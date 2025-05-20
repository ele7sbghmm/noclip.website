import * as Viewer from '../viewer.js'
import ArrayBufferSlice from '../ArrayBufferSlice.js'
import { SceneContext } from '../SceneBase.js'
import { GfxDevice, GfxTexture } from '../gfx/platform/GfxPlatform.js'
import { DataFetcher } from '../DataFetcher.js'

import { Scene } from './renderer.js'
import { ID } from './chunks/ids.js'
import { Muncher } from './chunkMuncher.js'
import { StaticEntityLoader } from './chunks/staticEntityLoader.js'
import { TextureLoader } from './chunks/textureLoader.js'


class SceneDesc implements Viewer.SceneDesc {
  constructor(public id: string, public name: string) { }
  async createScene(device: GfxDevice, context: SceneContext) {
    // const buffers = [await context.dataFetcher.fetchData(`sharTexture/l7/l7z1.p3d`)]
    const buffers = [await context.dataFetcher.fetchData(`sharTexture/l7/l7z2.p3d`)]
    // const buffer = await context.dataFetcher.fetchData(`sharTexture/p3d/staticEntity.L4_l1_gens_69Shape_016.p3d_`)
    //

    const scene = new Scene(device, context)
    new Muncher(buffers[0], scene)
    scene.doTextureStuff(context)
    scene.doAfter(device)

    return scene
  }
}

const id = "shar texture"
const name = "shar texture"
const sceneDescs = [
  new SceneDesc('l7z1', 'Suburbs Halloween | Homer 2')
]

export const sceneGroup = { id, name, sceneDescs }

export function fetchPNG(context: SceneContext, path: string): Promise<ImageData> {
  path = context.dataFetcher.getDataURLForPath(path)
  const img = document.createElement('img')
  img.crossOrigin = 'anonymous'
  img.src = path
  const p = new Promise<ImageData>((resolve) => {
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      resolve(ctx.getImageData(0, 0, img.width, img.height))
    }
  })
  return p
}

