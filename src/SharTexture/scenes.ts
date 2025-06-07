import * as Viewer from '../viewer.js'
import { SceneContext } from '../SceneBase.js'
import { Color, colorNewFromRGBA } from '../Color.js'
import { GfxDevice } from '../gfx/platform/GfxPlatform.js'

import { Scene } from './renderer.js'
import { Muncher } from './chunkMuncher.js'

class SceneDesc implements Viewer.SceneDesc {
  constructor(public id: string, public name: string, public path: string) { }
  async createScene(device: GfxDevice, context: SceneContext) {
    const buffers = await Promise.all(paths[this.id].map(async (fileName) => {
      return await context.dataFetcher.fetchData(`${this.path}/${fileName}.p3d`)
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
const path = 'sharTexture/art__'
const sceneDescs = [
  new SceneDesc('Level 1', 'Suburbs Day', path),
  new SceneDesc('Level 2', 'Downtown Day', path),
  new SceneDesc('Level 3', 'Seaside Sunset', path),
  new SceneDesc('Level 4', 'Suburbs Night', path),
  new SceneDesc('Level 5', 'Downtown Dusk', path),
  new SceneDesc('Level 6', 'Seaside Twilight', path),
  new SceneDesc('Level 7', 'Suburbs Halloween', path),
  new SceneDesc('fmc', 'Fully Connected Map', 'sharTexture/fmc'),
  new SceneDesc('l1z1', 'l1z1', path),
  new SceneDesc('l3r1', 'l3r1', path),
]

export const sceneGroup = { id, name, sceneDescs }

export function fetchPNG(buffer: ArrayBuffer): Promise<ImageData> {
  // path = context.dataFetcher.getDataURLForPath(path)
  const blob = new Blob([buffer], { type: 'image/png' })
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

const paths: Record<string, string[]> = {
  'l1z1': ['l1z1'],
  'l3r1': ['l3r1'],
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
    'l3z3', // lambert1 shader undefined && vb too small for draw call
    'l3r3',
    'l3z4',
    'l3r4',
    'l3z5', // vb too small for draw call
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
    'l6z1', // lambert1 shader undefined && vb too small for draw call
    'l6r1',
    'l6z2',
    'l6r2',
    'l6z3', // lambert1 shader undefined && vb too small for draw call
    'l6r3',
    'l6z4',
    'l6r4',
    'l6z5', // vb too small for draw call
    'l6r5',
    'l6r5_dam'
  ],
  'Level 7': [
    'L7_TERRA',
    'l7i00',
    'l7i01',
    'l7i02', // vb too small for draw call
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
  ],
  'fmc': [
    'L1_TERRA',
    'l1i00',
    'l1i01',
    'l1i02',
    // 'l1r1',
    'l1r2',
    'l1r3',
    // 'l1r4a',
    // 'l1r4b',
    // 'l1r6',
    // 'l1z1',
    'l1z2',
    'l1z3',
    // 'l1z4',
    // 'l1z6',
    // 'l1z7',
    // 'l1r7',
    'l2i03',
    'l2i04',
    'l2r1',
    'l2r2',
    'l2r3',
    'l2r4',
    'l2skybox',
    'l2z1',
    'l2z2',
    'l2z3',
    'l2z4',
    'l3i05',
    'l3i06',
    'l3r1',
    'l3r2',
    'l3r3',
    'l3r4',
    'l3r5_dam',
    'l3r5',
    'l3z1',
    'l3z2',
    'l3z3',
    'l3z4',
    'l3z5',
  ]
}
