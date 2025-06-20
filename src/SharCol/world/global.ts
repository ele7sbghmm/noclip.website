import * as Viewer from '../../viewer.js'
import { NamedArrayBufferSlice } from '../../DataFetcher.js'
import ArrayBufferSlice from '../../ArrayBufferSlice.js'
import { GfxRenderInstManager } from '../../gfx/render/GfxRenderInstManager.js'
import { GfxRenderCache } from '../../gfx/render/GfxRenderCache.js'
import { GfxDevice } from '../../gfx/platform/GfxPlatform.js'

import { ChunkHandler } from '../chunk/chunkHandler.js'
import { Sector } from './sector.js'
import { Entity } from '../chunk/loaders/util.js'
import { FenceLoader } from '../chunk/loaders/fence.js'
import { FenceRenderer } from './renderers/fence.js'
import { IntersectLoader } from '../chunk/loaders/intersect.js'
import { IntersectRenderer } from './renderers/intersect.js'
import { StatPhys } from '../chunk/loaders/statphys.js'
import { StatPhysRenderer } from './renderers/statphys.js'
import { ID } from '../chunk/id.js'
import { Scene } from '../scene.js'

export class Global {
  name: string = 'global sector'
  visible: boolean = true

  static fenceHeight: number = 30

  sectors: Sector[] = []
  fenceRenderer: FenceRenderer

  constructor() { }
  setVisible(b: boolean) { this.visible = b }
  destroy(device: GfxDevice) {
    this.sectors.forEach(sector => sector.destroy(device))
    this.fenceRenderer.destroy(device)
  }
  prepareToRender(renderInstManager: GfxRenderInstManager, viewerInput: Viewer.ViewerRenderInput) {
    this.sectors.forEach(sector => sector.prepareToRender(renderInstManager, viewerInput))

    if (!this.visible)
      return
    if (Scene.drawFences)
      this.fenceRenderer.prepareToRender(renderInstManager)
  }
  muncher(buffers: NamedArrayBufferSlice[], device: GfxDevice, renderCache: GfxRenderCache) {
    let fencePos: number[] = []
    let fenceNrm: number[] = []
    let fenceClr: number[] = []
    buffers.forEach(buf => {
      const ch = new ChunkHandler(buf)
      ch.p3dChunk()

      const sector = new Sector(buf.name.split('/').pop()!.slice(2, -4))
      const intersects: number[][] = [[], [], []]

      while (ch.remaining()) {
        switch (ch.begin()) {
          case ID.STATIC_PHYS_DSG: {
            const [pos, nrm] = new StatPhys().LoadObject(ch)
            const entity = new Entity
            entity.positionData = new ArrayBufferSlice(new Float32Array(pos).buffer)
            entity.normalData = new ArrayBufferSlice(new Float32Array(nrm).buffer)
            sector.statPhys.push(new StatPhysRenderer(device, renderCache, entity))
          } break
          case ID.INTERSECT_DSG: {
            const [p, n, t] = new IntersectLoader().LoadObject(ch)
            intersects[0] = intersects[0].concat(p)
            intersects[1] = intersects[1].concat(n)
            intersects[2] = intersects[2].concat(t)
          } break
          case ID.FENCE_DSG: {
            const y = Global.fenceHeight
            const fence = FenceLoader.LoadObject(ch)

            fencePos = fencePos.concat([
              fence.start[0], y, fence.start[2],
              fence.start[0], -y, fence.start[2],
              fence.end[0], -y, fence.end[2],
              fence.start[0], y, fence.start[2],
              fence.end[0], -y, fence.end[2],
              fence.end[0], y, fence.end[2]
            ])
            fenceNrm = fenceNrm.concat(
              fence.normal[0], fence.normal[1], fence.normal[2],
              fence.normal[0], fence.normal[1], fence.normal[2],
              fence.normal[0], fence.normal[1], fence.normal[2],
              fence.normal[0], fence.normal[1], fence.normal[2],
              fence.normal[0], fence.normal[1], fence.normal[2],
              fence.normal[0], fence.normal[1], fence.normal[2]
            )
            fenceClr = fenceClr.concat([0xff, 0, 0, 0xff, 0xff, 0, 0, 0xff, 0xff, 0, 0, 0xff, 0xff, 0, 0, 0xff, 0xff, 0, 0, 0xff, 0xff, 0, 0, 0xff])
          } break
        }
        ch.end()
      }

      if (buf.name.toLowerCase().includes('terra'))
        return

      const intersectEntity = new Entity
      intersectEntity.positionData = new ArrayBufferSlice(new Float32Array(intersects[0]).buffer)
      intersectEntity.normalData = new ArrayBufferSlice(new Float32Array(intersects[1]).buffer)
      intersectEntity.colorData = new ArrayBufferSlice(new Uint32Array(intersects[2]).buffer)

      if (intersects[0].length)
        sector.intersectRenderer = new IntersectRenderer(device, renderCache, intersectEntity)

      this.sectors.push(sector)
    })

    const fence = new Entity
    fence.positionData = new ArrayBufferSlice(new Float32Array(fencePos).buffer)
    fence.normalData = new ArrayBufferSlice(new Float32Array(fenceNrm).buffer)
    fence.colorData = new ArrayBufferSlice(new Uint8Array(fenceClr).buffer)
    this.fenceRenderer = new FenceRenderer(device, renderCache, fence)
  }
}

