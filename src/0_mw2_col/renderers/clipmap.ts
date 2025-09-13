import { vec3 } from 'gl-matrix'
import { GfxRenderInstManager } from '../../gfx/render/GfxRenderInstManager.js'
import { GfxRenderCache } from '../../gfx/render/GfxRenderCache.js'
import { makeStaticDataBuffer } from '../../gfx/helpers/BufferHelpers.js'
import {
  GfxDevice,
  GfxInputLayout,
  GfxBuffer,
  GfxFormat,
  GfxBufferUsage,
  GfxVertexBufferFrequency,
  GfxVertexBufferDescriptor,
  GfxIndexBufferDescriptor,
  GfxCullMode
} from '../../gfx/platform/GfxPlatform.js'

import { Program } from '../program.js'
import { Clipmap, Brush, Bounds, Plane } from '../parsers/clipmap.js'
import { brushToHull } from '../util/poly.js'
import { vToVn, triFanToTris, doubleSided } from './util.js'

const scratchVec3 = vec3.create()

export class ClipmapRenderer {
  brushRenderer: BrushRenderer
  triSoupRenderer: TriSoupRenderer

  constructor(device: GfxDevice, renderCache: GfxRenderCache, cm: Clipmap) {
    const mask = 0b00000000_00000001_00000000_00000000
    this.brushRenderer = new BrushRenderer(device, renderCache, cm.brushes, mask)
    this.triSoupRenderer = new TriSoupRenderer(device, renderCache, cm)
  }
  destroy(device: GfxDevice) {
    this.brushRenderer.destroy(device)
    this.triSoupRenderer.destroy(device)
  }
  prepareToRender(renderInstManager: GfxRenderInstManager) {
    this.brushRenderer.prepareToRender(renderInstManager)
    this.triSoupRenderer.prepareToRender(renderInstManager)
  }
}

class TriSoupRenderer {
  drawCount: number

  vertexDataBuffer: GfxBuffer
  normalDataBuffer: GfxBuffer
  colorDataBuffer: GfxBuffer

  vertexBufferDescriptors: GfxVertexBufferDescriptor[]
  indexBufferDescriptor: null | GfxIndexBufferDescriptor
  inputLayout: GfxInputLayout

  constructor(device: GfxDevice, renderCache: GfxRenderCache, cm: Clipmap) {
    const indexed = cm.triIndices.flatMap(is => [cm.verts[is[0]], cm.verts[is[2]], cm.verts[is[1]]])
    const len = indexed.length
    const nrms = vToVn(indexed)

    const vb = new Float32Array(len * 3)
    const nb = new Float32Array(len * 3)
    const cb = new Uint32Array(Array.from({ length: len }, () => 0xff666666))
    indexed.forEach((t, i) => vb.set(t, i * 3))
    nrms.forEach((n, i) => nb.set(n, i * 3))

    this.drawCount = indexed.length
    this.vertexDataBuffer = makeStaticDataBuffer(device, GfxBufferUsage.Vertex, vb.buffer)
    this.normalDataBuffer = makeStaticDataBuffer(device, GfxBufferUsage.Vertex, nb.buffer)
    this.colorDataBuffer = makeStaticDataBuffer(device, GfxBufferUsage.Vertex, cb.buffer)

    const vertexAttributeDescriptors = [
      { location: Program.a_Position, format: GfxFormat.F32_RGB, bufferIndex: 0, bufferByteOffset: 0 },
      { location: Program.a_Normal, format: GfxFormat.F32_RGB, bufferIndex: 1, bufferByteOffset: 0 },
      { location: Program.a_Color, format: GfxFormat.U8_RGBA, bufferIndex: 2, bufferByteOffset: 0 }
    ]
    const vertexInputLayoutBufferDescriptors = [
      { byteStride: 12, frequency: GfxVertexBufferFrequency.PerVertex },
      { byteStride: 12, frequency: GfxVertexBufferFrequency.PerVertex },
      { byteStride: 4, frequency: GfxVertexBufferFrequency.PerVertex }
    ]
    const indexBufferFormat = null

    this.inputLayout = renderCache.createInputLayout({
      vertexAttributeDescriptors,
      vertexBufferDescriptors: vertexInputLayoutBufferDescriptors,
      indexBufferFormat
    })

    this.vertexBufferDescriptors = [
      { buffer: this.vertexDataBuffer, byteOffset: 0 },
      { buffer: this.normalDataBuffer, byteOffset: 0 },
      { buffer: this.colorDataBuffer, byteOffset: 0 }
    ]
    this.indexBufferDescriptor = null
  }
  destroy(device: GfxDevice) {
    device.destroyBuffer(this.vertexDataBuffer)
    device.destroyBuffer(this.normalDataBuffer)
    device.destroyBuffer(this.colorDataBuffer)
  }
  prepareToRender(renderInstManager: GfxRenderInstManager) {
    const renderInst = renderInstManager.newRenderInst()

    renderInst.setVertexInput(this.inputLayout, this.vertexBufferDescriptors, this.indexBufferDescriptor)
    renderInst.setDrawCount(this.drawCount)
    renderInst.setMegaStateFlags({ cullMode: GfxCullMode.Back })

    renderInstManager.submitRenderInst(renderInst)
  }
}

class BrushRenderer {
  drawCount: number
  vertexDataBuffer: GfxBuffer
  normalDataBuffer: GfxBuffer
  colorDataBuffer: GfxBuffer
  vertexBufferDescriptors: GfxVertexBufferDescriptor[]
  inputLayout: GfxInputLayout

  constructor(device: GfxDevice, renderCache: GfxRenderCache, brushes: Brush[], bitMask: number) {
    const hasSides = brushes.filter(brush => brush.sides.length > 0)
    const masked = hasSides.filter(brush => brush.contents & bitMask)
    const hulls = masked.map(brush => brushToHull(brush))
    const trifans = hulls.map(hull => hull.map(poly => triFanToTris(poly)))
    const tris = doubleSided(trifans.flat().flat())
    const nrms = vToVn(tris)

    const cb = new Uint32Array(Array.from({ length: tris.length }, () => 0xff666666))

    const vb = new Float32Array(tris.length * 3)
    const nb = new Float32Array(nrms.length * 3)
    tris.forEach((t, i) => vb.set(t, i * 3))
    nrms.forEach((n, i) => nb.set(n, i * 3))

    this.drawCount = vb.length / 3
    this.vertexDataBuffer = makeStaticDataBuffer(device, GfxBufferUsage.Vertex, vb.buffer)
    this.normalDataBuffer = makeStaticDataBuffer(device, GfxBufferUsage.Vertex, nb.buffer)
    this.colorDataBuffer = makeStaticDataBuffer(device, GfxBufferUsage.Vertex, cb.buffer)

    const vertexAttributeDescriptors = [
      { location: Program.a_Position, format: GfxFormat.F32_RGB, bufferIndex: 0, bufferByteOffset: 0 },
      { location: Program.a_Normal, format: GfxFormat.F32_RGB, bufferIndex: 1, bufferByteOffset: 0 },
      { location: Program.a_Color, format: GfxFormat.U8_RGBA, bufferIndex: 2, bufferByteOffset: 0 }
    ]
    const vertexInputLayoutBufferDescriptors = [
      { byteStride: 12, frequency: GfxVertexBufferFrequency.PerVertex },
      { byteStride: 12, frequency: GfxVertexBufferFrequency.PerVertex },
      { byteStride: 4, frequency: GfxVertexBufferFrequency.PerVertex }
    ]

    this.inputLayout = renderCache.createInputLayout({
      vertexAttributeDescriptors,
      vertexBufferDescriptors: vertexInputLayoutBufferDescriptors,
      indexBufferFormat: null
    })

    this.vertexBufferDescriptors = [
      { buffer: this.vertexDataBuffer, byteOffset: 0 },
      { buffer: this.normalDataBuffer, byteOffset: 0 },
      { buffer: this.colorDataBuffer, byteOffset: 0 }
    ]
  }
  destroy(device: GfxDevice) {
    device.destroyBuffer(this.vertexDataBuffer)
    device.destroyBuffer(this.normalDataBuffer)
    device.destroyBuffer(this.colorDataBuffer)
  }
  prepareToRender(renderInstManager: GfxRenderInstManager) {
    const renderInst = renderInstManager.newRenderInst()

    renderInst.setVertexInput(this.inputLayout, this.vertexBufferDescriptors, null)
    renderInst.setDrawCount(this.drawCount)
    renderInst.setMegaStateFlags({ cullMode: GfxCullMode.Back })

    renderInstManager.submitRenderInst(renderInst)
  }
}

