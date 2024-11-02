
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

type BoxPts = any
interface AAPlane3f {
    mAxis: number
    mPosn: number
}

interface SwapArray<T> extends Array<T> {
    mUseSize: number
}
type NodeSwapArray<T> = SwapArray<T>

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
