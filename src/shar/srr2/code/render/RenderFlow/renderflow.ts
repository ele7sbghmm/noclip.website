import { AllWrappers } from '../Loaders/AllWrappers.js';

export class RenderFlow {
  public static spInstance: RenderFlow;
  public mpLoadWrappers: AllWrappers = AllWrappers.CreateInstance();

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

