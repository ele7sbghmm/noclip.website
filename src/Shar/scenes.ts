import { assert } from '../util.js'
import * as Viewer from '../viewer.js'
import { GfxDevice } from '../gfx/platform/GfxPlatform.js'
import { SceneContext } from '../SceneBase.js'

import { DynaLoadListDSG, RenderFlow } from './world.js'
import { tP3DFileHandler } from './file.js'
import { Bug } from './debug.js'
import { RoadManager } from './dsg.js'


type LevelPaths_ = {
    index: number
    id: string
    default_render: string[]
    global_sector_paths: string[]
    sectors: Thing[]
}
type Thing = { id: string, path: string, desc: string }
const levels_: LevelPaths_[] = [
    {index: 0, id: ``, default_render: [], global_sector_paths: [], sectors: []},
    { // l1
        index: 1,
        id: `l1`,
        default_render: [`z1`, `r1`, `z2`, `i02`],
        global_sector_paths: [`L1_TERRA.p3d`, `missions/level01/jumps.p3d`],
        sectors: [
            { id: `i00`, path: `l1i00.p3d`, desc: `Springfield Elementery Interior` },
            { id: `i01`, path: `l1i01.p3d`, desc: `Kwik-e-Mart Interior` },
            { id: `i02`, path: `l1i02.p3d`, desc: `Simpson's House Interior` },
            { id:  `z1`, path:  `l1z1.p3d`, desc: `742 Evergreen Terrace` },
            { id:  `r1`, path:  `l1r1.p3d`, desc: `Playground` },
            { id:  `z2`, path:  `l1z2.p3d`, desc: `Kwik-E-Mart Exterior` },
            { id:  `r2`, path:  `l1r2.p3d`, desc: `Church` },
            { id:  `z3`, path:  `l1z3.p3d`, desc: `School Playground` },
            { id:  `r3`, path:  `l1r3.p3d`, desc: `Olde Springfield` },
            { id:  `z4`, path:  `l1z4.p3d`, desc: `Burn's Mansion porte-cochère` },
            { id: `r4a`, path: `l1r4a.p3d`, desc: `Stonecutter's tunnel`  },
            { id: `r4b`, path: `l1r4b.p3d`, desc: `Burn's Mansion interior/courtyard` },
            { id:  `z6`, path:  `l1z6.p3d`, desc: `Powerplant interior/Homer's office` },
            { id:  `r6`, path:  `l1r6.p3d`, desc: `Tyre Fire / Powerplant carpark` },
            { id:  `z7`, path:  `l1z7.p3d`, desc: `Cletus' Shack / Caravan Park` },
            { id:  `r7`, path:  `l1r7.p3d`, desc: `Cemetery` },
        ]
    }
]

export class DLLD_ extends DynaLoadListDSG {
    constructor(public id: string = ``, public desc: string = ``, public draw: boolean = false) {
        super()
    }
}
export class Instance {
    constructor(public instance_index: number) { }
    renderFlow_instance: RenderFlow
    // pTriggerVolumeTracker_instance: TriggerVolumeTracker
    roadManager_instance = new RoadManager

    _get_instance() { instances[this.instance_index] }
    CreateSingletons() {
        // this.pTriggerVolumeTracker_instance = TriggerVolumeTracker.CreateInstance()
        this.renderFlow_instance = RenderFlow.CreateInstance()
    }
    // GetTriggerVolumeTracker() { return this.pTriggerVolumeTracker_instance }
    GetRenderFlow() { return this.renderFlow_instance }
    GetRenderManager() { return this.GetRenderFlow().mpRenderManager }
}
const instances: (Instance | null)[] = [
    null, new Instance(1), new Instance(2), new Instance(3),
    new Instance(4), new Instance(5), new Instance(6), new Instance(7)
]
const get_streetrace_paths = (i: number) => {
    //~ `l1_sr3p.p3d`, `missions/level01/sr3.p3d`
    return [
        `missions/level0${i}/sr1.p3d`, `l${i}_sr1p.p3d`, 
        `missions/level0${i}/sr2.p3d`, `l${i}_sr2p.p3d`, 
        `missions/level0${i}/sr3.p3d`, `l${i}_sr3p.p3d`, 
        `missions/level0${i}/gr1.p3d`, null,
    ]
}
class SceneDesc implements Viewer.SceneDesc {
    constructor(public id: string, public name: string, public level_paths: LevelPaths_) { }
    public async createScene(gfxDevice: GfxDevice, context: SceneContext): Promise<Viewer.SceneGfx> {
        const dataFetcher = context.dataFetcher
        const path_base = `shar/art`

        const global_sector_buffers = await Promise.all(this.level_paths.global_sector_paths.map(
            path => dataFetcher.fetchData(`${path_base}/${path}`)))
        // const street_race_buffers = await Promise.all(
        //     get_streetrace_paths(this.level_paths.index + 1).map(
        //         path => dataFetcher.fetchData(`${path_base}/${path}`))
        // )
        const sector_buffers = await Promise.all(
            this.level_paths.sectors.map(
                thing => dataFetcher.fetchData(`${path_base}/${thing.path}`)))
        
        const h = new tP3DFileHandler
        const level_instance = instances[this.level_paths.index]!
        level_instance.CreateSingletons()
        const iWRL = level_instance.GetRenderManager().pWorldRenderLayer()
        iWRL.mCurLoadIndex = 0
        this.level_paths.global_sector_paths.forEach((path, index) => {
            const draw = index == 0

            // if (iWRL.mLoadLists[iWRL.mCurLoadIndex] == null)
            iWRL.mLoadLists[iWRL.mCurLoadIndex] = new DLLD_(`terra`, `global`, draw)

            h.load(level_instance, global_sector_buffers[index])
        })

        // street_races: [
        //     { id: `sr1`, desc: `Time-trial Race / Milhouse`, paths: [`l1_sr1p.p3d`, `missions/level01/sr1.p3d`] },
        //     { id: `sr2`, desc: `Street Race / Ralph`,        paths: [`l1_sr2p.p3d`, `missions/level01/sr2.p3d`] },
        //     { id: `sr3`, desc: `Circuit Race / Nelson`,      paths: [`l1_sr3p.p3d`, `missions/level01/sr3.p3d`] },
        //     { id: `gr1`, desc: `Wager Race / Louis`,         paths: [`missions/level01/gr1.p3d`] },
        // ],
        iWRL.mCurLoadIndex++
        this.level_paths.sectors.forEach((thing, index) => {
            const draw = this.level_paths.default_render.includes(thing.id)

            iWRL.mLoadLists[iWRL.mCurLoadIndex] = new DLLD_(thing.id, thing.desc, draw)

            h.load(level_instance, sector_buffers[index])
            iWRL.mCurLoadIndex++
        })

        return new Bug(level_instance, gfxDevice)
    }
}

const sceneDescs: SceneDesc[] = [
    new SceneDesc(`l1`, `Level 1 - Suburbs`, levels_[1]),
    new SceneDesc(`l2`, `Level 2 - Downtown`, levels_[2]),
    new SceneDesc(`l3`, `Level 3 - Seaside`, levels_[3]),
    new SceneDesc(`l4`, `Level 4 - Suburbs Night`, levels_[4]),
    new SceneDesc(`l5`, `Level 5 - Downtown Night`, levels_[5]),
    new SceneDesc(`l6`, `Level 6 - Seaside Night`, levels_[6]),
    new SceneDesc(`l7`, `Level 7 - Suburbs Halloween`, levels_[7]),
]

const name = "The Simpsons: Hit & Run"
const id = "shar"

export const sceneGroup: Viewer.SceneGroup = { id, name, sceneDescs }
