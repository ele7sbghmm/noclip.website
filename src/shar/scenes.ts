import { Scene } from "./render.js";
import * as Viewer from "../viewer.js";
import { GfxDevice } from "../gfx/platform/GfxPlatform.js";
import { SceneContext } from "../SceneBase.js";

import { FenceEntityDSG } from "./radical/dsg.js";

class SceneDesc implements Viewer.SceneDesc {
  constructor(public id: string, public name: string, public level: Level) { }

  public async createScene(
    gfxDevice: GfxDevice,
    context: SceneContext,
  ): Promise<Viewer.SceneGfx> {
    const dataFetcher = context.dataFetcher;

    const p3ds = await Promise.all(
      this.level.files.map((file_name) =>
        dataFetcher.fetchData(`${id}/${file_name}`),
      ),
    );

    return new Scene(gfxDevice, p3ds);
  }
}

type Level = { id: string; files: string[]; } | {};
const levels: Level[] = [
  {}, {}, {}, {}, {}, {}, {},
  {
    id: "l7",
    files: ["L7_TERRA.P3D"],// "l7z1.p3d"],
  },
];

const name = "The Simpsons: Hit & Run";
const id = "shar";

const sceneDescs: SceneDesc[] = [new SceneDesc(id, name, levels[7])];

export const sceneGroup: Viewer.SceneGroup = { id, name, sceneDescs };

