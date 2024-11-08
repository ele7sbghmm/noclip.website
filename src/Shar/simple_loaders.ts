import { read_vector } from './reader.js'
import { Vector } from './math.js'

import { SRR2 } from './srrchunks.js'
import { tChunkFile } from './chunkfile.js'
import { SpatialNode } from './spatial.js'

export class simple_TreeDSGLoader {
    public id: number
    public nNodes: number
    public pSpatialTree: SpatialNode[]
    public bounds: Vector[]

    public LoadObject(f: tChunkFile) {
        this.nNodes = f.GetLong()
        this.bounds = [read_vector(f.realFile), read_vector(f.realFile)]

        let pCurNode = 0
        for (let i = 0; f.ChunksRemaining(); i++, pCurNode++) {
            f.BeginChunk()

            switch (f.GetCurrentID()) {
                case SRR2.ChunkID.CONTIGUOUS_BIN_NODE: {
                    this.pSpatialTree[pCurNode]._SetSubTreeSize = f.GetLong()
                    this.pSpatialTree[pCurNode]._LinkParent = f.GetLong()

                    f.BeginChunk()

                    this.pSpatialTree[pCurNode].mSubDivPlane.mAxis = f.GetChar()
                    this.pSpatialTree[pCurNode].mSubDivPlane.mPosn = f.GetFloat()
                    this.pSpatialTree[pCurNode].mSEntityElems.mUseSize = f.GetLong()
                    this.pSpatialTree[pCurNode].mSPhysElems.mUseSize = f.GetLong()
                    this.pSpatialTree[pCurNode].mIntersectElems.mUseSize = f.GetLong()
                    this.pSpatialTree[pCurNode].mDPhysElems.mUseSize = f.GetLong()
                    this.pSpatialTree[pCurNode].mFenceElems.mUseSize = f.GetLong()
                    this.pSpatialTree[pCurNode].mRoadSegmentElems.mUseSize = f.GetLong()
                    this.pSpatialTree[pCurNode].mPathSegmentElems.mUseSize = f.GetLong()
                    this.pSpatialTree[pCurNode].mAnimElems.mUseSize = f.GetLong() + 1
                    this.pSpatialTree[pCurNode].mAnimCollElems.mUseSize = 1

                    f.EndChunk()

                    if (this.pSpatialTree[pCurNode].IsRoot()) {
                        this.pSpatialTree[pCurNode].mSEntityElems.mUseSize += 100
                        this.pSpatialTree[pCurNode].mDPhysElems.mUseSize += 10
                        this.pSpatialTree[pCurNode].mAnimCollElems.mUseSize += 50
                        this.pSpatialTree[pCurNode].mAnimElems.mUseSize += 60
                    }

                    break
                }
            }
            f.EndChunk()
        }

        //mpListenerCB.OnChunkLoaded(pSpatialTree, mUserData, _id)
        return this.pSpatialTree
    }
}

