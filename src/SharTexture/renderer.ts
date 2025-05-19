import * as Viewer from '../viewer.js'
import ArrayBufferSlice from '../ArrayBufferSlice.js'
import { colorNewFromRGBA } from '../Color.js'
import { DeviceProgram } from '../Program.js'
import { GfxDevice, GfxProgram, GfxCullMode } from '../gfx/platform/GfxPlatform.js'
import { GfxRenderHelper } from '../gfx/render/GfxRenderHelper.js'
import { GfxRenderInstList } from '../gfx/render/GfxRenderInstManager.js'
import { GfxShaderLibrary } from '../gfx/helpers/GfxShaderLibrary.js'
import { makeBackbufferDescSimple, makeAttachmentClearDescriptor, standardFullClearRenderPassDescriptor } from '../gfx/helpers/RenderGraphHelpers.js'
import { fillMatrix4x4, fillMatrix4x3 } from '../gfx/helpers/UniformBufferHelpers.js'
import { GfxrAttachmentSlot } from '../gfx/render/GfxRenderGraph.js'

import { StaticEntity } from './staticEntity.js'
import { Muncher } from './chunkMuncher.js'

export class Program extends DeviceProgram {
  static a_Position = 0
  static a_Normal = 1
  static a_Color = 2
  static a_TexCoord = 3

  static ub_SceneParams = 0
  override both = `
precision mediump float;

${GfxShaderLibrary.MatrixLibrary}

layout(std140) uniform ub_SceneParams {
  Mat4x4 u_Projection;
  Mat3x4 u_View;
};

uniform sampler2D u_Texture;

varying vec4 v_Color;
varying vec2 v_TexCoord;

#ifdef VERT
layout(location = ${Program.a_Position}) attribute vec3 a_Position;
layout(location = ${Program.a_Normal}) attribute vec3 a_Normal;
layout(location = ${Program.a_Color}) attribute uvec4 a_Color;
layout(location = ${Program.a_TexCoord}) attribute vec2 a_TexCoord;

void main() {
  float t_Scale = 100.;
  vec3 t_PositionWorld = UnpackMatrix(u_View) * vec4(a_Position * t_Scale, 1.);
  gl_Position = UnpackMatrix(u_Projection) * vec4(t_PositionWorld, 1.);
  v_Color = vec4(a_Color) / 255.;
  // v_TexCoord = a_TexCoord;
}
#endif

#ifdef FRAG
void main() {

// #ifdef USE_TEXTURE
//   vec4 v_Color = texture(SAMPLER_2D(u_Texture), v_TexCoord);
// #endif
  gl_FragColor = v_Color;
}
#endif
`
}

export class Scene implements Viewer.SceneGfx {
  staticEntities: StaticEntity[]

  renderHelper: GfxRenderHelper
  program: Program
  gfxProgram: GfxProgram | null
  renderInstListMain = new GfxRenderInstList

  constructor(device: GfxDevice, buffer: ArrayBufferSlice) {
    this.createProgram()
    this.renderHelper = new GfxRenderHelper(device)

    this.staticEntities = Muncher.staticEntities(device, this.renderHelper.renderCache, buffer)
  }
  createProgram() {
    this.program = new Program
    this.program.defines.set('USE_TEXTURE', '1')

    this.gfxProgram = null
  }
  destroy(device: GfxDevice) {
    this.staticEntities.forEach(se => se.destroy(device))
    this.renderHelper.destroy()
  }
  prepareToRender(device: GfxDevice, viewerInput: Viewer.ViewerRenderInput) {
    const template = this.renderHelper.pushTemplateRenderInst()

    if (this.gfxProgram === null) {
      this.gfxProgram = this.renderHelper.renderInstManager.gfxRenderCache.createProgram(this.program)
    }
    template.setBindingLayouts([{ numUniformBuffers: 1, numSamplers: 1 }])
    template.setGfxProgram(this.gfxProgram)
    template.setMegaStateFlags({ cullMode: GfxCullMode.None })

    let offs = template.allocateUniformBuffer(Program.ub_SceneParams, 32)
    const mapped = template.mapUniformBufferF32(Program.ub_SceneParams)

    offs += fillMatrix4x4(mapped, offs, viewerInput.camera.projectionMatrix)
    offs += fillMatrix4x3(mapped, offs, viewerInput.camera.viewMatrix)

    this.renderHelper.renderInstManager.setCurrentList(this.renderInstListMain)

    this.staticEntities.forEach(se => se.prepareToRender(this.renderHelper.renderInstManager))

    this.renderHelper.renderInstManager.popTemplate()
    this.renderHelper.prepareToRender()
  }
  render(device: GfxDevice, viewerInput: Viewer.ViewerRenderInput) {
    const builder = this.renderHelper.renderGraph.newGraphBuilder()
    const mainColorDesc = makeBackbufferDescSimple(GfxrAttachmentSlot.Color0, viewerInput, makeAttachmentClearDescriptor(colorNewFromRGBA(153 / 255, 194 / 255, 221 / 255, 1.)))
    const mainDepthDesc = makeBackbufferDescSimple(GfxrAttachmentSlot.DepthStencil, viewerInput, standardFullClearRenderPassDescriptor)

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
