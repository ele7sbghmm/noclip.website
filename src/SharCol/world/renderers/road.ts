import { vec3 } from 'gl-matrix'
import { GfxDevice, GfxBuffer, GfxVertexBufferDescriptor, GfxIndexBufferDescriptor, GfxFormat, GfxInputLayout, GfxVertexBufferFrequency, GfxBufferUsage } from '../../../gfx/platform/GfxPlatform.js'
import { GfxRenderInstManager } from '../../../gfx/render/GfxRenderInstManager.js'
import { GfxRenderCache } from '../../../gfx/render/GfxRenderCache.js'
import { makeStaticDataBuffer } from '../../../gfx/helpers/BufferHelpers.js'
import { Color, colorNewFromRGBA } from '../../../Color.js'

import { Program } from '../../program.js'
import { RoadManager, Road } from '../../chunk/loaders/road.js'

const scratchVec = vec3.create()

export class RoadManagerRenderer {
    roadRenderers: RoadRenderer[]
    constructor(device: GfxDevice, renderCache: GfxRenderCache, rm: RoadManager) {
        for (let i = 0; i < rm.numRoadsUsed; i++) {
            this.roadRenderers.push(new RoadRenderer(device, renderCache, rm.roads[i]))
        }
    }
    destroy(device: GfxDevice) {
        this.roadRenderers.forEach(road => road.destroy(device))
    }
    prepareToRender(renderInstManager: GfxRenderInstManager) {
        this.roadRenderers.forEach(road => road.prepareToRender(renderInstManager))
    }
}
class RoadRenderer {
    color = colorNewFromRGBA(randRange(.2, 1.), randRange(.2, 1.), randRange(.2, 1.), 1.)

    vertexDataBuffer: GfxBuffer
    normalDataBuffer: GfxBuffer
    colorDataBuffer: GfxBuffer

    vertexBufferDescriptors: GfxVertexBufferDescriptor[]
    indexBufferDescriptor: GfxIndexBufferDescriptor | null
    inputLayout: GfxInputLayout
    drawCount: number

    constructor(device: GfxDevice, renderCache: GfxRenderCache, road: Road) {
        const squareIndices = [0, 1, 2, 0, 2, 3]
        const points = road.roadSegmentArray.map(seg => {
            return squareIndices.map(index => {
                seg.getCorner(index, scratchVec)
                return scratchVec
            })
        }).flat()

        const normals = calcNormals(points)

        this.drawCount = points.length
        
        const vertexArrayBuffer = new Float32Array(points.map(v => [v[0], v[1], v[2]]).flat())
        const normalArrayBuffer = new Float32Array(normals.map(v => [v[0], v[1], v[2]]).flat())
        const colorBuffer = Array.from({ length: points.length }, () => this.color)
        const colorArrayBuffer = new Uint8Array(colorBuffer.map(c => [c.r, c.g, c.b, c.a]).flat())

        this.vertexDataBuffer = makeStaticDataBuffer(device, GfxBufferUsage.Vertex, vertexArrayBuffer.buffer)
        this.normalDataBuffer = makeStaticDataBuffer(device, GfxBufferUsage.Vertex, normalArrayBuffer.buffer)
        this.colorDataBuffer = makeStaticDataBuffer(device, GfxBufferUsage.Vertex, colorArrayBuffer.buffer)

        this.vertexBufferDescriptors = [
            { buffer: this.vertexDataBuffer, byteOffset: 0 },
            { buffer: this.normalDataBuffer, byteOffset: 0 },
            { buffer: this.colorDataBuffer, byteOffset: 0 },
        ]
        this.indexBufferDescriptor = null

        const vertexAttributeDescriptors = [
            { location: Program.a_Position, bufferIndex: 0, bufferByteOffset: 0, format: GfxFormat.F32_RGB },
            { location: Program.a_Normal, bufferIndex: 0, bufferByteOffset: 0, format: GfxFormat.F32_RGB },
            { location: Program.a_Color, bufferIndex: 0, bufferByteOffset: 0, format: GfxFormat.U8_RGBA }
        ]
        const inputLayoutBufferDescriptors = [
            { byteStride: 12, frequency: GfxVertexBufferFrequency.PerVertex },
            { byteStride: 12, frequency: GfxVertexBufferFrequency.PerVertex },
            { byteStride: 4, frequency: GfxVertexBufferFrequency.PerVertex }
        ]
        const indexBufferFormat = null

        this.inputLayout = renderCache.createInputLayout({
            vertexAttributeDescriptors,
            vertexBufferDescriptors: inputLayoutBufferDescriptors,
            indexBufferFormat
        })

    }
    destroy(device: GfxDevice) {
        device.destroyBuffer(this.vertexDataBuffer)
        device.destroyBuffer(this.normalDataBuffer)
        device.destroyBuffer(this.colorDataBuffer)
    }
    prepareToRender(renderInstManager: GfxRenderInstManager) {
        const renderInst = renderInstManager.newRenderInst()

        renderInst.setVertexInput(this.inputLayout, this.vertexBufferDescriptors, this.indexBufferDescriptor)
        // renderInst.setMegaStateFlags()
        renderInst.setDrawCount(this.drawCount)

        renderInstManager.submitRenderInst(renderInst)
    }
}
class IntersectionRenderer {
    
}

function randRange(min: number, max: number) {
    return Math.random() * max + min
}

function calcNormals(points: vec3[]) {
    const normals = []
    for (let i = 0; i < points.length; i += 3) {
        const t0 = points[i + 0]
        const t1 = points[i + 1]
        const t2 = points[i + 2]

        vec3.cross(scratchVec,
            vec3.sub(vec3.create(), t0, t1),
            vec3.sub(vec3.create(), t0, t2)
        )
        vec3.normalize(scratchVec, scratchVec)

        normals.push(scratchVec, scratchVec, scratchVec)
    }
    return normals
}