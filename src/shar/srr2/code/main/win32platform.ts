import { Platform } from './platform.js';
import { AllWrappers } from '../render/Loaders/AllWrappers.js';
import { FenceLoader } from '../render/Loaders/FenceLoader.js';

import { tP3DFileHandler } from '../../libs/pure3d/p3d/loadmanager.js';
import { tPlatform } from '../../libs/pure3d/p3d/platform/win32/platform.js';
import { p3d_ } from '../../libs/pure3d/p3d/utility.js';;

export class Win32Platform implements Platform {
  public InitializePlatform() {
    this.InitializePure3D();
  }
  public InitializePure3D() {

    const mpPlatform: tPlatform = tPlatform.Create(mhInstance);

    // InitializeContext();

    const p3d: tP3DFileHandler = new tP3DFileHandler();

    p3d_.context.GetLoadManager().AddHandler(p3d, "p3d");

    const pFL: FenceLoader = AllWrappers.GetAllWrappers().mpLoader(AllWrappers.Enum.msFenceEntity);
    // pFL.SetRegdListener(GetRenderManager(), 0);
    p3d.AddHandler(pFL);
  }
}

