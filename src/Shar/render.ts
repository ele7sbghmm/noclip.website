import ArrayBufferSlice from '../ArrayBufferSlice.js'
import * as Viewer from '../viewer.js'
import * as UI from '../ui.js'
import { colorNewFromRGBA } from '../Color.js'
import { DeviceProgram } from '../Program.js'
import { GfxShaderLibrary } from '../gfx/helpers/GfxShaderLibrary.js'
import { SceneContext } from '../SceneBase.js'
import { GfxrAttachmentSlot } from '../gfx/render/GfxRenderGraph.js'
import { GfxRenderHelper } from '../gfx/render/GfxRenderHelper.js'
import { GfxRenderInstManager, GfxRenderInstList } from '../gfx/render/GfxRenderInstManager.js'
import { makeBackbufferDescSimple, standardFullClearRenderPassDescriptor, makeAttachmentClearDescriptor } from '../gfx/helpers/RenderGraphHelpers.js'
import { GfxDevice, GfxProgram, GfxCullMode } from '../gfx/platform/GfxPlatform.js'
import { fillMatrix4x4, fillMatrix4x3 } from '../gfx/helpers/UniformBufferHelpers.js'
import { GfxRenderCache } from '../gfx/render/GfxRenderCache.js'

import { Fence } from './fence.js'
import { Intersect } from './intersect.js'
import { StaticEntity } from './staticEntity.js'
import { Thing } from './scenes.js'

export class Program extends DeviceProgram {
	static a_Position = 0
	static a_Normal = 1
	static a_Color = 2
	static ub_SceneParams = 0
	static ub_ObjectParams = 1
	override both = `
precision mediump float;

${GfxShaderLibrary.MatrixLibrary}

layout(std140) uniform ub_SceneParams {
    Mat4x4 u_Projection;
    Mat3x4 u_View;
};

varying float v_LightIntensity;
varying vec4 v_Color;

#ifdef VERT
layout(location = ${Program.a_Position}) attribute vec3 a_Position;
layout(location = ${Program.a_Normal}) attribute vec3 a_Normal;
layout(location = ${Program.a_Color}) attribute uvec4 a_Color;

void mainVS() {
    float t_Scale = 100.;
    vec3 t_PositionWorld = UnpackMatrix(u_View) * vec4(a_Position * t_Scale, 1.);
    gl_Position = UnpackMatrix(u_Projection) * vec4(t_PositionWorld, 1.);

#ifdef USE_NORMALS
    vec3 t_LightDir = normalize(vec3(.2, -1., .5));
    v_LightIntensity = -dot(a_Normal, t_LightDir);
    v_Color = vec4(a_Color);
#endif
#ifdef USE_VERTEX_COLOR
    v_Color = vec4(a_Color) / 255.;
#endif
}
#endif

#ifdef FRAG
void mainPS() {
    gl_FragColor = v_Color;
#ifdef USE_NORMALS
    float t_LightTint = v_LightIntensity * .3;
    gl_FragColor = v_Color + vec4(t_LightTint, t_LightTint, t_LightTint, 0.);
#endif
}
#endif
`}

class Sector {
	name: string
	visible: boolean = true

	staticEntity: StaticEntity
	intersect: Intersect

	public setVisible(b: boolean) { this.visible = b }
	constructor(
		device: GfxDevice,
		renderCache: GfxRenderCache,
		obj: Thing,
		public visibleStaticEntities: boolean,
		public visibleIntersects: boolean
	) {
		this.name = obj.name
		this.staticEntity = new StaticEntity(device, renderCache, obj.staticEntityBuffer.arrayBuffer)
		this.intersect = new StaticEntity(device, renderCache, obj.intersectBuffer.arrayBuffer)
	}
	destroy(device: GfxDevice) {
		this.staticEntity.destroy(device)
		this.intersect.destroy(device)
	}
	prepareToRender(renderInstManager: GfxRenderInstManager) {
		if (this.visible) {
			if (this.visibleStaticEntities) { this.staticEntity.prepareToRender(renderInstManager) }
			if (this.visibleIntersects) { this.intersect.prepareToRender(renderInstManager) }
		}
	}
}

export class Scene implements Viewer.SceneGfx {
	fence: Fence
	sectors: Sector[]

	visibleStaticEntities: boolean = true
	visibleIntersects: boolean = false

	enableVertexColor: boolean = true

	program: Program
	gfxProgram: GfxProgram | null

	renderHelper: GfxRenderHelper
	renderInstListMain = new GfxRenderInstList

	public setVisibleStaticEntities = (b: boolean) => { this.sectors.forEach(sector => { sector.visibleStaticEntities = b }) }
	public setVisibleIntersects = (b: boolean) => { this.sectors.forEach(sector => { sector.visibleIntersects = b }) }

	public setEnableVertexColor = (b: boolean) => {
		this.enableVertexColor = b
		this.createProgram()
	}
	constructor(device: GfxDevice, fenceBuffer: ArrayBufferSlice, buffers: Thing[]) {
		this.renderHelper = new GfxRenderHelper(device)

		const renderCache = this.renderHelper.renderCache
		this.createProgram()

		this.fence = new Fence(device, renderCache, fenceBuffer.arrayBuffer)
		this.sectors = buffers.map(obj => {
			return new Sector(device, renderCache, obj, this.visibleStaticEntities, this.visibleIntersects)
		})
	}
	createProgram() {
		const program = new Program
		if (this.enableVertexColor) {
			program.defines.set('USE_VERTEX_COLOR', '1')
		}
		this.gfxProgram = null
		this.program = program
	}
	destroy(device: GfxDevice) {
		this.fence.destroy(device)
		this.sectors.forEach(sector => sector.destroy(device))
		this.renderHelper.destroy()
	}
	prepareToRender(device: GfxDevice, viewerInput: Viewer.ViewerRenderInput) {
		const template = this.renderHelper.pushTemplateRenderInst()

		if (this.gfxProgram === null) {
			this.gfxProgram = this.renderHelper.renderInstManager.gfxRenderCache.createProgram(this.program)
		}

		template.setBindingLayouts([{ numUniformBuffers: 1, numSamplers: 0 }])
		template.setGfxProgram(this.gfxProgram)
		template.setMegaStateFlags({ cullMode: GfxCullMode.None })

		let offs = template.allocateUniformBuffer(Program.ub_SceneParams, 32)
		const mapped = template.mapUniformBufferF32(Program.ub_SceneParams)

		offs += fillMatrix4x4(mapped, offs, viewerInput.camera.projectionMatrix)
		offs += fillMatrix4x3(mapped, offs, viewerInput.camera.viewMatrix)

		this.renderHelper.renderInstManager.setCurrentList(this.renderInstListMain);

		this.sectors.forEach(sector => sector.prepareToRender(this.renderHelper.renderInstManager))
		this.fence.prepareToRender(this.renderHelper.renderInstManager)

		this.renderHelper.renderInstManager.popTemplate()
		this.renderHelper.prepareToRender()
	}
	render(device: GfxDevice, viewerInput: Viewer.ViewerRenderInput) {
		const mainColorDesc = makeBackbufferDescSimple(GfxrAttachmentSlot.Color0, viewerInput, makeAttachmentClearDescriptor(colorNewFromRGBA(154 / 255, 197 / 255, 224 / 255, 1.)))
		const mainDepthDesc = makeBackbufferDescSimple(GfxrAttachmentSlot.DepthStencil, viewerInput, standardFullClearRenderPassDescriptor)

		const builder = this.renderHelper.renderGraph.newGraphBuilder()
		const mainColorTargetID = builder.createRenderTargetID(mainColorDesc, 'Main Color')
		const mainDepthTargetID = builder.createRenderTargetID(mainDepthDesc, 'Main Depth')

		builder.pushPass(pass => {
			pass.setDebugName('Main')
			pass.attachRenderTargetID(GfxrAttachmentSlot.Color0, mainColorTargetID)
			pass.attachRenderTargetID(GfxrAttachmentSlot.DepthStencil, mainDepthTargetID)
			pass.exec(passRenderer => {
				this.renderInstListMain.drawOnPassRenderer(this.renderHelper.renderCache, passRenderer)
			})
		})

		this.renderHelper.antialiasingSupport.pushPasses(builder, viewerInput, mainColorTargetID)
		builder.resolveRenderTargetToExternalTexture(mainColorTargetID, viewerInput.onscreenTexture)

		this.prepareToRender(device, viewerInput)
		this.renderHelper.renderGraph.execute(builder)
		this.renderInstListMain.reset()
	}
	createPanels(): UI.Panel[] {
		const addCheckBox = (panel: UI.Panel, label: string, b: boolean, setMethod: (b: boolean) => void, margin?: string) => {
			let box = new UI.Checkbox(label, b)
			box.onchanged = () => setMethod(box.checked)
			box.elem.style.margin = margin ?? "0px 0px 0px 0px"
			panel.contents.appendChild(box.elem)
		}

		const debug = new UI.Panel()
		debug.customHeaderBackgroundColor = UI.COOL_BLUE_COLOR;
		debug.setAutoClosed(false)
		debug.setTitle(UI.LAYER_ICON, 'DEBUG');

		addCheckBox(debug, 'ENABLE VERTEX COLOR', this.enableVertexColor, b => this.setEnableVertexColor(b), "0px 0px 0px 20px")
		addCheckBox(debug, 'DRAW STATIC ENTITIES', this.visibleStaticEntities, b => this.setVisibleStaticEntities(b), "0px 0px 0px 20px")
		addCheckBox(debug, 'DRAW INTERSECT COLLISION', this.visibleIntersects, b => this.setVisibleIntersects(b), "0px 0px 0px 20px")
		// (<HTMLElement>trackDataPanel.contents.children.item(trackDataPanel.contents.children.length - 1)).style.marginBottom = "20px";

		addCheckBox(debug, 'DRAW FENCES', this.fence.visible, b => this.fence.setVisible(b), "0px 0px 0px 5px")
		addCheckBox(debug, 'DOUBLE SIDED', this.fence.doubleSided, b => this.fence.setDoubleSided(b), "0px 0px 0px 20px")

		const layers = new UI.LayerPanel()
		layers.setLayers(this.sectors)
		return [debug, layers]
	}
}
