
import { Scene } from './render.js'

import * as Viewer from '../viewer.js'
import { GfxDevice } from '../gfx/platform/GfxPlatform.js'
import { SceneContext } from '../SceneBase.js'

import { AllWrappers, GetAllWrappers, radLoadInitialize, tP3DFileHandler } from './loaders.js'
import { tFile } from './file.js'
import { RenderFlow } from './renderer.js'
import { WinMain } from './win.js'

class SceneDesc implements Viewer.SceneDesc {
    constructor(public id: string, public name: string, public paths: string[]) { }

    public async createScene(gfxDevice: GfxDevice, context: SceneContext): Promise<Viewer.SceneGfx> {
        const dataFetcher = context.dataFetcher
        const tree_buffer = await dataFetcher.fetchData(`shar/l7_treedsg.p3d`)
        const fence_buffer = await dataFetcher.fetchData(`shar/l7_fencedsg.p3d`)

        WinMain()

        const p3d = new tP3DFileHandler

        // p3d.Load(new tFile(tree_buffer))
        p3d.Load(new tFile(fence_buffer))

        return new Scene(gfxDevice, [])
    }
}

const sceneDescs: SceneDesc[] = [
    new SceneDesc('shar', 'shar', []),
]

const name = "The Simpsons: Hit & Run"
const id = "shar"

export const sceneGroup: Viewer.SceneGroup = { id, name, sceneDescs }
