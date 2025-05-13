import { assert } from '../../util.js'
import { GfxRenderInstManager } from '../../gfx/render/GfxRenderInstManager.js'
import { GfxRenderCache } from '../../gfx/render/GfxRenderCache.js'
import { makeStaticDataBuffer } from '../../gfx/helpers/BufferHelpers.js'
import {
    GfxDevice,
    GfxBuffer,
    GfxFormat,
    GfxInputLayout,
    GfxVertexBufferFrequency,
    GfxVertexBufferDescriptor,
    GfxIndexBufferDescriptor,
    GfxBufferUsage
} from '../../gfx/platform/GfxPlatform.js'

import { Program } from '../render.js'
import { Pgf, VBGeom, PrimitiveList } from './pgf.js'

export class PgfRenderer {
    vbGeomRenderers: VBGeomRenderer[]
    vertexDataBuffer: GfxBuffer
    constructor(pgf: Pgf, device: GfxDevice, renderCache: GfxRenderCache) {
        const inputLayouts = new InputLayouts(renderCache)
        this.vertexDataBuffer = makeStaticDataBuffer(device, GfxBufferUsage.Vertex, pgf.vertexData.arrayBuffer)
        this.vbGeomRenderers = pgf.vbGeoms.map(
            geom => new VBGeomRenderer(geom, this.vertexDataBuffer, device, inputLayouts)
        )
    }
    destroy(device: GfxDevice) {
        this.vbGeomRenderers.forEach(geom => geom.destroy(device))
        device.destroyBuffer(this.vertexDataBuffer)
    }
    prepareToRender(renderInstManager: GfxRenderInstManager) {
        this.vbGeomRenderers.forEach(geom => geom.prepareToRender(renderInstManager))
    }
}

class VBGeomRenderer {
    primListRenderers: PrimListRenderer[]
    vertexBufferDescriptors: GfxVertexBufferDescriptor[]
    inputLayout: GfxInputLayout
    constructor(
        vbGeom: VBGeom,
        vertexDataBuffer: GfxBuffer,
        device: GfxDevice,
        inputLayouts: InputLayouts
    ) {
        this.primListRenderers = vbGeom.primitiveList.map(primList => new PrimListRenderer(primList, device))
        this.vertexBufferDescriptors = [
            { buffer: vertexDataBuffer, byteOffset: vbGeom.vertexStartIndex }
        ]
        this.inputLayout = inputLayouts.get(vbGeom.vertexStride)
    }
    destroy(device: GfxDevice) {
        this.primListRenderers.forEach(primListRenderer => primListRenderer.destroy(device))
    }
    prepareToRender(renderInstManager: GfxRenderInstManager) {
        this.primListRenderers.forEach(primList => primList.prepareToRender(
            renderInstManager,
            this.inputLayout,
            this.vertexBufferDescriptors
        ))
    }
}

class PrimListRenderer {
    drawCount: number
    indexDataBuffer: GfxBuffer
    indexBufferDescriptor: GfxIndexBufferDescriptor
    constructor(primList: PrimitiveList, device: GfxDevice) {
        this.indexDataBuffer = makeStaticDataBuffer(device, GfxBufferUsage.Index, primList.indexBuffer.buffer)
        this.indexBufferDescriptor = { buffer: this.indexDataBuffer, byteOffset: 0 }
        this.drawCount = primList.indexBuffer.length
    }
    destroy(device: GfxDevice) {
        device.destroyBuffer(this.indexDataBuffer)
    }
    prepareToRender(
        renderInstManager: GfxRenderInstManager,
        inputLayout: GfxInputLayout,
        vertexBufferDescriptors: GfxVertexBufferDescriptor[]
    ) {
        const renderInst = renderInstManager.newRenderInst()

        renderInst.setVertexInput(inputLayout, vertexBufferDescriptors, this.indexBufferDescriptor)
        renderInst.setDrawCount(this.drawCount)

        renderInstManager.submitRenderInst(renderInst)
    }
}

class InputLayouts {
    x10: GfxInputLayout
    x14: GfxInputLayout
    x18: GfxInputLayout
    x1c: GfxInputLayout
    x20: GfxInputLayout
    constructor(renderCache: GfxRenderCache) {
        this.x10 = renderCache.createInputLayout({
            vertexAttributeDescriptors: [
                { location: Program.a_Position, format: GfxFormat.F32_RGB, bufferByteOffset: 0, bufferIndex: 0 },
                { location: Program.a_Color, format: GfxFormat.U8_RGBA, bufferByteOffset: 3 * 4, bufferIndex: 0 }
            ],
            vertexBufferDescriptors: [
                { byteStride: 0x10, frequency: GfxVertexBufferFrequency.PerVertex }
            ],
            indexBufferFormat: GfxFormat.U16_R
        })
        this.x14 = renderCache.createInputLayout({
            vertexAttributeDescriptors: [
                { location: Program.a_Position, format: GfxFormat.F32_RGB, bufferByteOffset: 0, bufferIndex: 0 },
                // { location: Program.a_, format: GfxFormat., bufferByteOffset: 3 * 4, bufferIndex: 0 },
                { location: Program.a_Color, format: GfxFormat.U8_RGBA, bufferByteOffset: 3 * 4 + 4, bufferIndex: 0 }
            ],
            vertexBufferDescriptors: [
                { byteStride: 0x14, frequency: GfxVertexBufferFrequency.PerVertex }
            ],
            indexBufferFormat: GfxFormat.U16_R
        })
        this.x18 = renderCache.createInputLayout({
            vertexAttributeDescriptors: [
                { location: Program.a_Position, format: GfxFormat.F32_RGB, bufferByteOffset: 0, bufferIndex: 0 },
                { location: Program.a_Color, format: GfxFormat.U8_RGBA, bufferByteOffset: 3 * 4, bufferIndex: 0 },
                // { location: Program.a_TexCoord, format: GfxFormat.F32_RG, bufferByteOffset: 3 * 4 + 4, bufferIndex: 0 }
            ],
            vertexBufferDescriptors: [
                { byteStride: 0x18, frequency: GfxVertexBufferFrequency.PerVertex }
            ],
            indexBufferFormat: GfxFormat.U16_R
        })
        this.x1c = renderCache.createInputLayout({
            vertexAttributeDescriptors: [
                { location: Program.a_Position, format: GfxFormat.F32_RGB, bufferByteOffset: 0, bufferIndex: 0 },
                { location: Program.a_Color, format: GfxFormat.U8_RGBA, bufferByteOffset: 3 * 4, bufferIndex: 0 },
                // { location: Program.a_TexCoord, format: GfxFormat.F32_RG, bufferByteOffset: 3 * 4 + 4, bufferIndex: 0 },
                // { location: Program.a_, format: GfxFormat.U32_R, bufferByteOffset: 3 * 4 + 4 + 2 * 4, bufferIndex: 0 }
            ],
            vertexBufferDescriptors: [
                { byteStride: 0x1c, frequency: GfxVertexBufferFrequency.PerVertex }
            ],
            indexBufferFormat: GfxFormat.U16_R
        })
        this.x20 = renderCache.createInputLayout({
            vertexAttributeDescriptors: [
                { location: Program.a_Position, format: GfxFormat.F32_RGB, bufferByteOffset: 0, bufferIndex: 0 },
                { location: Program.a_Color, format: GfxFormat.U8_RGBA, bufferByteOffset: 3 * 4, bufferIndex: 0 },
                // { location: Program.a_TexCoord, format: GfxFormat.F32_RG, bufferByteOffset: 3 * 4 + 4, bufferIndex: 0 },
                // { location: Program.a_, format: GfxFormat.U32_RG, bufferByteOffset: 3 * 4 + 4 + 2 * 4, bufferIndex: 0 }
            ],
            vertexBufferDescriptors: [
                { byteStride: 0x20, frequency: GfxVertexBufferFrequency.PerVertex }
            ],
            indexBufferFormat: GfxFormat.U16_R
        })
    }
    get(stride: number) {
        switch (stride) {
            case 0x10: return this.x10
            case 0x14: return this.x14
            case 0x18: return this.x18
            case 0x1c: return this.x1c
            case 0x20: return this.x20
            default: assert(false, `stride ${stride} not implemented`)
        }
    }
}

