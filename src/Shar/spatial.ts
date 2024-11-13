import { assert } from '../util.js'
import { AnimCollisionEntityDSG, AnimEntityDSG, DynaPhysDSG, FenceEntityDSG, IntersectDSG, PathSegment, RoadSegment, StaticEntityDSG, StaticPhysDSG, TriggerVolume } from './dsg.js'
import { AAPlane3f, Bounds3f, BoxPts, FixedArray, ISpatialProxyAA, NodeSwapArray, SwapArray, tEntity } from './rad_util.js'

type float = number
type int = number

export class SpatialNode {
    mSubDivPlane: AAPlane3f = { mAxis: 0, mPosn: 0 }

    mSEntityElems: NodeSwapArray<StaticEntityDSG>
        = new NodeSwapArray(() => new StaticEntityDSG, 0)
    mSPhysElems: SwapArray<StaticPhysDSG>
        = new SwapArray(() => new StaticPhysDSG, 0)
    mIntersectElems: SwapArray<IntersectDSG>
        = new SwapArray(() => new IntersectDSG, 0)
    mDPhysElems: NodeSwapArray<DynaPhysDSG>
        = new NodeSwapArray(() => new DynaPhysDSG, 0)
    mFenceElems: SwapArray<FenceEntityDSG>
        = new SwapArray(() => new FenceEntityDSG, 0)
    mAnimCollElems: NodeSwapArray<AnimCollisionEntityDSG>
        = new NodeSwapArray(() => new AnimCollisionEntityDSG, 0)
    mAnimElems: NodeSwapArray<AnimEntityDSG>
        = new NodeSwapArray(() => new AnimEntityDSG, 0)
    mTrigVolElems: SwapArray<TriggerVolume>
        = new SwapArray(() => new TriggerVolume, 0)
    mRoadSegmentElems: SwapArray<RoadSegment>
        = new NodeSwapArray(() => new RoadSegment, 0)
    mPathSegmentElems: SwapArray<PathSegment>
        = new NodeSwapArray(() => new PathSegment, 0)

    mBBox: BoxPts

    IsRoot(): boolean { return true }
}
export class SpatialTree extends tEntity {
    mTreeNodes: FixedArray<ContiguousBinNode<SpatialNode>>
    mTreeBounds: Bounds3f

    GetRoot(): ContiguousBinNode<SpatialNode> {
        return this.mTreeNodes.mpData![0]
    }
    SetTo(iNumNodes: number, iTreeBounds: Bounds3f) {
        for (let i = 0; i < iNumNodes; i++) {
            new ContiguousBinNode<SpatialNode>(this, i, new SpatialNode)
        }
        // this.mTreeNodes.Allocate(
        //     () => new ContiguousBinNode<SpatialNode>(this, 0, new SpatialNode),
        //     iNumNodes
        // )
        this.mTreeBounds = iTreeBounds
    }
    GetBounds() { return this.mTreeBounds }
}
export class ContiguousBinNode<T> {
    // mData: T
    mSubTreeSize: number
    mParentOffset: number
    _s: number

    // enum
    private msNoChildren = 0
    private msNoParent = 0

    constructor(
        public _parent_tree: SpatialTree,
        public _index: number,
        public mData: T
    ) { }
    LinkParent(iParentOffset: number) { this.mParentOffset = iParentOffset }
    SetSubTreeSize(iSubTreeSize: number) { this.mSubTreeSize = iSubTreeSize }
    IsRoot() { return this.mParentOffset == this.msNoParent }
    GetSubTreeSize() { return this.mSubTreeSize }
    Parent() { return this.mParentOffset }
    LChild() { return this._lc() } // { return this + 1 }
    LChildOffset() { return this._lco() } // { return 1 }
    RChild() { return this._rc() } // { return (this + 1).RSibling() }
    RChildOffset() { return this._rco() } // { return this.LChild().RSiblingOffset() + 1 }
    LSibling() { return this._ls() }
    RSibling() { return this._rs() }
    RSiblingOffset() { this._rso() }

    _gn(i: number) { return this._parent_tree.mTreeNodes.mpData![i] }
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
type tMark = int
export class SpatialTreeIter {
    // enum {
    msFilterInvisible = 0xF0000000
    msFilterVisible = 0x0F000000
    msFilterAll = 0x00FFFFFF

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
                    return (pCurNode.mData)
                }
            }
        } else {
            return (pCurNode.mData)
        }
    }
}
