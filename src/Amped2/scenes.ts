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
    new SceneDesc('HD1', 'Tutorials', 'Levels/HD1/HD1_gfx/HD1.pgf'),
    new SceneDesc('ML1', 'Millicent 1', 'Levels/ML1/ML1_gfx/ML1.pgf'),
    new SceneDesc('BK1', 'Breckenridge', 'Levels/BK1/BK1_gfx/BK1.pgf'),
    new SceneDesc('BR1', 'Event 1', 'Levels/BR1/BR1_gfx/BR1.pgf'),
    new SceneDesc('BR2', 'Bear Mtn. 1', 'Levels/BR2/BR2_gfx/BR2.pgf'),
    new SceneDesc('HD2', 'Mt. Hood', 'Levels/HD2/HD2_gfx/HD2.pgf'),
    new SceneDesc('LX1', 'Laax 1', 'Levels/LX1/LX1_gfx/LX1.pgf'),
    new SceneDesc('AU1', 'Event 2', 'Levels/AU1/AU1_gfx/AU1.pgf'),
    new SceneDesc('AU2', 'Mt. Buller', 'Levels/AU2/AU2_gfx/AU2.pgf'),
    new SceneDesc('NZ1', 'New Zealand', 'Levels/NZ1/NZ1_gfx/NZ1.pgf'),
    new SceneDesc('ML2', 'Millicent', 'Levels/ML2/ML2_gfx/ML2.pgf'),
    new SceneDesc('BR3', 'Event 3', 'Levels/BR3/BR3_gfx/BR3.pgf'),
    new SceneDesc('BR4', 'Bear Mtn.', 'Levels/BR4/BR4_gfx/BR4.pgf'),
    new SceneDesc('LX2', 'Laax', 'Levels/LX2/LX2_gfx/LX2.pgf'),
    new SceneDesc('BK2', 'Event 4', 'Levels/BK2/BK2_gfx/BK2.pgf'),
]
const id = 'amp2'
const name = 'Amped2'

export const sceneGroup = { id, name, sceneDescs }

