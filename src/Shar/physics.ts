import { rmt } from "./math"
type int = number
type bool = boolean

export function GetWorldPhysicsManager(): WorldPhysicsManager {
    return WorldPhysicsManager.GetInstance()
}
class FencePieces {
    start: rmt.Vector
    end: rmt.Vector
}


export class WorldPhysicsManager {
    static spInstance: WorldPhysicsManager
    mInInterior: bool

    mNumCollisionAreas: int
    mMaxFencePerArea: int
    mFences: FencePieces[][]
    mFencesInEachArea: int[]

    static CreateInstance(): WorldPhysicsManager {
        WorldPhysicsManager.spInstance = new WorldPhysicsManager
        return WorldPhysicsManager.spInstance
    }
    static GetInstance(): WorldPhysicsManager {
        return WorldPhysicsManager.spInstance
    }
    Init(): void {
        this.InitCollsitionManager()
    }
    // TODO SubmitFencePiecesPseudoCallback(): void { }
    // TODO FenceSanityCheck(): bool { }
    // TODO UpdateFencePieces(): bool { }
    InitCollsitionManager(): void {
        //-------
        // fences
        //-------
        /* TODO
        this.mMaxFencePerArea = 8;
        this.mFences = Array.from({ length: this.mNumCollisionAreas }, () => [new FencePieces])

        this.mFencesInEachArea = Array.from({ length: this.mNumCollisionAreas }, () => 0)

        for (let i = 0; i < this.mNumCollisionAreas; i++) {
            this.mFences[i] = Array.from({ length: this.mMaxFencePerArea }, () => new FencePieces)

            for (let j = 0; j < this.mMaxFencePerArea; j++) {
                let center = new rmt.Vector(0.0, 0.0, 0.0)
                let o0 = new rmt.Vector(1.0, 0.0, 0.0)
                let o1 = new rmt.Vector(0.0, 1.0, 0.0)
                let o2 = new rmt.Vector(0.0, 0.0, 1.0)
                let tempOBBox: sim.OBBoxVolume = new OBBoxVolume(center, o0, o1, o2, 1.0, 1.0, 1.0)

                this.mFences[i][j].mFenceSimState = SimState.CreateManualSimState(tempOBBox) as sim.ManualSimState

                this.mFences[i][j].mFenceSimState.GetCollisionObject().SetManualUpdate(true)
                this.mFences[i][j].mFenceSimState.GetCollisionObject().SetAutoPair(false)

                this.mFences[i][j].mFenceSimState.SetPhysicsProperties(this.mFencePhysicsProperties)

                // give this thing a reasonable name for debug purposes
                const buffy = `fence_a${i}_n${j}`

                this.mFences[i][j].mFenceSimState.GetCollisionObject().SetName(buffy)

                this.mFences[i][j].mFenceSimState.mAIRefIndex = PhysicsAIRef.redBrickPhizFence
                this.mFences[i][j].mFenceSimState.mAIRefPointer = 0
                // only set if object is derived from CollisionEntityDSG

                this.mFences[i][j].mInCollision = false
                this.mFences[i][j].mClean = false
            }

            this.mFencesInEachArea[i] = 0
        }
        */
    }
}
