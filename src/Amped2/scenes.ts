import { SceneContext } from '../SceneBase.js'
import * as Viewer from '../viewer.js'
import { GfxDevice } from '../gfx/platform/GfxPlatform.js'

import { Scene } from './render.js'
import { Pgf, PgfData } from './pgf/pgf.js'

class SceneDesc implements Viewer.SceneDesc {
    constructor(public id: string, public name: string, public path: string) { }
    async createScene(device: GfxDevice, context: SceneContext) {
        const data = await context.dataFetcher.fetchData(`a2p/${this.path}`)
        const pgf = new Pgf(new PgfData(data))

        return new Scene(device, pgf)
    }
}

