import { Scene } from "./render.js";
import * as Viewer from "../viewer.js";
import { GfxDevice } from "../gfx/platform/GfxPlatform.js";
import { SceneContext } from "../SceneBase.js";

import { parse_header } from "./utils.js";
import { from_id, get_parser, ChunkEnum } from "./chunks.js";

const HEADER_SIZE = 12;

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
    const buffers = await Promise.all(
      this.paths.map((path) => dataFetcher.fetchData(`${path}`)),
    );
    // const ivs = buffers.map((buffer) => parse_header(buffer));
    let chunk_array: any[] = [];
    for (let buffer of buffers) {
      const buf: DataView = buffer.createDataView();
      let offs: number = 0;

      while (offs < buf.byteLength) {
        let header = parse_header(buf, offs);
        let chunk = from_id(header.chunk_id);

        switch (chunk) {
          case ChunkEnum.P3D: {
            offs += HEADER_SIZE;
            continue;
          }
          case ChunkEnum.SKIP: {
            offs += header.chunk_size;
            continue;
          }
          default: {
            chunk_array.push(get_parser(chunk)(buf, offs + HEADER_SIZE));
            offs += header.chunk_size;
            continue;
          }
        }
      }
      console.log("chunks: ", chunk_array);
    }

    let vertices: number[] = [];
    let normals: number[] = [];
    for (let wall of chunk_array) {
      let [sx, sz] = [wall.start.x, wall.start.z];
      let [ex, ez] = [wall.end.x, wall.end.z];
      let [nx, ny, nz] = [wall.end.x, wall.end.y, wall.end.z];
      vertices.push(sx, 10., sz);
      vertices.push(sx, -10., sz);
      vertices.push(ex, -10., ez);
      vertices.push(ex, -10., ez);
      vertices.push(ex, 10., ez);
      vertices.push(sx, 10., sz);

      normals.push(nx, ny, nz);
      normals.push(nx, ny, nz);
      normals.push(nx, ny, nz);
      normals.push(nx, ny, nz);
      normals.push(nx, ny, nz);
      normals.push(nx, ny, nz);
    }
    console.log(vertices);
    // console.log(vertices);

    return new Scene(gfxDevice, vertices, normals);
  }
}

const test = [
  // "p3d.p3d",
  // "wall.p3d",
  // "flandersHouse.p3d",
  "L7_TERRA.p3d",
];

const sceneDescs: SceneDesc[] = [new SceneDesc("test", "shar", test)];

const name = "Shar";
const id = "shar";

export const sceneGroup: Viewer.SceneGroup = { id, name, sceneDescs };

