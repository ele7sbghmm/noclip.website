import { SceneContext } from '../SceneBase.js'
import * as Viewer from '../viewer.js'
import { GfxDevice } from '../gfx/platform/GfxPlatform.js'

import { Scene } from './render.js'
import { Pgf } from './pgf/pgf.js'

class SceneDesc implements Viewer.SceneDesc {
    constructor(public id: string, public name: string, public path: string) { }
    async createScene(device: GfxDevice, context: SceneContext) {
        const data = await context.dataFetcher.fetchData(`a2p/${this.path}`)
        const pgf = new Pgf(data)

        return new Scene(device, pgf)
    }
}

const sceneDescs = [
    new SceneDesc('snowman', 'Snowman', 'Objects/Objects_gfx/Snowman.pgf'),
    new SceneDesc('snowcat', 'Snow Cat', 'Objects/Objects_gfx/Snow_Cat.pgf'),
    new SceneDesc('heli', 'Helicopter', 'Objects/Objects_gfx/Helicopter.pgf'),
    new SceneDesc('liftchair', 'Lift Chair', 'Objects/Objects_gfx/HD_Lift_Chair.PGF'),
    new SceneDesc('NZ1', 'New Zealand', 'Levels/NZ1/NZ1_gfx/NZ1.pgf'),
]
const id = 'amp2'
const name = 'Amped2'

export const sceneGroup = { id, name, sceneDescs }

