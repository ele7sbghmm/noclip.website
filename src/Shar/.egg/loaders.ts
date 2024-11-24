import { assert } from '../../util.js'

import { rmt } from './math.js'
import { read_vector } from '../reader.js'
import { tChunkFile, tFile } from './file.js'
import { SpatialTree } from './spatial.js'
import { BoxPts, Bounds3f, tEntity, Vector3f } from '../rad_util.js'
import { FenceEntityDSG, IntersectDSG } from './dsg.js'
import { RenderManager } from './renderer.js'

import { SRR2 } from './srrchunks.js'
import { Pure3D } from './chunkids.js'
import { radLoadDataLoader, radLoadManager } from './loadmanager.js'

const NULL = null
type float = number
type long = number
type int = number
type unsigned = number
type unsigned_int = number
type const_char_p = string
type char = string
type radLoadClassID = unsigned_int

export function radLoadInitialize() {
    // if (!init) { init = new radLoadInit() }
    ILoadManager.s_instance = new radLoadManager
}
class radLoadOptions { }
function radLoadInstance() { return ILoadManager.s_instance }
abstract class ILoadManager {
    static s_instance: ILoadManager
    abstract Load(options: radLoadOptions, request: radLoadRequest): void
    abstract AddDataLoader(dataLoader: radLoadDataLoader, id: radLoadClassID): void
    abstract AddFileLoader(fileLoader: radLoadFileLoader, extension: const_char_p): void
    abstract GetDataLoader(id: radLoadClassID): radLoadDataLoader
    abstract GetFileLoader(extension: const_char_p): radLoadFileLoader
}
export const radLoad = ILoadManager.s_instance
export enum tLoadStatus { LOAD_OK, LOAD_ERROR }
abstract class tChunkHandler extends radLoadDataLoader {
    abstract Load(file: tChunkFile): void
    abstract GetChunkID(): unsigned_int
}
abstract class tSimpleChunkHandler extends tChunkHandler {
    _id: unsigned
    m_NameOverride: const_char_p
    constructor(id: unsigned) {
        super()
        this._id = id
        this.m_NameOverride = ``
    }
    abstract LoadObject(f: tChunkFile): tEntity | null
    SetNameOverride(Name: const_char_p) { this.m_NameOverride = Name }
    Load(file: tChunkFile) {
        assert(file.GetCurrentID() == this._id)
        this.LoadObject(file)
    }
    GetChunkID(): unsigned { return this._id }

    //interface IWrappedLoader {
    mpListenerCB: ChunkListenerCallback = RenderManager.GetRenderManager()
    mUserData: int = 0
    SetRegdListener(pListenerCB: ChunkListenerCallback, iUserData: int): void {
        //if (this.mpListenerCB != NULL) this.mpListenerCB.OnChunkLoaded(NULL, iUserData, 0)
        // this.mpListenerCB = pListenerCB
        // this.mUserData = iUserData
        this.mpListenerCB = RenderManager.GetRenderManager()
        this.mUserData = 0
    }
    ModRegdListener(pListenerCB: ChunkListenerCallback, iUserData: int): void {
        assert(pListenerCB == this.mpListenerCB)
        this.mUserData = iUserData
    }
    //end interface IWrappedLoader
}
class radLoadObject { }
class radLoadFileLoader extends radLoadObject { }
class radLoadRequest extends radLoadObject {}
class radLoadStream extends radLoadObject {}
class radLoadUpdatableRequest extends radLoadRequest {
    m_pStream: radLoadStream
    SetStream(stream: radLoadStream) { this.m_pStream = stream }
    GetStream(): radLoadStream { return new radLoadStream }
}
export class tFileHandler extends radLoadFileLoader {
    Load(file: tFile): tLoadStatus { return tLoadStatus.LOAD_OK }
    LoadFile(request: radLoadUpdatableRequest) {
        const file: tFile = request.GetStream() as tFile
        this.Load(file)
    }
}
export class tP3DFileHandler extends tFileHandler {
    nExtensions: int
    extensions: char[] = []

    constructor(n?: int) {
        super()
        this.nExtensions = 1
        this.extensions.push(`.p3d`)
    }
    AddHandler(l: tChunkHandler, chunkID?: unsigned): tChunkHandler {
        radLoad.AddDataLoader(l, chunkID ?? l.GetChunkID())
        return l
    }
    GetHandler(chunkID: unsigned): tChunkHandler {
        return radLoad.GetDataLoader(chunkID) as tChunkHandler
    }
    override Load(file: tFile): tLoadStatus {
        const chunkFile = new tChunkFile(file)
        let fileStatus = tLoadStatus.LOAD_OK

        assert(chunkFile.GetCurrentID() == Pure3D.DATA_FILE, `opps`)
        while (chunkFile.ChunksRemaining()) {
            chunkFile.BeginChunk()

            const h = radLoad.GetDataLoader(chunkFile.GetCurrentID()) as tChunkHandler
            if (h != NULL) {
                let status = h.Load(chunkFile)
                // if (fileStatus == tLoadStatus.LOAD_ERROR) fileStatus = status
            } else {
                console.log(
                    `Unrecognized chunk (${chunkFile.GetCurrentID()}) in ${chunkFile.GetCurrentID()}\n`
                )
            }
            chunkFile.EndChunk()
            assert(chunkFile.GetCurrentID() == Pure3D.DATA_FILE)
        }
        return fileStatus
    }

}
interface ChunkListenerCallback {
    OnChunkLoaded(ipEntity: tEntity, iUserData: int, ipChunkID: unsigned): void
}
export class AllWrappers {
    static mspInstance: AllWrappers
    mpLoaders: tSimpleChunkHandler[]//IWrappedLoader[]// [msNumWrappers]

    constructor() {
        this.mpLoaders = []
        for (let i = AllWrappers._enum.msNumWrappers - 1; i > - 1; i--) {
            // this.mpLoaders![i] = NULL
            this.mpLoaders.push(new FenceLoader)
        }
        this.CoupleAllLoaders()
    }
    static CreateInstance(): AllWrappers {
        // assert(AllWrappers.mspInstance == NULL)
        AllWrappers.mspInstance = new AllWrappers()
        return AllWrappers.mspInstance
    }
    static GetInstance(): AllWrappers {
        // assert(this.mspInstance != NULL)
        return this.mspInstance
    }
    mLoader(iIndex: int): /*IWrappedLoader*/tSimpleChunkHandler | null {
        assert(iIndex < AllWrappers._enum.msNumWrappers)
        return this.mpLoaders![iIndex]
    }
    mpLoader(iIndex: int): /*IWrappedLoader*/tSimpleChunkHandler | null {
        assert(iIndex < AllWrappers._enum.msNumWrappers)
        return this.mpLoaders![iIndex]
    }
    CoupleAllLoaders() {
        for (let i: int = AllWrappers._enum.msNumWrappers - 1; i > -1; i--) {
            // assert(this.mpLoaders[i] == NULL)
            switch (i) {
                // case AllWrappers._enum.msGeometry:
                //     this.mpLoaders[i] = new GeometryWrappedLoader()
                //     break
                // case AllWrappers._enum.msStaticPhys:
                //     this.mpLoaders[i] = new StaticPhysLoader()
                //     break
                // case AllWrappers._enum.msStaticEntity:
                //     this.mpLoaders[i] = new StaticEntityLoader()
                //     break
                case AllWrappers._enum.msTreeDSG:
                    this.mpLoaders[i] = new TreeDSGLoader
                    break
                case AllWrappers._enum.msFenceEntity:
                    this.mpLoaders[i] = new FenceLoader
                    break
                case AllWrappers._enum.msIntersectDSG:
                    this.mpLoaders[i] = new IntersectLoader
                    break
                // case AllWrappers._enum.msAnimCollEntity:
                //     this.mpLoaders[i] = new AnimCollLoader
                //     break
                // case AllWrappers._enum.msDynaPhys:
                //     this.mpLoaders[i] = new DynaPhysLoader
                //     break
                // case AllWrappers._enum.msInstStatEntity:
                //     this.mpLoaders[i] = new InstStatEntityLoader
                //     break
                // case AllWrappers._enum.msInstStatPhys:
                //     this.mpLoaders[i] = new InstStatPhysLoader
                //     break
                // case AllWrappers._enum.msLocator:
                //     this.mpLoaders[i] = new LocatorLoader
                //     break
                case AllWrappers._enum.msWorldSphere:
                    this.mpLoaders[i] = new WorldSphereLoader
                    break
                // case AllWrappers._enum.msRoadSegment:
                //     this.mpLoaders[i] = new RoadLoader
                //     break
                // case AllWrappers._enum.msPathSegment:
                //     this.mpLoaders[i] = new PathLoader
                //     break
                // case AllWrappers._enum.msBillboard:
                //     this.mpLoaders[i] = new BillboardWrappedLoader
                //     break
                // case AllWrappers._enum.msInstParticleSystem:
                //     this.mpLoaders[i] = new InstParticleSystemLoader
                //     break
                // case AllWrappers._enum.msBreakableObject:
                //     this.mpLoaders[i] = new BreakableObjectLoader
                //     break
                // case AllWrappers._enum.msAnimEntity:
                //     this.mpLoaders[i] = new AnimDSGLoader
                //     break
                // case AllWrappers._enum.msLensFlare:
                //     this.mpLoaders[i] = new LensFlareLoader
                //     break
                // case AllWrappers._enum.msAnimDynaPhys:
                //     this.mpLoaders[i] = new AnimDynaPhysLoader
                //     break
                // case AllWrappers._enum.msAnimDynaPhysWrapper:
                //     this.mpLoaders[i] = new AnimDynaPhysWrapperLoader
                //     break
                default: break
            }
        }
    }
}
export namespace AllWrappers {
    export enum _enum {
        // msGeometry,
        // msStaticEntity,
        // msStaticPhys,
        msTreeDSG,
        msFenceEntity,
        msIntersectDSG,
        // msAnimCollEntity,
        // msAnimEntity,
        // msDynaPhys,
        // msInstStatEntity,
        // msInstStatPhys,
        // msLocator,
        msWorldSphere,
        // msRoadSegment,
        // msPathSegment,
        // msBillboard,
        // msInstParticleSystem,
        // msBreakableObject,
        // msLensFlare,
        // msAnimDynaPhys,
        // msAnimDynaPhysWrapper,
        msNumWrappers
    }
}
export function GetAllWrappers() {
    return AllWrappers.GetInstance()
}
export class TreeDSGLoader extends tSimpleChunkHandler {//implements IWrappedLoader {
    constructor() { super(SRR2.ChunkID.TREE_DSG) }
    LoadObject(f: tChunkFile) {
        const nNodes = f.GetLong()
        const bounds: Bounds3f = new Bounds3f()
        bounds.mMin = read_vector(f.realFile) as Vector3f
        bounds.mMax = read_vector(f.realFile) as Vector3f

        const pSpatialTree = new SpatialTree()
        pSpatialTree.SetTo(nNodes, bounds)

        // let pCurNode: ContiguousBinNode<SpatialNode> = pSpatialTree.GetRoot()
        for (let i = 0; f.ChunksRemaining(); i++) {
            let pCurNode = pSpatialTree.mTreeNodes.mpData![i]

            f.BeginChunk()

            switch (f.GetCurrentID()) {
                case SRR2.ChunkID.CONTIGUOUS_BIN_NODE: {
                    pCurNode.SetSubTreeSize(f.GetLong())
                    pCurNode.LinkParent(f.GetLong())

                    f.BeginChunk()

                    pCurNode.mData.mSubDivPlane.mAxis = f.GetChar()
                    pCurNode.mData.mSubDivPlane.mPosn = f.GetFloat()
                    pCurNode.mData.mSEntityElems.mUseSize = f.GetLong()
                    pCurNode.mData.mSPhysElems.mUseSize = f.GetLong()
                    pCurNode.mData.mIntersectElems.mUseSize = f.GetLong()
                    pCurNode.mData.mDPhysElems.mUseSize = f.GetLong()
                    pCurNode.mData.mFenceElems.mUseSize = f.GetLong()
                    pCurNode.mData.mRoadSegmentElems.mUseSize = f.GetLong()
                    pCurNode.mData.mPathSegmentElems.mUseSize = f.GetLong()
                    pCurNode.mData.mAnimElems.mUseSize = f.GetLong() + 1
                    pCurNode.mData.mAnimCollElems.mUseSize = 1

                    f.EndChunk()

                    if (pCurNode.IsRoot()) {
                        pCurNode.mData.mSEntityElems.mUseSize += 100
                        pCurNode.mData.mDPhysElems.mUseSize += 10
                        pCurNode.mData.mAnimCollElems.mUseSize += 50
                        pCurNode.mData.mAnimElems.mUseSize += 60
                    }

                    break
                }
            }
            f.EndChunk()
        }
        this.mpListenerCB.OnChunkLoaded(pSpatialTree, this.mUserData, this._id)
        // console.log(pSpatialTree)
        return NULL
    }
}
export class FenceLoader extends tSimpleChunkHandler {//implements IWrappedLoader {
    static mFenceCount: unsigned_int = 0
    constructor() {
        super(SRR2.ChunkID.FENCE_DSG)
    }
    LoadObject(f: tChunkFile): tEntity {
        const pFenceDSG: FenceEntityDSG = new FenceEntityDSG

        while (f.ChunksRemaining()) {
            f.BeginChunk()
            switch (f.GetCurrentID()) {
                case SRR2.ChunkID.WALL: {
                    pFenceDSG.mStartPoint = read_vector(f.realFile)
                    pFenceDSG.mEndPoint = read_vector(f.realFile)
                    pFenceDSG.mNormal = read_vector(f.realFile)

                    const WorldBBox: BoxPts = RenderManager
                        .GetRenderManager()
                        .pWorldScene()
                        .mStaticTreeWalker
                        .rIthNode(0)
                        .mBBox
                    pFenceDSG.mStartPoint.y = WorldBBox.mBounds.mMin.y
                    pFenceDSG.mEndPoint.y = WorldBBox.mBounds.mMax.y
                    break
                }
                default:
                    break
            } // switch
            f.EndChunk()
        } // while
        this.mpListenerCB.OnChunkLoaded(pFenceDSG, this.mUserData, this._id)
        pFenceDSG.SetName(`FenceDSG${FenceLoader.mFenceCount++}`)
        return pFenceDSG
    }
}
export class IntersectLoader extends tSimpleChunkHandler {//implements IWrappedLoader {
    constructor() { super(SRR2.ChunkID.INTERSECT_DSG) }
    LoadObject(f: tChunkFile): tEntity {
        const pIDSG: IntersectDSG = new IntersectDSG()

        pIDSG.mTriIndices.Allocate(() => 0, f.GetLong())
        pIDSG.mTriIndices.AddUse(pIDSG.mTriIndices.mSize)

        for (let i = 0; i < pIDSG.mTriIndices.mSize; i++) {
            pIDSG.mTriIndices.mpData![i] = f.GetLong()
        }

        pIDSG.mTriPts.Allocate(() => new rmt.Vector(0, 0, 0), f.GetLong())
        pIDSG.mTriPts.AddUse(pIDSG.mTriPts.mSize)

        for (let i = 0; i < pIDSG.mTriPts.mSize; i++) {
            pIDSG.mTriPts.mpData![i] = read_vector(f.realFile)
        }

        pIDSG.mTriNorms.Allocate(() => new rmt.Vector(0, 0, 0), f.GetLong())
        pIDSG.mTriNorms.AddUse(pIDSG.mTriNorms.mSize)

        for (let i = 0; i < pIDSG.mTriNorms.mSize; i++) {
            pIDSG.mTriNorms.mpData![i] = read_vector(f.realFile)
        }

        for (let i = 0; f.ChunksRemaining(); i++) {
            f.BeginChunk()
            switch (f.GetCurrentID()) {
                case Pure3D.Mesh.BOX: {
                    const minx: float = f.GetFloat()
                    const miny: float = f.GetFloat()
                    const minz: float = f.GetFloat()
                    const maxx: float = f.GetFloat()
                    const maxy: float = f.GetFloat()
                    const maxz: float = f.GetFloat()

                    pIDSG.SetBoundingBox(minx, miny, minz, maxx, maxy, maxz)
                    break
                }

                case Pure3D.Mesh.SPHERE: {
                    const cx: float = f.GetFloat()
                    const cy: float = f.GetFloat()
                    const cz: float = f.GetFloat()
                    const r: float = f.GetFloat()

                    pIDSG.SetBoundingSphere(cx, cy, cz, r)
                    break
                }

                case SRR2.ChunkID.TERRAIN_TYPE: {
                    const version: long = f.GetLong()
                    assert(version == 0)
                    const size: long = f.GetLong()
                    pIDSG.mTerrainType.Allocate(() => 0, size)
                    pIDSG.mTerrainType.AddUse(size)
                    pIDSG.mTerrainType.mpData![0] = f.realFile.u8()

                    break
                }
                default: break
            } // switch
            f.EndChunk()
        }
        this.mpListenerCB.OnChunkLoaded(pIDSG, this.mUserData, this._id)
        return /*NULL//*/pIDSG
    }
}
export class WorldSphereLoader extends tSimpleChunkHandler {//implements IWrappedLoader
    // mpCompDLoader
    // mpMCLoader
    // mpBillBoardQuadLoader
    // mpAnimLoader
    // mpSkelLoader
    // mpFCLoader
    // mpLensFlareLoader

    constructor() {
        super(SRR2.ChunkID.WORLD_SPHERE_DSG)
        // this.mpCompDLoader = new tCompositeDrawableLoader
        // this.mpMCLoader = new tMultiControllerLoader
        // this.mpBillBoardQuadLoader = new tBillboardQuadGroupLoader
        // this.mpAnimLoader = new tAnimationLoader
        // this.mpSkelLoader = new tSkeletonLoader
        // this.mpFCLoader = new tFrameControllerLoader
        // this.mpLensFlareLoader = new LensFlareLoader

        // this.mpListenerCB = NULL
        // this.mUserData = -1
    }
    LoadObject(f: tChunkFile): tEntity | null {
        /*
        const name = f.GetPString()

        const version: int = f.GetLong()

        const pWorldSphereDSG = new WorldSphereDSG
        pWorldSphereDSG.SetName(name)

        const pMC: tMultiController | null = NULL

        pWorldSphereDSG.SetNumMeshes(f.GetLong())

        pWorldSphereDSG.SetNumBillBoardQuadGroups( f.GetLong())

        while(f.ChunksRemaining())
        {      
            f.BeginChunk()
            const id: int = f.GetCurrentID()
            switch(f.GetCurrentID())
            {
                case Pure3D.Mesh.MESH: {
                    const pGeoLoader = AllWrappers.GetInstance().mpLoader(AllWrappers._enum.msGeometry) as GeometryWrappedLoader
                    const pGeo = pGeoLoader.LoadObject(f) as tGeometry
                    pWorldSphereDSG.AddMesh(pGeo)
                    break
                }
                case P3D_COMPOSITE_DRAWABLE: {
                    const pCompDraw = this.mpCompDLoader.LoadObject(f) as tCompositeDrawable
                    pWorldSphereDSG.SetCompositeDrawable(pCompDraw)	
                }
                break
                case P3D_SKELETON: {
                    const pSkeleton = this.mpSkelLoader->LoadObject(f) as tSkeleton
                    assert(pSkeleton != NULL)
                    break
                }
                case SRR2.ChunkID.LENS_FLARE_DSG: {
                    const pLensFlare = this.mpLensFlareLoader.LoadObject(f) as LensFlareDSG
                    pWorldSphereDSG.SetFlare(pLensFlare)
                }
                break
                case Pure3D.Animation.AnimationData.ANIMATION: {
                    const pAnimation = this.mpAnimLoader.LoadObject(f) as tAnimation
                    assert(pAnimation != NULL )		
                    break
                }
                case Pure3D.Animation.FrameControllerData.FRAME_CONTROLLER: {
                    const pFC = this.mpFCLoader.LoadObject(f) as tFrameController
                    pFC.SetCycleMode(FORCE_CYCLIC)
                    assert(pFC != NULL)
                }
                break
                case P3D_MULTI_CONTROLLER: {
                    const pMC = this.mpMCLoader.LoadObject(f) as tMultiController
                    assert(pMC != NULL)
                    pWorldSphereDSG.SetMultiController(pMC)
                    break
                }
                case Pure3D.BillboardObject.QUAD_GROUP: {
                    // BillboardWrappedLoader.OverrideLoader(true)
                    const pBBQLoader = AllWrappers.GetInstance().mpLoader(AllWrappers._enum.msBillboard) as BillboardWrappedLoader
                    const pGroup = pBBQLoader.LoadObject(f) as tBillboardQuadGroup
                    pWorldSphereDSG.AddBillBoardQuadGroup( pGroup )
                    // BillboardWrappedLoader.OverrideLoader( false )
                    break
                }
                default:
                    break
            } // switch
            f.EndChunk()
        } // while
        
        const pFlare: LensFlareDSG | null = NULL
        
        this.mpListenerCB.OnChunkLoaded(pWorldSphereDSG, this.mUserData, this._id)
        return pWorldSphereDSG
        */
        return new tEntity
    }
}
