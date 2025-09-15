import * as Viewer from '../viewer.js'
import { SceneContext } from '../SceneBase.js'
import ArrayBufferSlice from '../ArrayBufferSlice.js'
import { colorNewFromRGBA, OpaqueBlack } from '../Color.js'

import { GfxRenderHelper } from '../gfx/render/GfxRenderHelper.js'
import { GfxRenderInstManager, GfxRenderInstList } from '../gfx/render/GfxRenderInstManager.js'
import { fillMatrix4x3, fillMatrix4x4 } from '../gfx/helpers/UniformBufferHelpers.js'
import { GfxrAttachmentSlot } from '../gfx/render/GfxRenderGraph.js'
import { makeAttachmentClearDescriptor, standardFullClearRenderPassDescriptor, makeBackbufferDescSimple } from '../gfx/helpers/RenderGraphHelpers.js'
import { GfxDevice, GfxProgram, } from '../gfx/platform/GfxPlatform.js'

import { Program } from './program.js'
import { Scene } from './scene.js'

export class SceneGfx implements Viewer.SceneGfx {
  scene: Scene

  renderHelper: GfxRenderHelper
  renderInstListMain = new GfxRenderInstList
  gfxProgram: GfxProgram

  constructor(device: GfxDevice, context: SceneContext, data: ArrayBufferSlice, ptrs: number[]) {
    this.renderHelper = new GfxRenderHelper(device, context)
    this.gfxProgram = this.renderHelper.renderCache.createProgram(new Program)

    this.scene = new Scene(device, this.renderHelper.renderCache, data, ptrs)
  }
  destroy(device: GfxDevice) {
    this.scene.destroy(device)
    this.renderHelper.destroy()
  }
  createProgram() { }
  prepareToRender(device: GfxDevice, viewerInput: Viewer.ViewerRenderInput) {
    const template = this.renderHelper.pushTemplateRenderInst()
    template.setBindingLayouts([{ numSamplers: 0, numUniformBuffers: 1 }])
    template.setMegaStateFlags({})
    template.setGfxProgram(this.gfxProgram)

    let offs = template.allocateUniformBuffer(Program.ub_SceneParams, 32)
    const mapped = template.mapUniformBufferF32(Program.ub_SceneParams)
    offs += fillMatrix4x4(mapped, offs, viewerInput.camera.projectionMatrix)
    offs += fillMatrix4x3(mapped, offs, viewerInput.camera.viewMatrix)

    this.renderHelper.renderInstManager.setCurrentList(this.renderInstListMain)

    this.scene.prepareToRender(this.renderHelper.renderInstManager)

    this.renderHelper.renderInstManager.popTemplate()
    this.renderHelper.prepareToRender()
  }
  render(device: GfxDevice, viewerInput: Viewer.ViewerRenderInput) {
    const builder = this.renderHelper.renderGraph.newGraphBuilder()

    // const grey = colorNewFromRGBA(64 / 255, 64 / 255, 64 / 255, 1.)
    const grey = colorNewFromRGBA(32 / 255, 32 / 255, 32 / 255, 1.)
    const mainColorDesc = makeBackbufferDescSimple(GfxrAttachmentSlot.Color0, viewerInput, makeAttachmentClearDescriptor(grey))
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
