import ArrayBufferSlice from '../ArrayBufferSlice.js'
import { GfxRenderInstManager } from '../gfx/render/GfxRenderInstManager.js'
import { GfxRenderCache } from '../gfx/render/GfxRenderCache.js'
import { makeStaticDataBuffer } from '../gfx/helpers/BufferHelpers.js'
import { TextureHolder, TextureMapping } from '../TextureHolder.js'
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
  makeTextureDescriptor2D
} from '../gfx/platform/GfxPlatform.js'

import { Program } from './renderer.js'
import { StaticEntityLoader, PrimGroupBuffer } from './chunks/staticEntityLoader.js'
import { TextureIndexList } from './renderer.js'
import { ShaderList } from './chunks/shaderLoader.js'

export type StaticEntityBuffers = {
  positionData: ArrayBufferSlice,
  normalData: ArrayBufferSlice,
  colorData: ArrayBufferSlice,
  uvData: ArrayBufferSlice,
  indexData: ArrayBufferSlice,
}
export class StaticEntity {
  sortKeyIndex: number

  textureMapping = [new TextureMapping]
  sampler: GfxSampler

  drawCount: number
  inputLayout: GfxInputLayout
  vertexBufferDescriptors: GfxVertexBufferDescriptor[]
  indexBufferDescriptor: GfxIndexBufferDescriptor

  shaderName: string
  positionDataBuffer: GfxBuffer
  normalDataBuffer: GfxBuffer
  colorDataBuffer: GfxBuffer
  uvDataBuffer: GfxBuffer
  indexDataBuffer: GfxBuffer

  megaStateFlags: Partial<GfxMegaStateDescriptor>

  constructor(
    device: GfxDevice,
    renderCache: GfxRenderCache,
    sampler: GfxSampler,
    textures: Record<string, GfxTexture>,
    shaders: ShaderList,
    sel: StaticEntityLoader,
    sortKeyIndex: number
  ) {
    this.sortKeyIndex = sortKeyIndex

    const shader = shaders[sel.shaderName]
    if ('TEX' in shader) {
      const texturePath = shader['TEX']!
      const texture = textures[texturePath]

      this.textureMapping[0].gfxSampler = sampler
      this.textureMapping[0].gfxTexture = texture
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
          // blendSrcFactor: GfxBlendFactor.One,
          // blendDstFactor: GfxBlendFactor.Zero
          blendSrcFactor: GfxBlendFactor.SrcAlpha,
          blendDstFactor: GfxBlendFactor.OneMinusSrcAlpha
        },
        alphaBlendState: {
          blendMode: GfxBlendMode.Add,
          blendSrcFactor: GfxBlendFactor.One,
          blendDstFactor: GfxBlendFactor.Zero
        }
      }],
      depthCompare: undefined,
      depthWrite: undefined,
      stencilCompare: undefined,
      stencilWrite: undefined,
      stencilPassOp: undefined,
      cullMode: GfxCullMode.None,
      frontFace: undefined,
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
    const renderInst = renderInstManager.newRenderInst()

    renderInst.setVertexInput(this.inputLayout, this.vertexBufferDescriptors, this.indexBufferDescriptor)
    renderInst.setDrawCount(this.drawCount)
    renderInst.setMegaStateFlags(this.megaStateFlags)
    renderInst.sortKey = this.sortKeyIndex

    if (this.textureMapping[0].gfxTexture != undefined) {
      renderInst.setSamplerBindingsFromTextureMappings(this.textureMapping)
    }

    renderInstManager.submitRenderInst(renderInst)
  }
}

