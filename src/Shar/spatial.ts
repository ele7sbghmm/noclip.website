import { BoxPts, FixedArray, NodeSwapArray, SwapArray, AAPlane3f, Bounds3f, tEntity } from './rad_util.js'

type StaticEntityDSG = any
type StaticPhysDSG = any
type IntersectDSG = any
type DynaPhysDSG = any
type FenceEntityDSG = any
type AnimCollisionEntityDSG = any
type AnimEntityDSG = any
type TriggerVolume = any
type RoadSegment = any
type PathSegment = any

export class SpatialNode {
    public mSubDivPlane: AAPlane3f

    public mSEntityElems: NodeSwapArray<StaticEntityDSG>
    public mSPhysElems: SwapArray<StaticPhysDSG>
    public mIntersectElems: SwapArray<IntersectDSG>
    public mDPhysElems: NodeSwapArray<DynaPhysDSG>
    public mFenceElems: SwapArray<FenceEntityDSG>
    public mAnimCollElems: NodeSwapArray<AnimCollisionEntityDSG>
    public mAnimElems: NodeSwapArray<AnimEntityDSG>
    public mTrigVolElems: SwapArray<TriggerVolume>
    public mRoadSegmentElems: SwapArray<RoadSegment>
    public mPathSegmentElems: SwapArray<PathSegment>

    public mBBox: BoxPts

    public IsRoot(): boolean { return true }
}

export class SpatialTree extends tEntity {
    public mTreeNodes: FixedArray<ContiguousBinNode<SpatialNode>>
    public mTreeBounds: Bounds3f

    public SetTo(iNumNodes: number, iTreeBounds: Bounds3f) {
        this.mTreeNodes.Allocate(iNumNodes)
        this.mTreeBounds = iTreeBounds
    }
    public GetRoot(): ContiguousBinNode<SpatialNode>[] {
        return this.mTreeNodes.mpData
    }
}
export class ContiguousBinNode<T> /* extends Array<T> */ {
    public mData: T
    public mSubTreeSize: number
    public mParentOffset: number
    private msNoChildren = 0
    private msNoParent = 0

    public LinkParent(iParentOffset: number) { this.mParentOffset = iParentOffset }
    public SetSubTreeSize(iSubTreeSize: number) { this.mSubTreeSize = iSubTreeSize }
    public IsRoot(): boolean { return this.mParentOffset == this.msNoParent }
}

