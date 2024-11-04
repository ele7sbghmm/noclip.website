import { SRR2 } from './srrchunks.js'
import { tEntity } from './rad_util.js'
import { SpatialTreeIter, SpatialTree } from './spatial.js'
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
enum DynaLoadState {
    msPreLoads,
    msNoLoad,
    msLoad,
    msIgnoreLoad
};

class RenderLayer {
    //public AddGuts_tDrawable(ipDrawable: tDrawable) { }
    //public AddGuts_tGeometry(ipGeometry: tGeometry) { }
    public AddGuts_IntersectDSG(ipIntersectDSG: IntersectDSG) { }
    //public AddGuts_StaticEntityDSG(ipStaticEntityDSG: StaticEntityDSG) { }
    //public AddGuts_StaticPhysDSG(ipStaticPhysDSG: StaticPhysDSG) { }
    public AddGuts_FenceEntityDSG(ipFenceEntityDSG: FenceEntityDSG) { }
    //public AddGuts_Scrooby__App(ipScroobyApp: Scrooby__App) { }
    public AddGuts_SpatialTree(ipSpatialTree: SpatialTree) { }
    //public AddGuts_AnimCollisionEntityDSG(ipAnimCollDSG: AnimCollisionEntityDSG) { }
    //public AddGuts_AnimEntityDSG(ipAnimDSGpublic: AnimEntityDSG) { }
    //public AddGuts_DynaPhysDSG(ipDynaPhysDSG: DynaPhysDSG) { }
    //public AddGuts_TriggerVolume(ipTriggerVolume: TriggerVolume) { }
    //public AddGuts_WorldSphereDSG(ipWorldSphere: WorldSphereDSG) { }
    //public AddGuts_RoadSegment(ipRoadSegment: RoadSegment) { }
    //public AddGuts_PathSegment(ipPathSegment: PathSegment) { }
}
class WorldRenderLayer extends RenderLayer {
    public mpWorldScene: WorldScene
    public mDynaLoadState: DynaLoadState

    public override AddGuts_IntersectDSG(ipIntersectDSG: IntersectDSG) {
        this.mpWorldScene.Add_IntersectDSG(ipIntersectDSG)
        if (this.mDynaLoadState == DynaLoadState.msLoad)
            this.mLoadLists[this.mCurLoadIndex].mIntersectElems.Add(ipIntersectDSG)
    }
    // public override AddGuts_StaticEntityDSG(ipStaticEntityDSG: StaticEntityDSG): void;
    // public override AddGuts_StaticPhysDSG(ipStaticPhysDSG: StaticPhysDSG): void;
    public override AddGuts_FenceEntityDSG(ipFenceEntityDSG: FenceEntityDSG) {
        this.mpWorldScene.Add_FenceEntityDSG(ipFenceEntityDSG)
        if (this.mDynaLoadState == DynaLoadState.msLoad)
            this.mLoadLists[this.mCurLoadIndex].mFenceElems.Add(ipFenceEntityDSG)
    }
    public override AddGuts_SpatialTree(ipSpatialTree: SpatialTree) {
        this.mpWorldScene.SetTree(ipSpatialTree);
    }
    // public override AddGuts_StaticEntityDSG(ipStaticEntityDSG: StaticEntityDSG) { }
    // public override AddGuts_StaticPhysDSG( ipStaticPhysDSG: StaticPhysDSG) { }
    // public override AddGuts_AnimCollisionEntityDSG(ipAnimCollDSG: AnimCollisionEntityDSG) { }
    // public override AddGuts_AnimEntityDSG(ipAnimDSG: AnimEntityDSG) { }
    // public override AddGuts_DynaPhysDSG(ipDynaPhysDSG: DynaPhysDSG) { }
    // public override AddGuts_TriggerVolume(ipTriggerVolume: TriggerVolume) { }
    // public override AddGuts_WorldSphereDSG(ipWorldSphere: WorldSphereDSG) { }
    // public override AddGuts_RoadSegment(ipRoadSegment: RoadSegment) { }
    // public override AddGuts_PathSegment(ipPathSegment: PathSegment) { }
}

export class RenderManager {
    public mspInstance: RenderManager
    public mpRenderLayers: WorldRenderLayer[] // [RenderEnums::numLayers]

    public OnChunkLoaded(ipEntity: tEntity, iUserData: number, iChunkID: number): void {
        const pIDSG: IntersectDSG = null;

        switch (iChunkID) {
            case SRR2.ChunkID.TREE_DSG: {
                switch (iUserData & RenderEnums.GutsCallEnum.GutsOnlyMask) {
                    case RenderEnums.GutsCallEnum.TreeDSGGuts: {
                        this.mpRenderLayers[iUserData & RenderEnums.LayerEnum.LayerOnlyMask]
                            .AddGuts_SpatialTree(ipEntity as SpatialTree);
                        break;
                    }
                }
                break;
            }
            case SRR2.ChunkID.FENCE_DSG: {
                switch (iUserData & RenderEnums.GutsCallEnum.GutsOnlyMask) {
                    case RenderEnums.GutsCallEnum.FenceGuts: {
                        this.mpRenderLayers[iUserData & RenderEnums.LayerEnum.LayerOnlyMask]
                            .AddGuts_FenceEntityDSG(ipEntity as FenceEntityDSG)
                        break;
                    }
                }
                break;
            }
            case SRR2.ChunkID.INTERSECT_DSG: {
                switch (iUserData & RenderEnums.GutsCallEnum.GutsOnlyMask) {
                    case RenderEnums.GutsCallEnum.IntersectGuts: {
                        this.mpRenderLayers[iUserData & RenderEnums.LayerEnum.LayerOnlyMask]
                            .AddGuts_IntersectDSG(ipEntity: IntersectDSG);
                        break;
                    }
                }
                break;
            }
        }
    }
}


export class WorldScene {
    public mpStaticTree: SpatialTree
    public mStaticTreeWalker: SpatialTreeIter

    public SetTree(ipSpatialTree: SpatialTree) {
        //assert( IsPreTreeGen() );
        this.mpStaticTree = ipSpatialTree;
        //this.mpStaticTree.AddRef();
        this.mStaticTreeWalker.SetToRoot(this.mpStaticTree);
        this.mStaticTreeWalker.AndTree(0x00000000);
        this.GenerateSpatialReps();
    }

    public Add_tGeometry(pGeometry: tGeometry) { }
    public Add_IntersectDSG(ipIntersectDSG: IntersectDSG) { }
    public Add_StaticPhysDSG(ipStaticPhysDSG: StaticPhysDSG) { }
    public Add_StaticEntityDSG(ipStaticEntityDSG: StaticEntityDSG) { }
    public Add_FenceEntityDSG(ipFenceEntityDSG: FenceEntityDSG) { }
    public Add_AnimCollisionEntityDSG(ipAnimCollDSG: AnimCollisionEntityDSG) { }
    public Add_AnimEntityDSG(ipAnimDSG: AnimEntityDSG) { }
    public Add_DynaPhysDSG(ipDynaPhysDSG: DynaPhysDSG) { }
    public Add_TriggerVolume(ipTriggerVolume: TriggerVolume) { }
    public Add_RoadSegment(ipRoadSegment: RoadSegment) { }
    public Add_PathSegment(ipPathSegment: PathSegment) { }

    public GenerateSpatialReps() {
        //if (IsPreTreeGen())
        this.mStaticTreeWalker.rBBox().mBounds.mMin.y = -200.0
        this.mStaticTreeWalker.rBBox().mBounds.mMax.y = 100.0
        this.mStaticTreeWalker.BuildBBoxes(this.mStaticTreeWalker.rBBox())

        this.PopulateStaticTree()
    }
    public PopulateStaticTree() {
        const DrawableSP: BoxPts
        const Box3D: BoxPts

        const max: number = this.mStaticTreeWalker.NumNodes()
        for (let i = 0; i < max; i++) {
            this.mStaticTreeWalker.rIthNode(i).mSEntityElems.Allocate()
            this.mStaticTreeWalker.rIthNode(i).mSPhysElems.Allocate()
            this.mStaticTreeWalker.rIthNode(i).mIntersectElems.Allocate()
            this.mStaticTreeWalker.rIthNode(i).mDPhysElems.Allocate()
            this.mStaticTreeWalker.rIthNode(i).mFenceElems.Allocate()
            this.mStaticTreeWalker.rIthNode(i).mAnimCollElems.Allocate()
            this.mStaticTreeWalker.rIthNode(i).mAnimElems.Allocate()
            this.mStaticTreeWalker.rIthNode(i).mTrigVolElems.Allocate()
            this.mStaticTreeWalker.rIthNode(i).mRoadSegmentElems.Allocate()
            this.mStaticTreeWalker.rIthNode(i).mPathSegmentElems.Allocate()
        }
    }

    public Place_IntersectDSG(ipIntersectDSG: IntersectDSG) { }
    // public Place_StaticEntityDSG(ipStaticEntity: StaticEntityDSG) { }
    // public Place_StaticPhysDSG(ipStaticPhys: StaticPhysDSG) { }
    // public DynaPhysDSG(ipDynaPhys: DynaPhysDSG) { }
    public Place_FenceEntityDSG(ipFence: FenceEntityDSG) { }
    // public Place_AnimCollisionEntityDSG(ipAnimColl: AnimCollisionEntityDSG) { }
    // public Place_AnimEntityDSG(ipAnim: AnimEntityDSG) { }
    // public Place_TriggerVolume(ipTriggerVolume: TriggerVolume) { }
    // public Place_RoadSegment(ipRoadSegment: RoadSegment) { }
    // public Place_PathSegment(ipPathSegment: PathSegment) { }
}



