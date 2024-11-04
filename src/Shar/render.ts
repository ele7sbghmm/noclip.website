import { SRR2 } from './srrchunks.js'
import { tEntity } from './rad_util.js'
import { SpatialTree } from './spatial.js'
import { FenceEntityDSG, IntersectDSG } from './dsg.js'

namespace RenderEnums {
    export enum GutsCallEnum {
        IntersectGuts = 0x03000000,
        TreeDSGGuts = 0x06000000,
        FenceGuts = 0x07000000,
        GutsOnlyMask = 0xFF000000,
    }
    export enum LayerEnum {
        GUI = 0x00000000,
        PresentationSlot,
        LevelSlot,
        MissionSlot1,
        MissionSlot2,
        numLayers,
        LayerOnlyMask = 0x000000FF
    };
}

class RenderLayer { }
class WorldRenderLayer extends RenderLayer { }
export class RenderManager {
    public mspInstance: RenderManager
    public mpRenderLayers: RenderLayer[] // [RenderEnums::numLayers]

    public OnChunkLoaded(
        ipEntity: tEntity, iUserData: number, iChunkID: number
    ): void {
        //IntersectDSG pIDSG = NULL;

        switch (iChunkID) {
            case SRR2.ChunkID.TREE_DSG:
                switch (iUserData & RenderEnums.GutsCallEnum.GutsOnlyMask) {
                    case RenderEnums.GutsCallEnum.TreeDSGGuts:
                        this.mpRenderLayers[iUserData & RenderEnums.LayerEnum.LayerOnlyMask].AddGuts(ipEntity as SpatialTree);
                        break;
                }
                break;
            case SRR2.ChunkID.FENCE_DSG:
                switch (iUserData & RenderEnums.GutsCallEnum.GutsOnlyMask) {
                    case RenderEnums.GutsCallEnum.FenceGuts:
                        this.mpRenderLayers[iUserData & RenderEnums.LayerEnum.LayerOnlyMask].AddGuts(ipEntity as FenceEntityDSG)
                        break;
                }
                break;
            //case SRR2.ChunkID.INTERSECT_DSG:
            //    switch (iUserData & RenderEnums.GutsCallEnum.GutsOnlyMask) {
            //        case RenderEnums.GutsCallEnum.IntersectGuts:
            //            this.mpRenderLayers[iUserData & RenderEnums.LayerOnlyMask].AddGuts(ipEntity: IntersectDSG);
            //            break;
            //        default:
            //            //Unexpected GutsEnum
            //            rAssert(false);
            //            break;
            //    }
            //    break;
        }
    }

