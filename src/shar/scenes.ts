import { Scene } from "./render.js";
import * as Viewer from "../viewer.js";
import { GfxDevice } from "../gfx/platform/GfxPlatform.js";
import { SceneContext } from "../SceneBase.js";

import { FenceEntityDSG } from "./radical/dsg.js";

class SceneDesc implements Viewer.SceneDesc {
  constructor(
    public level: Level,
  ) { }

  public async createScene(gfxDevice: GfxDevice, context: SceneContext): Promise<Viewer.SceneGfx> {
    const dataFetcher = context.dataFetcher;

    const path_base = `shar/${id}/`;
    const [terra, ...zones] = await Promise.all(
      this.level.zones.map((path) => dataFetcher.fetchData(`${path_base}${path}`)),
    );


    return new Scene(gfxDevice, terra, zones);
  }
}

type Level = { id: string, zones: string[], extras?: string[] }
const level7: Level = {
  id: "l7",
  zones: ["L7_TERRA.P3D", "l1z1.p3d"],
}

const sceneDescs: SceneDesc[] = [
  new SceneDesc(level7),
];

const name = "The Simpsons: Hit & Run";
const id = "shar";

export const sceneGroup: Viewer.SceneGroup = { id, name, sceneDescs };

