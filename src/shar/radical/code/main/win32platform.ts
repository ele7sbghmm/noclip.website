import { Platform } from './platform.js';
import { tP3DFileHandler } from '../../libs/pure3d/p3d/loadmanager.js';
import { AllWrappers } from '../render/Loaders/AllWrappers.js';
import { FenceLoader } from '../render/Loaders/FenceLoader.js';

export class Win32Platform extends Platform {
  public override InitializePure3D() {
    const p3d: tP3DFileHandler = new tP3DFileHandler();

    const pFL: FenceLoader = AllWrappers.GetAllWrappers().mpLoader(AllWrappers.Enum.msFenceEntity);
    // pFL.SetRegdListener(GetRenderManager(), 0);
    p3d.AddHandler(pFL);
  }
}

