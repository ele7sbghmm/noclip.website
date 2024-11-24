import { GetRenderManager } from "./renderer";

class LoadingContext {
    OnStart() {
        GetRenderManager().LoadAllNeededData()
        // GetPresentationManager().Initialize()
        GetGameplayManager().Initialize()
        GetGameplayManager().LoadLevelData()
    }
}