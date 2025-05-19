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
	GfxCullMode,
	GfxMegaStateDescriptor,
	GfxBindingLayoutDescriptor,
	GfxBlendFactor,
	GfxBlendMode,
	GfxCompareMode,
	GfxMipFilterMode,
	GfxRenderPass,
	GfxSampler,
	GfxChannelWriteMask,
	GfxTexFilterMode,
	GfxTexture,
	GfxTextureDimension,
	GfxVertexAttributeDescriptor,
	GfxWrapMode,
	GfxInputLayoutBufferDescriptor,
	makeTextureDescriptor2D,
	GfxIndexBufferDescriptor
} from '../gfx/platform/GfxPlatform.js'

import { Program } from './render.js'

export class Fence {
	name: string = ""
	doubleSided: boolean
	visible: boolean = true

	megaStateFlags: Partial<GfxMegaStateDescriptor>
	program: Program
	gfxProgram: GfxProgram | null
	drawCount: number
	vertexDataBuffer: GfxBuffer
	inputLayout: GfxInputLayout
	vertexBufferDescriptors: GfxVertexBufferDescriptor[]
	public setDoubleSided(b: boolean) {
		this.doubleSided = b
		this.createProgram()
	}
	public setVisible(b: boolean) { this.visible = b }
	createProgram() {
		this.gfxProgram = null
		this.program = new Program

		this.program.defines.set('USEgNORMALS', '1')

		this.megaStateFlags = {
			attachmentsState: [{
				channelWriteMask: GfxChannelWriteMask.RGB,
				rgbBlendState: {
					blendMode: GfxBlendMode.Add,
					blendSrcFactor: GfxBlendFactor.One,
					blendDstFactor: GfxBlendFactor.Zero
				},
				alphaBlendState: {
					blendMode: GfxBlendMode.Add,
					blendSrcFactor: GfxBlendFactor.One,
					blendDstFactor: GfxBlendFactor.Zero
				}
			}],
			depthCompare: undefined,
			depthWrite: undefined,
			stencilCompare: undefined,
			stencilWrite: undefined,
			stencilPassOp: undefined,
			cullMode: this.doubleSided ? GfxCullMode.None : GfxCullMode.Back,
			frontFace: undefined,
			polygonOffset: undefined,
			wireframe: true
		}
	}
	constructor(device: GfxDevice, renderCache: GfxRenderCache, buffer: ArrayBufferLike) {
		this.createProgram()

		const stride = 28
		this.drawCount = buffer.byteLength / stride

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
		this.vertexBufferDescriptors = [{ buffer: this.vertexDataBuffer, byteOffset: 0 }]
	}
	destroy(device: GfxDevice) {
		device.destroyBuffer(this.vertexDataBuffer)
	}
	prepareToRender(renderInstManager: GfxRenderInstManager) {
		if (!this.visible) { return }

		const renderInst = renderInstManager.newRenderInst()

		if (this.gfxProgram === null)
			this.gfxProgram = renderInstManager.gfxRenderCache.createProgram(this.program)
		renderInst.setGfxProgram(this.gfxProgram)
		renderInst.setMegaStateFlags(this.megaStateFlags)
		renderInst.setVertexInput(this.inputLayout, this.vertexBufferDescriptors, null)
		renderInst.setDrawCount(this.drawCount)

		renderInstManager.submitRenderInst(renderInst)
	}
}
