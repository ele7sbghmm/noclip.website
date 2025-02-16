
import * as Viewer from "../viewer.js"
import { GfxDevice } from "../gfx/platform/GfxPlatform.js"
import { SceneContext } from "../SceneBase.js"


const base = "amped2/"
const sceneDescs: SceneDesc[] = [
  new SceneDesc("nz1", "New Zealand", base+"Levels/NZ1/NZ1_gfx/NZ1.pgf")
]
const name = "Amped 2"
const id = "amp2"

export const sceneGroup: Viewer.SceneGroup = { id, name, sceneDescs }
class SceneDesc implements Viewer.SceneDesc {
  constructor(public id: string, public name: string, public path: string) { }
  public async createScene(device: GfxDevice, context: SceneContext): Promise<Viewer.SceneGfx> {
    const dataFetcher = context.dataFetcher
    const pgf_buffer = await dataFetcher.fetCchData(this.path)
  }
}


