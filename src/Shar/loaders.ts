import { read_vector } from './reader.js'
import { tChunkFile } from './chunkfile.js'
import { ContiguousBinNode, SpatialTree, SpatialNode } from './spatial.js'
import { Bounds3f, tEntity } from './rad_util.js'

import { SRR2 } from './srrchunks.js'

enum tLoadStatus { LOAD_OK, LOAD_ERROR }
abstract class tSimpleChunkHandler {
    _id: number
    status: tLoadStatus
    abstract LoadObject(f: tChunkFile): tEntity
}
export class TreeDSGLoader extends tSimpleChunkHandler {
    public LoadObject(f: tChunkFile): tEntity {
        const nNodes = f.GetLong()

        const bounds: Bounds3f = {
            mMin: read_vector(f.realFile),
            mMax: read_vector(f.realFile),
        }

        const pSpatialTree = new SpatialTree()
        pSpatialTree.SetTo(nNodes, bounds)

        const pCurNode: ContiguousBinNode<SpatialNode>[] = pSpatialTree.GetRoot()

        for (let i = 0; f.ChunksRemaining(); i++) {
            f.BeginChunk()

            switch (f.GetCurrentID()) {
                case SRR2.ChunkID.CONTIGUOUS_BIN_NODE: {
                    pCurNode[i].SetSubTreeSize(f.GetLong())
                    pCurNode[i].LinkParent(f.GetLong())

                    f.BeginChunk()

                    pCurNode[i].mData.mSubDivPlane.mAxis = f.GetChar()
                    pCurNode[i].mData.mSubDivPlane.mPosn = f.GetFloat()
                    pCurNode[i].mData.mSEntityElems.mUseSize = f.GetLong()
                    pCurNode[i].mData.mSPhysElems.mUseSize = f.GetLong()
                    pCurNode[i].mData.mIntersectElems.mUseSize = f.GetLong()
                    pCurNode[i].mData.mDPhysElems.mUseSize = f.GetLong()
                    pCurNode[i].mData.mFenceElems.mUseSize = f.GetLong()
                    pCurNode[i].mData.mRoadSegmentElems.mUseSize = f.GetLong()
                    pCurNode[i].mData.mPathSegmentElems.mUseSize = f.GetLong()
                    pCurNode[i].mData.mAnimElems.mUseSize = f.GetLong() + 1
                    pCurNode[i].mData.mAnimCollElems.mUseSize = 1

                    f.EndChunk()

                    if (pCurNode[i].IsRoot()) {
                        pCurNode[i].mData.mSEntityElems.mUseSize += 100
                        pCurNode[i].mData.mDPhysElems.mUseSize += 10
                        pCurNode[i].mData.mAnimCollElems.mUseSize += 50
                        pCurNode[i].mData.mAnimElems.mUseSize += 60
                    }

                    break
                }
            }
            f.EndChunk()
        }

        //mpListenerCB.OnChunkLoaded(pSpatialTree, mUserData, _id)
        return pSpatialTree
    }
}

