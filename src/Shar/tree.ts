import { Reader, read_vector, read_matrix } from './reader.js'
import { tChunkFile } from './chunkfile.js'
import { SpatialNode } from './spatialnode.js'

import { SRR2 } from './srrchunks.js'

class Tree {
    public load_object(f: tChunkFile) {
        let mData = f.GetLong()

        let mMin = read_vector(f.realFile)
        let mMax = read_vector(f.realFile)

        //SpatialTree* pSpatialTree = new SpatialTree
        //pSpatialTree->SetTo(nNodes,bounds)
        //ContiguousBinNode< SpatialNode >* pCurNode=pSpatialTree->GetRoot()
        //
        let pCurMode: any[][]

        switch (f.GetCurrentID()) {
            case SRR2.ChunkID.CONTIGUOUS_BIN_NODE: {
                let pCurNode = new SpatialNode()

                //this.pCurNode.SetSubTreeSize(f.GetLong())
                //this.pCurNode.LinkParent(f.GetLong())
                f.GetLong()
                f.GetLong()

                f.BeginChunk()

                pCurNode.mSubDivPlane.mAxis = f.GetChar()
                pCurNode.mSubDivPlane.mPosn = f.GetFloat()
                pCurNode.mSEntityElems.mUseSize = f.GetLong()
                pCurNode.mSPhysElems.mUseSize = f.GetLong()
                pCurNode.mIntersectElems.mUseSize = f.GetLong()
                pCurNode.mDPhysElems.mUseSize = f.GetLong()
                pCurNode.mFenceElems.mUseSize = f.GetLong()
                pCurNode.mRoadSegmentElems.mUseSize = f.GetLong()
                pCurNode.mPathSegmentElems.mUseSize = f.GetLong()
                pCurNode.mAnimElems.mUseSize = f.GetLong() + 1
                pCurNode.mAnimCollElems.mUseSize = 1

                f.EndChunk()

                if (pCurNode.IsRoot()) {
                    pCurNode.mSEntityElems.mUseSize += 100
                    pCurNode.mDPhysElems.mUseSize += 10
                    pCurNode.mAnimCollElems.mUseSize += 50
                    pCurNode.mAnimElems.mUseSize += 60
                }

                break
            }
        }
    }
}
