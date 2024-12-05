import { AnimCollisionEntityDSG, AnimEntityDSG, DynaPhysDSG, FenceEntityDSG, IntersectDSG, PathSegment, RoadSegment, StaticEntityDSG, StaticPhysDSG, tEntity, TriggerVolume } from "./dsg.js"
import { AAPlane3f, NodeSwapArray, BoxPts, SwapArray, Bounds3f, int } from "./rad_util.js"

export class SpatialNode {
    mSubDivPlane      = new AAPlane3f
 
    mSEntityElems     = new NodeSwapArray<StaticEntityDSG>       (() => new StaticEntityDSG)
    mSPhysElems       = new SwapArray<StaticPhysDSG>             (() => new StaticPhysDSG)
    mIntersectElems   = new SwapArray<IntersectDSG>              (() => new IntersectDSG)
    mDPhysElems       = new NodeSwapArray<DynaPhysDSG>           (() => new DynaPhysDSG)
    mFenceElems       = new SwapArray<FenceEntityDSG>            (() => new FenceEntityDSG)
    mAnimCollElems    = new NodeSwapArray<AnimCollisionEntityDSG>(() => new AnimCollisionEntityDSG)
    mAnimElems        = new NodeSwapArray<AnimEntityDSG>         (() => new AnimEntityDSG)
    mTrigVolElems     = new SwapArray<TriggerVolume>             (() => new TriggerVolume)
    mRoadSegmentElems = new SwapArray<RoadSegment>               (() => new RoadSegment)
    mPathSegmentElems = new SwapArray<PathSegment>               (() => new PathSegment)

    mBBox             = new BoxPts
}
export class ContiguousBinNode<T> {
    static msNoParent = 0 // enum
    mData: T
    mSubTreeSize: int
    mParentOffset: int
    constructor(factory?: () => T) {
        if (factory) this.mData = factory()
    }
    IsRoot(): boolean { return this.mParentOffset == ContiguousBinNode.msNoParent }
    SetSubTreeSize(iSubTreeSize: int) { this.mSubTreeSize = iSubTreeSize }
    LinkParent(iParentOffset: int) { this.mParentOffset = iParentOffset }
    Parent(): ContiguousBinNode<T> { return new ContiguousBinNode }
    LChild(): ContiguousBinNode<T> { return new ContiguousBinNode }
    RChild(): ContiguousBinNode<T> { return new ContiguousBinNode }
    LChildOffset(): int { return 0 }
    RChildOffset(): int { return 0 }
    LSibling(): ContiguousBinNode<T> { return new ContiguousBinNode }
    RSibling(): ContiguousBinNode<T> { return new ContiguousBinNode }
}
export class SpatialTree extends tEntity {
    mTreeBounds: Bounds3f
    mTreeNodes = new SwapArray<ContiguousBinNode<SpatialNode>>(() => new ContiguousBinNode)
    GetRoot() { return this.mTreeNodes.mpData![0] }
    SetTo(nNodes: number, bounds: Bounds3f) {
        this.mTreeNodes.Allocate(() => new ContiguousBinNode(() => new SpatialNode), nNodes)
        this.mTreeBounds = bounds
    }
}