import * as Viewer from '../viewer.js'
import { SceneContext } from '../SceneBase.js'
import { GfxDevice } from '../gfx/platform/GfxPlatform.js'

import { SceneGfx } from './render.js'

class SceneDesc implements Viewer.SceneDesc {
  constructor(public id: string, public name: string, public path: string, public ptrs: number[]) { }
  async createScene(device: GfxDevice, context: SceneContext) {
    const data = await context.dataFetcher.fetchData(this.path)

    return new SceneGfx(device, context, data, this.ptrs)
  }
}

const id = 'mw2 col'
const name = 'mw2 col'

const sceneDescs = [
  new SceneDesc('favela', 'mp_favela', 'mw2/english/mp_favela.ff.release_xassets', [0x39ff165, 0x70f6dc, 0x3a3179c, 0x3c32c7c])
]

export const sceneGroup = { id, name, sceneDescs }

