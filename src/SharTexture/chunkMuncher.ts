import ArrayBufferSlice from '../ArrayBufferSlice.js'
import { GfxDevice } from '../gfx/platform/GfxPlatform.js'
import { GfxRenderCache } from '../gfx/render/GfxRenderCache.js'

import { ID } from './chunks/ids.js'
import { ChunkHandler } from './chunkHandler.js'
import { StaticEntityLoader } from './chunks/staticEntityLoader.js'
import { StaticEntity } from './staticEntity.js'

export class Muncher {
  static staticEntities(device: GfxDevice, renderCache: GfxRenderCache, buffer: ArrayBufferSlice) {
    const out = []
    const c = new ChunkHandler(buffer)
    c.p3dChunk()

    while (c.chunksRemaining()) {
      switch (c.beginChunk()) {
        case ID.ENTITY_DSG: {
          const maybe = StaticEntityLoader.getBuffers(c)
          if (maybe != null)
            out.push(new StaticEntity(device, renderCache, maybe))
          break
        }
      }
      c.endChunk()
    }
    return out
  }
}
