
import { Scene } from './render.js'

import * as Viewer from '../viewer.js'
import { GfxDevice } from '../gfx/platform/GfxPlatform.js'
import { SceneContext } from '../SceneBase.js'

import { simple_TreeDSGLoader } from './simple_loaders.js'
import { tChunkFile } from './chunkfile.js'
import { tFile } from './chunkfile.js'

class SceneDesc implements Viewer.SceneDesc {
    constructor(public id: string, public name: string, public paths: string[]) {
        console.log('<<<<<<<<<< constructor >>>>>>>>>')
    }

    public async createScene(gfxDevice: GfxDevice, context: SceneContext): Promise<Viewer.SceneGfx> {
        console.log('<<<<<<<<<< createScene >>>>>>>>>')
        const dataFetcher = context.dataFetcher
        const tree_buffer = await dataFetcher.fetchData(`shar/l7_treedsg.p3d`)

        const tree = new simple_TreeDSGLoader().LoadObject(new tChunkFile(new tFile(tree_buffer)))

        console.log(tree)

        return new Scene(gfxDevice, [])
    }
}

const chunks: {} = {
    tree: 'shar/l7_treedsg.p3d',
}

const sceneDescs: SceneDesc[] = [
    new SceneDesc('', '', []),
]

const name = "The Simpsons: Hit & Run"
const id = "shar"

export const sceneGroup: Viewer.SceneGroup = { id, name, sceneDescs }
