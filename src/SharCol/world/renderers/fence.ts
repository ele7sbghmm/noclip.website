import { mat4 } from 'gl-matrix'
import ArrayBufferSlice from '../../../ArrayBufferSlice.js'
import { GfxRenderInstManager } from '../../../gfx/render/GfxRenderInstManager.js'
import { GfxRenderCache } from '../../../gfx/render/GfxRenderCache.js'
import { makeStaticDataBuffer } from '../../../gfx/helpers/BufferHelpers.js'
import { fillMatrix4x4 } from '../../../gfx/helpers/UniformBufferHelpers.js'
import {
  GfxDevice,
  GfxVertexBufferDescriptor,
  GfxIndexBufferDescriptor,
  GfxInputLayout,
  GfxFormat,
  GfxBufferUsage,
  GfxVertexBufferFrequency,
  GfxCullMode
} from '../../../gfx/platform/GfxPlatform.js'

import { Program } from '../../program.js'
import { EntityRenderer } from './util.js'
import { Entity } from '../../chunk/loaders/util.js'

export class FenceRenderer extends EntityRenderer {
  static doubleSided = true

  constructor(device: GfxDevice, renderCache: GfxRenderCache, entity: Entity) {
    super()
    const vertexAttributeDescriptors = [
      { location: Program.a_Position, format: GfxFormat.F32_RGB, bufferIndex: 0, bufferByteOffset: 0 },
      { location: Program.a_Normal, format: GfxFormat.F32_RGB, bufferIndex: 1, bufferByteOffset: 0 },
      { location: Program.a_Color, format: GfxFormat.U8_RGBA, bufferIndex: 2, bufferByteOffset: 0 }
    ]
    const inputLayoutBufferDescriptors = [
      { byteStride: 0xC, frequency: GfxVertexBufferFrequency.PerVertex },
      { byteStride: 0xC, frequency: GfxVertexBufferFrequency.PerVertex },
      { byteStride: 0x4, frequency: GfxVertexBufferFrequency.PerVertex }
    ]
    const indexBufferFormat = null
    let posData = entity.positionData.arrayBuffer
    let nrmData = entity.normalData!.arrayBuffer
    let clrData = entity.colorData!.arrayBuffer

    this.drawCount = posData.byteLength / 12
    this.vertexDataBuffer = makeStaticDataBuffer(device, GfxBufferUsage.Vertex, posData)
    this.normalDataBuffer = makeStaticDataBuffer(device, GfxBufferUsage.Vertex, nrmData)
    this.colorDataBuffer = makeStaticDataBuffer(device, GfxBufferUsage.Vertex, clrData)
    this.vertexBufferDescriptors = [
      { byteOffset: 0, buffer: this.vertexDataBuffer },
      { byteOffset: 0, buffer: this.normalDataBuffer! },
      { byteOffset: 0, buffer: this.colorDataBuffer! }
    ]
    this.indexBufferDescriptor = null
    this.inputLayout = renderCache.createInputLayout({
      vertexAttributeDescriptors,
      vertexBufferDescriptors: inputLayoutBufferDescriptors,
      indexBufferFormat,
    })

    this.megaStateFlags = { cullMode: FenceRenderer.doubleSided ? GfxCullMode.None : GfxCullMode.Front }
  }
  destroy(device: GfxDevice) {
    device.destroyBuffer(this.vertexDataBuffer)
    device.destroyBuffer(this.normalDataBuffer!)
  }
  prepareToRender(renderInstManager: GfxRenderInstManager) {
    if (!this.drawCount)
      return

    const template = renderInstManager.pushTemplate()

    let offs = template.allocateUniformBuffer(Program.ub_ModelParams, 16)
    const mapped = template.mapUniformBufferF32(Program.ub_ModelParams)

    offs += fillMatrix4x4(mapped, offs, mat4.create())

    const renderInst = renderInstManager.newRenderInst()
    renderInst.setMegaStateFlags(this.megaStateFlags)
    renderInst.setVertexInput(
      this.inputLayout,
      this.vertexBufferDescriptors,
      this.indexBufferDescriptor
    )
    renderInst.setDrawCount(this.drawCount)
    renderInstManager.submitRenderInst(renderInst)

    renderInstManager.popTemplate()
  }
}
