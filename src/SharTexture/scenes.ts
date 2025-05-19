import * as Viewer from '../viewer.js'
import ArrayBufferSlice from '../ArrayBufferSlice.js'
import { SceneContext } from '../SceneBase.js'
import { GfxDevice } from '../gfx/platform/GfxPlatform.js'
import { DataFetcher } from '../DataFetcher.js'

import { Scene } from './renderer.js'
import { ID } from './chunks/ids.js'
import { ChunkHandler } from './chunkHandler.js'
import { ShaderLoader } from './chunks/shaderLoader.js'
import { TextureLoader } from './chunks/textureLoader.js'

class SceneDesc implements Viewer.SceneDesc {
  constructor(public id: string, public name: string) { }
  async createScene(device: GfxDevice, context: SceneContext) {
    // const buffer = await context.dataFetcher.fetchData(`sharTexture/l7/l7z1.p3d`)
    const buffer = await context.dataFetcher.fetchData(`sharTexture/l7/l7z2.p3d`)
    return new Scene(device, buffer)
  }
}

const id = "shar texture"
const name = "shar texture"
const sceneDescs = [
  new SceneDesc('l7z1', 'Suburbs Halloween | Homer 2')
]

export const sceneGroup = { id, name, sceneDescs }

function fetchPNG(dataFetcher: DataFetcher, path: string): Promise<ImageData> {
  path = dataFetcher.getDataURLForPath(path);
  const img = document.createElement('img');
  img.crossOrigin = 'anonymous';
  img.src = path;
  const p = new Promise<ImageData>((resolve) => {
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      resolve(ctx.getImageData(0, 0, img.width, img.height));
    };
  });
  return p;
}

