import { Platform } from './platform.js';
import { AllWrappers } from '../render/Loaders/AllWrappers.js';
import { FenceLoader } from '../render/Loaders/FenceLoader.js';

import { tP3DFileHandler } from '../../libs/pure3d/p3d/loadmanager.js';
import { tPlatform } from '../../libs/pure3d/p3d/platform/win32/platform.js';
import { tContext } from '../../libs/pure3d/p3d/context.js';
import { p3d_ } from '../../libs/pure3d/p3d/utility.js';;

type HINSTANCE = number;

export class Win32Platform implements Platform {
  public mhInstance: HINSTANCE;
  public mpPlatform: tPlatform;
  public mpContext: tContext;

  public InitializePlatform() {
    this.InitializePure3D();
  }
  public InitializePure3D() {

    const mpPlatform: tPlatform = tPlatform.Create(this.mhInstance);

    this.InitializeContext();

    const p3d: tP3DFileHandler = new tP3DFileHandler();

    p3d_.context.GetLoadManager().AddHandler(p3d, "p3d");

    const pFL: FenceLoader = AllWrappers.GetAllWrappers().mpLoader(AllWrappers.Enum.msFenceEntity);
    // pFL.SetRegdListener(GetRenderManager(), 0);
    p3d.AddHandler(pFL);
  }
  public InitializeContext() {
    if (this.mpContext == null) {
      this.mpContext = this.mpPlatform.CreateContext(); // init);
      this.mpPlatform.SetActiveContext(this.mpContext);
    }
  }

}

