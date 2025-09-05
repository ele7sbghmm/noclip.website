import ArrayBufferSlice from '../ArrayBufferSlice.js'
import { GfxRenderInstManager } from '../gfx/render/GfxRenderInstManager.js'
import { GfxRenderCache } from '../gfx/render/GfxRenderCache.js'
import { GfxDevice } from '../gfx/platform/GfxPlatform.js'

import { Reader } from './reader.js'
import { ClipmapRenderer } from './renderers/clipmap.js'
import { Clipmap } from './parsers/clipmap.js'

export class Scene {
  cm: ClipmapRenderer

  constructor(device: GfxDevice, renderCache: GfxRenderCache, data: ArrayBufferSlice, ptrs: number[]) {
    const r = new Reader(data)

    r.seek(ptrs[0])
    const cm = new Clipmap(r, ptrs)

    this.cm = new ClipmapRenderer(device, renderCache, cm)
  }
  destroy(device: GfxDevice) {
    this.cm.destroy(device)
  }
  prepareToRender(renderInstManager: GfxRenderInstManager) {
    this.cm.prepareToRender(renderInstManager)
  }
}

