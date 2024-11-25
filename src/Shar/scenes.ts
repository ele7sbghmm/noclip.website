
import { Scene } from './render.js'

import * as Viewer from '../viewer.js'
import { GfxDevice } from '../gfx/platform/GfxPlatform.js'
import { SceneContext } from '../SceneBase.js'

import { Sector, WorldScene } from './world.js'
import { tP3DFileHandler } from './file.js'
import { Bug } from './debug.js'

// const l1 = [ `L1_TERRA.p3d`, `l1i00.p3d`, `l1i01.p3d`, `l1i02.p3d`, `l1r1.p3d`, `l1r2.p3d`, `l1r3.p3d`, `l1r4a.p3d`, `l1r4b.p3d`, `l1r6.p3d`, `l1r7.p3d`, `l1z1.p3d`, `l1z2.p3d`, `l1z3.p3d`, `l1z4.p3d`, `l1z6.p3d`, `l1z7.p3d` ]
const l1 = [ `../l7_fencedsg.p3d`, `l1i00.p3d`, `l1i01.p3d`, `l1i02.p3d`, `l1r1.p3d`, `l1r2.p3d`, `l1r3.p3d`, `l1r4a.p3d`, `l1r4b.p3d`, `l1r6.p3d`, `l1r7.p3d`, `l1z1.p3d`, `l1z2.p3d`, `l1z3.p3d`, `l1z4.p3d`, `l1z6.p3d`, `l1z7.p3d` ]
const l2 = [ `l2_TERRA.p3d`, `l2i03.p3d`, `l2i04.p3d`, `l2r1.p3d`, `l2r2.p3d`, `l2r3.p3d`, `l2r4.p3d`, `l2z1.p3d`, `l2z2.p3d`, `l2z3.p3d`, `l2z4.p3d` ]
const l3 = [ `l3_TERRA.p3d`, `l3i05.p3d`, `l3i06.p3d`, `l3r1.p3d`, `l3r2.p3d`, `l3r3.p3d`, `l3r4.p3d`, `l3r5_dam.p3d`, `l3r5.p3d`, `l3z1.p3d`, `l3z2.p3d`, `l3z3.p3d`, `l3z4.p3d`, `l3z5.p3d` ]
const l4 = [ `L4_TERRA.p3d`, `l4i00.p3d`, `l4i01.p3d`, `l4i02.p3d`, `l4i07.p3d`, `l4r1.p3d`, `l4r2.p3d`, `l4r3.p3d`, `l4r4a.p3d`, `l4r4b.p3d`, `l4r6.p3d`, `l4r7.p3d`, `l4z1.p3d`, `l4z2.p3d`, `l4z3.p3d`, `l4z4.p3d`, `l4z6.p3d`, `l4z7.p3d` ]
const l5 = [ `l5_TERRA.p3d`, `l5i03.p3d`, `l5i04.p3d`, `l5r1.p3d`, `l5r2.p3d`, `l5r3.p3d`, `l5r4.p3d`, `l5z1.p3d`, `l5z2.p3d`, `l5z3.p3d`, `l5z4.p3d` ]
const l6 = [ `l6_TERRA.p3d`, `l6i05.p3d`, `l6i06.p3d`, `l6r1.p3d`, `l6r2.p3d`, `l6r3.p3d`, `l6r4.p3d`, `l6r5_dam.p3d`, `l6r5.p3d`, `l6z1.p3d`, `l6z2.p3d`, `l6z3.p3d`, `l6z4.p3d`, `l6z5.p3d` ]
const l7 = [ `L7_TERRA.p3d`, `l7i00.p3d`, `l7i01.p3d`, `l7i02.p3d`, `l7i07.p3d`, `l7r1.p3d`, `l7r2.p3d`, `l7r3.p3d`, `l7r6.p3d`, `l7r7.p3d`, `l7z1.p3d`, `l7z2.p3d`, `l7z3.p3d`, `l7z6.p3d`, `l7z7.p3d` ]

class SceneDesc implements Viewer.SceneDesc {
    constructor(public id: string, public name: string, public paths: string[]) { }

    public async createScene(gfxDevice: GfxDevice, context: SceneContext): Promise<Viewer.SceneGfx> {
        const dataFetcher = context.dataFetcher
        
        const sc = { scene: new WorldScene }
        const h = new tP3DFileHandler
        let terra_buffer = await dataFetcher.fetchData(`shar/art/${this.paths[0]}`)
        h.load(sc, -1, terra_buffer)
        for (let i = 0; i < this.paths.length - 1; i++) {
            const file_name = this.paths[i + 1]
            const sector_buffer = await dataFetcher.fetchData(`shar/art/${file_name}`)
            const active = file_name.slice(2, 4) == `z1` ? true : false
            sc.scene.sectors[i] = new Sector(file_name.slice(2).slice(0, -4), active)
            h.load(sc, i, sector_buffer)
        }
        return new Bug(sc, gfxDevice)
    }
}

const sceneDescs: SceneDesc[] = [
    new SceneDesc('l1', 'Level 1', l1),
    new SceneDesc('l2', 'Level 2', l2),
    new SceneDesc('l3', 'Level 3', l3),
    new SceneDesc('l4', 'Level 4', l4),
    new SceneDesc('l5', 'Level 5', l5),
    new SceneDesc('l6', 'Level 6', l6),
    new SceneDesc('l7', 'Level 7', l7)
]

const name = "The Simpsons: Hit & Run"
const id = "shar"

export const sceneGroup: Viewer.SceneGroup = { id, name, sceneDescs }
