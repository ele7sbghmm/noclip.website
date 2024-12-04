import { AnimCollisionEntityDSG, AnimEntityDSG, DynaPhysDSG, FenceEntityDSG, IntersectDSG, PathSegment, RoadSegment, StaticEntityDSG, StaticPhysDSG, tEntity, TriggerVolume } from "./dsg"
import { AAPlane3f, NodeSwapArray, BoxPts, SwapArray, Bounds3f, int } from "./rad_util"

export class SpatialNode {
    mSubDivPlane: AAPlane3f
 
    mSEntityElems:     NodeSwapArray<StaticEntityDSG>
    mSPhysElems:       SwapArray<StaticPhysDSG>
    mIntersectElems:   SwapArray<IntersectDSG>
    mDPhysElems:       NodeSwapArray<DynaPhysDSG>
    mFenceElems:       SwapArray<FenceEntityDSG>
    mAnimCollElems:    NodeSwapArray<AnimCollisionEntityDSG>
    mAnimElems:        NodeSwapArray<AnimEntityDSG>
    mTrigVolElems:     SwapArray<TriggerVolume>
    mRoadSegmentElems: SwapArray<RoadSegment>
    mPathSegmentElems: SwapArray<PathSegment>

    mBBox: BoxPts
}
export class ContiguousBinNode<T> {
    static msNoParent = 0 // enum
    mData: T
    mSubTreeSize: int
    mParentOffset: int
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
    mTreeNodes: SwapArray<ContiguousBinNode<SpatialNode>>
    GetRoot() { return this.mTreeNodes.mpData![0] }
    SetTo(nNodes: number, bounds: Bounds3f) {
        this.mTreeNodes.Allocate(() => new ContiguousBinNode, nNodes)
        this.mTreeBounds = bounds
    }
}