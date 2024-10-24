import { AllWrappers } from '../Loaders/AllWrappers.js';
import { RenderManager } from '../RenderManager/RenderManager.js';

export class RenderFlow {
  public static spInstance: RenderFlow;
  public mpRenderManager: RenderManager;
  public mpLoadWrappers: AllWrappers;

  constructor() {
    this.mpRenderManager = RenderManager.CreateInstance()
    this.mpLoadWrappers = AllWrappers.CreateInstance()
  }

  public static CreateInstance(): RenderFlow {
    if (RenderFlow.spInstance == null) {
      RenderFlow.spInstance = new RenderFlow();
    }
    return RenderFlow.spInstance;
  }
  public static GetInstance(): RenderFlow {
    return RenderFlow.spInstance;
  }
}

