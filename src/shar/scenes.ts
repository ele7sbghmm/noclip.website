import { Scene } from "./render.js";

import * as Viewer from "../viewer.js";
import { GfxDevice } from "../gfx/platform/GfxPlatform.js";
import { SceneContext } from "../SceneBase.js";

import { parse_header } from "./parsers.js";

const pathBase = `Shar`;

class SceneDesc implements Viewer.SceneDesc {
  constructor(
    public id: string,
    public name: string,
    public paths: string[],
  ) { }

  public async createScene(
    gfxDevice: GfxDevice,
    context: SceneContext,
  ): Promise<Viewer.SceneGfx> {
    const dataFetcher = context.dataFetcher;
    // const buffers = await Promise.all(
    //   this.paths.map((path) => dataFetcher.fetchData(`${pathBase}/${path}`)),
    // );
    // const ivs = buffers.map((buffer) => parse_header(buffer));
    // const p3d = parse_header(buffers[0]);

    return new Scene(gfxDevice);
  }
}

const test = ["data/p3d.p3d"];

const sceneDescs: SceneDesc[] = [new SceneDesc("test", "shar", test)];

const name = "Shar";
const id = "shar";

export const sceneGroup: Viewer.SceneGroup = { id, name, sceneDescs };

