
import { Scene } from './render.js'

import * as Viewer from '../viewer.js'
import { GfxDevice } from '../gfx/platform/GfxPlatform.js'
import { SceneContext } from '../SceneBase.js'

import { TreeDSGLoader } from './loaders.js'
import { tChunkFile, tFile } from './file.js'

class SceneDesc implements Viewer.SceneDesc {
    constructor(public id: string, public name: string, public paths: string[]) { }

    public async createScene(gfxDevice: GfxDevice, context: SceneContext): Promise<Viewer.SceneGfx> {
        const dataFetcher = context.dataFetcher
        const tree_buffer = await dataFetcher.fetchData(`shar/l7_treedsg.p3d`)

        const tree = new TreeDSGLoader().LoadObject(new tChunkFile(new tFile(tree_buffer)))

        return new Scene(gfxDevice, [])
    }
}

const sceneDescs: SceneDesc[] = [
    new SceneDesc('shar', 'shar', []),
]

const name = "The Simpsons: Hit & Run"
const id = "shar"

export const sceneGroup: Viewer.SceneGroup = { id, name, sceneDescs }
