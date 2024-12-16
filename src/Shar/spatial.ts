import { AnimCollisionEntityDSG, AnimEntityDSG, DynaPhysDSG, FenceEntityDSG, IntersectDSG, PathSegment, RoadSegment, StaticEntityDSG, StaticPhysDSG, TriggerVolume } from "./dsg.js"
import { AAPlane3f, NodeSwapArray, BoxPts, SwapArray, Bounds3f, int, FixedArray, ISpatialProxyAA, float, tEntity } from "./rad_util.js"

export class SpatialNode {
    mSubDivPlane      = new AAPlane3f
 
    mSEntityElems     = new NodeSwapArray<StaticEntityDSG>(() => new StaticEntityDSG)
    mSPhysElems       = new SwapArray<StaticPhysDSG>(() => new StaticPhysDSG)
    mIntersectElems   = new SwapArray<IntersectDSG>(() => new IntersectDSG)
    mDPhysElems       = new NodeSwapArray<DynaPhysDSG>(() => new DynaPhysDSG)
    mFenceElems       = new SwapArray<FenceEntityDSG>(() => new FenceEntityDSG)
    mAnimCollElems    = new NodeSwapArray<AnimCollisionEntityDSG>(() => new AnimCollisionEntityDSG)
    mAnimElems        = new NodeSwapArray<AnimEntityDSG>(() => new AnimEntityDSG)
    mTrigVolElems     = new SwapArray<TriggerVolume>(() => new TriggerVolume)
    mRoadSegmentElems = new SwapArray<RoadSegment>(() => new RoadSegment)
    mPathSegmentElems = new SwapArray<PathSegment>(() => new PathSegment)

    mBBox             = new BoxPts
}
export class ContiguousBinNode<T> {
    static msNoParent = 0 // enum
    mData: T
    mSubTreeSize: int
    mParentOffset: int
    constructor(
        public _parent_tree: SpatialTree | null,
        public _index = 0,
        factory?: () => T,
    ) {
        if (factory) this.mData = factory()
    }

    LinkParent(iParentOffset: number) { this.mParentOffset = iParentOffset }
    SetSubTreeSize(iSubTreeSize: number) { this.mSubTreeSize = iSubTreeSize }
    IsRoot() { return this.mParentOffset == ContiguousBinNode.msNoParent }
    GetSubTreeSize() { return this.mSubTreeSize }
    Parent() { return this.mParentOffset }
    LChild() { return this._lc() } // { return this + 1 }
    LChildOffset() { return this._lco() } // { return 1 }
    RChild() { return this._rc() } // { return (this + 1).RSibling() }
    RChildOffset() { return this._rco() } // { return this.LChild().RSiblingOffset() + 1 }
    LSibling() { return this._ls() }
    RSibling() { return this._rs() }
    RSiblingOffset() { this._rso() }

    _gn(i: number) { return this._parent_tree!.mTreeNodes.mpData![i] }
    _pi() { return this._index + this.mParentOffset }
    _p() { return this._gn(this._pi()) }
    _lco() { return 1 }
    _rco() { return this._lc()._rso() + 1 }
    _lso() { return this.Parent() + 1 }
    _rso() { return this.mSubTreeSize + 1 }
    _lci() { return this._index + 1 }
    _rci() { return this._index + this._rco() + 1 }
    _lsi() { return this._index + this._pi() + 1 }
    _rsi() { return this._index + this._rso() + 1 }
    _lc() { return this._gn(this._lci()) }
    _rc() { return this._gn(this._rci()) }
    _ls() { return this._gn(this._lsi()) }
    _rs() { return this._gn(this._rsi()) }
}
export class SpatialTree extends tEntity {
    mTreeNodes: FixedArray<ContiguousBinNode<SpatialNode>>
    mTreeBounds: Bounds3f

    GetRoot(): ContiguousBinNode<SpatialNode> {
        return this.mTreeNodes.mpData![0]
    }
    SetTo(iNumNodes: number, iTreeBounds: Bounds3f) {
        this.mTreeNodes.Allocate(
            () => new ContiguousBinNode<SpatialNode>(this),
            iNumNodes
        )
        this.mTreeBounds = iTreeBounds
    }
    GetBounds() { return this.mTreeBounds }
}
type tMark = int
export class SpatialTreeIter {
    mCurNodes: SwapArray<SpatialNode>
    mCurAlwaysVisNodes: SwapArray<SpatialNode>
    mpCurNodeList: SwapArray<SpatialNode>
    mpRootNode: ContiguousBinNode<SpatialNode>
    mpCurNode: ContiguousBinNode<SpatialNode>
    mCurNodeOffset: int
    mNodeMarks: FixedArray<tMark>
    mCurMarkFilter: tMark
    mCurNodeI: int
    mBBox: BoxPts
    _parent_array: FixedArray<ContiguousBinNode<SpatialNode>>

    rBBox() { return this.mBBox }
    MarkTree() { }
    AndTree(iMark: tMark) {
        if (iMark == 0) {
            this.mCurAlwaysVisNodes.ClearUse()
        }
        for (let i = this.mNodeMarks.mSize - 1; i >= 0; i--) {
            this.mNodeMarks.mpData![i] &= iMark
        }
    }
    MoveToNext(ibIncludeVis: boolean) {
        this.mCurNodeI++
        if (ibIncludeVis
            && (this.mCurNodeI >= this.mpCurNodeList.mUseSize)
            && (this.mpCurNodeList != this.mCurAlwaysVisNodes)
        ) {
            this.mpCurNodeList = this.mCurAlwaysVisNodes
            this.mCurNodeI = 0
        }
    }
    SetToRoot(irTree: SpatialTree) {
        this.mpRootNode = irTree.GetRoot()
        
        this.mBBox.SetTo(irTree.GetBounds())

        this.mNodeMarks.Allocate(() => 0, this.mpRootNode.GetSubTreeSize() + 1)
        this.mCurNodes.Allocate(() => new SpatialNode(), this.mpRootNode.GetSubTreeSize() + 1)
        this.mCurAlwaysVisNodes.Allocate(() => new SpatialNode(), this.mpRootNode.GetSubTreeSize() + 1)
        this.mpCurNodeList = this.mCurNodes
    }
    rIthNode(iIth: int): SpatialNode {
        // return (mpRootNode+iIth)->mData
        return this._parent_array.mpData![iIth].mData
    }
    NumNodes(): int {
        return this.mpRootNode.GetSubTreeSize() + 1
    }
    BuildBBoxes(iBoxPts: BoxPts, iCurNodeOffset: int = 0) {
        // const pCurNode: ContiguousBinNode<SpatialNode> = (mpRootNode + iCurNodeOffset)
        const pCurNode: ContiguousBinNode<SpatialNode>
            = this._parent_array.mpData![iCurNodeOffset]

        pCurNode.mData.mBBox = iBoxPts

        if (pCurNode.GetSubTreeSize() > 0) {
            iBoxPts.CutOffGT(pCurNode.mData.mSubDivPlane)
            this.BuildBBoxes(iBoxPts, iCurNodeOffset + pCurNode.LChildOffset())

            iBoxPts = pCurNode.mData.mBBox
            iBoxPts.CutOffLT(pCurNode.mData.mSubDivPlane)
            this.BuildBBoxes(iBoxPts, iCurNodeOffset + pCurNode.RChildOffset())
        }
    }
    rSeekNode(irVolume: ISpatialProxyAA, iCurNodeOffset: int = 0): SpatialNode {
        // const pCurNode: ContiguousBinNode<SpatialNode> = (mpRootNode + iCurNodeOffset)
        const pCurNode: ContiguousBinNode<SpatialNode>
            = this._parent_array.mpData![iCurNodeOffset]

        if (pCurNode.GetSubTreeSize() > 0) {
            const PlaneVolResult: float = irVolume.CompareTo__AAPlane3f(pCurNode.mData.mSubDivPlane)

            if (PlaneVolResult > 0.0) {
                 // The Plane is greater than TVolume in Posn, so
                 // TVolume is in the LT Partitiion..
                return this.rSeekNode(irVolume, iCurNodeOffset + pCurNode.LChildOffset())
            } else {
                if (PlaneVolResult < 0.0) {
                     // The Plane is less han TVolume in Posn, so
                     // TVolume is in the GT Partitiion..
                    return this.rSeekNode(irVolume, iCurNodeOffset + pCurNode.RChildOffset())
                } else {
                     //  PlaneVolResult == 0
                    return pCurNode.mData
                }
            }
        } else {
            return pCurNode.mData
        }
    }
}