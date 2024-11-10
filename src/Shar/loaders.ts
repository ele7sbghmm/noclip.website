import { assert } from '../util.js'

import { read_vector } from './reader.js'
import { tChunkFile } from './file.js'
import { ContiguousBinNode, SpatialTree, SpatialNode } from './spatial.js'
import { Bounds3f, tEntity } from './rad_util.js'
import { FenceEntityDSG, IntersectDSG } from './dsg.js'

import { SRR2 } from './srrchunks.js'

const NULL = null
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
interface IWrappedLoader { }
export class AllWrappers {
    static mspInstance: AllWrappers | null = NULL
    mpLoaders: (IWrappedLoader | null)[]// msNumWrappers

    constructor() {
        for (let i = AllWrappers.Enum.msNumWrappers - 1; i > - 1; i--) {
            this.mpLoaders[i] = NULL
        }
        this.CoupleAllLoaders()
    }
    public static CreateInstance(): AllWrappers {
        assert(AllWrappers.mspInstance == NULL)
        AllWrappers.mspInstance = new AllWrappers()
        return AllWrappers.mspInstance
    }
    public static GetInstance(): AllWrappers {
        assert(this.mspInstance != NULL)
        return this.mspInstance
    }
    public CoupleAllLoaders() {
        for (let i: int = AllWrappers.Enum.msNumWrappers - 1; i > -1; i--) {
            assert(this.mpLoaders[i] == NULL)

            switch (i) {
                // case AllWrappers.Enum.msGeometry:
                //     this.mpLoaders[i] = new GeometryWrappedLoader()
                //     break
                // case AllWrappers.Enum.msStaticPhys:
                //     this.mpLoaders[i] = new StaticPhysLoader()
                //     break
                // case AllWrappers.Enum.msStaticEntity:
                //     this.mpLoaders[i] = new StaticEntityLoader()
                //     break
                case AllWrappers.Enum.msTreeDSG:
                    this.mpLoaders[i] = new TreeDSGLoader()
                    break
                case AllWrappers.Enum.msFenceEntity:
                    this.mpLoaders[i] = new FenceLoader()
                    break
                case AllWrappers.Enum.msIntersectDSG:
                    this.mpLoaders[i] = new IntersectLoader()
                    break
                // case AllWrappers.Enum.msAnimCollEntity:
                //     this.mpLoaders[i] = new AnimCollLoader()
                //     break
                // case AllWrappers.Enum.msDynaPhys:
                //     this.mpLoaders[i] = new DynaPhysLoader()
                //     break
                // case AllWrappers.Enum.msInstStatEntity:
                //     this.mpLoaders[i] = new InstStatEntityLoader()
                //     break
                // case AllWrappers.Enum.msInstStatPhys:
                //     this.mpLoaders[i] = new InstStatPhysLoader()
                //     break
                // case AllWrappers.Enum.msLocator:
                //     this.mpLoaders[i] = new LocatorLoader()
                //     break
                // case AllWrappers.Enum.msWorldSphere:
                //     this.mpLoaders[i] = new WorldSphereLoader()
                //     break
                // case AllWrappers.Enum.msRoadSegment:
                //     this.mpLoaders[i] = new RoadLoader()
                //     break
                // case AllWrappers.Enum.msPathSegment:
                //     this.mpLoaders[i] = new PathLoader()
                //     break
                // case AllWrappers.Enum.msBillboard:
                //     this.mpLoaders[i] = new BillboardWrappedLoader()
                //     break
                // case AllWrappers.Enum.msInstParticleSystem:
                //     this.mpLoaders[i] = new InstParticleSystemLoader()
                //     break
                // case AllWrappers.Enum.msBreakableObject:
                //     this.mpLoaders[i] = new BreakableObjectLoader()
                //     break
                // case AllWrappers.Enum.msAnimEntity:
                //     this.mpLoaders[i] = new AnimDSGLoader()
                //     break
                // case AllWrappers.Enum.msLensFlare:
                //     this.mpLoaders[i] = new LensFlareLoader()
                //     break
                // case AllWrappers.Enum.msAnimDynaPhys:
                //     this.mpLoaders[i] = new AnimDynaPhysLoader()
                //     break
                // case AllWrappers.Enum.msAnimDynaPhysWrapper:
                //     this.mpLoaders[i] = new AnimDynaPhysWrapperLoader()
                // break
                default: break
            }
        }
    }
}
export namespace AllWrappers {
    export enum Enum {
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
export class TreeDSGLoader extends tSimpleChunkHandler {
    public id: number

    constructor() {
        super(SRR2.ChunkID.TREE_DSG)
    }
    public LoadObject(f: tChunkFile) {

        const nNodes = f.GetLong()
        const bounds: Bounds3f = {
            mMin: read_vector(f.realFile),
            mMax: read_vector(f.realFile)
        }

        const pSpatialTree = new SpatialTree()
        pSpatialTree.SetTo(nNodes, bounds)

        let pCurNode: ContiguousBinNode<SpatialNode> = pSpatialTree.GetRoot()
        for (let i = 0; f.ChunksRemaining(); i++) {
            pCurNode = pSpatialTree.mTreeNodes.mpData[i]

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

                    // BoxPts WorldBBox = GetRenderManager()->pWorldScene()->mStaticTreeWalker.rIthNode(0).mBBox
                    // pFenceDSG.mStartPoint.y = WorldBBox.mBounds.mMin.y
                    // pFenceDSG.mEndPoint.y = WorldBBox.mBounds.mMax.y

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
    LoadObject(f: tChunkFile): iEntity { }
}
