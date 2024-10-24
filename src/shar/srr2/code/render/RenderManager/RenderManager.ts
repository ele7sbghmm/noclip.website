import { assert } from '../../../../../util.js';

import { int } from '../../../../type_aliases.js';
import { RenderLayer } from './RenderLayer.js';
import { WorldScene } from '../Culling/WorldScene.js';

const NULL = null;

export class RenderManager {
  public static mspInstance: RenderManager;
  public mpRenderLayers: RenderLayer[]; // [RenderEnums::numLayers]
  public mCurWorldLayer: int;

  public static CreateInstance() {
    // rAssert(mspInstance == NULL);
    assert(RenderManager.mspInstance == NULL);

    RenderManager.mspInstance = new RenderManager();
    return RenderManager.mspInstance;
  }
  public static GetInstance() {
    return RenderManager.mspInstance;
  }
  public pWorldScene() {
    return this.mpRenderLayers[this.mCurWorldLayer].pWorldScene();
  }
}
export function GetRenderManager() {
  return RenderManager.GetInstance();
}

export class WorldRenderLayer extends RenderLayer {
  public mpWorldSCene: WorldScene;

  public pWorldScene() { return this.mpWorldScene; }
}

