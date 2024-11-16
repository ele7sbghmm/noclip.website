import { GetRenderManager, RenderEnums } from "./renderer"

export function GetGameplayManager() {
    return GameplayManager.GetInstance()
}
export function SetGameplayManager(pInstance: GameplayManager) {
    GameplayManager.SetInstance(pInstance)
}
class LevelDataEnum {
    level: RenderEnums.LevelEnum
    constructor() {
        this.level = RenderEnums.LevelEnum.numLevels - 1
    }
}
class GameplayManager {
    static spInstance: GameplayManager
    mLevelData: LevelDataEnum = new LevelDataEnum

    static CreateInstance(): GameplayManager {
        GameplayManager.spInstance = new GameplayManager
        return GameplayManager.spInstance
    }
    static GetInstance(): GameplayManager {
        return GameplayManager.spInstance
    }
    static SetInstance(pInstance: GameplayManager): void {
        GameplayManager.spInstance = pInstance
    }
    /*abstract*/ LoadLevelData(): void { }
    /*abstract*/ InitLevelData(): void { }
    Initialize(): void { }
    LevelLoaded(): void {
        this.InitLevelData()
        // SetCurrentMission(this.mLevelData.mission * 2 + this.mSkipSunday)
    }

    SetLevelIndex(level: RenderEnums.LevelEnum): void {
        this.mLevelData.level = level
        GetRenderManager().SetLoadData(RenderEnums.LayerEnum.LevelSlot, level, RenderEnums.MissionEnum.M1)
    }
    GetCurrentLevelIndex(): RenderEnums.LevelEnum {
        if (this.mLevelData.level >= RenderEnums.LevelEnum.numLevels) {
            // This is a bonus game.
            return this.mLevelData.level - RenderEnums.LevelEnum.numLevels
        }
        return this.mLevelData.level
    }
    SetCurrentLevelIndex(level: RenderEnums.LevelEnum): void {
        this.mLevelData.level = level;
    }
}
