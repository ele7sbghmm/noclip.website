import { assert } from '../util.js'

import { rmt } from './math.js'
import { SRR2 } from './srrchunks.js'
import { tEntity, SwapArray, NodeSwapArray, tUID, BoxPts, ISpatialProxyAA } from './rad_util.js'
import { SpatialTreeIter, SpatialTree, SpatialNode } from './spatial.js'
import { DynaLoadListDSG, FenceEntityDSG, IntersectDSG, tDrawable, WorldSphereDSG } from './dsg.js'
import { AllWrappers } from './loaders.js'

const NULL = null
type int = number
type bool = boolean

enum DynaLoadState {
    msPreLoads,
    msNoLoad,
    msLoad,
    msIgnoreLoad
}

abstract class RenderLayer {   //Static Data
    // enum {
        msMaxGuts = 10
    // };
    
    mpGuts: SwapArray<tDrawable>
 
    // abstract AddGuts__tDrawable(ipDrawable: tDrawable): void
    // abstract AddGuts__tGeometry(ipGeometry: tGeometry): void
    abstract AddGuts__IntersectDSG(ipIntersectDSG: IntersectDSG): void
    // abstract AddGuts__StaticEntityDSG(ipStaticEntityDSG: StaticEntityDSG): void
    // abstract AddGuts__StaticPhysDSG(ipStaticPhysDSG: StaticPhysDSG): void
    abstract AddGuts__FenceEntityDSG(ipFenceEntityDSG: FenceEntityDSG): void
    // abstract AddGuts__Scrooby__App(ipScroobyApp: Scrooby__App): void
    abstract AddGuts__SpatialTree(ipSpatialTree: SpatialTree): void
    // abstract AddGuts__AnimCollisionEntityDSG(ipAnimCollDSG: AnimCollisionEntityDSG): void
    // abstract AddGuts__AnimEntityDSG(ipAnimDSGpublic: AnimEntityDSG): void
    // abstract AddGuts__DynaPhysDSG(ipDynaPhysDSG: DynaPhysDSG): void
    // abstract AddGuts__TriggerVolume(ipTriggerVolume: TriggerVolume): void
    // abstract AddGuts__WorldSphereDSG(ipWorldSphere: WorldSphereDSG): void
    // abstract AddGuts__RoadSegment(ipRoadSegment: RoadSegment): void
    // abstract AddGuts__PathSegment(ipPathSegment: PathSegment): void
    SetUpGuts() { this.mpGuts.Allocate(() => new tDrawable, this.msMaxGuts) }
}
class WorldRenderLayer extends RenderLayer {
    mpWorldScene: WorldScene

    mWorldSpheres: SwapArray<WorldSphereDSG>
    mStaticLoadLists: SwapArray<DynaLoadListDSG>
    mLoadLists: SwapArray<DynaLoadListDSG>
    mnLoadListRefs: int
    mCurLoadIndex: int

    mDynaLoadState: DynaLoadState
    mCurLoadUID: tUID

    mMirror: bool
    mMirrorMatrix: rmt.Matrix
    mWorldShperes: any

    // enum DynaLoadState {
    msPreLoads = 0
    msNoLoad = 1
    msLoad = 2
    msIgnoreLoad = 3
    // }

    ActivateWS(iUID: tUID) {
        for (let i = this.mWorldSpheres.mUseSize; i > -1; i--) {
            if (this.mWorldShperes[i].GetUID() == iUID) {
                this.mWorldShperes[i].Activate()
            }
        }
    }
    pWorldScene(): WorldScene { return this.mpWorldScene }
    AddGuts__IntersectDSG(ipIntersectDSG: IntersectDSG) {
        this.mpWorldScene.Add__IntersectDSG(ipIntersectDSG)
        // if (this.mDynaLoadState == DynaLoadState.msLoad)
        this.mLoadLists.mpData![this.mCurLoadIndex].mIntersectElems.Add(ipIntersectDSG)
    }
    // AddGuts__StaticEntityDSG(ipStaticEntityDSG: StaticEntityDSG): void
    // AddGuts__StaticPhysDSG(ipStaticPhysDSG: StaticPhysDSG): void
    AddGuts__FenceEntityDSG(ipFenceEntityDSG: FenceEntityDSG) {
        this.mpWorldScene.Add__FenceEntityDSG(ipFenceEntityDSG)
        // if (this.mDynaLoadState == DynaLoadState.msLoad)
        this.mLoadLists.mpData![this.mCurLoadIndex].mFenceElems.Add(ipFenceEntityDSG)
    }
    AddGuts__SpatialTree(ipSpatialTree: SpatialTree) {
        this.mpWorldScene.SetTree(ipSpatialTree)
    }
    // AddGuts__StaticEntityDSG(ipStaticEntityDSG: StaticEntityDSG) { }
    // AddGuts__StaticPhysDSG( ipStaticPhysDSG: StaticPhysDSG) { }
    // AddGuts__AnimCollisionEntityDSG(ipAnimCollDSG: AnimCollisionEntityDSG) { }
    // AddGuts__AnimEntityDSG(ipAnimDSG: AnimEntityDSG) { }
    // AddGuts__DynaPhysDSG(ipDynaPhysDSG: DynaPhysDSG) { }
    // AddGuts__TriggerVolume(ipTriggerVolume: TriggerVolume) { }
    AddGuts__WorldSphereDSG(ipWorldSphereDSG: WorldSphereDSG) {
        this.mWorldSpheres.Add(ipWorldSphereDSG)
        // if(mDynaLoadState == msLoad) {
        //    mLoadLists[mCurLoadIndex]->mWorldSphereElems.Add(ipWorldSphereDSG)
        // }
    }
    // AddGuts__RoadSegment(ipRoadSegment: RoadSegment) { }
    // AddGuts__PathSegment(ipPathSegment: PathSegment) { }
    override SetUpGuts() {
        super.SetUpGuts()

        this.mpWorldScene = new WorldScene
        // this.mpWorldScene.Init(msMaxGuts)

        this.mStaticLoadLists.Allocate(() => new DynaLoadListDSG, 7)
        this.mLoadLists.Allocate(() => new DynaLoadListDSG, 7)

        this.mLoadLists.AddUse(7)
        this.mStaticLoadLists.AddUse(7)

        this.mWorldSpheres.Allocate(() => new WorldSphereDSG, 10)

        this.mDynaLoadState = this.msPreLoads
        this.mnLoadListRefs = 2000
        this.mCurLoadIndex = -1

        for (let i = 0; i < 7; i++) {
            this.mStaticLoadLists.mpData![i].AllocateAll(this.mnLoadListRefs)
            this.mLoadLists.mpData![i] = this.mStaticLoadLists.mpData![i]
        }

        this.mLoadLists.ClearUse()

    }
    DoPreStaticLoad() {
        // if (!IsGutsSetup())
        this.SetUpGuts()
        // mExportedState = msFrozen
    }
}
export function GetRenderManager() { return RenderManager.GetInstance() }
export class RenderManager {
    SetLoadData(LevelSlot: any, level: any, M1: any) {
        throw new Error("Method not implemented.")
    }
    LoadAllNeededData() {
        throw new Error("Method not implemented.")
    }
    static mspInstance: RenderManager
    mpRenderLayers: WorldRenderLayer[] = [new WorldRenderLayer, new WorldRenderLayer, new WorldRenderLayer, new WorldRenderLayer, new WorldRenderLayer]//[RenderEnums.numLayers]
    mCurWorldLayer: int

    constructor() { this.InitLayers() }
    static CreateInstance() {
        RenderManager.mspInstance = new RenderManager()
        return RenderManager.mspInstance
    }
    static GetInstance(): RenderManager {
        return RenderManager.mspInstance
    }
    static GetRenderManager() {
        return RenderManager.GetInstance()
    }
    pWorldScene(): WorldScene {
        return (this.mpRenderLayers[this.mCurWorldLayer] as WorldRenderLayer).pWorldScene()
    }
    OnChunkLoaded(ipEntity: tEntity, iUserData: number, iChunkID: number): void {
        // const pIDSG: IntersectDSG | null = null

        switch (iChunkID) {
            case SRR2.ChunkID.TREE_DSG: {
                switch (iUserData & RenderEnums.GutsCallEnum.GutsOnlyMask) {
                    case RenderEnums.GutsCallEnum.TreeDSGGuts: {
                        this.mpRenderLayers[iUserData & RenderEnums.LayerEnum.LayerOnlyMask]
                            .AddGuts__SpatialTree(ipEntity as SpatialTree)
                        break
                    }
                }
                break
            }
            case SRR2.ChunkID.FENCE_DSG: {
                switch (iUserData & RenderEnums.GutsCallEnum.GutsOnlyMask) {
                    case RenderEnums.GutsCallEnum.FenceGuts: {
                        this.mpRenderLayers[iUserData & RenderEnums.LayerEnum.LayerOnlyMask]
                            .AddGuts__FenceEntityDSG(ipEntity as FenceEntityDSG)
                        break
                    }
                }
                break
            }
            case SRR2.ChunkID.INTERSECT_DSG: {
                switch (iUserData & RenderEnums.GutsCallEnum.GutsOnlyMask) {
                    case RenderEnums.GutsCallEnum.IntersectGuts: {
                        this.mpRenderLayers[iUserData & RenderEnums.LayerEnum.LayerOnlyMask]
                            .AddGuts__IntersectDSG(ipEntity as IntersectDSG)
                        break
                    }
                }
                break
            }
        }
    }
    RedirectChunks(ChunkDestinationMask: int) {
        // AllWrappers.GetInstance().mLoader(AllWrappers._enum.msStaticEntity)!.ModRegdListener(this, ChunkDestinationMask | RenderEnums.GutsCallEnum.StaticEntityGuts)
        // AllWrappers.GetInstance().mLoader(AllWrappers._enum.msStaticPhys)!.ModRegdListener(this, ChunkDestinationMask | RenderEnums.GutsCallEnum.StaticPhysGuts)
        AllWrappers.GetInstance().mLoader(AllWrappers._enum.msTreeDSG)!.ModRegdListener(this, ChunkDestinationMask | RenderEnums.GutsCallEnum.TreeDSGGuts)
        AllWrappers.GetInstance().mLoader(AllWrappers._enum.msFenceEntity)!.ModRegdListener(this, ChunkDestinationMask | RenderEnums.GutsCallEnum.FenceGuts)
        // AllWrappers.GetInstance().mLoader(AllWrappers._enum.msGeometry)!.ModRegdListener(this, ChunkDestinationMask | RenderEnums.GutsCallEnum.IgnoreGuts)
        AllWrappers.GetInstance().mLoader(AllWrappers._enum.msIntersectDSG)!.ModRegdListener(this, ChunkDestinationMask | RenderEnums.GutsCallEnum.IntersectGuts)
        // AllWrappers.GetInstance().mLoader(AllWrappers._enum.msAnimCollEntity)!.ModRegdListener(this, ChunkDestinationMask | RenderEnums.GutsCallEnum.AnimCollGuts)
        // AllWrappers.GetInstance().mLoader(AllWrappers._enum.msAnimEntity).!ModRegdListener(this, ChunkDestinationMask | RenderEnums.GutsCallEnum.AnimGuts)
        // AllWrappers.GetInstance().mLoader(AllWrappers._enum.msDynaPhys)!.ModRegdListener(this, ChunkDestinationMask | RenderEnums.GutsCallEnum.DynaPhysGuts)
        // AllWrappers.GetInstance().mLoader(AllWrappers._enum.msInstStatPhys)!.ModRegdListener(this, ChunkDestinationMask | RenderEnums.GutsCallEnum.StaticPhysGuts)
        // AllWrappers.GetInstance().mLoader(AllWrappers._enum.msInstStatEntity)!.ModRegdListener(this, ChunkDestinationMask | RenderEnums.GutsCallEnum.StaticEntityGuts)
        // AllWrappers.GetInstance().mLoader(AllWrappers._enum.msLocator)!.ModRegdListener(this, ChunkDestinationMask | RenderEnums.GutsCallEnum.LocatorGuts)
        AllWrappers.GetInstance().mLoader(AllWrappers._enum.msWorldSphere)!.ModRegdListener(this, ChunkDestinationMask | RenderEnums.GutsCallEnum.WorldSphereGuts)
        // AllWrappers.GetInstance().mLoader(AllWrappers._enum.msRoadSegment)!.ModRegdListener(this, ChunkDestinationMask | RenderEnums.GutsCallEnum.RoadSegmentGuts)
        // AllWrappers.GetInstance().mLoader(AllWrappers._enum.msPathSegment)!.ModRegdListener(this, ChunkDestinationMask | RenderEnums.GutsCallEnum.PathSegmentGuts)
        // AllWrappers.GetInstance().mLoader(AllWrappers._enum.msBillboard)!.ModRegdListener(this, ChunkDestinationMask | RenderEnums.GutsCallEnum.StaticEntityGuts)
        // AllWrappers.GetInstance().mLoader(AllWrappers._enum.msLensFlare)!.ModRegdListener(this, ChunkDestinationMask | RenderEnums.GutsCallEnum.StaticEntityGuts)
        // AllWrappers.GetInstance().mLoader(AllWrappers._enum.msAnimDynaPhys)!.ModRegdListener(this, ChunkDestinationMask | RenderEnums.GutsCallEnum.DynaPhysGuts)
    }
    InitLayers() {
        for (let i: int = RenderEnums.LayerEnum.numLayers - 1; i > -1; i--) {
            switch (i) {
                case RenderEnums.LayerEnum.LevelSlot:
                    this.mpRenderLayers![i] = new WorldRenderLayer
                    break
                // case RenderEnums.LayerEnum.GUI:
                //     this.mpRenderLayers[i] = new FrontEndRenderLayer
                //     this.mpRenderLayers[i].DoAllSetups()
                //     break;
                // case RenderEnums.LayerEnum.PresentationSlot:
                //     this.mpRenderLayers[i] = new RenderLayer
                //     this.mpRenderLayers[i].SetBeginView(false)
                //     this.mpRenderLayers[i].DoAllSetups()
                //     break
                // default:
                //     this.mpRenderLayers[i] = new RenderLayer
                //     this.mpRenderLayers[i].DoAllSetups()
                //     break
            }
            // this.mpRenderLayers[i].SetUpViewCam()
        }
    }
}
export class WorldScene {
    mStaticTreeWalker: SpatialTreeIter
    mEpsilonOffset: rmt.Vector
    mpStaticTree: SpatialTree

    SetTree(ipSpatialTree: SpatialTree) {
        this.mpStaticTree = ipSpatialTree
        this.mStaticTreeWalker.SetToRoot(this.mpStaticTree)
        this.mStaticTreeWalker.AndTree(0x00000000)
        this.GenerateSpatialReps()
    }
    // Add__tGeometry(pGeometry: tGeometry) {
    //     this.Place__tGeometry(pGeometry: tGeometry)
    // }
    Add__IntersectDSG(ipIntersectDSG: IntersectDSG) {
        this.Place__IntersectDSG(ipIntersectDSG)
    }
    // Add__StaticPhysDSG(ipStaticPhysDSG: StaticPhysDSG) {
    //     this.Place__StaticPhysDSG(ipStaticPhysDSG: StaticPhysDSG)
    // }
    // Add__StaticEntityDSG(ipStaticEntityDSG: StaticEntityDSG) {
    //     this.Place__StaticEntityDSG(ipStaticEntityDSG: StaticEntityDSG)
    // }
    Add__FenceEntityDSG(ipFenceEntityDSG: FenceEntityDSG) {
        this.Place__FenceEntityDSG(ipFenceEntityDSG)
    }
    // Add__AnimCollisionEntityDSG(ipAnimCollDSG: AnimCollisionEntityDSG) {
    //     this.Place__AnimCollisionEntityDSG(ipAnimCollDSG)
    // }
    // Add__AnimEntityDSG(ipAnimDSG: AnimEntityDSG) {
    //     this.Place__AnimEntityDSG(ipAnimDSG)
    // }
    // Add__DynaPhysDSG(ipDynaPhysDSG: DynaPhysDSG) {
    //     this.Place__DynaPhysDSG(ipDynaPhysDSG)
    // }
    // Add__TriggerVolume(ipTriggerVolume: TriggerVolume) {
    //     this.Place__TriggerVolume(ipTriggerVolume)
    // }
    // Add__RoadSegment(ipRoadSegment: RoadSegment) {
    //     this.Place__RoadSegment(ipRoadSegment)
    // }
    // Add__PathSegment(ipPathSegment: PathSegment) {
    //     this.Place__PathSegment(ipPathSegment)
    // }
    Place__IntersectDSG(ipIntersectDSG: IntersectDSG) {
        const DrawableSP: BoxPts = new BoxPts
        const BBox: rmt.Box3D = new rmt.Box3D

        ipIntersectDSG.GetBoundingBox(BBox)

        DrawableSP.mBounds.mMin.SetTo(BBox.low)
        DrawableSP.mBounds.mMax.SetTo(BBox.high)
        DrawableSP.mBounds.mMin.Add(this.mEpsilonOffset)
        DrawableSP.mBounds.mMax.Sub(this.mEpsilonOffset)

        const pSpatialNode: SpatialNode = this.mStaticTreeWalker.rSeekNode(DrawableSP as ISpatialProxyAA)
        pSpatialNode.mIntersectElems.Add(ipIntersectDSG)
        ipIntersectDSG.mpSpatialNode = pSpatialNode
    }
    // Place__StaticEntityDSG  (    ipStaticEntity: StaticEntityDSG   ) {
    //    const DrawableSP: BoxPts
    //    const BBox: rmt.Box3D  
    //    
    //    ipStaticEntity.GetBoundingBox( &BBox )
    //    
    //    DrawableSP.mBounds.mMin.SetTo( BBox.low )
    //    DrawableSP.mBounds.mMax.SetTo( BBox.high )
    //    DrawableSP.mBounds.mMin.Add(this.mEpsilonOffset)
    //    DrawableSP.mBounds.mMax.Sub(this.mEpsilonOffset)
    //    
    //    //mStaticTreeWalker.Place( (ISpatialProxyAA&)DrawableSP, mStaticEntities[i] )
    //     const pSpatialNode: SpatialNode  = &(mStaticTreeWalker.rSeekNode((ISpatialProxyAA&)DrawableSP))
    //
    //    if(! pSpatialNode.mSEntityElems.Add(ipStaticEntity)) {
    //        pSpatialNode = &(mStaticTreeWalker.rIthNode(0))
    //        if(pSpatialNode.mSEntityElems.Add(ipStaticEntity)) {
    //            ipStaticEntity.mpSpatialNode = pSpatialNode
    //        }
    //    } else {
    //        ipStaticEntity.mpSpatialNode = pSpatialNode
    //    }
    // }
    // Place__StaticPhysDSG(ipStaticPhys: StaticPhysDSG) {
    //    //rAssert(false)
    //    //This currently fails because PopulateStaticTree doesn't 
    //    //reserve any extra places for stuff to be added
    //    BoxPts DrawableSP
    //    rmt.Box3D  BBox
    //    
    //    ipStaticPhys.GetBoundingBox( &BBox )
    //    
    //    DrawableSP.mBounds.mMin.SetTo( BBox.low )
    //    DrawableSP.mBounds.mMax.SetTo( BBox.high )
    //    DrawableSP.mBounds.mMin.Add(this.mEpsilonOffset)
    //    DrawableSP.mBounds.mMax.Sub(this.mEpsilonOffset)
    //    
    //    //mStaticTreeWalker.Place( (ISpatialProxyAA&)DrawableSP, mStaticEntities[i] )
    //    //mStaticTreeWalker.rSeekNode((ISpatialProxyAA&)DrawableSP).mSPhysElems.Add(ipStaticPhys)
    //    SpatialNode* pSpatialNode = &(mStaticTreeWalker.rSeekNode((ISpatialProxyAA&)DrawableSP))
    //    pSpatialNode.mSPhysElems.Add(ipStaticPhys)
    //    ipStaticPhys.mpSpatialNode = pSpatialNode
    //
    // }
    // Place__DynaPhysDSG(ipDynaPhys: DynaPhysDSG) {
    //    const DrawableSP: BoxPts
    //    const BBox: rmt.Box3D
    //
    //    const ipDynaPhys.GetBoundingBox(BBox)
    //
    //    DrawableSP.mBounds.mMin.SetTo(BBox.low)
    //    DrawableSP.mBounds.mMax.SetTo(BBox.high)
    //    DrawableSP.mBounds.mMin.Add(this.mEpsilonOffset)
    //    DrawableSP.mBounds.mMax.Sub(this.mEpsilonOffset)
    //
    //    pSpatialNode: SpatialNode  = mStaticTreeWalker.rSeekNode(DrawableSP as ISpatialProxyAA)
    //
    //    if(!pSpatialNode.mDPhysElems.Add(ipDynaPhys)) {
    //        pSpatialNode = mStaticTreeWalker.rIthNode(0)
    //        if(pSpatialNode.mDPhysElems.Add(ipDynaPhys)) {
    //            ipDynaPhys.mpSpatialNode = pSpatialNode
    //        }
    //    } else {
    //        ipDynaPhys.mpSpatialNode = pSpatialNode
    //    }
    // }
    Place__FenceEntityDSG(ipFence: FenceEntityDSG) {
        const DrawableSP: BoxPts = new BoxPts
        const BBox: rmt.Box3D = ipFence.GetBoundingBox()

        // ipFence.GetBoundingBox(BBox)

        DrawableSP.mBounds.mMin.SetTo(BBox.low)
        DrawableSP.mBounds.mMax.SetTo(BBox.high)
        DrawableSP.mBounds.mMin.Add(this.mEpsilonOffset)
        DrawableSP.mBounds.mMax.Sub(this.mEpsilonOffset)

        const pSpatialNode: SpatialNode = this.mStaticTreeWalker.rSeekNode(DrawableSP as ISpatialProxyAA)
        pSpatialNode.mFenceElems.Add(ipFence)
        ipFence.mpSpatialNode = pSpatialNode
    }
    // Place__AnimCollisionEntityDSG(ipAnimColl: AnimCollisionEntityDSG) {
    //     const DrawableSP: BoxPts
    //     const BBox: rmt.Box3D
    //
    //     ipAnimColl.GetBoundingBox(BBox)
    //
    //     DrawableSP.mBounds.mMin.SetTo(BBox.low)
    //     DrawableSP.mBounds.mMax.SetTo(BBox.high)
    //     DrawableSP.mBounds.mMin.Add(this.mEpsilonOffset)
    //     DrawableSP.mBounds.mMax.Sub(this.mEpsilonOffset)
    //
    //
    //     const pSpatialNode: SpatialNode   = this.mStaticTreeWalker.rSeekNode(DrawableSP as ISpatialProxyAA)
    //
    //     if (!pSpatialNode.mAnimCollElems.Add(ipAnimColl)) {
    //         pSpatialNode = mStaticTreeWalker.rIthNode(0)
    //         if (!pSpatialNode.mAnimCollElems.Add(ipAnimColl)) {
    //             assert(false)
    //         } else {
    //             ipAnimColl.mpSpatialNode = pSpatialNode
    //         }
    //     } else {
    //         ipAnimColl.mpSpatialNode = pSpatialNode
    //     }
    // }
    // Place__AnimEntityDSG(ipAnim: AnimEntityDSG) {
    //     const DrawableSP: BoxPts
    //     const BBox: rmt.Box3D
    //
    //     ipAnim.GetBoundingBox(BBox)
    //
    //     DrawableSP.mBounds.mMin.SetTo(BBox.low)
    //     DrawableSP.mBounds.mMax.SetTo(BBox.high)
    //     DrawableSP.mBounds.mMin.Add(this.mEpsilonOffset)
    //     DrawableSP.mBounds.mMax.Sub(this.mEpsilonOffset)
    //
    //     const pSpatialNode: SpatialNode = this.mStaticTreeWalker.rSeekNode(DrawableSP as ISpatialProxyAA)
    //
    //     if (!pSpatialNode.mAnimElems.Add(ipAnim)) {
    //         pSpatialNode = this.mStaticTreeWalker.rIthNode(0)
    //         if (pSpatialNode.mAnimElems.Add(ipAnim)) {
    //             ipAnim.mpSpatialNode = pSpatialNode
    //         }
    //     }
    //     else {
    //         ipAnim.mpSpatialNode = pSpatialNode
    //     }
    // }
    // Place__TriggerVolume(ipTriggerVolume: TriggerVolume) {
    //     const DrawableSP: BoxPts
    //     const BBox: rmt.Box3D
    //
    //     ipTriggerVolume.GetBoundingBox(BBox)
    //
    //     DrawableSP.mBounds.mMin.SetTo(BBox.low)
    //     DrawableSP.mBounds.mMax.SetTo(BBox.high)
    //     DrawableSP.mBounds.mMin.Add(this.mEpsilonOffset)
    //     DrawableSP.mBounds.mMax.Sub(this.mEpsilonOffset)
    //
    //     const pSpatialNode: SpatialNode = this.mStaticTreeWalker.rSeekNode(DrawableSP: ISpatialProxyAA)
    //     pSpatialNode.mTrigVolElems.Add(ipTriggerVolume)
    //     ipTriggerVolume.mpSpatialNode = pSpatialNode
    // }
    // Place__RoadSegment(ipRoadSegment: RoadSegment) {
    //     const DrawableSP: BoxPts
    //     const BBox: rmt.Box3D
    //
    //     ipRoadSegment.GetBoundingBox(BBox)
    //
    //     DrawableSP.mBounds.mMin.SetTo(BBox.low)
    //     DrawableSP.mBounds.mMax.SetTo(BBox.high)
    //     DrawableSP.mBounds.mMin.Add(this.mEpsilonOffset)
    //     DrawableSP.mBounds.mMax.Sub(this.mEpsilonOffset)
    //
    //     const pSpatialNode: SpatialNode = this.mStaticTreeWalker.rSeekNode(DrawableSP as ISpatialProxyAA)
    //     pSpatialNode.mRoadSegmentElems.Add(ipRoadSegment)
    //     ipRoadSegment.mpSpatialNode = pSpatialNode
    // }
    // Place__PathSegment(ipPathSegment: PathSegment) {
    //     const DrawableSP: BoxPts = new BoxPts()
    //     const BBox: rmt.Box3D = new Box3D()
    //
    //     ipPathSegment.GetBoundingBox(BBox)
    //
    //     DrawableSP.mBounds.mMin.SetTo(BBox.low)
    //     DrawableSP.mBounds.mMax.SetTo(BBox.high)
    //     DrawableSP.mBounds.mMin.Add(this.mEpsilonOffset)
    //     DrawableSP.mBounds.mMax.Sub(this.mEpsilonOffset)
    //
    //     const pSpatialNode: SpatialNode = this.mStaticTreeWalker.rSeekNode(DrawableSP as ISpatialProxyAA)
    //     pSpatialNode.mPathSegmentElems.Add(ipPathSegment)
    //     ipPathSegment.mpSpatialNode = pSpatialNode
    // }

    GenerateSpatialReps() {
        this.mStaticTreeWalker.rBBox().mBounds.mMin.y = -200.0
        this.mStaticTreeWalker.rBBox().mBounds.mMax.y = 100.0
        this.mStaticTreeWalker.BuildBBoxes(this.mStaticTreeWalker.rBBox())

        this.PopulateStaticTree()
    }
    PopulateStaticTree() {
        const DrawableSP: BoxPts = new BoxPts
        const BBox: rmt.Box3D = new rmt.Box3D

        const max: number = this.mStaticTreeWalker.NumNodes()
        for (let i = 0; i < max; i++) {
            // this.mStaticTreeWalker.rIthNode(i).mSEntityElems.Allocate(() => new StaticEntityDSG(), 0)
            // this.mStaticTreeWalker.rIthNode(i).mSPhysElems.Allocate(() => new StaticPhysicsDSG(), 0)
            this.mStaticTreeWalker.rIthNode(i).mIntersectElems.Allocate(() => new IntersectDSG(), 0)
            // this.mStaticTreeWalker.rIthNode(i).mDPhysElems.Allocate(() => new DynaPhysDSG(), 0)
            this.mStaticTreeWalker.rIthNode(i).mFenceElems.Allocate(() => new FenceEntityDSG(), 0)
            // this.mStaticTreeWalker.rIthNode(i).mAnimCollElems.Allocate(() => new AnimCollisionEntityDSG(), 0)
            // this.mStaticTreeWalker.rIthNode(i).mAnimElems.Allocate(() => new AnimEntityDSG(), 0)
            // this.mStaticTreeWalker.rIthNode(i).mTrigVolElems.Allocate(() => new TriggerVolume(), 0)
            // this.mStaticTreeWalker.rIthNode(i).mRoadSegmentElems.Allocate(() => new RoadSegment(), 0)
            // this.mStaticTreeWalker.rIthNode(i).mPathSegmentElems.Allocate(() => new PathSegment(), 0)
        }
    }
}
export class RenderFlow {
    static spInstance: RenderFlow | null

    mpRenderManager: RenderManager
    // mpDSGFactory: DSGFactory
    mpLoadWrappers: AllWrappers
    // mpIntersectManager: IntersectManager

    constructor() {
        this.mpRenderManager = RenderManager.CreateInstance()
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
    static GetInstance(): RenderFlow {
        assert(RenderFlow.spInstance != NULL)
        return RenderFlow.spInstance
    }
    DoAllRegistration() {
        // ParticleSystemRandomData.SetUp()

        // GetEventManager().AddListener(GetRenderManager(),(EventEnum)(EVENT_LOCATOR+LocatorEvent.DYNAMIC_ZONE))
        // GetEventManager().AddListener(GetRenderManager(), EVENT_FIRST_DYNAMIC_ZONE_START)
        // GetEventManager().AddListener(GetRenderManager(), EVENT_ALL_DYNAMIC_ZONES_DUMPED)
        // GetEventManager().AddListener(GetRenderManager(),(EventEnum)(EVENT_LOCATOR + LocatorEvent.OCCLUSION_ZONE))
        // GetEventManager().AddListener(GetRenderManager(), static_cast<EventEnum>(EVENT_LOCATOR + LocatorEvent, LIGHT_CHANGE))
        // GetEventManager().AddListener(GetRenderManager(), EVENT_MISSION_RESET)
    }
}
export namespace RenderEnums {
    export enum LayerEnum {
        GUI = 0x00000000,
        PresentationSlot,
        LevelSlot,
        MissionSlot1,
        MissionSlot2,
        numLayers,
        LayerOnlyMask = 0x000000FF
    }
    export enum UserDataEnum {
        BogusUserData = 0x00000000,
        AllRenderLoadingComplete = 0x00100000,
        AllIntersectLoadingComplete = 0x00200000,
        DynamicLoadComplete = 0x00400000,
        CompletionOnlyMask = 0x00F00000
    }
    export enum LoadZoneEnum {
        Zone1 = 0x00001000,
        ZoneMask = 0x000FF000,
        ZoneShift = 12
    }
    //GutsCallEnum is meant to mask to the top byte of a CB whose 
    //bottom byte is LayerEnum
    export enum GutsCallEnum {
        DrawableGuts = 0x01000000,
        GeometryGuts = 0x02000000,
        IntersectGuts = 0x03000000,
        StaticEntityGuts = 0x04000000,
        StaticPhysGuts = 0x05000000,
        TreeDSGGuts = 0x06000000,
        FenceGuts = 0x07000000,
        AnimCollGuts = 0x08000000,
        DynaPhysGuts = 0x09000000,
        LocatorGuts = 0x0A000000,
        WorldSphereGuts = 0x0B000000,
        RoadSegmentGuts = 0x0C000000,
        PathSegmentGuts = 0x0D000000,
        GlobalWSphereGuts = 0x0E000000,
        AnimGuts = 0x0F000000,
        IgnoreGuts = 0xFE000000,
        GutsOnlyMask = 0xFF000000
    }
    export enum LevelEnum {
        L1,
        L2,
        L3,
        L4,
        L5,
        L6,
        L7,
        //L8,
        //L9,
        //MULTI,
        numLevels,
        //Mini games
        B00 = numLevels,
        B01,
        B02,
        B03,
        B04,
        B05,
        B06,
        B07,
        MAX_LEVEL
    }
    export enum LevelMissionCountEnum {
        L1MCount = 10,
        L2MCount = 10,
        L3MCount = 10,
        L4MCount = 10,
        L5MCount = 10,
        L6MCount = 10,
        L7MCount = 10,
        L8MCount = 10,
        L9MCount = 10
    }
    export enum MissionEnum {
        M1,
        M2,
        M3,
        M4,
        M5,
        M6,
        M7,
        M8,
        M9,
        M10,
        numMissions
    }
}