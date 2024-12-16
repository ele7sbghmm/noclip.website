import { assert, nArray } from '../util.js'
import { FenceEntityDSG, IntersectDSG, StaticPhysDSG, TriggerVolume, PathSegment, StaticEntityDSG, WorldSphereDSG, AnimCollisionEntityDSG, AnimEntityDSG, DynaPhysDSG, RoadSegment } from './dsg.js'
import { StaticEntityLoader, StaticPhysLoader, TreeDSGLoader, FenceLoader, IntersectLoader, LocatorLoader, WorldSphereLoader, PathLoader, RoadLoader, AnimCollLoader, AnimDSGLoader, AnimDynaPhysLoader, AnimDynaPhysWrapperLoader, BillboardWrappedLoader, BreakableObjectLoader, InstParticleSystemLoader, InstStatEntityLoader, InstStatPhysLoader, LensFlareLoader } from './loaders.js'
import { DLLD_, Instance } from './scenes/scenes.js'
import { SpatialTree } from './spatial.js'
import { tSimpleChunkHandler } from './file.js'
// import { tDrawable } from './drawable.js'
import { BoxPts, tEntity } from './rad_util.js'

import { SRR2 } from './srrchunks.js'
import { Pure3D } from './chunkids.js'
import { rmt } from './math.js'
import { vec3 } from 'gl-matrix'

const MAX_PLAYERS: number = 4

export class WorldRenderLayer {
    mpWorldScene = new WorldScene
    // worldSpheres: WorldSphereDSG[]
    mLoadLists: (DLLD_ | null)[] = nArray(30, () => null)
    mCurLoadIndex: number
    pWorldScene() { return this.mpWorldScene }
    AddGuts__SpatialTree(ipSpatialTree: SpatialTree) {
        this.mpWorldScene.SetTree(ipSpatialTree)
    }
    AddGuts__IntersectDSG(ipIntersectDSG: IntersectDSG) {
        // this.mpWorldScene.Add__IntersectDSG(ipIntersectDSG)
        this.mLoadLists[this.mCurLoadIndex]!.mIntersectElems.push(ipIntersectDSG)
    }
    AddGuts__StaticEntityDSG(ipStaticEntityDSG: StaticEntityDSG) {
        // this.mpWorldScene.Add__StaticEntityDSG(ipStaticEntityDSG)
        this.mLoadLists[this.mCurLoadIndex]!.mSEntityElems.push(ipStaticEntityDSG)
    }
    AddGuts__StaticPhysDSG(ipStaticPhysDSG: StaticPhysDSG) {
        // this.mpWorldScene.Add__StaticPhysDSG(ipStaticPhysDSG)
        this.mLoadLists[this.mCurLoadIndex]!.mSPhysElems.push(ipStaticPhysDSG)
    }
    AddGuts__FenceEntityDSG(ipFenceEntityDSG: FenceEntityDSG) {
        this.mpWorldScene.Add__FenceEntityDSG(ipFenceEntityDSG)
        this.mLoadLists[this.mCurLoadIndex]!.mFenceElems.push(ipFenceEntityDSG)
    }
    AddGuts__AnimCollisionEntityDSG(ipAnimCollDSG: AnimCollisionEntityDSG) {
        // this.mpWorldScene.Add__AnimCollisionEntityDSG(ipAnimCollDSG)
        this.mLoadLists[this.mCurLoadIndex]!.mAnimCollElems.push(ipAnimCollDSG)
    }
    AddGuts__AnimEntityDSG(ipAnimDSG: AnimEntityDSG) {
        // this.mpWorldScene.Add__AnimEntityDSG(ipAnimDSG)
        this.mLoadLists[this.mCurLoadIndex]!.mAnimElems.push(ipAnimDSG)
    }
    AddGuts__DynaPhysDSG(ipDynaPhysDSG: DynaPhysDSG) {
        // this.mpWorldScene.Add__DynaPhysDSG(ipDynaPhysDSG)
        this.mLoadLists[this.mCurLoadIndex]!.mDPhysElems.push(ipDynaPhysDSG)
    }
    AddGuts__TriggerVolume(ipTriggerVolume: TriggerVolume) {
        // this.mpWorldScene.Add__TriggerVolume(ipTriggerVolume)
        this.mLoadLists[this.mCurLoadIndex]!.mTrigVolElems.push(ipTriggerVolume)
    }
    AddGuts__RoadSegment(ipRoadSegment: RoadSegment) {
        // this.mpWorldScene.Add__RoadSegment(ipRoadSegment)
        this.mLoadLists[this.mCurLoadIndex]!.mRoadSegmentElems.push(ipRoadSegment)
    }
    AddGuts__PathSegment(ipPathSegment: PathSegment) {
        // this.mpWorldScene.Add__PathSegment(ipPathSegment)
        this.mLoadLists[this.mCurLoadIndex]!.mPathSegmentElems.push(ipPathSegment)
    }
    AddGuts__WorldSphereDSG(ipWorldSphereDSG: WorldSphereDSG) {
        // this.mpWorldScene.Add__WorldSphereDSG(ipWorldSphereDSG)
        this.mLoadLists[this.mCurLoadIndex]!.mWorldSphereElems.push(ipWorldSphereDSG)
    }
}
class WorldScene {
    mpStaticTree: SpatialTree | null = null
    mEpsilonOffset = vec3.fromValues(0.01, 0.01, 0.01)
    SetTree(ipSpatialTree: SpatialTree) { this.mpStaticTree = ipSpatialTree }
    Add__FenceEntityDSG(ipFenceEntityDSG: FenceEntityDSG) {
        this.Place__FenceEntityDSG(ipFenceEntityDSG)
    }
    Place__FenceEntityDSG(ipFence: FenceEntityDSG) {
        const DrawableSP = new BoxPts
        const BBox: rmt.Box3D = ipFence.GetBoundingBox()
        vec3.copy(DrawableSP.mBounds.min, BBox.min)
        vec3.copy(DrawableSP.mBounds.max, BBox.max)
        vec3.add(DrawableSP.mBounds.min, DrawableSP.mBounds.min, this.mEpsilonOffset)
        vec3.add(DrawableSP.mBounds.max, DrawableSP.mBounds.max, this.mEpsilonOffset)

        // const pSpatialNode = this.mStaticTreeWalker.rSeekNode(DrawableSP as ISpatialProxyAA)
        // pSpatialNode.mFenceElems.Ad(ipFence)
        // ipFence.mpSpatialNode = pSpatialNode
    }
}
export class DynaLoadListDSG {
    // mGiveItAFuckinName: string
    mWorldSphereElems: WorldSphereDSG[] = []
    mSEntityElems: StaticEntityDSG[] = []
    mSPhysElems: StaticPhysDSG[] = []
    mIntersectElems: IntersectDSG[] = []
    mDPhysElems: DynaPhysDSG[] = []
    mFenceElems: FenceEntityDSG[] = []
    mAnimCollElems: AnimCollisionEntityDSG[] = []
    mAnimElems: AnimEntityDSG[] = []
    mTrigVolElems: TriggerVolume[] = []
    mRoadSegmentElems: RoadSegment[] = []
    mPathSegmentElems: PathSegment[] = []
}
class TriggerVolumeTracker {
    static MAX_VOLUMES = 500
    static MAX_ACTIVE = 20
    mpTriggerSphere: tDrawable
    mTriggerCount: number
    mTriggerVolumes: (TriggerVolume | null)[] =
        nArray(TriggerVolumeTracker.MAX_VOLUMES, () => null)

    // mActiveCount: number[] = nArray(MAX_PLAYERS, () => 0)
    // mActiveVolumes: (TriggerVolume | null)[][] = 
    //     nArray(MAX_PLAYERS, () => nArray(TriggerVolumeTracker.MAX_ACTIVE, () => null))
    static CreateInstance() { return new TriggerVolumeTracker }
    GetInstance() { return this }
}

export class RenderFlow {
    mpRenderManager = RenderManager.CreateInstance()
    mpLoadWrappers = AllWrappers.CreateInstance()
    // mpDSGFactory = DSGFactory.CreateInstance()
    // mpIntersectManager: IntersectManager
    static CreateInstance() { return new RenderFlow }
    GetInstance() { return this }
}
export class RenderManager {
    mCurWorldLayer = RenderEnums.LayerEnum.LevelSlot
    msLayer = RenderEnums.LayerEnum.LevelSlot
    // mpRenderLayers: RenderLayer[]
    mpRenderLayers: (WorldRenderLayer | null)[] = [null, null, new WorldRenderLayer]
    // mZELS: ZoneEventLocator[]

    static CreateInstance() { return new RenderManager }
    GetInstance() { return this }
    pWorldRenderLayer() { return this.mpRenderLayers[this.mCurWorldLayer]! }
    pWorldScene() { return this.mpRenderLayers[this.mCurWorldLayer]!.pWorldScene() }
    OnChunkLoaded(level_instance: Instance, ipEntity: tEntity, iUserData: number, iChunkID: number) {
        iUserData = 2
        switch (iChunkID) {
            case SRR2.ChunkID.LENS_FLARE_DSG:
            case SRR2.ChunkID.INSTA_ENTITY_DSG:
            case SRR2.ChunkID.ENTITY_DSG: {
                this.mpRenderLayers[iUserData & RenderEnums.LayerEnum.LayerOnlyMask]!
                    .AddGuts__StaticEntityDSG(ipEntity as unknown as StaticEntityDSG)
            } break
            case SRR2.ChunkID.INSTA_STATIC_PHYS_DSG:
            case SRR2.ChunkID.STATIC_PHYS_DSG: {
                this.mpRenderLayers[iUserData & RenderEnums.LayerEnum.LayerOnlyMask]!
                    .AddGuts__StaticPhysDSG(ipEntity as unknown as StaticPhysDSG);
            } break
            case SRR2.ChunkID.DYNA_PHYS_DSG:
            case SRR2.ChunkID.INSTA_ANIM_DYNA_PHYS_DSG: {
                const renderLayer = iUserData & RenderEnums.LayerEnum.LayerOnlyMask;
                const pDynaPhys = ipEntity as DynaPhysDSG
                this.mpRenderLayers[renderLayer]!.AddGuts__DynaPhysDSG(pDynaPhys)
                // pDynaPhys.SetRenderLayer(renderLayer as RenderEnums.LayerEnum)
            } break
            case SRR2.ChunkID.TREE_DSG: {
                // switch (iUserData & RenderEnums.GutsCallEnum.GutsOblyMask) {
                //     case RenderEnums.TreeDSGGuts: {
                this.mpRenderLayers[iUserData & RenderEnums.LayerEnum.LayerOnlyMask]!
                    .AddGuts__SpatialTree(ipEntity as SpatialTree)
                //     }
                // }
            } break
            case SRR2.ChunkID.FENCE_DSG: {
                this.mpRenderLayers[iUserData & RenderEnums.LayerEnum.LayerOnlyMask]!
                    .AddGuts__FenceEntityDSG(ipEntity as FenceEntityDSG)
            } break
            case SRR2.ChunkID.INTERSECT_DSG: {
                this.mpRenderLayers[iUserData & RenderEnums.LayerEnum.LayerOnlyMask]!
                    .AddGuts__IntersectDSG(ipEntity as IntersectDSG)
            } break
            case SRR2.ChunkID.ANIM_DSG: {
                const renderLayer = iUserData & RenderEnums.LayerEnum.LayerOnlyMask
                const pAnimDSG = ipEntity as AnimEntityDSG
                this.mpRenderLayers[renderLayer]!.AddGuts__AnimEntityDSG(pAnimDSG)
                // pAnimDSG.SetRenderLayer(renderLayer as RenderEnums.LayerEnum)
            } break
            case SRR2.ChunkID.ANIM_COLL_DSG: {
                const renderLayer = iUserData & RenderEnums.LayerEnum.LayerOnlyMask
                const pAnimCollDSG = ipEntity as AnimCollisionEntityDSG
                this.mpRenderLayers[renderLayer]!.AddGuts__AnimCollisionEntityDSG(pAnimCollDSG)
                // pAnimCollDSG.SetRenderLayer(renderLayer as RenderEnums.LayerEnum)
            } break
            // case Pure3D.Mesh.MESH: {
            //     switch (iUserData & RenderEnums.GutsCallEnum.GutsOnlyMask) {
            //         case RenderEnums.GutsCallEnum.GeometryGuts: {

            //         } break
            //         case RenderEnums.GutsCallEnum.DrawableGuts: {

            //         } break
            //         case RenderEnums.GutsCallEnum.IntersectGuts: {

            //         } break
            //         case RenderEnums.GutsCallEnum.IgnoreGuts: {
            //             const pIDSG = level_instance.GetDSGFactory().CreateIntersectDSG(ipEntity as tGeometry)
            //             this.mpRenderLayers[iUserData & RenderEnums.LayerEnum.LayerOnlyMask]!
            //                 .AddGuts__IntersectDSG(pIDSG)
            //         }
            //     }
            // } break
         
        }
        this.pWorldRenderLayer().AddGuts__WorldSphereDSG(ipEntity)
    }
    LoadAllNeededData() {
        switch (this.msLayer) {
            case RenderEnums.LayerEnum.LevelSlot: {
                // this.mpRenderLayers[this.msLayer].DoPreStaticLoad()
                // AllWrappers.GetInstance().mLoader()
            }
        }
    }

}
// export class DSGFactory {
//     static CreateInstance() { return new DSGFactory }
//     GetInstance() { return this }
//     CreateEntityDSG(ipDrawable: tDrawable) {
//         return ipDrawable as IEntityDSG
//     }
//     CreateIntersectDSG(ipGeometry: tGeometry) {
//         return new IntersectDSG//(ipGeometry)
//     }
// }
export class AllWrappers {
    mpLoaders: (tSimpleChunkHandler | null)[]
    mpGlobalEntities: tDrawable[]
    mNumGlobalEntities = 0
    constructor() {
        this.mpLoaders = nArray(AllWrappers.Enum.msNumWrappers, () => null)
    // CoupleAllLoaders() {
        this.mpLoaders[AllWrappers.Enum.msGeometry]            = null//new GeometryWrappedLoader
        this.mpLoaders[AllWrappers.Enum.msStaticEntity]        = new StaticEntityLoader
        this.mpLoaders[AllWrappers.Enum.msStaticPhys]          = new StaticPhysLoader
        this.mpLoaders[AllWrappers.Enum.msTreeDSG]             = new TreeDSGLoader
        this.mpLoaders[AllWrappers.Enum.msFenceEntity]         = new FenceLoader
        this.mpLoaders[AllWrappers.Enum.msIntersectDSG]        = new IntersectLoader
        this.mpLoaders[AllWrappers.Enum.msAnimCollEntity]      = new AnimCollLoader
        this.mpLoaders[AllWrappers.Enum.msAnimEntity]          = new AnimDSGLoader
        this.mpLoaders[AllWrappers.Enum.msDynaPhys]            = null//new DynaPhysLoader
        this.mpLoaders[AllWrappers.Enum.msInstStatEntity]      = new InstStatEntityLoader
        this.mpLoaders[AllWrappers.Enum.msInstStatPhys]        = new InstStatPhysLoader
        this.mpLoaders[AllWrappers.Enum.msLocator]             = new LocatorLoader
        this.mpLoaders[AllWrappers.Enum.msWorldSphere]         = new WorldSphereLoader
        this.mpLoaders[AllWrappers.Enum.msRoadSegment]         = new RoadLoader
        this.mpLoaders[AllWrappers.Enum.msPathSegment]         = new PathLoader
        this.mpLoaders[AllWrappers.Enum.msBillboard]           = new BillboardWrappedLoader
        this.mpLoaders[AllWrappers.Enum.msInstParticleSystem]  = new InstParticleSystemLoader
        this.mpLoaders[AllWrappers.Enum.msBreakableObject]     = new BreakableObjectLoader
        this.mpLoaders[AllWrappers.Enum.msLensFlare]           = new LensFlareLoader
        this.mpLoaders[AllWrappers.Enum.msAnimDynaPhys]        = new AnimDynaPhysLoader
        this.mpLoaders[AllWrappers.Enum.msAnimDynaPhysWrapper] = new AnimDynaPhysWrapperLoader
    // }
    }

    static CreateInstance() { return new AllWrappers }
    GetInstance() { return this }
    mLoader(iIndex: number) { return this.mpLoaders[iIndex] }
    mpLoader(iIndex: number) { return this.mpLoaders[iIndex] }

    GetGlobalEntity(EntityID: tUID): any | null {
        for (let i = 0; i < this.mNumGlobalEntities; ++i) {
            if (this.mpGlobalEntities[i].GetUID() == EntityID)
                this.mpGlobalEntities[i]
        }
        return null
    }
    AddGlobalEntity(Entity: tDrawable) {
        if (!Entity) { return }
        this.mpGlobalEntities[this.mNumGlobalEntities] = Entity
        ++this.mNumGlobalEntities
    }
}
export type tUID = string
export namespace AllWrappers {
    export enum Enum {
        msGeometry,
        msStaticEntity,
        msStaticPhys,
        msTreeDSG,
        msFenceEntity,
        msIntersectDSG,
        msAnimCollEntity,
        msAnimEntity,
        msDynaPhys,
        msInstStatEntity,
        msInstStatPhys,
        msLocator,
        msWorldSphere,
        msRoadSegment,
        msPathSegment,
        msBillboard,
        msInstParticleSystem,
        msBreakableObject,
        msLensFlare,
        msAnimDynaPhys,
        msAnimDynaPhysWrapper,
        msNumWrappers
    }
}
export namespace RenderEnums {
    export enum LayerEnum {
        GUI = 0,
        PresentationSlot,
        LevelSlot,
        MissionSlot1,
        MissionSlot2,
        numLayers,
        LayerOnlyMask = 0xff
    }
    export enum GutsCallEnum   
    {
       DrawableGuts      = 0x01000000,
       GeometryGuts      = 0x02000000,
       IntersectGuts     = 0x03000000,
       StaticEntityGuts  = 0x04000000,
       StaticPhysGuts    = 0x05000000,
       TreeDSGGuts       = 0x06000000,
       FenceGuts         = 0x07000000,
       AnimCollGuts      = 0x08000000,
       DynaPhysGuts      = 0x09000000,
       LocatorGuts       = 0x0A000000,
       WorldSphereGuts   = 0x0B000000,
       RoadSegmentGuts   = 0x0C000000,
       PathSegmentGuts   = 0x0D000000,
       GlobalWSphereGuts = 0x0E000000,
       AnimGuts          = 0x0F000000,
       IgnoreGuts        = 0xFE000000,
       GutsOnlyMask      = 0xFF000000
    };
}

export class tDrawable {
    GetUID() {
        return ``
    }
}