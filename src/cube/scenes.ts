import * as Viewer from "../viewer.js";
import { GfxDevice } from "../gfx/platform/GfxPlatform.js";
import { SceneContext } from "../SceneBase.js";
import { colorNewFromRGBA } from "../Color.js";

import { Scene } from "./render.js";

class SceneDesc implements Viewer.SceneDesc {
  constructor(
    public id: string,
    public name: string,
  ) { }

  public async createScene(
    gfxDevice: GfxDevice,
    // context: SceneContext,
  ): Promise<Viewer.SceneGfx> {
    let color = colorNewFromRGBA(1., 0., 1., 1.);
    let vertex_array = [1, 1, -1, 1, -1, -1, 1, 1, 1, 1, -1, 1, -1, 1, -1, -1, -1, -1, -1, 1, 1, -1, -1, 1,];
    let index_array = [0, 4, 6, 0, 6, 2, 3, 2, 6, 3, 6, 7, 7, 6, 4, 7, 4, 5, 5, 1, 3, 5, 3, 7, 1, 0, 2, 1, 2, 3, 5, 4, 0, 5, 0, 1,];

    return new Scene(
      gfxDevice,
      index_array,
      vertex_array,
      color
    ); //, ivs);
  }
}

const sceneDescs: SceneDesc[] = [new SceneDesc("cube", "cube")];

const name = "cube";
const id = "cube";

export const sceneGroup: Viewer.SceneGroup = { id, name, sceneDescs };

