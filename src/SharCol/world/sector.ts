import * as Viewer from '../../viewer.js'
import { GfxRenderInstManager } from '../../gfx/render/GfxRenderInstManager.js'
import { GfxRenderCache } from '../../gfx/render/GfxRenderCache.js'
import { GfxDevice } from '../../gfx/platform/GfxPlatform.js'
import { IntersectRenderer } from './renderers/intersect.js'
import { StatPhysRenderer } from './renderers/statphys.js'
import { Entity } from '../chunk/loaders/util.js'
import { Scene } from '../scene.js'

export class Sector {
  visible: boolean = true

  // collisionRenderers: CollisionRenderer[] | null = null
  intersectRenderer: IntersectRenderer | null = null
  statPhys: StatPhysRenderer[] = []

  setVisible(b: boolean) { this.visible = b }
  constructor(public name: string) { }
  destroy(device: GfxDevice) { }
  prepareToRender(renderInstManager: GfxRenderInstManager, viewerInput: Viewer.ViewerRenderInput) {
    if (!this.visible)
      return

    if (Scene.drawIntersects && this.intersectRenderer)
      this.intersectRenderer.prepareToRender(renderInstManager)
    if (Scene.drawStatPhys && this.statPhys)
      this.statPhys.forEach(r => r.prepareToRender(renderInstManager))
  }
}

