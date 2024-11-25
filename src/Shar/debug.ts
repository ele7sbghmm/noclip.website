import { assert, nArray } from '../util.js'
import { vec3, vec4, mat4, mat3, ReadonlyMat4, ReadonlyVec3 } from 'gl-matrix'
import { Blue, Color, colorNewFromRGBA, colorToCSS, Cyan, Green, Magenta, Red, White, Yellow } from "../Color.js";
import { 
    drawWorldSpaceAABB,
    drawWorldSpacePoint,
    drawWorldSpaceText,
    drawWorldSpaceLine,
    drawWorldSpaceVector,
    getDebugOverlayCanvas2D,
    drawClipSpaceLine,
    transformToClipSpace,
    p,
    clipLineAndDivide,
    drawWorldSpaceCylinder,
    drawWorldSpaceCircle
} from "../DebugJunk.js";

import { GfxDevice } from "../gfx/platform/GfxPlatform.js";
import { GfxRenderInstList, GfxRenderInstManager } from "../gfx/render/GfxRenderInstManager.js";
import { SceneGfx, ViewerRenderInput } from "../viewer.js";

import { Sc, Sector, WorldScene } from './world.js'
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

export class Bug implements SceneGfx {
    public renderHelper: GfxRenderHelper;
    private renderInstListMain = new GfxRenderInstList()

    private attachmentClearDescriptor: GfxrAttachmentClearDescriptor
    private show_tree: boolean = false
    private show_fences: boolean = true
    private show_intersects: boolean = false
    private show_static_phys: boolean = false
    private show_load_zones: boolean = true
    constructor(public sc: Sc, device: GfxDevice) {
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
        const trackDataPanel = new UI.Panel()

        trackDataPanel.customHeaderBackgroundColor = UI.COOL_BLUE_COLOR
        trackDataPanel.setTitle(UI.LAYER_ICON, 'Display Track Data')

        let addCheckBox = (label: string, setMethod: ((val: boolean) => void)) => {
            let chk = new UI.Checkbox(label)
            chk.onchanged = () => { setMethod(chk.checked); }
            trackDataPanel.contents.appendChild(chk.elem)
        }

        addCheckBox("Show tree", val => this.show_tree = val)
        addCheckBox("Show fences", val => this.show_fences = val)
        addCheckBox("Show intersects", val => this.show_intersects = val)
        addCheckBox("Show static phys", val => this.show_static_phys = val)
        addCheckBox("Show load zones", val => this.show_load_zones = val)
        for (let i = 0; i < 20; i++) {
            const sect = this.sc.scene.sectors[i]
            if (sect == null) continue
            addCheckBox(sect.name, val => sect.active = val)
        }

        // addCheckBox("Display tree", val => this.show_tree = val);
        // addCheckBox("Track up directions and widths", val => this.trackDataRenderer.alsoShowTrackUpVectorAndWidthVector = val);
        // addCheckBox("First progress val of each point", val => this.trackDataRenderer.showProgressValuesNextToTrackPoints = val);
        // (<HTMLElement>trackDataPanel.contents.children.item(trackDataPanel.contents.children.length - 1)).style.marginBottom = "20px";
        // addCheckBox("Display fences", val => this.show_fences = val);
        // addCheckBox('Progress correction zones', val => this.trackDataRenderer.showProgressFixZones = val);
        // addCheckBox("Progress values of each zone point", val => this.trackDataRenderer.showProgressFixZoneValues = val);
        // (<HTMLElement>trackDataPanel.contents.children.item(trackDataPanel.contents.children.length - 1)).style.marginBottom = "20px";
        // addCheckBox("Track segment begin planes", val => this.trackDataRenderer.showTrackSegmentBeginPlanes = val);
        // addCheckBox("Track segment end planes", val => this.trackDataRenderer.showTrackSegmentEndPlanes = val);
        // trackDataPanel.contents.append(this.buildMinMaxSegmentInputs());
        // (<HTMLElement>trackDataPanel.contents.children.item(trackDataPanel.contents.children.length - 1)).style.marginBottom = "20px";
        // trackDataPanel.contents.append(this.buildProgressValsInput());

        return [trackDataPanel]//, debuggingToolsPanel];
        // } else {
        //     return [debuggingToolsPanel];
        // }
    }
    drawLoadZones(ctx: CanvasRenderingContext2D, clipFromWorldMatrix: ReadonlyMat4) {//, color: Color, thickness: number) {
        const thickness = 4
        const nPoints = 20
        this.sc.scene.load_zones.forEach((volume: TriggerVolume) => {
            const zel = volume.mLocator as ZoneEventLocator
            switch (volume.constructor.name) {
                case 'RectTriggerVolume':
                    this.drawTriggerRect(ctx, clipFromWorldMatrix, volume as RectTriggerVolume, Blue, thickness);
                    if (!zel.mInteriorLoad) { break }
                    volume.mRadius = 40
                case 'SphereTriggerVolume':
                    this.drawTriggerSphere(ctx, clipFromWorldMatrix, volume, Cyan, nPoints)
            }
        })
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
        const p1 = vec3.fromValues( volume.mExtentX, -volume.mExtentY, -volume.mExtentZ)
        const p2 = vec3.fromValues( volume.mExtentX, -volume.mExtentY,  volume.mExtentZ)
        const p3 = vec3.fromValues(-volume.mExtentX, -volume.mExtentY,  volume.mExtentZ)
        const p4 = vec3.fromValues(-volume.mExtentX,  volume.mExtentY, -volume.mExtentZ)
        const p5 = vec3.fromValues( volume.mExtentX,  volume.mExtentY, -volume.mExtentZ)
        const p6 = vec3.fromValues( volume.mExtentX,  volume.mExtentY,  volume.mExtentZ)
        const p7 = vec3.fromValues(-volume.mExtentX,  volume.mExtentY,  volume.mExtentZ)
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
    drawStaticPhys(static_phys: StaticPhysDSG[], ctx: CanvasRenderingContext2D, clipFromWorldMatrix: ReadonlyMat4) {
        for (let i = 0; i < static_phys.length; i++) {
            const sp = static_phys[i]
            const volume = sp.mpSimStateObj!.mCollisionObject!.mCollisionVolume!
            this.recurseDrawCollision(ctx, clipFromWorldMatrix, volume, sp.color, 2)
        }
    }
    recurseDrawCollision(ctx: CanvasRenderingContext2D,
                         clipFromWorldMatrix: ReadonlyMat4,
                         volume: CollisionVolume,
                         color: Color,
                         thickness: number) {
        if (!volume) return
        if (volume.mPosition == vec3.fromValues(0, 0, 0)) return
        this.drawCollision(ctx, clipFromWorldMatrix, volume, color, thickness)
        if (volume.mSubVolumeList != null && volume.mSubVolumeList.length > 0) {
            for (let i = 0; i < volume.mSubVolumeList.length; i++) {
                let subvolume = volume.mSubVolumeList[i]
                if (subvolume == null) continue
                this.recurseDrawCollision(ctx, clipFromWorldMatrix, subvolume, color, thickness)
            }
        }
    }
    drawObbox(ctx: CanvasRenderingContext2D,
              clipFromWorldMatrix: ReadonlyMat4,
              volume: OBBoxVolume,
              color: Color,
              thickness: number) {
        if (volume == null || volume.mType != 3) return
        const axis = mat3.fromValues(volume.mAxis[0][0], volume.mAxis[0][1], volume.mAxis[0][2], 
                                     volume.mAxis[1][0], volume.mAxis[1][1], volume.mAxis[1][2], 
                                     volume.mAxis[2][0], volume.mAxis[2][1], volume.mAxis[2][2])
        const p0 = vec3.fromValues(-volume.mLength[0], -volume.mLength[1], -volume.mLength[2])
        const p1 = vec3.fromValues( volume.mLength[0], -volume.mLength[1], -volume.mLength[2])
        const p2 = vec3.fromValues( volume.mLength[0], -volume.mLength[1],  volume.mLength[2])
        const p3 = vec3.fromValues(-volume.mLength[0], -volume.mLength[1],  volume.mLength[2])
        const p4 = vec3.fromValues(-volume.mLength[0],  volume.mLength[1], -volume.mLength[2])
        const p5 = vec3.fromValues( volume.mLength[0],  volume.mLength[1], -volume.mLength[2])
        const p6 = vec3.fromValues( volume.mLength[0],  volume.mLength[1],  volume.mLength[2])
        const p7 = vec3.fromValues(-volume.mLength[0],  volume.mLength[1],  volume.mLength[2])
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
                  thickness: number) {
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
                // drawWorldSpaceAABB(ctx,
                //                    viewerInput.camera.clipFromWorldMatrix,
                //                    aabb,
                //                    mat4.create(),
                //                    Blue)
                this.drawObbox(ctx, clipFromWorldMatrix, obbox, color, thickness)
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
        if (this.show_tree) {
            const tree = this.sc.scene.tree
            for (let i = 0; i < tree.n_nodes; i++) {
                let node = this.sc.scene.tree.nodes[i]
                if (node === undefined) continue
                switch (node.axis) {
                    case 0:  {
                        drawWorldSpaceLine(ctx,
                                           clipFromWorldMatrix,
                                           vec3.fromValues(node.pos, 0, tree.bounds_min[2]),
                                           vec3.fromValues(node.pos, 0, tree.bounds_max[2]),
                                           colorNewFromRGBA(1, 1, 0, 1),
                                           1)
                        continue }
                    case 2:  {
                        drawWorldSpaceLine(ctx,
                                           clipFromWorldMatrix,
                                           vec3.fromValues(tree.bounds_min[0], 0, node.pos),
                                           vec3.fromValues(tree.bounds_max[0], 0, node.pos),
                                           colorNewFromRGBA(1, 1, 0, 1),
                                           1)
                        continue }
                    default: continue
                }
            }
        }
        if (this.show_load_zones) {
            this.drawLoadZones(ctx, clipFromWorldMatrix)
        }
        if (this.show_fences) {
            const p = nArray(10, () => vec4.create());
            ctx.beginPath()

            const fence_len = this.sc.scene.fences.length
            for (let i = 0; i < fence_len; i++) {
                let [sx, sy, sz] = this.sc.scene.fences[i].start
                let [ex, ey, ez] = this.sc.scene.fences[i].end

                vec4.set(p[0], sx, sy, sz, 1.0)
                vec4.set(p[1], ex, ey, ez, 1.0)
                transformToClipSpace(clipFromWorldMatrix, p, 2)

                drawClipSpaceLine(ctx, p[0], p[1], p[8], p[9])
                // export function drawClipSpaceLine(ctx: CanvasRenderingContext2D, 
                //                                    p0: ReadonlyVec4, 
                //                                    p1: ReadonlyVec4, 
                //                                    s0: vec4, 
                //                                    s1: vec4): void {
                // let [p0, p1, s0, s1] = [p[0], p[1], p[8], p[9]]
                // if (!clipLineAndDivide(s0, s1, p0, p1)) return;
                // ctx.moveTo((s0[0] + 1) * cw / 2, ((-s0[1] + 1) * ch / 2));
                // ctx.lineTo((s1[0] + 1) * cw / 2, ((-s1[1] + 1) * ch / 2));
            }
            ctx.closePath()
            ctx.lineWidth = 1
            ctx.strokeStyle = colorToCSS(Red)
            ctx.stroke()
        }
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


        this.sc.scene.sectors.forEach((sect: Sector | null) => {
            if (sect == null) return
            if (sect.active == false) return

            if (this.show_static_phys) {
                this.drawStaticPhys(sect.static_phys, ctx, clipFromWorldMatrix)
            }
            if (this.show_intersects) {
                const int_len = sect!.intersects.length
                const p = nArray(10, () => vec4.create());
                for (let i = 0; i < int_len; i++) {
                    const int = sect!.intersects[i]

                    const indices_len = int.mTriIndices.length

                    for (let j = 0; j < indices_len ; j += 3) {
                        let [a, b, c] = [int.mTriIndices[j + 0],
                                        int.mTriIndices[j + 1],
                                        int.mTriIndices[j + 2]]
                        if (a == b || a == c || b == c) continue
                        drawWorldSpaceLine(ctx, clipFromWorldMatrix, int.mTriPts[a], int.mTriPts[b], White, 1)
                        drawWorldSpaceLine(ctx, clipFromWorldMatrix, int.mTriPts[b], int.mTriPts[c], White, 1)
                        drawWorldSpaceLine(ctx, clipFromWorldMatrix, int.mTriPts[c], int.mTriPts[a], White, 1)
                
                        // const [ax, ay, az] = int.mTriPts[a]
                        // const [bx, by, bz] = int.mTriPts[b]
                        // const [cx, cy, cz] = int.mTriPts[c]
                        // vec4.set(p[0], ax, ay, az, 1.0)
                        // vec4.set(p[1], bx, by, bz, 1.0)
                        // vec4.set(p[2], cx, cy, cz, 1.0)
                        // transformToClipSpace(clipFromWorldMatrix, p, 3)

                        // ctx.beginPath()
                        // drawClipSpaceLine(ctx, p[0], p[1], p[8], p[9])
                        // drawClipSpaceLine(ctx, p[1], p[2], p[8], p[9])
                        // drawClipSpaceLine(ctx, p[2], p[0], p[8], p[9])
                        // ctx.closePath()
                        // ctx.lineWidth = 1
                        // ctx.strokeStyle = colorToCSS(White)
                        // ctx.stroke()
                        //     // export function drawClipSpaceLine(ctx: CanvasRenderingContext2D, 
                        //     //                                    p0: ReadonlyVec4, 
                        //     //                                    p1: ReadonlyVec4, 
                        //     //                                    s0: vec4, 
                        //     //                                    s1: vec4): void {
                        //     // let [p0, p1, s0, s1] = [p[0], p[1], p[8], p[9]]
                        //     // if (!clipLineAndDivide(s0, s1, p0, p1)) return;
                        //     // ctx.moveTo((s0[0] + 1) * cw / 2, ((-s0[1] + 1) * ch / 2));
                        //     // ctx.lineTo((s1[0] + 1) * cw / 2, ((-s1[1] + 1) * ch / 2));
                    }
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