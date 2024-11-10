import { BoxPts, FixedArray, NodeSwapArray, SwapArray, AAPlane3f, Bounds3f, tEntity } from './rad_util.js'
import { IntersectDSG, FenceEntityDSG } from './dsg.js'

type int = number

type StaticEntityDSG = any
type StaticPhysDSG = any
type DynaPhysDSG = any
type AnimCollisionEntityDSG = any
type AnimEntityDSG = any
type TriggerVolume = any
type RoadSegment = any
type PathSegment = any

export class SpatialNode {
    public mSubDivPlane: AAPlane3f = { mAxis: 0, mPosn: 0 }

    public mSEntityElems: NodeSwapArray<StaticEntityDSG> = new NodeSwapArray()
    public mSPhysElems: SwapArray<StaticPhysDSG> = new SwapArray()
    public mIntersectElems: SwapArray<IntersectDSG> = new SwapArray()
    public mDPhysElems: NodeSwapArray<DynaPhysDSG> = new NodeSwapArray()
    public mFenceElems: SwapArray<FenceEntityDSG> = new SwapArray()
    public mAnimCollElems: NodeSwapArray<AnimCollisionEntityDSG> = new NodeSwapArray()
    public mAnimElems: NodeSwapArray<AnimEntityDSG> = new NodeSwapArray()
    public mTrigVolElems: SwapArray<TriggerVolume> = new SwapArray()
    public mRoadSegmentElems: SwapArray<RoadSegment> = new NodeSwapArray()
    public mPathSegmentElems: SwapArray<PathSegment> = new NodeSwapArray()

    public mBBox: BoxPts

    public IsRoot(): boolean { return true }
}
export class SpatialTree extends tEntity {
    public mTreeNodes: FixedArray<ContiguousBinNode<SpatialNode>> = new FixedArray()
    public mTreeBounds: Bounds3f

    public SetTo(iNumNodes: number, iTreeBounds: Bounds3f) {
        // this.mTreeNodes.Allocate(iNumNodes)
        for (let i = 0; i < iNumNodes; i++) {
            this.mTreeNodes.mpData[i] = new ContiguousBinNode(
                new SpatialNode(),
                this.mTreeNodes.mpData
            )
        }
        this.mTreeBounds = iTreeBounds
    }
    public GetRoot(): ContiguousBinNode<SpatialNode> {
        return this.mTreeNodes.mpData[0]
    }
}

export class ContiguousBinNode<T> {
    // public mData: T
    public mSubTreeSize: number = -1
    public mParentOffset: number

    // enum
    private msNoChildren = 0
    private msNoParent = 0

    constructor(public mData: T) { }
    public LinkParent(iParentOffset: number) { this.mParentOffset = iParentOffset }
    public SetSubTreeSize(iSubTreeSize: number) { this.mSubTreeSize = iSubTreeSize }
    public IsRoot() { return this.mParentOffset == this.msNoParent }
    public GetSubTreeSize() { return this.mSubTreeSize }
    public Parent() { return this.mParentOffset }
    // public LChild() { } // : ContiguousBinNode { this + 1 }
    // public LChilfOffset() { return 1 }
    // public RChild() { } // : ContiguousBinNode { (this + 1).RSibling() }
    // public RChilfOffset() { return this.LChild().RSiblingOffset() + 1 }
    // public LSibling() { }
    // public RSibling() { }
    // public RSiblingOffset() { }
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
    mpRootNode: ContiguousBinNode<SpatialNode> | null
    mpCurNode: ContiguousBinNode<SpatialNode>

    mCurNodeOffset: int

    mNodeMarks: FixedArray<tMark>
    mCurMarkFilter: tMark

    mCurNodeI: int

    mBBox: BoxPts

    constructor() { this.mpRootNode = null }
    public rBBox() { return this.mBBox }
    public rIthNode(iIth: int): SpatialNode { }
    public MoveToNext(ibIncludeVis: boolean) {
        this.mCurNodeI++;
        if (ibIncludeVis
            && (this.mCurNodeI >= this.mpCurNodeList.mUseSize)
            && (this.mpCurNodeList != this.mCurAlwaysVisNodes)
        ) {
            this.mpCurNodeList = this.mCurAlwaysVisNodes;
            this.mCurNodeI = 0;
        }
    }
    public SetToRoot(irTree: SpatialTree) {
        this.mpRootNode = irTree.GetRoot();

        this.mBBox.SetTo(irTree.GetBounds());

        this.mNodeMarks.Allocate(this.mpRootNode.GetSubTreeSize() + 1);
        this.mCurNodes.Allocate(this.mpRootNode.GetSubTreeSize() + 1);
        this.mCurAlwaysVisNodes.Allocate(this.mpRootNode.GetSubTreeSize() + 1);
        this.mpCurNodeList = this.mCurNodes;
    }
}
