import { vec3, mat4 } from 'gl-matrix'
import * as UI from '../ui.js'
import * as Viewer from '../viewer.js'
import { NamedArrayBufferSlice } from '../DataFetcher.js'
import { SceneContext } from '../SceneBase.js'
import ArrayBufferSlice from '../ArrayBufferSlice.js'
import { Color, colorNewFromRGBA } from '../Color.js'
import { DeviceProgram } from '../Program.js'
import {
  GfxDevice,
  GfxProgram,
} from '../gfx/platform/GfxPlatform.js'
import { GfxRenderHelper } from '../gfx/render/GfxRenderHelper.js'
import { GfxRenderInstList, GfxRenderInstManager } from '../gfx/render/GfxRenderInstManager.js'
import { GfxRenderCache } from '../gfx/render/GfxRenderCache.js'
import { makeBackbufferDescSimple, makeAttachmentClearDescriptor, standardFullClearRenderPassDescriptor } from '../gfx/helpers/RenderGraphHelpers.js'
import { fillMatrix4x4, fillMatrix4x3 } from '../gfx/helpers/UniformBufferHelpers.js'
import { GfxrAttachmentSlot } from '../gfx/render/GfxRenderGraph.js'

import { Program } from './program.js'
import { Global } from './world/global.js'
import { Muncher } from './chunk/chunkMuncher.js'

export class Scene implements Viewer.SceneGfx {
  program: Program
  gfxProgram: GfxProgram | null
  renderHelper: GfxRenderHelper
  renderInstListMain = new GfxRenderInstList

  static drawFences: boolean = true
  static drawStatPhys: boolean = true
  static drawIntersects: boolean = true

  global: Global
  constructor(device: GfxDevice, context: SceneContext, public id: string, public name: string, buffers: NamedArrayBufferSlice[]) {
    this.renderHelper = new GfxRenderHelper(device)
    this.gfxProgram = this.renderHelper.renderCache.createProgram(new Program)

    this.global = new Global
    this.global.muncher(buffers, device, this.renderHelper.renderCache)
  }
  createPanels() {
    const addCheckbox = (panel: UI.Panel, label: string, bool: boolean, setMethod: (b: boolean) => void) => {
      const box = new UI.Checkbox(label, bool)
      box.onchanged = () => setMethod(box.checked)
      panel.contents.appendChild(box.elem)
    }

    const debugPanel = new UI.Panel()
    debugPanel.customHeaderBackgroundColor = UI.COOL_BLUE_COLOR;
    debugPanel.setTitle(UI.RENDER_HACKS_ICON, 'Debug')
    addCheckbox(debugPanel, 'draw fences', Scene.drawFences, b => Scene.drawFences = b)
    addCheckbox(debugPanel, 'draw intersects', Scene.drawIntersects, b => Scene.drawIntersects = b)
    addCheckbox(debugPanel, 'draw static physics', Scene.drawStatPhys, b => Scene.drawStatPhys = b)

    const layerPanel = new UI.LayerPanel([this.global, ...this.global.sectors])
    return [debugPanel, layerPanel]
  }
  destroy(device: GfxDevice) {
    this.global.destroy(device)
    this.renderHelper.destroy()
  }
  createProgram() {
    this.gfxProgram = null
    this.program = new Program
  }
  prepareToRender(device: GfxDevice, viewerInput: Viewer.ViewerRenderInput) {
    const template = this.renderHelper.pushTemplateRenderInst()
    if (this.gfxProgram == null)
      this.gfxProgram = this.renderHelper.renderInstManager.gfxRenderCache.createProgram(this.program)
    template.setGfxProgram(this.gfxProgram)
    template.setBindingLayouts([{ numUniformBuffers: 2, numSamplers: 0 }])

    let offs = template.allocateUniformBuffer(Program.ub_SceneParams, 32)
    const mapped = template.mapUniformBufferF32(Program.ub_SceneParams)

    offs += fillMatrix4x4(mapped, offs, viewerInput.camera.projectionMatrix)
    offs += fillMatrix4x3(mapped, offs, viewerInput.camera.viewMatrix)

    this.renderHelper.renderInstManager.setCurrentList(this.renderInstListMain)

    this.global.prepareToRender(this.renderHelper.renderInstManager, viewerInput)
    this.renderHelper.renderInstManager.popTemplate()

    this.renderHelper.prepareToRender()
  }
  render(device: GfxDevice, viewerInput: Viewer.ViewerRenderInput) {
    const builder = this.renderHelper.renderGraph.newGraphBuilder()

    const mainColorDesc = makeBackbufferDescSimple(GfxrAttachmentSlot.Color0, viewerInput, makeAttachmentClearDescriptor(colorNewFromRGBA(.1, .1, .1, 1.)))
    const mainDepthDesc = makeBackbufferDescSimple(GfxrAttachmentSlot.DepthStencil, viewerInput, standardFullClearRenderPassDescriptor)

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
}

