import { assert, nArray } from '../util.js'
import { vec3, vec4, mat4, mat3, ReadonlyMat4 } from 'gl-matrix'
import { Color, colorNewFromRGBA, colorToCSS, Green, Red, White } from "../Color.js";
import {
    drawWorldSpaceText,
    drawWorldSpaceLine,
    getDebugOverlayCanvas2D,
    drawClipSpaceLine,
    transformToClipSpace,
    drawWorldSpaceCircle
} from "../DebugJunk.js";

import { GfxDevice } from "../gfx/platform/GfxPlatform.js";
import { GfxRenderInstList, GfxRenderInstManager } from "../gfx/render/GfxRenderInstManager.js";
import { SceneGfx, ViewerRenderInput } from "../viewer.js";

import { DynaLoadListDSG, WorldRenderLayer } from './world.js'
import { GfxRenderHelper } from '../gfx/render/GfxRenderHelper.js';
import { SceneContext } from '../SceneBase.js';
import { UVENRenderer } from '../BeetleAdventureRacing/ParsedFiles/UVEN.js';
import { UVTRRenderer } from '../BeetleAdventureRacing/ParsedFiles/UVTR.js';
import { TexScrollAnim, TexSeqAnim } from '../BeetleAdventureRacing/ParsedFiles/UVTX.js';
import { DEBUGGING_TOOLS_STATE } from '../BeetleAdventureRacing/Scenes.js';
import { TrackDataRenderer } from '../BeetleAdventureRacing/TrackData.js';
import { CameraController } from '../Camera.js';
import { makeAttachmentClearDescriptor, makeBackbufferDescSimple } from '../gfx/helpers/RenderGraphHelpers.js';
import { GfxrAttachmentClearDescriptor, GfxrAttachmentSlot } from '../gfx/render/GfxRenderGraph.js';
import InputManager from '../InputManager.js';
import { bindingLayouts } from '../OcarinaOfTime3D/oot3d_scenes.js';
import * as UI from '../ui.js';
import { AABB } from '../Geometry.js';
import { BBoxVolume, CollisionVolume, CollisionVolumeTypeEnum, CylinderVolume, OBBoxVolume, RectTriggerVolume, SphereTriggerVolume, SphereVolume, StaticPhysDSG, TriggerVolume, WallVolume, ZoneEventLocator } from './dsg.js';
import { MathConstants, transformVec3Mat4w0, Vec3UnitX, Vec3UnitY, Vec3UnitZ } from '../MathHelpers.js';
import { DLLD_, Instance } from './scenes.js';

export class Bug implements SceneGfx {
    public renderHelper: GfxRenderHelper;
    private renderInstListMain = new GfxRenderInstList()

    private attachmentClearDescriptor: GfxrAttachmentClearDescriptor
    private draw_tree: boolean = false
    private draw_fences: boolean = true
    private draw_fences_height: number = 0
    private draw_paths: boolean = true
    private draw_intersect_lines: boolean = false
    private draw_static_phys: boolean = true
    private draw_static_phys_fill: boolean = true
    private draw_loadzones: boolean = true
    private draw_jumpzones: boolean = true
    constructor(public level_instance: Instance, device: GfxDevice) {
        this.renderHelper = new GfxRenderHelper(device);

        // this.uvtrRenderer = rendererStore.getOrCreateRenderer(uvtr, () => new UVTRRenderer(uvtr, rendererStore))

        this.attachmentClearDescriptor = makeAttachmentClearDescriptor(colorNewFromRGBA(0, 0, 0, 1));
    }
    destroy(device: GfxDevice): void {
        this.renderHelper.destroy();
    }
    public createPanels(): UI.Panel[] {
        // const debuggingToolsPanel = new UI.Panel();

        // debuggingToolsPanel.customHeaderBackgroundColor = UI.COOL_BLUE_COLOR;
        // debuggingToolsPanel.setTitle(UI.RENDER_HACKS_ICON, 'Debug');

        // const showTextureIndicesCheckbox = new UI.Checkbox('Show Texture Indices', DEBUGGING_TOOLS_STATE.showTextureIndices);
        // showTextureIndicesCheckbox.onchanged = () => {
        //     DEBUGGING_TOOLS_STATE.showTextureIndices = showTextureIndicesCheckbox.checked;
        // };
        // debuggingToolsPanel.contents.appendChild(showTextureIndicesCheckbox.elem);

        // if (this.trackDataRenderer !== undefined) {

        const addCheckBox = (panel: any, label: string, initiallyChecked: boolean, setMethod: (val: boolean) => void) => {
            const chk = new UI.Checkbox(label, initiallyChecked)
            chk.onchanged = () => { setMethod(chk.checked) }
            panel.contents.appendChild(chk.elem)
        }
        const addSlider = (panel: any, label: string, initial: number, range_bot: number, range_top: number, setMethod: (val: number) => void) => {
            const slider = new UI.Slider()
            slider.setRange(range_bot, range_top)
            slider.setLabel(label)
            slider.setValue(initial)
            slider.onvalue = () => {
                setMethod(slider.getValue())
                // this.setEnvironmentSettingsIndex(environmentIndexSlider.getValue());
            }
            panel.contents.appendChild(slider.elem);
        }

        const sectors = new UI.Panel()
        sectors.customHeaderBackgroundColor = UI.COOL_BLUE_COLOR
        sectors.setTitle(UI.LAYER_ICON, 'Sectors')

        const iWRL = this.level_instance.GetRenderManager().pWorldRenderLayer()
        iWRL.mLoadLists.forEach((sect: DLLD_, index: number) => {
            if (sect == null) return
            // if (index == 0) return // global sector
            if (sect.desc == ``) return
            addCheckBox(sectors, sect.desc, sect.draw, val => sect.draw = val)
        })


        const debug = new UI.Panel()
        debug.customHeaderBackgroundColor = UI.COOL_BLUE_COLOR
        debug.setTitle(UI.LAYER_ICON, 'Debug Panel')
        const global_sector = iWRL.mLoadLists[0]
        addCheckBox(debug, `draw global sector`, global_sector.draw, val => global_sector.draw = val)
        addCheckBox(debug, `draw tree`, this.draw_tree, val => this.draw_tree = val)
        addCheckBox(debug, `draw fences`, this.draw_fences, val => this.draw_fences = val)
        addSlider(debug, `fences height`, this.draw_fences_height, 0, 100, val => this.draw_fences_height = val)
        addCheckBox(debug, `draw paths`, this.draw_paths, val => this.draw_paths = val)
        addCheckBox(debug, `draw intersects`, this.draw_intersect_lines, val => this.draw_intersect_lines = val)
        addCheckBox(debug, `draw static collisions`, this.draw_static_phys, val => this.draw_static_phys = val)
        addCheckBox(debug, `draw static collisions fill`, this.draw_static_phys_fill, val => this.draw_static_phys_fill = val)
        addCheckBox(debug, `draw loadzones`, this.draw_loadzones, val => this.draw_loadzones = val)
        addCheckBox(debug, `draw jumpzones`, this.draw_jumpzones, val => this.draw_jumpzones = val)

        // addCheckBox("Track up directions and widths", val => this.trackDataRenderer.alsoShowTrackUpVectorAndWidthVector = val);
        // addCheckBox("First progress val of each point", val => this.trackDataRenderer.showProgressValuesNextToTrackPoints = val);
        // (<HTMLElement>trackDataPanel.contents.children.item(trackDataPanel.contents.children.length - 1)).style.marginBottom = "20px";
        // addCheckBox('Progress correction zones', val => this.trackDataRenderer.showProgressFixZones = val);
        // addCheckBox("Progress values of each zone point", val => this.trackDataRenderer.showProgressFixZoneValues = val);
        // (<HTMLElement>trackDataPanel.contents.children.item(trackDataPanel.contents.children.length - 1)).style.marginBottom = "20px";
        // addCheckBox("Track segment begin planes", val => this.trackDataRenderer.showTrackSegmentBeginPlanes = val);
        // addCheckBox("Track segment end planes", val => this.trackDataRenderer.showTrackSegmentEndPlanes = val);
        // trackDataPanel.contents.append(this.buildMinMaxSegmentInputs());
        // (<HTMLElement>trackDataPanel.contents.children.item(trackDataPanel.contents.children.length - 1)).style.marginBottom = "20px";
        // trackDataPanel.contents.append(this.buildProgressValsInput());

        return [sectors, debug]
    }
    drawTriggerSphere(ctx: CanvasRenderingContext2D,
        clipFromWorldMatrix: ReadonlyMat4,
        volume: TriggerVolume,
        color: Color,
        nPoints: number) {
        drawWorldSpaceCircle(ctx,
            clipFromWorldMatrix,
            volume.mPosition,
            volume.mRadius,
            vec3.fromValues(1, 0, 0),
            color,
            nPoints)
        drawWorldSpaceCircle(ctx,
            clipFromWorldMatrix,
            volume.mPosition,
            volume.mRadius,
            vec3.fromValues(0, 1, 0),
            color,
            nPoints)
        drawWorldSpaceCircle(ctx,
            clipFromWorldMatrix,
            volume.mPosition,
            volume.mRadius,
            vec3.fromValues(0, 0, 1),
            color,
            nPoints)
    }
    drawTriggerRect(ctx: CanvasRenderingContext2D,
        clipFromWorldMatrix: ReadonlyMat4,
        volume: RectTriggerVolume,
        color: Color,
        thickness: number) {
        if (volume == null) return
        const axis = mat3.fromValues(volume.mAxisX[0], volume.mAxisY[0], volume.mAxisZ[0],
            volume.mAxisX[1], volume.mAxisY[1], volume.mAxisZ[1],
            volume.mAxisX[2], volume.mAxisY[2], volume.mAxisZ[2])
        const p0 = vec3.fromValues(-volume.mExtentX, -volume.mExtentY, -volume.mExtentZ)
        const p1 = vec3.fromValues(volume.mExtentX, -volume.mExtentY, -volume.mExtentZ)
        const p2 = vec3.fromValues(volume.mExtentX, -volume.mExtentY, volume.mExtentZ)
        const p3 = vec3.fromValues(-volume.mExtentX, -volume.mExtentY, volume.mExtentZ)
        const p4 = vec3.fromValues(-volume.mExtentX, volume.mExtentY, -volume.mExtentZ)
        const p5 = vec3.fromValues(volume.mExtentX, volume.mExtentY, -volume.mExtentZ)
        const p6 = vec3.fromValues(volume.mExtentX, volume.mExtentY, volume.mExtentZ)
        const p7 = vec3.fromValues(-volume.mExtentX, volume.mExtentY, volume.mExtentZ)
        vec3.transformMat3(p0, p0, axis)
        vec3.transformMat3(p1, p1, axis)
        vec3.transformMat3(p2, p2, axis)
        vec3.transformMat3(p3, p3, axis)
        vec3.transformMat3(p4, p4, axis)
        vec3.transformMat3(p5, p5, axis)
        vec3.transformMat3(p6, p6, axis)
        vec3.transformMat3(p7, p7, axis)
        vec3.add(p0, p0, volume.mPosition)
        vec3.add(p1, p1, volume.mPosition)
        vec3.add(p2, p2, volume.mPosition)
        vec3.add(p3, p3, volume.mPosition)
        vec3.add(p4, p4, volume.mPosition)
        vec3.add(p5, p5, volume.mPosition)
        vec3.add(p6, p6, volume.mPosition)
        vec3.add(p7, p7, volume.mPosition)
        drawWorldSpaceLine(ctx, clipFromWorldMatrix, p0, p1, color, thickness)
        drawWorldSpaceLine(ctx, clipFromWorldMatrix, p1, p2, color, thickness)
        drawWorldSpaceLine(ctx, clipFromWorldMatrix, p2, p3, color, thickness)
        drawWorldSpaceLine(ctx, clipFromWorldMatrix, p3, p0, color, thickness)

        drawWorldSpaceLine(ctx, clipFromWorldMatrix, p4, p5, color, thickness)
        drawWorldSpaceLine(ctx, clipFromWorldMatrix, p5, p6, color, thickness)
        drawWorldSpaceLine(ctx, clipFromWorldMatrix, p6, p7, color, thickness)
        drawWorldSpaceLine(ctx, clipFromWorldMatrix, p7, p4, color, thickness)

        drawWorldSpaceLine(ctx, clipFromWorldMatrix, p0, p4, color, thickness)
        drawWorldSpaceLine(ctx, clipFromWorldMatrix, p1, p5, color, thickness)
        drawWorldSpaceLine(ctx, clipFromWorldMatrix, p2, p6, color, thickness)
        drawWorldSpaceLine(ctx, clipFromWorldMatrix, p3, p7, color, thickness)
    }
    drawStaticPhys(static_phys: StaticPhysDSG[], 
                   ctx: CanvasRenderingContext2D, 
                   clipFromWorldMatrix: ReadonlyMat4,
                   fill: boolean) {
        for (let i = 0; i < static_phys.length; i++) {
            const sp = static_phys[i]
            const volume = sp.mpSimStateObj!.mCollisionObject!.mCollisionVolume!
            this.recurseDrawCollision(ctx, clipFromWorldMatrix, volume, sp._color, 2, fill)
        }
    }
    recurseDrawCollision(ctx: CanvasRenderingContext2D,
        clipFromWorldMatrix: ReadonlyMat4,
        volume: CollisionVolume,
        color: Color,
        thickness: number,
        fill: boolean
    ) {
        if (!volume) return
        if (volume.mPosition == vec3.fromValues(0, 0, 0)) return
        this.drawCollision(ctx, clipFromWorldMatrix, volume, color, thickness, fill)
        if (volume.mSubVolumeList != null && volume.mSubVolumeList.length > 0) {
            for (let i = 0; i < volume.mSubVolumeList.length; i++) {
                let subvolume = volume.mSubVolumeList[i]
                if (subvolume == null) continue
                this.recurseDrawCollision(ctx, clipFromWorldMatrix, subvolume, color, thickness, fill)
            }
        }
    }
    drawObboxLines(ctx: CanvasRenderingContext2D,
              clipFromWorldMatrix: ReadonlyMat4,
              volume: OBBoxVolume,
              color: Color,
              thickness: number) {
        if (volume == null || volume.mType != 3) return
        const axis = mat3.fromValues(volume.mAxis[0][0], volume.mAxis[0][1], volume.mAxis[0][2],
                                     volume.mAxis[1][0], volume.mAxis[1][1], volume.mAxis[1][2],
                                     volume.mAxis[2][0], volume.mAxis[2][1], volume.mAxis[2][2])
        const p0 = vec3.fromValues(-volume.mLength[0], -volume.mLength[1], -volume.mLength[2])
        const p1 = vec3.fromValues( volume.mLength[0],  volume.mLength[1],  volume.mLength[2])
        const p2 = vec3.fromValues( volume.mLength[0], -volume.mLength[1], -volume.mLength[2])
        const p3 = vec3.fromValues(-volume.mLength[0],  volume.mLength[1],  volume.mLength[2])
        const p4 = vec3.fromValues(-volume.mLength[0], -volume.mLength[1],  volume.mLength[2])
        const p5 = vec3.fromValues( volume.mLength[0],  volume.mLength[1], -volume.mLength[2])
        const p6 = vec3.fromValues( volume.mLength[0], -volume.mLength[1],  volume.mLength[2])
        const p7 = vec3.fromValues(-volume.mLength[0],  volume.mLength[1], -volume.mLength[2])
        vec3.transformMat3(p0, p0, axis)
        vec3.transformMat3(p1, p1, axis)
        vec3.transformMat3(p2, p2, axis)
        vec3.transformMat3(p3, p3, axis)
        vec3.transformMat3(p4, p4, axis)
        vec3.transformMat3(p5, p5, axis)
        vec3.transformMat3(p6, p6, axis)
        vec3.transformMat3(p7, p7, axis)
        vec3.add(p0, p0, volume.mPosition)
        vec3.add(p1, p1, volume.mPosition)
        vec3.add(p2, p2, volume.mPosition)
        vec3.add(p3, p3, volume.mPosition)
        vec3.add(p4, p4, volume.mPosition)
        vec3.add(p5, p5, volume.mPosition)
        vec3.add(p6, p6, volume.mPosition)
        vec3.add(p7, p7, volume.mPosition)
        drawWorldSpaceLine(ctx, clipFromWorldMatrix, p0, p2, color, thickness)
        drawWorldSpaceLine(ctx, clipFromWorldMatrix, p2, p6, color, thickness)
        drawWorldSpaceLine(ctx, clipFromWorldMatrix, p6, p4, color, thickness)
        drawWorldSpaceLine(ctx, clipFromWorldMatrix, p4, p0, color, thickness)

        drawWorldSpaceLine(ctx, clipFromWorldMatrix, p7, p5, color, thickness)
        drawWorldSpaceLine(ctx, clipFromWorldMatrix, p5, p1, color, thickness)
        drawWorldSpaceLine(ctx, clipFromWorldMatrix, p1, p3, color, thickness)
        drawWorldSpaceLine(ctx, clipFromWorldMatrix, p3, p7, color, thickness)

        drawWorldSpaceLine(ctx, clipFromWorldMatrix, p0, p7, color, thickness)
        drawWorldSpaceLine(ctx, clipFromWorldMatrix, p2, p5, color, thickness)
        drawWorldSpaceLine(ctx, clipFromWorldMatrix, p6, p1, color, thickness)
        drawWorldSpaceLine(ctx, clipFromWorldMatrix, p4, p3, color, thickness)
    }
    drawObboxFill(ctx: CanvasRenderingContext2D,
                  clipFromWorldMatrix: ReadonlyMat4,
                  volume: OBBoxVolume,
                  color: Color,
                  thickness: number) {
        if (volume == null || volume.mType != 3) return
        const axis = mat3.fromValues(volume.mAxis[0][0], volume.mAxis[0][1], volume.mAxis[0][2],
                                    volume.mAxis[1][0], volume.mAxis[1][1], volume.mAxis[1][2],
                                    volume.mAxis[2][0], volume.mAxis[2][1], volume.mAxis[2][2])
        color.a = 0.2
        const f0 = vec3.fromValues(-volume.mLength[0], -volume.mLength[1], -volume.mLength[2])
        const f1 = vec3.fromValues( volume.mLength[0],  volume.mLength[1],  volume.mLength[2])
        const f2 = vec3.fromValues( volume.mLength[0], -volume.mLength[1], -volume.mLength[2])
        const f3 = vec3.fromValues(-volume.mLength[0],  volume.mLength[1],  volume.mLength[2])
        const f4 = vec3.fromValues(-volume.mLength[0], -volume.mLength[1],  volume.mLength[2])
        const f5 = vec3.fromValues( volume.mLength[0],  volume.mLength[1], -volume.mLength[2])
        vec3.add(f0, f0, vec3.fromValues( volume.mLength[0],                  0,  volume.mLength[2]))
        vec3.add(f1, f1, vec3.fromValues(-volume.mLength[0],                  0, -volume.mLength[2]))
        vec3.add(f2, f2, vec3.fromValues(                 0,  volume.mLength[1],  volume.mLength[2]))
        vec3.add(f3, f3, vec3.fromValues(                 0, -volume.mLength[1], -volume.mLength[2]))
        vec3.add(f4, f4, vec3.fromValues( volume.mLength[0],  volume.mLength[1],                  0))
        vec3.add(f5, f5, vec3.fromValues(-volume.mLength[0], -volume.mLength[1],                  0))
        vec3.transformMat3(f0, f0, axis)
        vec3.transformMat3(f1, f1, axis)
        vec3.transformMat3(f2, f2, axis)
        vec3.transformMat3(f3, f3, axis)
        vec3.transformMat3(f4, f4, axis)
        vec3.transformMat3(f5, f5, axis)
        vec3.add(f0, f0, volume.mPosition)
        vec3.add(f1, f1, volume.mPosition)
        vec3.add(f2, f2, volume.mPosition)
        vec3.add(f3, f3, volume.mPosition)
        vec3.add(f4, f4, volume.mPosition)
        vec3.add(f5, f5, volume.mPosition)
        this.renderHelper.debugDraw.drawRectSolidRU(f0, volume.mAxis[0], volume.mAxis[2],  volume.mLength[0],  volume.mLength[2], color)
        this.renderHelper.debugDraw.drawRectSolidRU(f1, volume.mAxis[0], volume.mAxis[2], -volume.mLength[0], -volume.mLength[2], color)
        this.renderHelper.debugDraw.drawRectSolidRU(f2, volume.mAxis[2], volume.mAxis[1],  volume.mLength[2],  volume.mLength[1], color)
        this.renderHelper.debugDraw.drawRectSolidRU(f3, volume.mAxis[2], volume.mAxis[1], -volume.mLength[2], -volume.mLength[1], color)
        this.renderHelper.debugDraw.drawRectSolidRU(f4, volume.mAxis[1], volume.mAxis[0],  volume.mLength[1],  volume.mLength[0], color)
        this.renderHelper.debugDraw.drawRectSolidRU(f5, volume.mAxis[1], volume.mAxis[0], -volume.mLength[1], -volume.mLength[0], color)
    }
    drawCylinder(ctx: CanvasRenderingContext2D,
        clipFromWorldMatrix: ReadonlyMat4,
        cylinder: CylinderVolume,
        nPoints: number,
        color: Color,
        thickness: number): void {
        //* public override cylinder.mPosition: vec3,
        //* public cylinder.mAxis: vec3,
        //* public mLength: number,
        //* public mCylinderRadius: number,
        //* public mFlatEnd: boolean
        const scratchMatrix = mat4.create()
        const scratchVec3a = vec3.create()
        const scratchVec3b = vec3.create()
        // axis = vec3.fromValues(0.975, .22, 0)
        const unit = Math.abs(cylinder.mAxis[0]) < 0.8 ? Vec3UnitX : Vec3UnitZ
        nPoints = 12
        for (let i = 0; i < nPoints; i++) {
            const t0 = ((i + 0) / nPoints) * MathConstants.TAU;
            mat4.fromRotation(scratchMatrix, t0, cylinder.mAxis);
            transformVec3Mat4w0(scratchVec3a, scratchMatrix, unit);
            vec3.scaleAndAdd(scratchVec3a, cylinder.mPosition, scratchVec3a, cylinder.mCylinderRadius);
            const t1 = ((i + 1) / nPoints) * MathConstants.TAU;

            mat4.fromRotation(scratchMatrix, t1, cylinder.mAxis);
            transformVec3Mat4w0(scratchVec3b, scratchMatrix, unit);
            vec3.scaleAndAdd(scratchVec3b, cylinder.mPosition, scratchVec3b, cylinder.mCylinderRadius);
            vec3.scaleAndAdd(scratchVec3a, scratchVec3a, cylinder.mAxis, -cylinder.mLength);
            vec3.scaleAndAdd(scratchVec3b, scratchVec3b, cylinder.mAxis, -cylinder.mLength);

            drawWorldSpaceLine(ctx, clipFromWorldMatrix, scratchVec3a, scratchVec3b, color, thickness);

            vec3.scaleAndAdd(scratchVec3b, scratchVec3a, cylinder.mAxis, cylinder.mLength * 2);
            drawWorldSpaceLine(ctx, clipFromWorldMatrix, scratchVec3a, scratchVec3b, color, thickness);

            vec3.scaleAndAdd(scratchVec3a, scratchVec3a, cylinder.mAxis, cylinder.mLength * 2);
            mat4.fromRotation(scratchMatrix, t1, cylinder.mAxis);
            transformVec3Mat4w0(scratchVec3b, scratchMatrix, unit);
            vec3.scaleAndAdd(scratchVec3b, cylinder.mPosition, scratchVec3b, cylinder.mCylinderRadius);
            vec3.scaleAndAdd(scratchVec3b, scratchVec3b, cylinder.mAxis, cylinder.mLength);
            drawWorldSpaceLine(ctx, clipFromWorldMatrix, scratchVec3a, scratchVec3b, color, thickness);
        }
    }
    drawCollision(ctx: CanvasRenderingContext2D,
        clipFromWorldMatrix: ReadonlyMat4,
        volume: CollisionVolume,
        color: Color,
        thickness: number,
        fill: boolean
    ) {
        switch (volume.mType) {
            /* drawWorldSpaceAABB(ctx: CanvasRenderingContext2D, 
                                  clipFromWorldMatrix: ReadonlyMat4, 
                                  aabb: AABB, 
                                  m: ReadonlyMat4 | null = null, 
                                  color: Color = Magenta): void */
            case CollisionVolumeTypeEnum.CollisionVolumeType: {
                //// const volume = volume as CollisionVolume
                break
            }
            case CollisionVolumeTypeEnum.SphereVolumeType: {
                const sphere = volume as SphereVolume
                /* drawWorldSpaceCircle(ctx: CanvasRenderingContext2D, 
                                        clipFromWorldMatrix: ReadonlyMat4, 
                                        center: ReadonlyVec3, 
                                        radius: number, 
                                        axis: ReadonlyVec3, 
                                        color = Magenta, 
                                        nPoints: number = 32): void { */
                const adjusted_y = vec3.create()
                vec3.add(adjusted_y, sphere.mPosition, vec3.fromValues(0, sphere.mSphereRadius / 2, 0))
                drawWorldSpaceCircle(ctx,
                    clipFromWorldMatrix,
                    adjusted_y,
                    sphere.mSphereRadius,
                    vec3.fromValues(1, 0, 0),
                    color,
                    12)
                drawWorldSpaceCircle(ctx,
                    clipFromWorldMatrix,
                    adjusted_y,
                    sphere.mSphereRadius,
                    vec3.fromValues(0, 1, 0),
                    color,
                    12)
                drawWorldSpaceCircle(ctx,
                    clipFromWorldMatrix,
                    adjusted_y,
                    sphere.mSphereRadius,
                    vec3.fromValues(0, 0, 1),
                    color,
                    12)
                break
            }
            case CollisionVolumeTypeEnum.CylinderVolumeType: {
                const cylinder = volume as CylinderVolume
                this.drawCylinder(ctx,
                    clipFromWorldMatrix,
                    cylinder,
                    8,
                    color,
                    thickness)
                break
            }
            case CollisionVolumeTypeEnum.OBBoxVolumeType: {
                const obbox = volume as OBBoxVolume
                if (fill)
                    this.drawObboxFill(ctx, clipFromWorldMatrix, obbox, color, thickness)
                this.drawObboxLines(ctx, clipFromWorldMatrix, obbox, color, thickness)
                break
            }
            case CollisionVolumeTypeEnum.WallVolumeType: {
                const wall = volume as WallVolume
                break
            }
            case CollisionVolumeTypeEnum.BBoxVolumeType: {
                const bbox = volume as BBoxVolume
                break
            }
        }
    }
    prepareToRender(device: GfxDevice,
        // renderInstManager: GfxRenderInstManager,
        viewerInput: ViewerRenderInput) {
        viewerInput.camera.setClipPlanes(0.1);
        this.renderHelper.debugDraw.beginFrame(viewerInput.camera.projectionMatrix,
            viewerInput.camera.viewMatrix,
            viewerInput.backbufferHeight,
            viewerInput.backbufferHeight);

        const topTemplate = this.renderHelper.pushTemplateRenderInst();
        // We use the same number of samplers & uniform buffers in every material
        topTemplate.setBindingLayouts(bindingLayouts);

        const renderInstManager = this.renderHelper.renderInstManager;
        renderInstManager.setCurrentList(this.renderInstListMain);

        // Not sure if this is strictly necessary but it can't hurt
        renderInstManager.popTemplate();

        // Upload uniform data to the GPU
        this.renderHelper.prepareToRender();

        // For the extra track data display, check to see if we need to toggle the nearest plane on/off
        // this.checkCheckpointPlaneToggle(viewerInput);

        const ctx = getDebugOverlayCanvas2D()
        const clipFromWorldMatrix = viewerInput.camera.clipFromWorldMatrix
        const cw = ctx.canvas.width
        const ch = ctx.canvas.height

        let len = null
        let color = null
        let thickness = 0
        let nPoints = 0
        let p = nArray(10, () => vec4.create())

        // drawWorldSpaceLine(/* ctx */                 getDebugOverlayCanvas2D(), 
        //                    /* clipFromWorldMatrix */ clipFromWorldMatrix, 
        //                    /* pos */                 start,
        //                    /* scratchVec3v */        end,
        //                    /* color */               colorNewFromRGBA(1, 0, 0, 1), 
        //                    /* thickness */           4)
        /*drawWorldSpaceVector(
            getDebugOverlayCanvas2D(), 
            clipFromWorldMatrix, 
            pos, 
            BARVecToStandardVec(pnt.fwd), 
            pnt.trackSectionLength, 
            colorNewFromRGBA(0.0, 0.5, 0.8, 1), 
            4
        )*/

        if (this.draw_tree) {
            const tree = this.level_instance.GetRenderManager().pWorldScene().mpStaticTree
            const tree_color = colorNewFromRGBA(1, 1, 0, 1)
            const p0 = vec3.create()
            const p1 = vec3.create()
            assert(tree != null, `kd-tree = null xD GL`)
            for (let i = 0; i < tree.n_nodes; i++) {
                const node = tree.nodes[i]
                // if (node === undefined) continue
                switch (node.axis) {
                    case 0: {
                        vec3.set(p0, node.pos, 0, tree.bounds_min[2])
                        vec3.set(p1, node.pos, 0, tree.bounds_max[2])
                        break
                    }
                    case 2: {
                        vec3.set(p0, tree.bounds_min[0], 0, node.pos)
                        vec3.set(p1, tree.bounds_max[0], 0, node.pos)
                        break
                    }
                    default: { continue }
                }
                drawWorldSpaceLine(ctx, clipFromWorldMatrix, p0, p1, tree_color, 1)
            }
        }
        if (this.draw_loadzones) {
            // sect.mZELS[msLevel].forEach((volume: TriggerVolume) => {
            //     // if (this.show_load_zones) {
            //     const zel = volume.mLocator as ZoneEventLocator
            //     if (volume.mLocator)
            //     switch (volume.constructor.name) {
            //         case 'RectTriggerVolume':
            //             this.drawTriggerRect(ctx, clipFromWorldMatrix, volume as RectTriggerVolume, Blue, thickness);
            //             if (!zel.mInteriorLoad) { break }
            //             volume.mRadius = 40
            //         case 'SphereTriggerVolume':
            //             this.drawTriggerSphere(ctx, clipFromWorldMatrix, volume, Cyan, nPoints)
            //     }
            // })
        }
        this.level_instance.GetRenderManager().pWorldRenderLayer().mLoadLists.forEach((sect: DLLD_ | null) => {
            if (sect == null) return
            if (sect.draw == false) return

            len = null
            p = nArray(10, () => vec4.create())

            if (this.draw_paths) {
                const color = colorNewFromRGBA(0, 0, 1)
                p = nArray(10, () => vec4.create())
                ctx.beginPath()
                sect.mPathSegmentElems.forEach(path => {
                    const [sx, sy, sz] = path.mStartPos
                    const [ex, ey, ez] = path.mEndPos
                    vec4.set(p[0], sx, sy, sz, 1.0)
                    vec4.set(p[1], ex, ey, ez, 1.0)
                    transformToClipSpace(clipFromWorldMatrix, p, 2)

                    drawClipSpaceLine(ctx, p[0], p[1], p[8], p[9])
                })
                ctx.closePath()
                ctx.lineWidth = 1
                ctx.strokeStyle = colorToCSS(color)
                ctx.stroke()
            }
            if (this.draw_static_phys) {
                this.drawStaticPhys(sect.mSPhysElems, ctx, clipFromWorldMatrix, this.draw_static_phys_fill)
            }
            if (this.draw_intersect_lines) {
                color = White
                thickness = 1

                len = sect.mIntersectElems.length
                let int = null
                let indices_len = null
                for (let i = 0; i < len; i++) {
                    int = sect.mIntersectElems[i]
                    indices_len = int.mTriIndices.length

                    p = nArray(10, () => vec4.create())
                    ctx.beginPath()
                    for (let j = 0; j < indices_len; j += 3) {
                        const a = int.mTriIndices[j + 0]
                        const b = int.mTriIndices[j + 1]
                        const c = int.mTriIndices[j + 2]
                        if (a == b || a == c || b == c) continue

                        const [ax, ay, az] = int.mTriPts[a]
                        const [bx, by, bz] = int.mTriPts[b]
                        const [cx, cy, cz] = int.mTriPts[c]
                        vec4.set(p[0], ax, ay, az, 1.0)
                        vec4.set(p[1], bx, by, bz, 1.0)
                        vec4.set(p[2], cx, cy, cz, 1.0)
                        transformToClipSpace(clipFromWorldMatrix, p, 3)

                        drawClipSpaceLine(ctx, p[0], p[1], p[8], p[9])
                        drawClipSpaceLine(ctx, p[1], p[2], p[8], p[9])
                        drawClipSpaceLine(ctx, p[2], p[0], p[8], p[9])
                        /* export function drawClipSpaceLine(ctx: CanvasRenderingContext2D, 
                                                             p0: ReadonlyVec4, 
                                                             p1: ReadonlyVec4, 
                                                             s0: vec4, 
                                                             s1: vec4): void { */
                        // let [p0, p1, p2, s0, s1] = [p[0], p[1], p[2], p[8], p[9]]
                        // if (!clipLineAndDivide(s0, s1, p0, p1)) return
                        // ctx.moveTo((s0[0] + 1) * cw / 2, ((-s0[1] + 1) * ch / 2))
                        // ctx.lineTo((s1[0] + 1) * cw / 2, ((-s1[1] + 1) * ch / 2))
                        // if (!clipLineAndDivide(s0, s1, p1, p2)) return
                        // ctx.moveTo((s0[0] + 1) * cw / 2, ((-s0[1] + 1) * ch / 2))
                        // ctx.lineTo((s1[0] + 1) * cw / 2, ((-s1[1] + 1) * ch / 2))
                        // if (!clipLineAndDivide(s0, s1, p2, p0)) return
                        // ctx.moveTo((s0[0] + 1) * cw / 2, ((-s0[1] + 1) * ch / 2))
                        // ctx.lineTo((s1[0] + 1) * cw / 2, ((-s1[1] + 1) * ch / 2))
                    }
                    ctx.closePath()
                    ctx.lineWidth = 1
                    ctx.strokeStyle = colorToCSS(color)
                    ctx.stroke()
                }
            }
            if (this.draw_fences) {
                const y = 100
                p = nArray(10, () => vec4.create());
                const color_a = colorNewFromRGBA(1, 0, 0, 0.1)

                if (this.draw_fences_height > 0.1) {
                    ctx.beginPath()
                    sect.mFenceElems.forEach(fence => {
                        const centre = vec3.create()
                        vec3.add(centre, fence.start, fence.end)
                        vec3.scale(centre, centre, 0.5)
                        const half = vec3.fromValues(fence.start[0] - centre[0], 0, fence.start[2] - centre[2])
                        const length = vec3.length(half)
                        const norm = vec3.create()
                        vec3.normalize(norm, half)
                        this.renderHelper.debugDraw.drawRectSolidRU(centre, 
                                                                    norm, 
                                                                    Vec3UnitY, 
                                                                    length, 
                                                                    this.draw_fences_height, 
                                                                    color_a)

                        let [sx, sy, sz] = fence.start
                        let [ex, ey, ez] = fence.end
                        const h = this.draw_fences_height
                        vec4.set(p[0], sx, -h, sz, 1.0)
                        vec4.set(p[1], sx,  h, sz, 1.0)
                        vec4.set(p[2], ex, -h, ez, 1.0)
                        vec4.set(p[3], ex,  h, ez, 1.0)
                        transformToClipSpace(clipFromWorldMatrix, p, 4)

                        drawClipSpaceLine(ctx, p[0], p[1], p[8], p[9])
                        drawClipSpaceLine(ctx, p[2], p[3], p[8], p[9])
                        drawClipSpaceLine(ctx, p[0], p[2], p[8], p[9])
                        drawClipSpaceLine(ctx, p[1], p[3], p[8], p[9])

                    })
                    color = Red
                    ctx.closePath()
                    ctx.lineWidth = 1
                    ctx.strokeStyle = colorToCSS(color)
                    ctx.stroke()
                } else {
                    ctx.beginPath()
                    sect.mFenceElems.forEach(fence => {
                        let [sx, sy, sz] = fence.start
                        let [ex, ey, ez] = fence.end

                        vec4.set(p[0], sx, sy, sz, 1.0)
                        vec4.set(p[1], ex, ey, ez, 1.0)
                        transformToClipSpace(clipFromWorldMatrix, p, 2)

                        drawClipSpaceLine(ctx, p[0], p[1], p[8], p[9])
                    })
                    color = Red
                    ctx.closePath()
                    ctx.lineWidth = 2
                    ctx.strokeStyle = colorToCSS(color)
                    ctx.stroke()
                }
            }
        })
    }
    public render(device: GfxDevice, viewerInput: ViewerRenderInput) {
        const builder = this.renderHelper.renderGraph.newGraphBuilder();

        const mainColorDesc = makeBackbufferDescSimple(GfxrAttachmentSlot.Color0, viewerInput, this.attachmentClearDescriptor);
        const mainDepthDesc = makeBackbufferDescSimple(GfxrAttachmentSlot.DepthStencil, viewerInput, this.attachmentClearDescriptor);

        const mainColorTargetID = builder.createRenderTargetID(mainColorDesc, 'Main Color');
        const mainDepthTargetID = builder.createRenderTargetID(mainDepthDesc, 'Main Depth');
        builder.pushPass((pass) => {
            pass.setDebugName('Main');
            pass.attachRenderTargetID(GfxrAttachmentSlot.Color0, mainColorTargetID);
            pass.attachRenderTargetID(GfxrAttachmentSlot.DepthStencil, mainDepthTargetID);
            pass.exec((passRenderer) => {
                this.renderInstListMain.drawOnPassRenderer(this.renderHelper.renderCache, passRenderer);
            });
        });
        this.renderHelper.debugDraw.pushPasses(builder, mainColorTargetID, mainDepthTargetID);

        //TODO: snow

        this.renderHelper.antialiasingSupport.pushPasses(builder, viewerInput, mainColorTargetID);
        builder.resolveRenderTargetToExternalTexture(mainColorTargetID, viewerInput.onscreenTexture);

        this.prepareToRender(device, viewerInput);
        this.renderHelper.renderGraph.execute(builder);
        this.renderInstListMain.reset();
    }
}