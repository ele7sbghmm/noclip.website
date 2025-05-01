import * as Viewer from '../viewer.js'
import { DeviceProgram } from '../Program.js'
import ArrayBufferSlice from '../ArrayBufferSlice.js'
import { colorNewFromRGBA } from '../Color.js'
import { GfxrAttachmentSlot } from '../gfx/render/GfxRenderGraph.js'
import { makeBackbufferDescSimple, makeAttachmentClearDescriptor, standardFullClearRenderPassDescriptor } from '../gfx/helpers/RenderGraphHelpers.js'
import { GfxRenderHelper } from '../gfx/render/GfxRenderHelper.js'
import { GfxRenderInstList } from '../gfx/render/GfxRenderInstManager.js'
import { GfxDevice, GfxProgram } from '../gfx/platform/GfxPlatform.js'
import { fillMatrix4x4, fillMatrix4x3 } from '../gfx/helpers/UniformBufferHelpers.js'
import { GfxShaderLibrary } from '../gfx/helpers/GfxShaderLibrary.js'

import { Pgf } from './pgf/pgf.js'
import { PgfRender } from './pgf/render.js'

export class Program extends DeviceProgram {
    static a_Position = 0
    static a_Color = 1
    static ub_SceneParams = 0
    override both = `
precision mediump float;

${GfxShaderLibrary.MatrixLibrary}

layout(std140) uniform ub_SceneParams {
    Mat4x4 u_Projection;
    Mat3x4 u_View;
};

varying vec3 v_Color;

#ifdef VERT
layout(location = ${Program.a_Position} attribute vec3 a_Position;
layout(location = ${Program.a_Color} attribute uvec4 a_Color;

void mainVS() {
    vec4 t_Position = UnpackMatrix(u_View) * vec4(a_Position, 1.);
    gl_Position = UnpackMatrix(u_Projection) * vec4(t_Position, 1.);
    float t_Alpha = float(a_Color.a) / 255.;
    v_Color = vec3(a_Color.r, a_Color.g, a_Color.b) * t_Alpha;
}
#endif

#ifdef FRAG
void mainPS() {
    gl_FragColor = vec4(v_Color, 0.);
}
#endif
`
}

export class Scene implements Viewer.SceneGfx {
    renderHelper: GfxRenderHelper
    renderInstListMain = new GfxRenderInstList
    program: GfxProgram
    model: PgfRenderer
    constructor(device: GfxDevice, pgf: Pgf) {
        this.renderHelper = new GfxRenderHelper(device)
        this.program = this.renderHelper.renderCache.createProgram(new Program)

        this.model = new PgfRenderer(pgf)
    }
    destroy(device: GfxDevice) {
        this.model.destroy(device)
        this.renderHelper.destroy()
    }
    prepareToRender(device: GfxDevice, viewerInput: Viewer.ViewerRenderInput) {
        const template = this.renderHelper.pushTemplateRenderInst()
        template.setBindingLayouts([{ numUniformBuffers: 1, numSamplers: 0 }])
        template.setGfxProgram(this.program)
        template.setMegaStateFlags({})

        let offs = template.allocateUniformBuffer(Program.ub_SceneParams, 32)
        const mapped = template.mapUniformBufferF32(Program.ub_SceneParams)
        offs = fillMatrix4x4(mapped, offs, viewerInput.camera.projectionMatrix)
        offs = fillMatrix4x3(mapped, offs, viewerInput.camera.viewMatrix)

        this.renderHelper.renderInstManager.setCurrentList(this.renderInstListMain)
        this.model.prepareToRender(this.renderHelper.renderInstManager, this.renderHelper.renderCache)
        this.renderHelper.prepareToRender()

        this.renderHelper.renderInstManager.popTemplate()
    }
    render(device: GfxDevice, viewerInput: Viewer.ViewerRenderInput) {
        const mainColorDesc = makeBackbufferDescSimple(GfxrAttachmentSlot.Color0, viewerInput, makeAttachmentClearDescriptor(colorNewFromRGBA(.2, .2, .2, 1.)))
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
}
