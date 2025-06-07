import ArrayBufferSlice from '../../ArrayBufferSlice.js'
import * as Viewer from '../../viewer.js'
import { GfxRenderInstManager } from '../../gfx/render/GfxRenderInstManager.js'
import { GfxRenderCache } from '../../gfx/render/GfxRenderCache.js'
import { makeStaticDataBuffer } from '../../gfx/helpers/BufferHelpers.js'
import { TextureHolder, TextureMapping } from '../../TextureHolder.js'
import { fillMatrix4x4 } from '../../gfx/helpers/UniformBufferHelpers.js'
import {
  GfxDevice,
  GfxBuffer,
  GfxInputLayout,
  GfxFormat,
  GfxVertexBufferDescriptor,
  GfxIndexBufferDescriptor,
  GfxVertexBufferFrequency,
  GfxBufferUsage,
  GfxTexture,
  GfxSampler,
  makeTextureDescriptor2D,
  GfxWrapMode,
  GfxTexFilterMode,
  GfxMipFilterMode,
  GfxCullMode,
  GfxAttachmentState,
  GfxChannelBlendState,
  GfxChannelWriteMask,
  GfxBlendMode,
  GfxBlendFactor,
  GfxMegaStateDescriptor,
  GfxCompareMode,
  GfxFrontFaceMode
} from '../../gfx/platform/GfxPlatform.js'

import { Program } from '../renderer.js'
import { DynaPhysLoader } from '../chunks/dynaPhysEntityLoader.js'
import { ShaderList } from '../chunks/shaderLoader.js'
import { IEntityDSG } from '../chunkHandler.js'
import { defaultBlendState, defaultMegaState, reverseDepthForCompareMode } from '../util.js'

export class DynaPhysDSG extends IEntityDSG {
  static n = 0

  textureMapping = [new TextureMapping]
  sampler: GfxSampler

  drawCount: number
  inputLayout: GfxInputLayout
  vertexBufferDescriptors: GfxVertexBufferDescriptor[]
  indexBufferDescriptor: GfxIndexBufferDescriptor

  positionDataBuffer: GfxBuffer
  normalDataBuffer: GfxBuffer
  colorDataBuffer: GfxBuffer
  uvDataBuffer: GfxBuffer
  indexDataBuffer: GfxBuffer

  megaStateFlags: Partial<GfxMegaStateDescriptor>

  textureFound: boolean = false
  alphaTest: boolean = false
  constructor(
    device: GfxDevice,
    renderCache: GfxRenderCache,
    sampler: GfxSampler,
    textures: Record<string, GfxTexture>,
    shaders: ShaderList,
    sel: IEntityDSG
  ) {
    super()
    DynaPhysDSG.n += 1

    this.boundingBox = sel.boundingBox
    this.boundingSphere = sel.boundingSphere
    this.matrix = sel.matrix
    
    this.megaStateFlags = defaultMegaState

    const shader = shaders[sel.shaderName]
    if (shader != undefined) {
      if ('TEX' in shader) {
        const textureName = shader['TEX']
        let texture: GfxTexture | null = null
        if (typeof textureName === 'string') {
          texture = textures[textureName]
          if (texture) {
            this.textureFound = true

            this.textureMapping[0].gfxSampler = sampler
            this.textureMapping[0].gfxTexture = texture
          }
        }

        this.translucent = sel.translucent
        this.castsShadow = sel.castsShadow
      }

      if ('2SID' in shader)
      //   this.megaStateFlags.cullMode = !shader['2SID'] ? GfxCullMode.None : GfxCullMode.Front
      
      if ('ATST' in shader) {
        this.alphaTest = !!shader['ATST']

        this.megaStateFlags.attachmentsState = [{
          channelWriteMask: GfxChannelWriteMask.RGB,
          rgbBlendState: {
            blendMode: GfxBlendMode.Add,
            blendSrcFactor: this.alphaTest ? GfxBlendFactor.One : GfxBlendFactor.SrcAlpha,
            blendDstFactor: this.alphaTest ? GfxBlendFactor.Zero : GfxBlendFactor.OneMinusSrcAlpha
          },
          alphaBlendState: defaultBlendState
        }]
      }
    }

    this.drawCount = sel.indexData.byteLength / 4

    const vertexAttributeDescriptors = [
      { location: Program.a_Position, format: GfxFormat.F32_RGB, bufferIndex: 0, bufferByteOffset: 0 },
      { location: Program.a_Normal, format: GfxFormat.F32_RGB, bufferIndex: 1, bufferByteOffset: 0 },
      { location: Program.a_Color, format: GfxFormat.U8_RGBA, bufferIndex: 2, bufferByteOffset: 0 },
      { location: Program.a_TexCoord, format: GfxFormat.F32_RG, bufferIndex: 3, bufferByteOffset: 0 }
    ]
    const inputLayoutBufferDescriptors = [
      { byteStride: 12, frequency: GfxVertexBufferFrequency.PerVertex },
      { byteStride: 12, frequency: GfxVertexBufferFrequency.PerVertex },
      { byteStride: 4, frequency: GfxVertexBufferFrequency.PerVertex },
      { byteStride: 8, frequency: GfxVertexBufferFrequency.PerVertex }
    ]
    const indexBufferFormat = GfxFormat.U32_R

    this.inputLayout = renderCache.createInputLayout({
      vertexAttributeDescriptors,
      vertexBufferDescriptors: inputLayoutBufferDescriptors,
      indexBufferFormat
    })

    this.positionDataBuffer = makeStaticDataBuffer(device, GfxBufferUsage.Vertex, sel.positionData.arrayBuffer)
    this.normalDataBuffer = makeStaticDataBuffer(device, GfxBufferUsage.Vertex, sel.normalData.arrayBuffer)
    this.colorDataBuffer = makeStaticDataBuffer(device, GfxBufferUsage.Vertex, sel.colorData.arrayBuffer)
    this.uvDataBuffer = makeStaticDataBuffer(device, GfxBufferUsage.Vertex, sel.uvData.arrayBuffer)
    this.indexDataBuffer = makeStaticDataBuffer(device, GfxBufferUsage.Index, sel.indexData.arrayBuffer)
    this.vertexBufferDescriptors = [
      { buffer: this.positionDataBuffer, byteOffset: 0 },
      { buffer: this.normalDataBuffer, byteOffset: 0 },
      { buffer: this.colorDataBuffer, byteOffset: 0 },
      { buffer: this.uvDataBuffer, byteOffset: 0 }
    ]
    this.indexBufferDescriptor = { buffer: this.indexDataBuffer, byteOffset: 0 }

    this.megaStateFlags = {
      attachmentsState: [{
        channelWriteMask: GfxChannelWriteMask.RGB,
        rgbBlendState: {
          blendMode: GfxBlendMode.Add,
          blendSrcFactor: GfxBlendFactor.SrcAlpha,
          blendDstFactor: GfxBlendFactor.OneMinusSrcAlpha
        },
        alphaBlendState: {
          blendMode: GfxBlendMode.Add,
          blendSrcFactor: GfxBlendFactor.One,
          blendDstFactor: GfxBlendFactor.Zero
        }
      }],
      depthCompare: GfxCompareMode.Greater,
      depthWrite: (this.translucent || this.castsShadow) ? false : true,
      stencilCompare: undefined,
      stencilWrite: undefined,
      stencilPassOp: undefined,
      cullMode: GfxCullMode.None,
      frontFace: GfxFrontFaceMode.CW,
      polygonOffset: undefined,
      wireframe: false
    }
  }
  destroy(device: GfxDevice) {
    device.destroyBuffer(this.positionDataBuffer)
    device.destroyBuffer(this.normalDataBuffer)
    device.destroyBuffer(this.colorDataBuffer)
    device.destroyBuffer(this.uvDataBuffer)
    device.destroyBuffer(this.indexDataBuffer)
  }
  prepareToRender(renderInstManager: GfxRenderInstManager) {
    const template = renderInstManager.pushTemplate()

    let offs = template.allocateUniformBuffer(Program.ub_ModelParams, 16)
    const mapped = template.mapUniformBufferF32(Program.ub_ModelParams)

    offs += fillMatrix4x4(mapped, offs, this.matrix)

    const renderInst = renderInstManager.newRenderInst()

    renderInst.setVertexInput(this.inputLayout, this.vertexBufferDescriptors, this.indexBufferDescriptor)
    renderInst.setDrawCount(this.drawCount)
    renderInst.setMegaStateFlags(this.megaStateFlags)

    if (this.textureMapping[0].gfxTexture != undefined) {
      renderInst.setSamplerBindingsFromTextureMappings(this.textureMapping)
    }

    renderInstManager.submitRenderInst(renderInst)
    renderInstManager.popTemplate()
  }
}

