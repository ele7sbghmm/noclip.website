import { mat4, vec3 } from 'gl-matrix'
import { GfxRenderInstManager } from '../../../gfx/render/GfxRenderInstManager.js'
import { GfxRenderCache } from '../../../gfx/render/GfxRenderCache.js'
import { makeStaticDataBuffer } from '../../../gfx/helpers/BufferHelpers.js'
import { Color, colorNewFromRGBA } from '../../../Color.js'
import {
    GfxDevice,
    GfxBuffer,
    GfxVertexBufferDescriptor,
    GfxIndexBufferDescriptor,
    GfxFormat,
    GfxInputLayout,
    GfxVertexBufferFrequency,
    GfxCompareMode,
    GfxBufferUsage,
    GfxMegaStateDescriptor
} from '../../../gfx/platform/GfxPlatform.js'

import { Program } from '../../program.js'
import { RoadManager, Road } from '../../chunk/loaders/road.js'
import { fillMatrix4x4 } from '../../../gfx/helpers/UniformBufferHelpers.js'

const scratchVec = vec3.create()

export class RoadManagerRenderer {
    roadRenderers: RoadRenderer[] = []
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
    color = colorNewFromRGBA(randRange(100., 255.), randRange(100., 255.), randRange(100., 255.), 1.)

    vertexDataBuffer: GfxBuffer
    normalDataBuffer: GfxBuffer
    colorDataBuffer: GfxBuffer

    vertexBufferDescriptors: GfxVertexBufferDescriptor[]
    indexBufferDescriptor: GfxIndexBufferDescriptor | null
    inputLayout: GfxInputLayout
    drawCount: number

    megaStateFlags: Partial<GfxMegaStateDescriptor>
    constructor(device: GfxDevice, renderCache: GfxRenderCache, road: Road) {
        const squareIndices = [0, 1, 2, 0, 2, 3]
        const points = road.roadSegmentArray.map(seg => {
            return squareIndices.map(index => {
                // seg.getCorner(index, scratchVec)
                return vec3.clone(seg.corners[index])
            })
        }).flat()

        const normals = calcNormals(points)

        this.drawCount = points.length / 3
        
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
            { location: Program.a_Normal, bufferIndex: 1, bufferByteOffset: 0, format: GfxFormat.F32_RGB },
            { location: Program.a_Color, bufferIndex: 2, bufferByteOffset: 0, format: GfxFormat.U8_RGBA }
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

        this.megaStateFlags = {
            wireframe: true
        }

    }
    destroy(device: GfxDevice) {
        device.destroyBuffer(this.vertexDataBuffer)
        device.destroyBuffer(this.normalDataBuffer)
        device.destroyBuffer(this.colorDataBuffer)
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
    
    }
    // createProgram() {
    //     this.gfxProgram = null
    //     this.program = new Program
    //     this.program.setDefineBool('IS_FENCE', true)
    // }
}
class IntersectionRenderer {
    
}

function randRange(min: number, max: number) {
    return Math.random() * max + min
}

function calcNormals(points: vec3[]) {
    const normals = []
    for (let i = 0; i < points.length; i += 3) {
        const t0 = vec3.clone(points[i + 0])
        const t1 = vec3.clone(points[i + 1])
        const t2 = vec3.clone(points[i + 2])

        vec3.cross(scratchVec,
            vec3.sub(vec3.create(), t0, t1),
            vec3.sub(vec3.create(), t0, t2)
        )
        vec3.normalize(scratchVec, scratchVec)
        
        const copy = vec3.create()
        vec3.copy(copy, scratchVec)
        normals.push(copy, copy, copy)
    }
    return normals
}