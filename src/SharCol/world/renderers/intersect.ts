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
  GfxVertexBufferFrequency
} from '../../../gfx/platform/GfxPlatform.js'

import { Program } from '../../program.js'
import { EntityRenderer } from './util.js'
import { Entity } from '../../chunk/loaders/util.js'

export class IntersectRenderer extends EntityRenderer {
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

    this.drawCount = entity.positionData.byteLength / 12
    this.vertexDataBuffer = makeStaticDataBuffer(device, GfxBufferUsage.Vertex, entity.positionData.arrayBuffer)
    this.normalDataBuffer = makeStaticDataBuffer(device, GfxBufferUsage.Vertex, entity.normalData!.arrayBuffer)
    this.colorDataBuffer = makeStaticDataBuffer(device, GfxBufferUsage.Vertex, entity.colorData!.arrayBuffer)
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
  }
  destroy(device: GfxDevice) {
    device.destroyBuffer(this.vertexDataBuffer)
    device.destroyBuffer(this.normalDataBuffer!)
  }
  prepareToRender(renderInstManager: GfxRenderInstManager) {
    const template = renderInstManager.pushTemplate()

    const mapped = template.mapUniformBufferF32(Program.ub_ModelParams)
    let offs = template.allocateUniformBuffer(Program.ub_ModelParams, 16)
    offs += fillMatrix4x4(mapped, offs, mat4.create())

    const renderInst = renderInstManager.newRenderInst()
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
