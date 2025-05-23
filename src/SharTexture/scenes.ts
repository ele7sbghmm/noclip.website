import * as Viewer from '../viewer.js'
import { SceneContext } from '../SceneBase.js'
import { GfxDevice } from '../gfx/platform/GfxPlatform.js'

import { Scene } from './renderer.js'
import { Muncher } from './chunkMuncher.js'


const paths: Record<string, string[]> = {
  'Level 1': [
    'L1_TERRA',
    'l1i00',
    'l1i01',
    'l1i02',
    'l1z1',
    'l1r1',
    'l1z2',
    'l1r2',
    'l1z3',
    'l1r3',
    'l1z4',
    'l1r4a',
    'l1r4b',
    'l1z6',
    'l1r6',
    'l1z7',
    'l1r7'
  ],
  'Level 2': [
    'l2_TERRA',
    'l2i03',
    'l2i04',
    'l2z1',
    'l2r1',
    'l2z2',
    'l2r2',
    'l2z3',
    'l2r3',
    'l2z4',
    'l2r4'
  ],
  'Level 3': [
    'l3_TERRA',
    'l3i05',
    'l3i06',
    'l3z1',
    'l3r1',
    'l3z2',
    'l3r2',
    // 'l3z3',
    'l3r3',
    'l3z4',
    'l3r4',
    // 'l3z5',
    'l3r5',
    'l3r5_dam'
  ],
  'Level 4': [
    'L4_TERRA',
    'l4i00',
    'l4i01',
    'l4i02',
    'l4i07',
    'l4z1',
    'l4r1',
    'l4z2',
    'l4r2',
    'l4z3',
    'l4r3',
    'l4z4',
    'l4r4a',
    'l4r4b',
    'l4z6',
    'l4r6',
    'l4z7',
    'l4r7'
  ],
  'Level 5': [
    'l5_TERRA',
    'l5i03',
    'l5i04',
    'l5z1',
    'l5r1',
    'l5z2',
    'l5r2',
    'l5z3',
    'l5r3',
    'l5z4',
    'l5r4'
  ],
  'Level 6': [
    'l6_TERRA',
    'l6i05',
    'l6i06',
    'l6z1',
    'l6r1',
    'l6z2',
    'l6r2',
    'l6z3',
    'l6r3',
    'l6z4',
    'l6r4',
    'l6z5',
    'l6r5',
    'l6r5_dam'
  ],
  'Level 7': [
    'L7_TERRA',
    'l7i00',
    'l7i01',
    'l7i02',
    'l7i07',
    'l7z1',
    'l7r1',
    'l7z2',
    'l7r2',
    'l7z3',
    'l7r3',
    'l7z6',
    'l7r6',
    'l7z7',
    'l7r7',
  ]
}


class SceneDesc implements Viewer.SceneDesc {
  constructor(public id: string, public name: string) { }
  async createScene(device: GfxDevice, context: SceneContext) {
    const buffers = await Promise.all(paths[this.id].map(async (fileName) => {
      return await context.dataFetcher.fetchData(`sharTexture/art/${fileName}.p3d`)
    }))
   
    const scene = new Scene(device, context)
    new Muncher(buffers, scene)
    await scene.doTextureStuff()
    scene.doAfter(device)

    return scene
  }
}

const id = "shar texture"
const name = "shar texture"
const sceneDescs = [
  new SceneDesc('Level 1', 'Suburbs Day'),
  new SceneDesc('Level 2', 'Downtown Day'),
  new SceneDesc('Level 3', 'Seaside Sunset'),
  new SceneDesc('Level 4', 'Suburbs Night'),
  new SceneDesc('Level 5', 'Downtown Night'),
  new SceneDesc('Level 6', 'Seaside Twilight'),
  new SceneDesc('Level 7', 'Suburbs Halloween')
]

export const sceneGroup = { id, name, sceneDescs }

export function fetchPNG(buffer: ArrayBuffer): Promise<ImageData> {
  // path = context.dataFetcher.getDataURLForPath(path)
  const blob = new Blob([buffer], { type: 'image/png'})
  const url = URL.createObjectURL(blob)

  const img = document.createElement('img')
  img.crossOrigin = 'anonymous'
  img.src = url
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

