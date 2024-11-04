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

class RenderLayer {
  public AddGuts(
    // ipDrawable?: tDrawable,
    // ipGeometry?: tGeometry,
    ipIntersectDSG?: IntersectDSG,
    // ipStaticEntityDSG?: StaticEntityDSG,
    // ipStaticPhysDSG?: StaticPhysDSG,
    ipFenceEntityDSG?: FenceEntityDSG,
    // ipScroobyApp?: Scrooby__App,
    ipSpatialTree?: SpatialTree,
    // ipAnimCollDSG?: AnimCollisionEntityDSG,
    // ipAnimDSG?: AnimEntityDSG,
    // ipDynaPhysDSG?: DynaPhysDSG,
    // ipTriggerVolume?: TriggerVolume,
    // ipWorldSphere?: WorldSphereDSG,
    // ipRoadSegment?: RoadSegment,
    // ipPathSegment?: PathSegment,
  ) { }
}
enum DynaLoadState {
  msPreLoads,
  msNoLoad,
  msLoad,
  msIgnoreLoad
};
class WorldRenderLayer extends RenderLayer {
  public mpWorldScene: WorldScene

  public override AddGuts(ipIntersectDSG: IntersectDSG): void;
  // public override AddGuts(ipStaticEntityDSG: StaticEntityDSG): void;
  // public override AddGuts(ipStaticPhysDSG: StaticPhysDSG): void;
  public override AddGuts(ipFenceEntityDSG: FenceEntityDSG): void;
  public override AddGuts(ipSpatialTree: SpatialTree): void;
  // public override AddGuts(ipAnimCollDSG: AnimCollisionEntityDSG): void;
  // public override AddGuts(ipAnimDSG: AnimEntityDSG): void;
  // public override AddGuts(ipDynaPhysDSG: DynaPhysDSG): void;
  // public override AddGuts(ipTriggerVolume: TriggerVolume): void;
  // public override AddGuts(ipWorldSphere: WorldSphereDSG): void;
  // public override AddGuts(ipRoadSegment: RoadSegment): void;
  // public override AddGuts(ipPathSegment: PathSegment): void;
  public override AddGuts(
    // ipIntersectDSG?: IntersectDSG,
    // ipStaticEntityDSG?: StaticEntityDSG,
    // ipStaticPhysDSG?: StaticPhysDSG,
    // ipFenceEntityDSG?: FenceEntityDSG,
    // ipSpatialTree?: SpatialTree,
    // ipAnimCollDSG?: AnimCollisionEntityDSG,
    // ipAnimDSG?: AnimEntityDSG,
    // ipDynaPhysDSG?: DynaPhysDSG,
    // ipTriggerVolume?: TriggerVolume,
    // ipWorldSphere?: WorldSphereDSG,
    // ipRoadSegment?: RoadSegment,
    // ipPathSegment?: PathSegment,
    entity: tEntity,
  ) {
    // ipSpatialTree && this.mpWorldScene.SetTree(ipSpatialTree)
    switch (typeof entity) {
      case "SpatialTree": {
        this.mpWorldScene.SetTree(entity)ipSpatialTree);
      }
      case "FenceEntityDSG": {
        this.mpWorldScene.Add(entity) // (ipFenceEntityDSG)
        if (this.mDynaLoadState == DynaLoadState.msLoad)
          this.mLoadLists[this.mCurLoadIndex].mFenceElems.Add(entity) // (ipFenceEntityDSG)
      }
      case "IntersectDSG": {
        this.mpWorldScene.Add(entity) // (ipFenceEntityDSG)
        if (this.mDynaLoadState == DynaLoadState.msLoad)
          this.mLoadLists[this.mCurLoadIndex].mIntersectElems.Add(entity) // (ipFenceEntityDSG)
      }
    }

                           }

export class RenderManager {
  public mspInstance: RenderManager
  public mpRenderLayers: RenderLayer[] // [RenderEnums::numLayers]

  public OnChunkLoaded(ipEntity: tEntity, iUserData: number, iChunkID: number): void {
    const pIDSG: IntersectDSG = null;

    switch (iChunkID) {
      case SRR2.ChunkID.TREE_DSG: {
        switch (iUserData & RenderEnums.GutsCallEnum.GutsOnlyMask) {
          case RenderEnums.GutsCallEnum.TreeDSGGuts: {
            this.mpRenderLayers[iUserData & RenderEnums.LayerEnum.LayerOnlyMask]
              .AddGuts(ipEntity as SpatialTree);
            break;
          }
        }
        break;
      }
      case SRR2.ChunkID.FENCE_DSG: {
        switch (iUserData & RenderEnums.GutsCallEnum.GutsOnlyMask) {
          case RenderEnums.GutsCallEnum.FenceGuts: {
            this.mpRenderLayers[iUserData & RenderEnums.LayerEnum.LayerOnlyMask]
              .AddGuts(ipEntity as FenceEntityDSG)
            break;
          }
        }
        break;
      }
      case SRR2.ChunkID.INTERSECT_DSG: {
        switch (iUserData & RenderEnums.GutsCallEnum.GutsOnlyMask) {
          case RenderEnums.GutsCallEnum.IntersectGuts: {
            this.mpRenderLayers[iUserData & RenderEnums.LayerEnum.LayerOnlyMask]
              .AddGuts(ipEntity: IntersectDSG);
            break;
          }
        }
        break;
      }
    }
  }

