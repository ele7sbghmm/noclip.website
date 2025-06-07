import * as Viewer from '../viewer.js'
import { SceneContext } from '../SceneBase.js'
import { GfxDevice } from '../gfx/platform/GfxPlatform.js'

import { Scene } from './scene.js'

class SceneDesc implements Viewer.SceneDesc {
  constructor(public id: string, public name: string, public relPath: string) { }
  async createScene(device: GfxDevice, context: SceneContext) {
    const buffers = await Promise.all(
      paths[this.id].map(path => context.dataFetcher.fetchData(`${this.relPath}/${path}`))
    )

    return new Scene(device, context, this.id, this.name, buffers)
  }
}

const id = 'simpsons fence col'
const name = 'simpsons fence col'
const base = 'sharTexture'
const paths: Record<string, string[]> = {
  'Level 1': [
    'L1_TERRA.p3d',
    'l1i00.p3d',
    'l1i01.p3d',
    'l1i02.p3d',
    'l1r1.p3d',
    'l1r2.p3d',
    'l1r3.p3d',
    'l1r4a.p3d',
    'l1r4b.p3d',
    'l1r6.p3d',
    'l1r7.p3d',
    'l1z1.p3d',
    'l1z2.p3d',
    'l1z3.p3d',
    'l1z4.p3d',
    'l1z6.p3d',
    'l1z7.p3d'
  ],
  'Level 2': [
    'L2_TERRA.p3d',
    'l2i03.p3d',
    'l2i04.p3d',
    'l2r1.p3d',
    'l2r2.p3d',
    'l2r3.p3d',
    'l2r4.p3d',
    'l2z1.p3d',
    'l2z2.p3d',
    'l2z3.p3d',
    'l2z4.p3d'
  ],
  'Level 3': [
    'L3_TERRA.p3d',
    'l3i05.p3d',
    'l3i06.p3d',
    'l3r1.p3d',
    'l3r2.p3d',
    'l3r3.p3d',
    'l3r4.p3d',
    'l3r5_dam.p3d',
    'l3r5.p3d',
    'l3z1.p3d',
    'l3z2.p3d',
    'l3z3.p3d',
    'l3z4.p3d',
    'l3z5.p3d'
  ],
  'Level 4': [
    'L4_TERRA.p3d',
    'l4i00.p3d',
    'l4i01.p3d',
    'l4i02.p3d',
    'l4i03.p3d',
    'l4r1.p3d',
    'l4r2.p3d',
    'l4r3.p3d',
    'l4r4a.p3d',
    'l4r4b.p3d',
    'l4r6.p3d',
    'l4r7.p3d',
    'l4z1.p3d',
    'l4z2.p3d',
    'l4z3.p3d',
    'l4z4.p3d',
    'l4z6.p3d',
    'l4z7.p3d'
  ],
  'Level 5': [
    'L5_TERRA.p3d',
    'l5i03.p3d',
    'l5i04.p3d',
    'l5r1.p3d',
    'l5r2.p3d',
    'l5r3.p3d',
    'l5r4.p3d',
    'l5z1.p3d',
    'l5z2.p3d',
    'l5z3.p3d',
    'l5z4.p3d'
  ],
  'Level 6': [
    'L6_TERRA.p3d',
    'l6i05.p3d',
    'l6i06.p3d',
    'l6r1.p3d',
    'l6r2.p3d',
    'l6r3.p3d',
    'l6r4.p3d',
    'l6r5_dam.p3d',
    'l6r5.p3d',
    'l6z1.p3d',
    'l6z2.p3d',
    'l6z3.p3d',
    'l6z4.p3d',
    'l6z5.p3d'
  ],
  'Level 7': [
    'L7_TERRA.p3d',
    'l7i00.p3d',
    'l7i01.p3d',
    'l7i02.p3d',
    'l7i07.p3d',
    'l7r1.p3d',
    'l7r2.p3d',
    'l7r3.p3d',
    'l7r6.p3d',
    'l7r7.p3d',
    'l7z1.p3d',
    'l7z2.p3d',
    'l7z3.p3d',
    'l7z6.p3d',
    'l7z7.p3d'
  ],
  'fcm': ['L1_TERRA.p3d', 'l1i00.p3d', 'l1i01.p3d', 'l1i02.p3d', 'l1r1.p3d', 'l1r2.p3d', 'l1r3.p3d', 'l1r4a.p3d', 'l1r4b.p3d', 'l1r6.p3d', 'l1r7.p3d', 'l1z1.p3d', 'l1z2.p3d', 'l1z3.p3d', 'l1z4.p3d', 'l1z6.p3d', 'l1z7.p3d', 'l2i03.p3d', 'l2i04.p3d', 'l2r1.p3d', 'l2r2.p3d', 'l2r3.p3d', 'l2r4.p3d', 'l2skybox.p3d', 'l2z1.p3d', 'l2z2.p3d', 'l2z3.p3d', 'l2z4.p3d', 'l3i05.p3d', 'l3i06.p3d', 'l3r1.p3d', 'l3r2.p3d', 'l3r3.p3d', 'l3r4.p3d', 'l3r5_dam.p3d', 'l3r5.p3d', 'l3z1.p3d', 'l3z2.p3d', 'l3z3.p3d', 'l3z4.p3d', 'l3z5.p3d'],
  'l1z1': ['l1z1.p3d'],
  'int': ['intersect'],
}

const sceneDescs = [
  new SceneDesc('Level 1', 'Suburbs Day', 'sharTexture/art__'),
  new SceneDesc('Level 2', 'Downtown Day', 'sharTexture/art__'),
  new SceneDesc('Level 3', 'Seaside Sunset', 'sharTexture/art__'),
  new SceneDesc('Level 4', 'Suburbs Night', 'sharTexture/art__'),
  new SceneDesc('Level 5', 'Downtown Dusk', 'sharTexture/art__'),
  new SceneDesc('Level 6', 'Seaside Twilight', 'sharTexture/art__'),
  new SceneDesc('Level 7', 'Suburbs Halloween', 'sharTexture/art__'),
  new SceneDesc('fcm', 'fcm', 'sharTexture/fmc'),
  new SceneDesc('l1z1', 'l1z1', 'sharTexture/art__'),
  new SceneDesc('int', 'int', '')
]

export const sceneGroup = { id, name, sceneDescs }

