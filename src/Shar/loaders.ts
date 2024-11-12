import { assert } from '../util.js'

import { rmt } from './math.js'
import { read_vector } from './reader.js'
import { tChunkFile } from './file.js'
import { SpatialTree } from './spatial.js'
import { BoxPts, Bounds3f, tEntity } from './rad_util.js'
import { FenceEntityDSG, IntersectDSG } from './dsg.js'
import { RenderManager } from './renderer.js'

import { SRR2 } from './srrchunks.js'
import { Pure3D } from './chunkids.js'

const NULL = null
type float = number
type long = number
type int = number
type unsigned = number
type const_char_p = string

enum tLoadStatus { LOAD_OK, LOAD_ERROR }
abstract class tSimpleChunkHandler {
    _id: unsigned
    m_NameOverride: const_char_p
    constructor(id: unsigned) {
        this._id = id
        this.m_NameOverride = ``
    }
    abstract LoadObject(f: tChunkFile): tEntity | null
    SetNameOverride(Name: const_char_p) { this.m_NameOverride = Name }
    Load(file: tChunkFile) {
        assert(file.GetCurrentID() == this._id)
        this.LoadObject(file)
    }
}
interface ChunkListenerCallback {
    OnChunkLoaded(ipEntity: tEntity, iUserData: int, ipChunkID: unsigned): void
}
interface IWrappedLoader {
    mpListenerCB: ChunkListenerCallback
    mUserData: int
    // SetRegdListener(pListenerCB: ChunkListenerCallback, iUserData: int): void {
    //     // if (this.mpListenerCB != NULL) this.mpListenerCB.OnChunkLoaded(NULL, iUserData, 0)
    //     this.mpListenerCB = pListenerCB
    //     this.mUserData = iUserData
    // }
    // ModRegdListener(pListenerCB: ChunkListenerCallback, iUserData: int): void {
    //     assert(pListenerCB == this.mpListenerCB)
    //     this.mUserData = iUserData
    // }
}
export class AllWrappers {
    static mspInstance: AllWrappers
    mpLoaders: IWrappedLoader[]// msNumWrappers

    constructor() {
        for (let i = AllWrappers._enum.msNumWrappers - 1; i > - 1; i--) {
            this.mpLoaders[i] = NULL
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
                    // this.mpLoaders[i] = new TreeDSGLoader()
                    this.mpLoaders.push(new TreeDSGLoader())
                    break
                case AllWrappers._enum.msFenceEntity:
                    this.mpLoaders[i] = new FenceLoader()
                    break
                case AllWrappers._enum.msIntersectDSG:
                    this.mpLoaders[i] = new IntersectLoader()
                    break
                // case AllWrappers._enum.msAnimCollEntity:
                //     this.mpLoaders[i] = new AnimCollLoader()
                //     break
                // case AllWrappers._enum.msDynaPhys:
                //     this.mpLoaders[i] = new DynaPhysLoader()
                //     break
                // case AllWrappers._enum.msInstStatEntity:
                //     this.mpLoaders[i] = new InstStatEntityLoader()
                //     break
                // case AllWrappers._enum.msInstStatPhys:
                //     this.mpLoaders[i] = new InstStatPhysLoader()
                //     break
                // case AllWrappers._enum.msLocator:
                //     this.mpLoaders[i] = new LocatorLoader()
                //     break
                // case AllWrappers._enum.msWorldSphere:
                //     this.mpLoaders[i] = new WorldSphereLoader()
                //     break
                // case AllWrappers._enum.msRoadSegment:
                //     this.mpLoaders[i] = new RoadLoader()
                //     break
                // case AllWrappers._enum.msPathSegment:
                //     this.mpLoaders[i] = new PathLoader()
                //     break
                // case AllWrappers._enum.msBillboard:
                //     this.mpLoaders[i] = new BillboardWrappedLoader()
                //     break
                // case AllWrappers._enum.msInstParticleSystem:
                //     this.mpLoaders[i] = new InstParticleSystemLoader()
                //     break
                // case AllWrappers._enum.msBreakableObject:
                //     this.mpLoaders[i] = new BreakableObjectLoader()
                //     break
                // case AllWrappers._enum.msAnimEntity:
                //     this.mpLoaders[i] = new AnimDSGLoader()
                //     break
                // case AllWrappers._enum.msLensFlare:
                //     this.mpLoaders[i] = new LensFlareLoader()
                //     break
                // case AllWrappers._enum.msAnimDynaPhys:
                //     this.mpLoaders[i] = new AnimDynaPhysLoader()
                //     break
                // case AllWrappers._enum.msAnimDynaPhysWrapper:
                //     this.mpLoaders[i] = new AnimDynaPhysWrapperLoader()
                // break
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
        // msWorldSphere,
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
export class TreeDSGLoader extends tSimpleChunkHandler implements IWrappedLoader {
    constructor() { super(SRR2.ChunkID.TREE_DSG) }
    LoadObject(f: tChunkFile) {
        const nNodes = f.GetLong()
        const bounds: Bounds3f = new Bounds3f()
        bounds.mMin = read_vector(f.realFile)
        bounds.mMax = read_vector(f.realFile)

        const pSpatialTree = new SpatialTree()
        pSpatialTree.SetTo(nNodes, bounds)

        // let pCurNode: ContiguousBinNode<SpatialNode> = pSpatialTree.GetRoot()
        for (let i = 0; f.ChunksRemaining(); i++) {
            let pCurNode = pSpatialTree.mTreeNodes.mpData[i]

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
        //mpListenerCB.OnChunkLoaded(pSpatialTree, mUserData, _id)
        console.log(pSpatialTree)
        return NULL
    }
}
class FenceLoader extends tSimpleChunkHandler implements IWrappedLoader {
    constructor() { super(SRR2.ChunkID.FENCE_DSG) }
    LoadObject(f: tChunkFile): tEntity {
        const pFenceDSG: FenceEntityDSG = new FenceEntityDSG()

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

        // mpListenerCB->OnChunkLoaded( pFenceDSG, mUserData, _id )
        pFenceDSG.SetName(`FenceDSG${mFenceCount++}`)
        return pFenceDSG
    }
}
class IntersectLoader extends tSimpleChunkHandler implements IWrappedLoader {
    constructor() { super(SRR2.ChunkID.INTERSECT_DSG) }
    LoadObject(f: tChunkFile): tEntity {
        const pIDSG: IntersectDSG = new IntersectDSG()

        pIDSG.mTriIndices.Allocate(() => 0, f.GetLong());
        pIDSG.mTriIndices.AddUse(pIDSG.mTriIndices.mSize);

        for (let i = 0; i < pIDSG.mTriIndices.mSize; i++) {
            pIDSG.mTriIndices.mpData[i] = f.GetLong()
        }

        pIDSG.mTriPts.Allocate(() => new rmt.Vector(0, 0, 0), f.GetLong())
        pIDSG.mTriPts.AddUse(pIDSG.mTriPts.mSize)

        for (let i = 0; i < pIDSG.mTriPts.mSize; i++) {
            pIDSG.mTriPts.mpData[i] = read_vector(f.realFile)
        }

        pIDSG.mTriNorms.Allocate(() => new rmt.Vector(0, 0, 0), f.GetLong())
        pIDSG.mTriNorms.AddUse(pIDSG.mTriNorms.mSize)

        for (let i = 0; i < pIDSG.mTriNorms.mSize; i++) {
            pIDSG.mTriNorms.mpData[i] = read_vector(f.realFile)
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

                    pIDSG.SetBoundingBox(minx, miny, minz, maxx, maxy, maxz);
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
                    pIDSG.mTerrainType[0] = f.realFile.u8()

                    break
                }

                default: break
            } // switch
            f.EndChunk()
        }
        this.mpListenerCB.OnChunkLoaded(pIDSG, this.mUserData, this._id)
        return /*NULL;//*/pIDSG;
    }
}
