
import { Scene } from './render.js'

import * as Viewer from '../viewer.js'
import { GfxDevice } from '../gfx/platform/GfxPlatform.js'
import { SceneContext } from '../SceneBase.js'

import { WorldScene } from './world'
import { tP3DFileHandler } from './file'

// import { AllWrappers, GetAllWrappers, radLoadInitialize, tP3DFileHandler } from './egg/loaders.js'
// import { tFile } from './egg/file.js'
// import { RenderFlow } from './egg/renderer.js'
// import { WinMain } from './egg/win.js'

class SceneDesc implements Viewer.SceneDesc {
    constructor(public id: string, public name: string, public paths: string[]) { }

    public async createScene(
        gfxDevice: GfxDevice, context: SceneContext
    ): Promise<Viewer.SceneGfx> {
        const dataFetcher = context.dataFetcher
        // const tree_buffer = await dataFetcher.fetchData(`shar/l7_treedsg.p3d`)
        const fence_buffer = await dataFetcher.fetchData(`shar/l7_fencedsg.p3d`)

        const world_scene = new WorldScene
        const h = new tP3DFileHandler
        h.load(world_scene, fence_buffer)

        return new Scene(gfxDevice, [])
    }
}

const sceneDescs: SceneDesc[] = [
    new SceneDesc('shar', 'shar', []),
]

const name = "The Simpsons: Hit & Run"
const id = "shar"

export const sceneGroup: Viewer.SceneGroup = { id, name, sceneDescs }
