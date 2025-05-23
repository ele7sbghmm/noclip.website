import * as Viewer from '../viewer.js'
import { SceneContext } from '../SceneBase.js'
import ArrayBufferSlice from '../ArrayBufferSlice.js'
import { colorNewFromRGBA } from '../Color.js'
import { DeviceProgram } from '../Program.js'
import {
  GfxDevice,
  GfxProgram,
  GfxCullMode,
  GfxFormat,
  GfxTexture,
  GfxSampler,
  GfxWrapMode,
  GfxTexFilterMode,
  GfxMipFilterMode,
  makeTextureDescriptor2D,
} from '../gfx/platform/GfxPlatform.js'
import { TextureHolder } from '../TextureHolder.js'
import { GfxRenderHelper } from '../gfx/render/GfxRenderHelper.js'
import { GfxRenderInstList } from '../gfx/render/GfxRenderInstManager.js'
import { GfxShaderLibrary } from '../gfx/helpers/GfxShaderLibrary.js'
import { makeBackbufferDescSimple, makeAttachmentClearDescriptor, standardFullClearRenderPassDescriptor } from '../gfx/helpers/RenderGraphHelpers.js'
import { fillMatrix4x4, fillMatrix4x3 } from '../gfx/helpers/UniformBufferHelpers.js'
import { GfxrAttachmentSlot } from '../gfx/render/GfxRenderGraph.js'

import { StaticEntity } from './staticEntity.js'
import { StaticEntityLoader } from './chunks/staticEntityLoader.js'
import { ShaderList } from './chunks/shaderLoader.js'
import { fetchPNG } from './scenes.js'

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
  v_TexCoord = vec2(a_TexCoord.x, 1. - a_TexCoord.y);
}
#endif

#ifdef FRAG
void main() {
  vec4 t_Color = vec4(1., 1., 1., 1.);
#ifdef USE_TEXTURE
  t_Color = texture(SAMPLER_2D(u_Texture), v_TexCoord);
#endif
  t_Color.rgb *= v_Color.rgb;
  t_Color.a = v_Color.a;
  gl_FragColor = t_Color;
}
#endif
`
}

// type TextureIndexList = Record<string, GfxTexture>
export type TextureIndexList = Record<string, number>
export class Scene implements Viewer.SceneGfx {
  staticEntities: StaticEntity[]
  staticEntityLoaders: StaticEntityLoader[] = []

  shaders: ShaderList = {}
  texturesSlice: Record<string, ArrayBufferSlice> = {}
  texturesImageData: Record<string, ImageData> = {}
  textures: Record<string, GfxTexture> = {}

  renderHelper: GfxRenderHelper
  program: Program
  gfxProgram: GfxProgram | null
  renderInstListMain = new GfxRenderInstList
  sampler: GfxSampler
  textureList: Record<string, GfxTexture> = {}

  constructor(device: GfxDevice, context: SceneContext) {
    this.createProgram()
    this.renderHelper = new GfxRenderHelper(device)

    this.sampler = this.renderHelper.renderCache.createSampler({
      wrapS: GfxWrapMode.Repeat,
      wrapT: GfxWrapMode.Repeat,
      minFilter: GfxTexFilterMode.Bilinear,
      magFilter: GfxTexFilterMode.Bilinear,
      mipFilter: GfxMipFilterMode.Nearest,
      minLOD: 0.,
      maxLOD: 0.
    })
  }
  arrayBs(bufferLike: ArrayBufferLike) {
    if (bufferLike instanceof ArrayBuffer) {
      return bufferLike
    }
    const arrayBuffer = new ArrayBuffer(bufferLike.byteLength)
    const srcView = new Uint8Array(bufferLike)
    const dstView = new Uint8Array(arrayBuffer)
    dstView.set(srcView)
    return arrayBuffer
  }
  async doTextureStuff() {
    this.texturesImageData = Object.fromEntries(await Promise.all(
      Object.entries(this.texturesSlice).map(async ([path, slc]) => {
        const data = await fetchPNG(this.arrayBs(slc.arrayBuffer))
        return [path, data]
      })
    ))
  }
  doAfter(device: GfxDevice) {
    for (const name in this.texturesImageData) {
      const imageData = this.texturesImageData[name]
      const texture = device.createTexture(
        makeTextureDescriptor2D(GfxFormat.U8_RGBA_NORM, imageData.width, imageData.height, 1)
      )
      device.setResourceName(texture, name)
      device.uploadTextureData(texture, 0, [new Uint8Array(imageData.data.buffer)])

      this.textureList[name.slice(0, -4)] = texture
    }

    this.staticEntities = []
    for (let i = 0; i < this.staticEntityLoaders.length; i++) {
      const sel = this.staticEntityLoaders[i]
      const se = new StaticEntity(
        device,
        this.renderHelper.renderCache,
        this.sampler,
        this.textureList,
        this.shaders,
        sel,
        i
      )
      this.staticEntities.push(se)
    }
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
    const mainColorDesc = makeBackbufferDescSimple(
      GfxrAttachmentSlot.Color0,
      viewerInput,
      makeAttachmentClearDescriptor(colorNewFromRGBA(153 / 255, 194 / 255, 221 / 255, 1.))
    )
    const mainDepthDesc = makeBackbufferDescSimple(
      GfxrAttachmentSlot.DepthStencil,
      viewerInput,
      standardFullClearRenderPassDescriptor
    )

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
