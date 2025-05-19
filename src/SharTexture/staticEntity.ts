import ArrayBufferSlice from '../ArrayBufferSlice.js'
import { GfxRenderInstManager } from '../gfx/render/GfxRenderInstManager.js'
import { GfxRenderCache } from '../gfx/render/GfxRenderCache.js'
import { makeStaticDataBuffer } from '../gfx/helpers/BufferHelpers.js'
import { TextureMapping } from '../TextureHolder.js'
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
  makeTextureDescriptor2D
} from '../gfx/platform/GfxPlatform.js'

import { Program } from './renderer.js'

export type StaticEntityBuffers = {
  positionData: ArrayBufferSlice,
  normalData: ArrayBufferSlice,
  colorData: ArrayBufferSlice,
  uvData: ArrayBufferSlice,
  indexData: ArrayBufferSlice,
}
export class StaticEntity {
  drawCount: number
  inputLayout: GfxInputLayout
  vertexBufferDescriptors: GfxVertexBufferDescriptor[]
  indexBufferDescriptor: GfxIndexBufferDescriptor

  positionDataBuffer: GfxBuffer
  normalDataBuffer: GfxBuffer
  colorDataBuffer: GfxBuffer
  uvDataBuffer: GfxBuffer
  indexDataBuffer: GfxBuffer

  textureMapping = [new TextureMapping]
  texture: GfxTexture
  sampler: GfxSampler

  constructor(
    device: GfxDevice,
    renderCache: GfxRenderCache,
    // imageData: ImageData,
    buffers: StaticEntityBuffers
  ) {
    // this.sampler = renderCache.createSampler({
    //   wrapS: GfxWrapMode.Repeat,
    //   wrapT: GfxWrapMode.Repeat,
    //   minFilter: GfxTexFilterMode.Bilinear,
    //   magFilter: GfxTexFilterMode.Bilinear,
    //   mipFilter: GfxMipFilterMode.Nearest,
    //   minLOD: 0,
    //   maxLOD: 1500.
    // })

    // const texture = device.createTexture(makeTextureDescriptor2D(GfxFormat.U8_RGBA_NORM, imageData.width, imageData.height, 1));
    // device.setResourceName(texture, 'roof')
    // device.uploadTextureData(texture, 0, [new Uint8Array(imageData.data.buffer)]);
    // this.textureMapping[0].gfxTexture = texture
    // this.textureMapping[0].gfxSampler = this.sampler
    //
    this.drawCount = buffers.positionData.byteLength / 12

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

    this.positionDataBuffer = makeStaticDataBuffer(device, GfxBufferUsage.Vertex, buffers.positionData.arrayBuffer)
    this.normalDataBuffer = makeStaticDataBuffer(device, GfxBufferUsage.Vertex, buffers.normalData.arrayBuffer)
    this.colorDataBuffer = makeStaticDataBuffer(device, GfxBufferUsage.Vertex, buffers.colorData.arrayBuffer)
    this.uvDataBuffer = makeStaticDataBuffer(device, GfxBufferUsage.Vertex, buffers.uvData.arrayBuffer)
    this.indexDataBuffer = makeStaticDataBuffer(device, GfxBufferUsage.Index, buffers.indexData.arrayBuffer)
    this.vertexBufferDescriptors = [
      { buffer: this.positionDataBuffer, byteOffset: 0 },
      { buffer: this.normalDataBuffer, byteOffset: 0 },
      { buffer: this.colorDataBuffer, byteOffset: 0 },
      { buffer: this.uvDataBuffer, byteOffset: 0 }
    ]
    this.indexBufferDescriptor = { buffer: this.indexDataBuffer, byteOffset: 0 }
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
    // renderInst.setSamplerBindingsFromTextureMappings(this.textureMapping)

    renderInstManager.submitRenderInst(renderInst)
  }
}

