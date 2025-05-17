import ArrayBufferSlice from '../ArrayBufferSlice.js'
import * as Viewer from '../viewer.js'
import * as UI from '../ui.js'
import { colorNewFromRGBA } from '../Color.js'
import { DeviceProgram } from '../Program.js'
import { GfxShaderLibrary } from '../gfx/helpers/GfxShaderLibrary.js'
import { SceneContext } from '../SceneBase.js'
import { GfxrAttachmentSlot } from '../gfx/render/GfxRenderGraph.js'
import { GfxRenderHelper } from '../gfx/render/GfxRenderHelper.js'
import { GfxRenderInstManager, GfxRenderInstList } from '../gfx/render/GfxRenderInstManager.js'
import { makeBackbufferDescSimple, standardFullClearRenderPassDescriptor, makeAttachmentClearDescriptor } from '../gfx/helpers/RenderGraphHelpers.js'
import { GfxDevice, GfxProgram, GfxCullMode } from '../gfx/platform/GfxPlatform.js'
import { fillMatrix4x4, fillMatrix4x3 } from '../gfx/helpers/UniformBufferHelpers.js'
import { GfxRenderCache } from '../gfx/render/GfxRenderCache.js'

import { Fence } from './fence.js'
import { Intersect } from './intersect.js'
import { StaticEntity } from './staticEntity.js'

export class Program extends DeviceProgram {
    static a_Position = 0
    static a_Normal = 1
    static a_Color = 2
    static ub_SceneParams = 0
    static ub_ObjectParams = 1
    override both = `
precision mediump float;

${GfxShaderLibrary.MatrixLibrary}

layout(std140) uniform ub_SceneParams {
    Mat4x4 u_Projection;
    Mat3x4 u_View;
};

varying float v_LightIntensity;
varying vec4 v_Color;

#ifdef VERT
layout(location = ${Program.a_Position}) attribute vec3 a_Position;
layout(location = ${Program.a_Normal}) attribute vec3 a_Normal;
layout(location = ${Program.a_Color}) attribute uvec4 a_Color;

void mainVS() {
    float t_Scale = 100.;
    vec3 t_PositionWorld = UnpackMatrix(u_View) * vec4(a_Position * t_Scale, 1.);
    gl_Position = UnpackMatrix(u_Projection) * vec4(t_PositionWorld, 1.);

    vec3 t_LightDir = normalize(vec3(.2, -1., .5));
    v_LightIntensity = -dot(a_Normal, t_LightDir);
    v_Color = vec4(a_Color) / 255.;
}
#endif

#ifdef FRAG
void mainPS() {
    float t_LightTint = v_LightIntensity * .7;
    gl_FragColor = v_Color * vec4(t_LightTint, t_LightTint, t_LightTint, 0.);
}
#endif
`}

class Sector {
    visible: boolean = true
    staticEntity: StaticEntity
    intersects: Intersect

    public setVisible(b: boolean) { this.visible = b }
    constructor(public name: string, device: GfxDevice, renderCache: GfxRenderCache, buffer: ArrayBufferSlice) {
        this.staticEntity = new StaticEntity(device, renderCache, buffer.arrayBuffer)
    }
    destroy(device: GfxDevice) {
        this.intersects.destroy(device)
        this.staticEntity.destroy(device)
    }
    prepareToRender(renderInstManager: GfxRenderInstManager) {
        if (this.visible) {
            this.staticEntity.prepareToRender(renderInstManager)
        }
    }
}
export class Scene implements Viewer.SceneGfx {
    fence: Fence
    sectors: Sector[]

    program: GfxProgram
    renderHelper: GfxRenderHelper
    renderInstListFence = new GfxRenderInstList
    renderInstListMain = new GfxRenderInstList
    constructor(
        device: GfxDevice,
        fenceBuffer: ArrayBufferLike,
        staticEntityBuffers: { name: string, buffer: ArrayBufferSlice }[]
    ) {
        this.renderHelper = new GfxRenderHelper(device)
        const renderCache = this.renderHelper.renderCache
        this.program = renderCache.createProgram(new Program)

        this.fence = new Fence(device, this.renderHelper.renderCache, fenceBuffer)
        this.sectors = staticEntityBuffers.map(obj => {
            return new Sector(obj.name, device, renderCache, obj.buffer)
        })
    }
    destroy(device: GfxDevice) {
        this.fence.destroy(device)
        this.sectors.forEach(sector => sector.destroy(device))
        this.renderHelper.destroy()
    }
    prepareToRender(device: GfxDevice, viewerInput: Viewer.ViewerRenderInput) {
        const template = this.renderHelper.pushTemplateRenderInst()

        template.setBindingLayouts([{ numUniformBuffers: 1, numSamplers: 0 }])
        template.setGfxProgram(this.program)
        template.setMegaStateFlags({ cullMode: GfxCullMode.Back })

        let offs = template.allocateUniformBuffer(Program.ub_SceneParams, 32)
        const mapped = template.mapUniformBufferF32(Program.ub_SceneParams)

        offs += fillMatrix4x4(mapped, offs, viewerInput.camera.projectionMatrix)
        offs += fillMatrix4x3(mapped, offs, viewerInput.camera.viewMatrix)

        this.renderHelper.renderInstManager.setCurrentList(this.renderInstListMain);

        this.fence.prepareToRender(this.renderHelper.renderInstManager)
        this.sectors.forEach(sector => sector.prepareToRender(this.renderHelper.renderInstManager))

        this.renderHelper.renderInstManager.popTemplate()
        this.renderHelper.prepareToRender()
    }
    render(device: GfxDevice, viewerInput: Viewer.ViewerRenderInput) {
        const mainColorDesc = makeBackbufferDescSimple(GfxrAttachmentSlot.Color0, viewerInput, makeAttachmentClearDescriptor(colorNewFromRGBA(.05, .06, .08, 1.)))
        const mainDepthDesc = makeBackbufferDescSimple(GfxrAttachmentSlot.DepthStencil, viewerInput, standardFullClearRenderPassDescriptor)

        const builder = this.renderHelper.renderGraph.newGraphBuilder()
        const mainColorTargetID = builder.createRenderTargetID(mainColorDesc, 'Main Color')
        const mainDepthTargetID = builder.createRenderTargetID(mainDepthDesc, 'Main Depth')

        builder.pushPass(pass => {
            pass.setDebugName('Main')
            pass.attachRenderTargetID(GfxrAttachmentSlot.Color0, mainColorTargetID)
            pass.attachRenderTargetID(GfxrAttachmentSlot.DepthStencil, mainDepthTargetID)
            pass.exec(passRenderer => {
                this.renderInstListMain.drawOnPassRenderer(this.renderHelper.renderCache, passRenderer)
            })
        })

        this.renderHelper.antialiasingSupport.pushPasses(builder, viewerInput, mainColorTargetID)
        builder.resolveRenderTargetToExternalTexture(mainColorTargetID, viewerInput.onscreenTexture)

        this.prepareToRender(device, viewerInput)
        this.renderHelper.renderGraph.execute(builder)
        this.renderInstListMain.reset()
    }
    createPanels(): UI.Panel[] {
        const layers = new UI.LayerPanel()
        layers.setLayers(this.sectors)
        return [layers]

    }
}
