import { GfxRenderInstManager } from '../gfx/render/GfxRenderInstManager.js'
import { GfxRenderCache } from '../gfx/render/GfxRenderCache.js'
import { makeStaticDataBuffer } from '../gfx/helpers/BufferHelpers.js'
import {
    GfxDevice,
    GfxBuffer,
    GfxFormat,
    GfxInputLayout,
    GfxVertexBufferFrequency,
    GfxVertexBufferDescriptor,
    GfxBufferUsage,
    GfxProgram,
} from '../gfx/platform/GfxPlatform.js'

import { Program } from './render.js'

export class Fence {
    drawCount: number
    program: GfxProgram
    vertexDataBuffer: GfxBuffer
    inputLayout: GfxInputLayout
    vertexBufferDescriptors: GfxVertexBufferDescriptor[]
    constructor(device: GfxDevice, renderCache: GfxRenderCache, buffer: ArrayBufferLike) {
        const stride = 28
        this.drawCount = buffer.byteLength / stride

        this.program = renderCache.createProgram(new Program)

        const vertexAttributeDescriptors = [
            { location: Program.a_Position, format: GfxFormat.F32_RGB, bufferIndex: 0, bufferByteOffset: 0 },
            { location: Program.a_Normal, format: GfxFormat.F32_RGB, bufferIndex: 0, bufferByteOffset: 12 },
            { location: Program.a_Color, format: GfxFormat.U8_RGBA, bufferIndex: 0, bufferByteOffset: 24 }
        ]
        const inputLayoutBufferDescriptors = [
            { byteStride: stride, frequency: GfxVertexBufferFrequency.PerVertex }
        ]
        this.inputLayout = renderCache.createInputLayout({
            vertexAttributeDescriptors,
            vertexBufferDescriptors: inputLayoutBufferDescriptors,
            indexBufferFormat: null
        })
        this.vertexDataBuffer = makeStaticDataBuffer(device, GfxBufferUsage.Vertex, buffer)
        this.vertexBufferDescriptors = [
            { buffer: this.vertexDataBuffer, byteOffset: 0 },
        ]
    }
    destroy(device: GfxDevice) {
        device.destroyBuffer(this.vertexDataBuffer)
    }
    prepareToRender(renderInstManager: GfxRenderInstManager) {
        const renderInst = renderInstManager.newRenderInst()

        renderInst.setVertexInput(this.inputLayout, this.vertexBufferDescriptors, null)
        renderInst.setDrawCount(this.drawCount)

        renderInstManager.submitRenderInst(renderInst)
    }
}
