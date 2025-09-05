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
	GfxVertexBufferDescriptor
} from '../../gfx/platform/GfxPlatform.js'

import { Program } from '../program.js'
import { Clipmap } from '../parsers/clipmap.js'
import { brushToHull } from '../util/poly.js'

const scratchVec3 = vec3.create()

export class ClipmapRenderer {
	drawCount: number
	vertexDataBuffer: GfxBuffer
	normalDataBuffer: GfxBuffer
	vertexBufferDescriptors: GfxVertexBufferDescriptor[]
	inputLayout: GfxInputLayout

	constructor(device: GfxDevice, renderCache: GfxRenderCache, cm: Clipmap) {
		const hulls: vec3[] = []

		// for (let i = 0; i < 2; i++) {
		for (let i in [0, 1]) {
			if (cm.brushes[i].sides.length == 0)
				continue

			const brush = cm.brushes[i]
			const hull = brushToHull(brush)
			hulls.push(...hull)
		}
		const tris = quadToTri(hulls)
		const nrms = vToVn(tris)

		const vb = new Float32Array(tris.length * 3)
		const nb = new Float32Array(nrms.length * 3)
		tris.forEach((t, i) => vb.set(t, i * 3))
		nrms.forEach((n, i) => nb.set(n, i * 3))

		console.log(vb)
		console.log(nb)

		this.drawCount = tris.length / 3
		this.vertexDataBuffer = makeStaticDataBuffer(device, GfxBufferUsage.Vertex, vb.buffer)
		this.normalDataBuffer = makeStaticDataBuffer(device, GfxBufferUsage.Vertex, vb.buffer)

		const vertexAttributeDescriptors = [
			{ location: Program.a_Position, format: GfxFormat.F32_RGB, bufferIndex: 0, bufferByteOffset: 0 },
			{ location: Program.a_Normal, format: GfxFormat.F32_RGB, bufferIndex: 1, bufferByteOffset: 12 }
		]
		const vertexInputLayoutBufferDescriptors = [
			{ byteStride: 12, frequency: GfxVertexBufferFrequency.PerVertex },
			{ byteStride: 12, frequency: GfxVertexBufferFrequency.PerVertex }
		]

		this.inputLayout = renderCache.createInputLayout({
			vertexAttributeDescriptors,
			vertexBufferDescriptors: vertexInputLayoutBufferDescriptors,
			indexBufferFormat: null
		})

		this.vertexBufferDescriptors = [
			{ buffer: this.vertexDataBuffer, byteOffset: 0 },
			{ buffer: this.normalDataBuffer, byteOffset: 0 }
		]
	}
	destroy(device: GfxDevice) {
		device.destroyBuffer(this.vertexDataBuffer)
		device.destroyBuffer(this.normalDataBuffer)
	}
	prepareToRender(renderInstManager: GfxRenderInstManager) {
		const renderInst = renderInstManager.newRenderInst()

		renderInst.setVertexInput(this.inputLayout, this.vertexBufferDescriptors, null)
		renderInst.setDrawCount(this.drawCount)
		renderInst.setMegaStateFlags({})

		renderInstManager.submitRenderInst(renderInst)
	}
}

function vToVn(vs: vec3[]) {
	return vs.map((_, i) => {
		if (i % 3 == 0) {
			const v0 = vs[i + 0]
			const v1 = vs[i + 1]
			const v2 = vs[i + 2]

			vec3.cross(
				scratchVec3,
				[v0[0] - v1[0], v0[1] - v1[1], v0[2] - v1[2]],
				[v0[0] - v2[0], v0[1] - v2[1], v0[2] - v2[2]]
			)
			vec3.normalize(scratchVec3, scratchVec3)
		}

		return vec3.clone(scratchVec3)
	})
}

function quadToTri(v: vec3[]) {
	const out: vec3[] = []
	let v0, v1, v2, v3

	v.forEach((_, i) => {
		if (i % 4)
			return

		v0 = v[i + 0]
		v1 = v[i + 1]
		v2 = v[i + 2]
		v3 = v[i + 3]

		out.push(v0, v1, v2, v0, v2, v3)
	})

	return out
}
