import { read_vector } from './reader.js'
import { tChunkFile } from './chunkfile.js'
import { ContiguousBinNode, SpatialTree, SpatialNode } from './spatial.js'
import { Bounds3f, FixedArray, AAPlane3f, tEntity } from './rad_util.js'

import { SRR2 } from './srrchunks.js'

export class TreeDSGLoader extends tEntity {
    public load_object(f: tChunkFile) {
        const nNodes = f.GetLong()

        const bounds: Bounds3f = {
            mMin: read_vector(f.realFile),
            mMax: read_vector(f.realFile),
        }

        const pSpatialTree = new SpatialTree()
        pSpatialTree.SetTo(nNodes, bounds)

        const pCurNode: ContiguousBinNode<SpatialNode> = pSpatialTree.GetRoot()

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
}
