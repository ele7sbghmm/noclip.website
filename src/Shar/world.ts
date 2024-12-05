import { assert, nArray } from '../util.js'
import { IEntityDSG, FenceEntityDSG, IntersectDSG, StaticPhysDSG, TriggerVolume, PathSegment, StaticEntityDSG, WorldSphereDSG, AnimCollisionEntityDSG, AnimEntityDSG, DynaPhysDSG, RoadSegment } from './dsg.js'
import { StaticEntityLoader, StaticPhysLoader, TreeDSGLoader, FenceLoader, IntersectLoader, LocatorLoader, WorldSphereLoader, PathLoader, IWrappedLoader, RoadLoader, AnimCollLoader, AnimDSGLoader, AnimDynaPhysLoader, AnimDynaPhysWrapperLoader, BillboardWrappedLoader, BreakableObjectLoader, DynaPhysLoader, InstParticleSystemLoader, InstStatEntityLoader, InstStatPhysLoader, LensFlareLoader } from './loaders.js'
import { DLLD_ } from './scenes.js'
import { SpatialTree } from './spatial.js'
import { SRR2 } from './srrchunks.js'

const MAX_PLAYERS: number = 4

export class WorldRenderLayer {
    mpWorldScene = new WorldScene
    // worldSpheres: WorldSphereDSG[]
    mLoadLists = nArray(30, () => new DLLD_)
    mCurLoadIndex: number
    pWorldScene() { return this.mpWorldScene }
    AddGuts(ipEDSG: IEntityDSG) {
        assert(this.mLoadLists[this.mCurLoadIndex] != null, `mLoadList elem is null! have fun xD`)
        switch(ipEDSG.constructor.name) {
            case `SpatialTree`:            this.mpWorldScene.SetTree(ipEDSG as SpatialTree); break
            // case `WorldSphereDSG`:         this.mLoadLists[this.mCurLoadIndex]!.mWorldSphereElems.push(ipEDSG as WorldSphereDSG); break
            // case `StaticEntityDSG`:        this.mLoadLists[this.mCurLoadIndex]!.mSEntityElems.push(ipEDSG as StaticEntityDSG); break
            case `StaticPhysDSG`:          this.mLoadLists[this.mCurLoadIndex].mSPhysElems.push(ipEDSG as StaticPhysDSG); break
            case `IntersectDSG`:           this.mLoadLists[this.mCurLoadIndex].mIntersectElems.push(ipEDSG as IntersectDSG); break
            // case `DynaPhysDSG`:            this.mLoadLists[this.mCurLoadIndex]!.mDPhysElems.push(ipEDSG as DynaPhysDSG); break
            case `FenceEntityDSG`:         this.mLoadLists[this.mCurLoadIndex].mFenceElems.push(ipEDSG as FenceEntityDSG); break
            // case `AnimCollisionEntityDSG`: this.mLoadLists[this.mCurLoadIndex]!.mAnimCollElems.push(ipEDSG as AnimCollisionEntityDSG); break
            // case `AnimEntityDSG`:          this.mLoadLists[this.mCurLoadIndex]!.mAnimElems.push(ipEDSG as AnimEntityDSG); break
            case `TriggerVolume`:          this.mLoadLists[this.mCurLoadIndex].mTrigVolElems.push(ipEDSG as TriggerVolume); break
            // case `RoadSegment`:            this.mLoadLists[this.mCurLoadIndex]!.mRoadSegmentElems.push(ipEDSG as RoadSegment); break
            case `PathSegment`:            this.mLoadLists[this.mCurLoadIndex].mPathSegmentElems.push(ipEDSG as PathSegment); break
        }
    }

}
class WorldScene {
    mpStaticTree: SpatialTree | null = null
    SetTree(ipSpatialTree: SpatialTree) { this.mpStaticTree = ipSpatialTree }
}
export class DynaLoadListDSG {
    // mGiveItAFuckinName: string
    mWorldSphereElems: WorldSphereDSG[] = []
    mSEntityElems:     StaticEntityDSG[] = []
    mSPhysElems:       StaticPhysDSG[] = []
    mIntersectElems:   IntersectDSG[] = []
    mDPhysElems:       DynaPhysDSG[] = []
    mFenceElems:       FenceEntityDSG[] = []
    mAnimCollElems:    AnimCollisionEntityDSG[] = []
    mAnimElems:        AnimEntityDSG[] = []
    mTrigVolElems:     TriggerVolume[] = []
    mRoadSegmentElems: RoadSegment[] = []
    mPathSegmentElems: PathSegment[] = []
}
class TriggerVolumeTracker {
    static MAX_VOLUMES = 500
    static MAX_ACTIVE  =  20
    // mpTriggerSphere: tDrawable
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
    // mpDSGFactory: DSGFactory
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
    OnChunkLoaded(ipEntity: /*tEntity*/IEntityDSG, iUserData: number, iChunkID: number) {
        switch (iChunkID) {
            case SRR2.ChunkID.TREE_DSG: this.pWorldScene().SetTree(ipEntity as SpatialTree)
        }
        this.pWorldRenderLayer().AddGuts(ipEntity)
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
export class AllWrappers {
    static msGeometry            =  0
    static msStaticEntity        =  1
    static msStaticPhys          =  2
    static msTreeDSG             =  3
    static msFenceEntity         =  4
    static msIntersectDSG        =  5
    static msAnimCollEntity      =  6
    static msAnimEntity          =  7
    static msDynaPhys            =  8
    static msInstStatEntity      =  9
    static msInstStatPhys        = 10
    static msLocator             = 11
    static msWorldSphere         = 12
    static msRoadSegment         = 13
    static msPathSegment         = 14
    static msBillboard           = 15
    static msInstParticleSystem  = 16
    static msBreakableObject     = 17
    static msLensFlare           = 18
    static msAnimDynaPhys        = 19
    static msAnimDynaPhysWrapper = 20
    static msNumWrappers         = 21

    mpLoaders: (IWrappedLoader | null)[] = nArray(AllWrappers.msNumWrappers, () => null)
    // mpGlobalEntities: tDrawable[]
    mNumGlobalEntities: number

    static CreateInstance() { return new AllWrappers }
    GetInstance() { return this }
    mLoader() { }
    mpLoader() { }
    CoupleAllLoaders() {
        this.mpLoaders[AllWrappers.msGeometry]           = null//new GeometryWrappedLoader
        this.mpLoaders[AllWrappers.msStaticEntity]       = new StaticEntityLoader
        this.mpLoaders[AllWrappers.msStaticPhys]         = new StaticPhysLoader
        this.mpLoaders[AllWrappers.msTreeDSG]            = new TreeDSGLoader
        this.mpLoaders[AllWrappers.msFenceEntity]        = new FenceLoader
        this.mpLoaders[AllWrappers.msIntersectDSG]       = new IntersectLoader
        this.mpLoaders[AllWrappers.msAnimCollEntity]     = new AnimCollLoader
        this.mpLoaders[AllWrappers.msAnimEntity]         = new AnimDSGLoader
        this.mpLoaders[AllWrappers.msDynaPhys]           = new DynaPhysLoader
        this.mpLoaders[AllWrappers.msInstStatEntity]     = new InstStatEntityLoader
        this.mpLoaders[AllWrappers.msInstStatPhys]       = new InstStatPhysLoader
        this.mpLoaders[AllWrappers.msLocator]            = new LocatorLoader
        this.mpLoaders[AllWrappers.msWorldSphere]        = new WorldSphereLoader
        this.mpLoaders[AllWrappers.msRoadSegment]        = new RoadLoader
        this.mpLoaders[AllWrappers.msPathSegment]        = new PathLoader
        this.mpLoaders[AllWrappers.msBillboard]          = new BillboardWrappedLoader
        this.mpLoaders[AllWrappers.msInstParticleSystem] = new InstParticleSystemLoader
        this.mpLoaders[AllWrappers.msBreakableObject]    = new BreakableObjectLoader
        this.mpLoaders[AllWrappers.msLensFlare]          = new LensFlareLoader
        this.mpLoaders[AllWrappers.msAnimDynaPhys]       = new AnimDynaPhysLoader
        this.mpLoaders[AllWrappers.msAnimDynaPhysWrapper]= new AnimDynaPhysWrapperLoader
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
}
