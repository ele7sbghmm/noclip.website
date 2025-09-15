import * as Viewer from '../viewer.js'
import { SceneContext } from '../SceneBase.js'
import { GfxDevice } from '../gfx/platform/GfxPlatform.js'

import { SceneGfx } from './render.js'

class SceneDesc implements Viewer.SceneDesc {
  constructor(public id: string, public name: string, public path: string, public ptrs: number[]) { }
  async createScene(device: GfxDevice, context: SceneContext) {
    const data = await context.dataFetcher.fetchData(this.path)

    return new SceneGfx(device, context, data, this.ptrs)
  }
}

const id = 'mw2 col'
const name = 'mw2 col'

const sceneDescs = [
  new SceneDesc('afghan', 'mp_afghan', 'mw2/english/mp_afghan.ff.release_xassets', [0x9950bf, 0x3eb6ac4]),
  new SceneDesc('boneyard', 'mp_boneyard', 'mw2/english/mp_boneyard.ff.release_xassets', [0x75afeb, 0x331a592]),
  // new SceneDesc('brecourt', 'mp_brecourt', 'mw2/english/mp_brecourt.ff.release_xassets', []),
  new SceneDesc('checkpoint', 'mp_checkpoint', 'mw2/english/mp_checkpoint.ff.release_xassets', [0x63ee68, 0x5543c7c]),
  new SceneDesc('derail', 'mp_derail', 'mw2/english/mp_derail.ff.release_xassets', [0xa23890, 0x4b1158b]),
  new SceneDesc('estate', 'mp_estate', 'mw2/english/mp_estate.ff.release_xassets', [0x919d80, 0x43694e1]),
  new SceneDesc('favela', 'mp_favela', 'mw2/english/mp_favela.ff.release_xassets', [0x70f6dc, 0x39ff165]),
  new SceneDesc('highrise', 'mp_highrise', 'mw2/english/mp_highrise.ff.release_xassets', [0xd13ddf, 0x48f7a46]),
  new SceneDesc('invasion', 'mp_invasion', 'mw2/english/mp_invasion.ff.release_xassets', [0x92a793, 0x49e0a98]),
  new SceneDesc('nightshift', 'mp_nightshift', 'mw2/english/mp_nightshift.ff.release_xassets', [0x727a5f, 0x47ff9be]),
  new SceneDesc('quarry', 'mp_quarry', 'mw2/english/mp_quarry.ff.release_xassets', [0x9aeddd, 0x4985830]),
  new SceneDesc('rundown', 'mp_rundown', 'mw2/english/mp_rundown.ff.release_xassets', [0xa24e02, 0x3befe25]),
  new SceneDesc('rust', 'mp_rust', 'mw2/english/mp_rust.ff.release_xassets', [0x2d8369, 0x397df59]),
  new SceneDesc('subbase', 'mp_subbase', 'mw2/english/mp_subbase.ff.release_xassets', [0x948f7f, 0x3839d66]),
  // new SceneDesc('terminal', 'mp_terminal', 'mw2/english/mp_terminal.ff.release_xassets', []),
  // new SceneDesc('underpass', 'mp_underpass', 'mw2/english/mp_underpass.ff.release_xassets', []),
]
export const sceneGroup = { id, name, sceneDescs }

/*
  mp_abandon.ff.release_xassets
  mp_abandon_load.ff.release_xassets
  mp_compact.ff.release_xassets
  mp_compact_load.ff.release_xassets
  mp_complex.ff.release_xassets
  mp_complex_load.ff.release_xassets
  mp_crash.ff.release_xassets
  mp_crash_load.ff.release_xassets
  mp_fuel2.ff.release_xassets
  mp_fuel2_load.ff.release_xassets
  mp_overgrown.ff.release_xassets
  mp_overgrown_load.ff.release_xassets
  mp_storm.ff.release_xassets
  mp_storm_load.ff.release_xassets
  mp_strike.ff.release_xassets
  mp_strike_load.ff.release_xassets
  mp_trailerpark.ff.release_xassets
  mp_trailerpark_load.ff.release_xassets
  mp_vacant.ff.release_xassets
  mp_vacant_load.ff.release_xassets

  english/
    code_post_gfx_mp.ff.release_xassets
    code_pre_gfx_mp.ff.release_xassets
    common_mp.ff.release_xassets
    dlc1_ui_mp.ff.release_xassets
    dlc2_ui_mp.ff.release_xassets
    localized_code_post_gfx_mp.ff.release_xassets
    localized_code_pre_gfx_mp.ff.release_xassets
    localized_common_mp.ff.release_xassets
    localized_ui_mp.ff.release_xassets
    mp_afghan.ff.release_xassets
    mp_afghan_load.ff.release_xassets
    mp_boneyard.ff.release_xassets
    mp_boneyard_load.ff.release_xassets
    mp_brecourt.ff.release_xassets
    mp_brecourt_load.ff.release_xassets
    mp_checkpoint.ff.release_xassets
    mp_checkpoint_load.ff.release_xassets
    mp_derail.ff.release_xassets
    mp_derail_load.ff.release_xassets
    mp_estate.ff.release_xassets
    mp_estate_load.ff.release_xassets
    mp_favela.ff.release_xassets
    mp_favela_load.ff.release_xassets
    mp_highrise.ff.release_xassets
    mp_highrise_load.ff.release_xassets
    mp_invasion.ff.release_xassets
    mp_invasion_load.ff.release_xassets
    mp_nightshift.ff.release_xassets
    mp_nightshift_load.ff.release_xassets
    mp_quarry.ff.release_xassets
    mp_quarry_load.ff.release_xassets
    mp_rundown.ff.release_xassets
    mp_rundown_load.ff.release_xassets
    mp_rust.ff.release_xassets
    mp_rust_load.ff.release_xassets
    mp_subbase.ff.release_xassets
    mp_subbase_load.ff.release_xassets
    mp_terminal.ff.release_xassets
    mp_terminal_load.ff.release_xassets
    mp_underpass.ff.release_xassets
    mp_underpass_load.ff.release_xassets
    patch_code_pre_gfx_mp.ff.release_xassets
    patch_mp.ff.release_xassets
    ui_mp.ff.release_xassets
 */

/*
mp_afghan [0x9950bf, 0x3eb6ac4]
mp_derail [0xa23890, 0x4b1158b]
mp_estate [0x919d80, 0x43694e1]
mp_highrise [0xd13ddf, 0x48f7a46]
mp_invasion [0x92a793, 0x49e0a98]
mp_checkpoint karachi [0x63ee68, 0x5543c7c]
mp_quarry [0x9aeddd, 0x4985830]
mp_rundown [0xa24e02, 0x3befe25]
mp_rust [0x2d8369, 0x397df59]
mp_boneyard [0x75afeb, 0x331a592]
mp_nightshift skidrow [0x727a5f, 0x47ff9be]
mp_subbase [0x948f7f, 0x3839d66]
*/
/*
mp_terminal
0112A6C4  00 00 00 00 16 97 9D 00 00 00 00 00 00 00 00 00  ................
0112A6C4  00 00 00 00 8B 8A AA 04 00 00 00 00 00 00 00 00  ......ª.........
mp_underpass
0112A6C4  00 00 00 00 24 5C 99 00 00 00 00 00 00 00 00 00  ....$..........
0112A6C4  00 00 00 00 57 1A 42 04 00 00 00 00 00 00 00 00  ....W.B.........
mp_brecourt wasteland
0112A6C4  00 00 00 00 DA 74 31 00 00 00 00 00 00 00 00 00  ....Út1.........
0112A6C4  00 00 00 00 64 AC 56 03 00 00 00 00 00 00 00 00  ....d¬V.........
mp_complex bailout
0112A6C4  00 00 00 00 C4 22 C9 00 00 00 00 00 00 00 00 00  ....Ä"É.........
0112A6C4  00 00 00 00 BF 3F 3F 04 00 00 00 00 00 00 00 00  ....¿??.........
mp_crash
0112A6C4  00 00 00 00 D5 1E 84 00 00 00 00 00 00 00 00 00  ....Õ...........
0112A6C4  00 00 00 00 0A 0B D1 03 00 00 00 00 00 00 00 00  ......Ñ.........
mp_overgrown
0112A6C4  00 00 00 00 A0 B7 64 00 00 00 00 00 00 00 00 00  .... ·d.........
0112A6C4  00 00 00 00 94 46 9A 03 00 00 00 00 00 00 00 00  .....F..........
mp_compact salvage
0112A6C4  00 00 00 00 E2 C5 C1 00 00 00 00 00 00 00 00 00  ....âÅÁ.........
0112A6C4  00 00 00 00 71 99 6E 04 00 00 00 00 00 00 00 00  ....q.n.........
mp_storm
0112A6C4  00 00 00 00 1C F9 A9 00 00 00 00 00 00 00 00 00  .....ù©.........
0112A6C4  00 00 00 00 93 33 7F 04 00 00 00 00 00 00 00 00  .....3..........
mp_abandon
0112A6C4  00 00 00 00 B7 FE A0 00 00 00 00 00 00 00 00 00  ....·þ .........
0112A6C4  00 00 00 00 E4 81 BB 04 00 00 00 00 00 00 00 00  ....ä.».........
mp_fuel2
0112A6C4  00 00 00 00 6F E9 90 00 00 00 00 00 00 00 00 00  ....oé..........
0112A6C4  00 00 00 00 7D 9E 4A 04 00 00 00 00 00 00 00 00  ....}.J.........
mp_strike
0112A6C4  00 00 00 00 79 11 A7 00 00 00 00 00 00 00 00 00  ....y.§.........
0112A6C4  00 00 00 00 F3 EB 85 04 00 00 00 00 00 00 00 00  ....óë.......... 
*/
