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

export class StaticEntity {
  drawCount: number
  inputLayout: GfxInputLayout
  vertexDataBuffer: GfxBuffer
  vertexBufferDescriptors: GfxVertexBufferDescriptor[]

  textureMapping = [new TextureMapping]
  texture: GfxTexture
  sampler: GfxSampler

  constructor(device: GfxDevice, renderCache: GfxRenderCache, buffer: ArrayBufferLike, imageData: ImageData) {
    this.sampler = renderCache.createSampler({
      wrapS: GfxWrapMode.Repeat,
      wrapT: GfxWrapMode.Repeat,
      minFilter: GfxTexFilterMode.Bilinear,
      magFilter: GfxTexFilterMode.Bilinear,
      mipFilter: GfxMipFilterMode.Nearest,
      minLOD: 0,
      maxLOD: 1500.
    })

    const texture = device.createTexture(makeTextureDescriptor2D(GfxFormat.U8_RGBA_NORM, imageData.width, imageData.height, 1));
    device.setResourceName(texture, 'roof')
    device.uploadTextureData(texture, 0, [new Uint8Array(imageData.data.buffer)]);
    this.textureMapping[0].gfxTexture = texture
    this.textureMapping[0].gfxSampler = this.sampler

    const byteStride = 0x18
    this.drawCount = buffer.byteLength / byteStride

    const vertexAttributeDescriptors = [
      { location: Program.a_Position, format: GfxFormat.F32_RGB, bufferIndex: 0, bufferByteOffset: 0 },
      { location: Program.a_Color, format: GfxFormat.U8_RGBA, bufferIndex: 0, bufferByteOffset: 0xc },
      { location: Program.a_TexCoord, format: GfxFormat.F32_RG, bufferIndex: 0, bufferByteOffset: 0x10 },
    ]
    const inputLayoutBufferDescriptors = [{ byteStride, frequency: GfxVertexBufferFrequency.PerVertex }]

    this.inputLayout = renderCache.createInputLayout({
      vertexAttributeDescriptors,
      vertexBufferDescriptors: inputLayoutBufferDescriptors,
      indexBufferFormat: null
    })

    this.vertexDataBuffer = makeStaticDataBuffer(device, GfxBufferUsage.Vertex, buffer)
    this.vertexBufferDescriptors = [{ buffer: this.vertexDataBuffer, byteOffset: 0 }]
  }
  destroy(device: GfxDevice) {
    device.destroyBuffer(this.vertexDataBuffer)
  }
  prepareToRender(renderInstManager: GfxRenderInstManager) {
    const renderInst = renderInstManager.newRenderInst()

    renderInst.setVertexInput(this.inputLayout, this.vertexBufferDescriptors, null)
    renderInst.setDrawCount(this.drawCount)
    renderInst.setSamplerBindingsFromTextureMappings(this.textureMapping)

    renderInstManager.submitRenderInst(renderInst)
  }
}

