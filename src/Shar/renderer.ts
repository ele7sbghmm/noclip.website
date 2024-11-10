import { assert } from '../util.js'

import { SRR2 } from './srrchunks.js'
import { tEntity } from './rad_util.js'
import { SpatialTreeIter, SpatialTree } from './spatial.js'
import { FenceEntityDSG, IntersectDSG } from './dsg.js'
import { AllWrappers } from './loaders.js'

const NULL = null

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
    }
}
enum DynaLoadState {
    msPreLoads,
    msNoLoad,
    msLoad,
    msIgnoreLoad
}
/*
abstract class RenderLayer {
    // abstract AddGuts_tDrawable(ipDrawable: tDrawable): void
    // abstract AddGuts_tGeometry(ipGeometry: tGeometry): void
    abstract AddGuts_IntersectDSG(ipIntersectDSG: IntersectDSG): void
    // abstract AddGuts_StaticEntityDSG(ipStaticEntityDSG: StaticEntityDSG): void
    // abstract AddGuts_StaticPhysDSG(ipStaticPhysDSG: StaticPhysDSG): void
    abstract AddGuts_FenceEntityDSG(ipFenceEntityDSG: FenceEntityDSG): void
    // abstract AddGuts_Scrooby__App(ipScroobyApp: Scrooby__App): void
    abstract AddGuts_SpatialTree(ipSpatialTree: SpatialTree): void
    // abstract AddGuts_AnimCollisionEntityDSG(ipAnimCollDSG: AnimCollisionEntityDSG): void
    // abstract AddGuts_AnimEntityDSG(ipAnimDSGpublic: AnimEntityDSG): void
    // abstract AddGuts_DynaPhysDSG(ipDynaPhysDSG: DynaPhysDSG): void
    // abstract AddGuts_TriggerVolume(ipTriggerVolume: TriggerVolume): void
    // abstract AddGuts_WorldSphereDSG(ipWorldSphere: WorldSphereDSG): void
    // abstract AddGuts_RoadSegment(ipRoadSegment: RoadSegment): void
    // abstract AddGuts_PathSegment(ipPathSegment: PathSegment): void
}
class WorldRenderLayer extends RenderLayer {
    public mpWorldScene: WorldScene
    public mDynaLoadState: DynaLoadState
    public mLoadLists: []

    public AddGuts_IntersectDSG(ipIntersectDSG: IntersectDSG) {
        this.mpWorldScene.Add_IntersectDSG(ipIntersectDSG)
        // if (this.mDynaLoadState == DynaLoadState.msLoad)
        this.mLoadLists[this.mCurLoadIndex].mIntersectElems.Add(ipIntersectDSG)
    }
    // public AddGuts_StaticEntityDSG(ipStaticEntityDSG: StaticEntityDSG): void
    // public AddGuts_StaticPhysDSG(ipStaticPhysDSG: StaticPhysDSG): void
    public AddGuts_FenceEntityDSG(ipFenceEntityDSG: FenceEntityDSG) {
        this.mpWorldScene.Add_FenceEntityDSG(ipFenceEntityDSG)
        // if (this.mDynaLoadState == DynaLoadState.msLoad)
        this.mLoadLists[this.mCurLoadIndex].mFenceElems.Add(ipFenceEntityDSG)
    }
    public AddGuts_SpatialTree(ipSpatialTree: SpatialTree) {
        this.mpWorldScene.SetTree(ipSpatialTree)
    }
    // public AddGuts_StaticEntityDSG(ipStaticEntityDSG: StaticEntityDSG) { }
    // public AddGuts_StaticPhysDSG( ipStaticPhysDSG: StaticPhysDSG) { }
    // public AddGuts_AnimCollisionEntityDSG(ipAnimCollDSG: AnimCollisionEntityDSG) { }
    // public AddGuts_AnimEntityDSG(ipAnimDSG: AnimEntityDSG) { }
    // public AddGuts_DynaPhysDSG(ipDynaPhysDSG: DynaPhysDSG) { }
    // public AddGuts_TriggerVolume(ipTriggerVolume: TriggerVolume) { }
    // public AddGuts_WorldSphereDSG(ipWorldSphere: WorldSphereDSG) { }
    // public AddGuts_RoadSegment(ipRoadSegment: RoadSegment) { }
    // public AddGuts_PathSegment(ipPathSegment: PathSegment) { }
}
*//*
export class RenderManager {
    public mspInstance: RenderManager
    public mpRenderLayers: WorldRenderLayer[]// [RenderEnums.numLayers]

    public OnChunkLoaded(ipEntity: tEntity, iUserData: number, iChunkID: number): void {
        const pIDSG: IntersectDSG = null

        switch (iChunkID) {
            case SRR2.ChunkID.TREE_DSG: {
                switch (iUserData & RenderEnums.GutsCallEnum.GutsOnlyMask) {
                    case RenderEnums.GutsCallEnum.TreeDSGGuts: {
                        this.mpRenderLayers[iUserData & RenderEnums.LayerEnum.LayerOnlyMask]
                            .AddGuts_SpatialTree(ipEntity as SpatialTree)
                        break
                    }
                }
                break
            }
            case SRR2.ChunkID.FENCE_DSG: {
                switch (iUserData & RenderEnums.GutsCallEnum.GutsOnlyMask) {
                    case RenderEnums.GutsCallEnum.FenceGuts: {
                        this.mpRenderLayers[iUserData & RenderEnums.LayerEnum.LayerOnlyMask]
                            .AddGuts_FenceEntityDSG(ipEntity as FenceEntityDSG)
                        break
                    }
                }
                break
            }
            case SRR2.ChunkID.INTERSECT_DSG: {
                switch (iUserData & RenderEnums.GutsCallEnum.GutsOnlyMask) {
                    case RenderEnums.GutsCallEnum.IntersectGuts: {
                        this.mpRenderLayers[iUserData & RenderEnums.LayerEnum.LayerOnlyMask]
                            .AddGuts_IntersectDSG(ipEntity as IntersectDSG)
                        break
                    }
                }
                break
            }
        }
    }
}
*/
export class WorldScene {
    public mpStaticTree: SpatialTree
    public mStaticTreeWalker: SpatialTreeIter

    public SetTree(ipSpatialTree: SpatialTree) {
        this.mpStaticTree = ipSpatialTree
        this.mStaticTreeWalker.SetToRoot(this.mpStaticTree)
        this.mStaticTreeWalker.AndTree(0x00000000)
        this.GenerateSpatialReps()
    }

    // public Add_tGeometry(pGeometry: tGeometry) {
    //     Place_tGeometry(pGeometry: tGeometry)
    // }
    public Add_IntersectDSG(ipIntersectDSG: IntersectDSG) {
        Place_IntersectDSG(ipIntersectDSG)
    }
    // public Add_StaticPhysDSG(ipStaticPhysDSG: StaticPhysDSG) {
    //     Place_StaticPhysDSG(ipStaticPhysDSG: StaticPhysDSG)
    // }
    // public Add_StaticEntityDSG(ipStaticEntityDSG: StaticEntityDSG) {
    //     Place_StaticEntityDSG(ipStaticEntityDSG: StaticEntityDSG)
    // }
    public Add_FenceEntityDSG(ipFenceEntityDSG: FenceEntityDSG) {
        Place_FenceEntityDSG(ipFenceEntityDSG)
    }
    // public Add_AnimCollisionEntityDSG(ipAnimCollDSG: AnimCollisionEntityDSG) {
    //     Place_AnimCollisionEntityDSG(ipAnimCollDSG)
    // }
    // public Add_AnimEntityDSG(ipAnimDSG: AnimEntityDSG) {
    //     Place_AnimEntityDSG(ipAnimDSG)
    // }
    // public Add_DynaPhysDSG(ipDynaPhysDSG: DynaPhysDSG) {
    //     Place_DynaPhysDSG(ipDynaPhysDSG)
    // }
    // public Add_TriggerVolume(ipTriggerVolume: TriggerVolume) {
    //     Place_TriggerVolume(ipTriggerVolume)
    // }
    // public Add_RoadSegment(ipRoadSegment: RoadSegment) {
    //     Place_RoadSegment(ipRoadSegment)
    // }
    // public Add_PathSegment(ipPathSegment: PathSegment) {
    //     Place_PathSegment(ipPathSegment)
    // }
    Place_FenceEntityDSG(ipFence: FenceEntityDSG) {
        DrawableSP: BoxPts
        BBox: rmt.Box3D

        ipFence.GetBoundingBox(BBox)

        DrawableSP.mBounds.mMin.SetTo(BBox.low)
        DrawableSP.mBounds.mMax.SetTo(BBox.high)
        DrawableSP.mBounds.mMin.Add(this.mEpsilonOffset)
        DrawableSP.mBounds.mMax.Sub(this.mEpsilonOffset)

        pSpatialNode: SpatialNode = this.mStaticTreeWalker.rSeekNode(DrawableSP as ISpatialProxyAA)
        pSpatialNode.mFenceElems.Add(ipFence)
        ipFence.mpSpatialNode = pSpatialNode
    }
    Place_AnimCollisionEntityDSG(ipAnimColl: AnimCollisionEntityDSG) {
        const DrawableSP: BoxPts
        const BBox: rmt.Box3D

        ipAnimColl.GetBoundingBox(BBox)

        DrawableSP.mBounds.mMin.SetTo(BBox.low)
        DrawableSP.mBounds.mMax.SetTo(BBox.high)
        DrawableSP.mBounds.mMin.Add(this.mEpsilonOffset)
        DrawableSP.mBounds.mMax.Sub(this.mEpsilonOffset)


    SpatialNode  pSpatialNode = this.mStaticTreeWalker.rSeekNode(DrawableSP as ISpatialProxyAA)

        if (!pSpatialNode.mAnimCollElems.Add(ipAnimColl)) {
            pSpatialNode = mStaticTreeWalker.rIthNode(0)
            if (!pSpatialNode.mAnimCollElems.Add(ipAnimColl)) {
                assert(false)
            } else {
                ipAnimColl.mpSpatialNode = pSpatialNode
            }
        } else {
            ipAnimColl.mpSpatialNode = pSpatialNode
        }
    }
    Place_AnimEntityDSG(ipAnim: AnimEntityDSG) {
        const DrawableSP: BoxPts
        const BBox: rmt.Box3D

        ipAnim.GetBoundingBox(BBox)

        DrawableSP.mBounds.mMin.SetTo(BBox.low)
        DrawableSP.mBounds.mMax.SetTo(BBox.high)
        DrawableSP.mBounds.mMin.Add(this.mEpsilonOffset)
        DrawableSP.mBounds.mMax.Sub(this.mEpsilonOffset)

        const pSpatialNode: SpatialNode = this.mStaticTreeWalker.rSeekNode(DrawableSP as ISpatialProxyAA)

        if (!pSpatialNode.mAnimElems.Add(ipAnim)) {
            pSpatialNode = this.mStaticTreeWalker.rIthNode(0)
            if (pSpatialNode.mAnimElems.Add(ipAnim)) {
                ipAnim.mpSpatialNode = pSpatialNode
            }
        }
        else {
            ipAnim.mpSpatialNode = pSpatialNode
        }
    }
    Place_TriggerVolume(ipTriggerVolume: TriggerVolume) {
        const DrawableSP: BoxPts
        const BBox: rmt.Box3D

        ipTriggerVolume.GetBoundingBox(BBox)

        DrawableSP.mBounds.mMin.SetTo(BBox.low)
        DrawableSP.mBounds.mMax.SetTo(BBox.high)
        DrawableSP.mBounds.mMin.Add(this.mEpsilonOffset)
        DrawableSP.mBounds.mMax.Sub(this.mEpsilonOffset)

        const pSpatialNode: SpatialNode = this.mStaticTreeWalker.rSeekNode(DrawableSP: ISpatialProxyAA)
        pSpatialNode.mTrigVolElems.Add(ipTriggerVolume)
        ipTriggerVolume.mpSpatialNode = pSpatialNode
    }
    Place_RoadSegment(ipRoadSegment: RoadSegment) {
        const DrawableSP: BoxPts
        const BBox: rmt.Box3D

        ipRoadSegment.GetBoundingBox(BBox)

        DrawableSP.mBounds.mMin.SetTo(BBox.low)
        DrawableSP.mBounds.mMax.SetTo(BBox.high)
        DrawableSP.mBounds.mMin.Add(this.mEpsilonOffset)
        DrawableSP.mBounds.mMax.Sub(this.mEpsilonOffset)

        const pSpatialNode: SpatialNode = this.mStaticTreeWalker.rSeekNode(DrawableSP as ISpatialProxyAA)
        pSpatialNode.mRoadSegmentElems.Add(ipRoadSegment)
        ipRoadSegment.mpSpatialNode = pSpatialNode
    }
    Place_PathSegment(ipPathSegment: PathSegment) {
        const DrawableSP: BoxPts = new BoxPts()
        const BBox: rmt.Box3D = new Box3D()

        ipPathSegment.GetBoundingBox(BBox)

        DrawableSP.mBounds.mMin.SetTo(BBox.low)
        DrawableSP.mBounds.mMax.SetTo(BBox.high)
        DrawableSP.mBounds.mMin.Add(this.mEpsilonOffset)
        DrawableSP.mBounds.mMax.Sub(this.mEpsilonOffset)

        const pSpatialNode: SpatialNode = this.mStaticTreeWalker.rSeekNode(DrawableSP as ISpatialProxyAA)
        pSpatialNode.mPathSegmentElems.Add(ipPathSegment)
        ipPathSegment.mpSpatialNode = pSpatialNode
    }

    public GenerateSpatialReps() {
        this.mStaticTreeWalker.rBBox().mBounds.mMin.y = -200.0
        this.mStaticTreeWalker.rBBox().mBounds.mMax.y = 100.0
        // this.mStaticTreeWalker.BuildBBoxes(this.mStaticTreeWalker.rBBox())

        this.PopulateStaticTree()
    }
    public PopulateStaticTree() {
        const DrawableSP: BoxPts
        const Box3D: BoxPts// rmt.Box3D

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
}
*/
export class RenderFlow {
    static spInstance: RenderFlow | null

    // mpRenderManager: RenderManager
    // mpDSGFactory: DSGFactory
    mpLoadWrappers: AllWrappers
    // mpIntersectManager: IntersectManager

    constructor() {
        // this.mpRenderManager = RenderManager.CreateInstance()
        // this.mpDSGFactory = DSGFactory.CreateInstance()
        this.mpLoadWrappers = AllWrappers.CreateInstance()
        // this.mpIntersectManager = IntersectManager.CreateInstance()
    }
    static CreateInstance(): RenderFlow {
        assert(RenderFlow.spInstance == NULL)
        RenderFlow.spInstance = new RenderFlow()
        // BillboardQuadManager.CreateInstance()
        return RenderFlow.spInstance
    }
    GetInstance(): RenderFlow {
        assert(RenderFlow.spInstance != NULL)
        return RenderFlow.spInstance
    }
}
