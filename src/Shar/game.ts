import { RenderFlow } from "./renderer"

export abstract class Platform {
    abstract InitializePlatform(): void
    abstract InitializePure3D(): void
}
export class Game {
    static spInstance: Game
    mpPlatform: Platform
    mpGameFlow: GameFlow
    mpRenderFlow: RenderFlow

    constructor(platform: Platform) {
        this.mpPlatform = platform
    }
    static CreateInstance(platform: Platform) {
        Game.spInstance = new Game(platform)
        return Game.spInstance
    }
    static GetInstance() {
        return Game.spInstance
    }
    Initialize() {
        this.mpPlatform.InitializePlatform()
        this.mpGameFlow = GameFlow.CreateInstance()
        this.mpRenderFlow = RenderFlow.GetInstance()
        this.mpRenderFlow.DoAllRegistration()
    }
}
class GameFlow {
    static _instance: GameFlow
    static CreateInstance() {
        GameFlow._instance = new GameFlow
        return GameFlow._instance
    }
    GetInstance() { 
        return GameFlow._instance
    }
}
