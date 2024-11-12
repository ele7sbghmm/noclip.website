import { rmt } from './math.js'
import { SwapArray, ReserveArray, tName, tEntity, Bounds3f } from './rad_util.js'
import { SpatialNode } from './spatial.js'

type bool = boolean
type int = number
type unsigned_char = number
type unsigned_char_p = number
type int_p = number

export class tDrawable extends tEntity {

    static dummyBox: rmt.Box3D
    static dummySphere: rmt.Sphere

    GetBoundingBox(box: rmt.Box3D) {
        let isFirst: bool = true // static
        if (isFirst) {
            tDrawable.dummyBox.low.Set(0, 0, 0)
            tDrawable.dummyBox.high.Set(1, 1, 1)
            isFirst = false
        }
        box = tDrawable.dummyBox
    }
    GetBoundingSphere(sphere: rmt.Sphere) {
        let isFirst: bool = true // static
        if (isFirst) {
            tDrawable.dummySphere.centre.Set(0, 0, 0)
            tDrawable.dummySphere.radius = 1
            isFirst = false
        }
        sphere = tDrawable.dummySphere
    }
}
export class IEntityDSG extends tDrawable { }
export class CollisionEntityDSG extends IEntityDSG { }
export class StaticEntityDSG { }
export class StaticPhysDSG { }
export class IntersectDSG extends IEntityDSG {
    mTriIndices: ReserveArray<int>
    mTriPts: ReserveArray<rmt.Vector>         //Separated Triangles
    mTriNorms: ReserveArray<rmt.Vector>       //Triangle Normals
    mTerrainType: ReserveArray<unsigned_char> // The terrain type for the triangle.

    static mspIndexData: int_p
    static mspTerrainData: unsigned_char_p
    static mspVertexData: rmt.Vector
    static mspNormalData: rmt.Vector
    static msbInScratchPad: bool

    mnPrimGroups: int

    mBox3D: rmt.Box3D
    mSphere: rmt.Sphere
    mPosn: rmt.Vector
    mpSpatialNode: SpatialNode

    override GetBoundingBox(box: rmt.Box3D): rmt.Box3D { return this.mBox3D }
    override GetBoundingSphere(sphere: rmt.Sphere): rmt.Sphere { return this.mSphere }
}
export namespace IntersectDSG {
    export enum _enum {
        UNINIT_PT = 0x0,
        X_GT_PT = 0x0001,
        X_LT_PT = 0x0002,
        Z_GT_PT = 0x0004,
        Z_LT_PT = 0x0008,
        INIT_PT = 0x0010,
        FOUND_PT = 0X001F
    };
}
export class DynaPhysDSG { }
export class FenceEntityDSG extends CollisionEntityDSG {
    mStartPoint: rmt.Vector
    mEndPoint: rmt.Vector
    mNormal: rmt.Vector
    // mpSpatialNode: SpatialNode

    override GetBoundingBox(/*box: rmt.Box3D*/): rmt.Box3D {
        const bounds = new Bounds3f
        bounds.mMin.SetTo(this.mStartPoint)
        bounds.mMax.SetTo(this.mStartPoint)
        bounds.Accumulate__Vector(this.mEndPoint)

        const box = new rmt.Box3D
        box.low = (bounds.mMin)
        box.high = (bounds.mMax)
        return box
    }
    override GetBoundingSphere(/*sphere: rmt.Sphere*/): rmt.Sphere {
        let tmp = this.mStartPoint
        tmp.Add(this.mEndPoint)
        tmp.Scale(2.0)

        const sphere = new rmt.Sphere
        sphere.centre = tmp

        tmp = rmt.Vector.Sub(this.mStartPoint, tmp)
        sphere.radius = tmp.Magnitude()
        return sphere
    }
}
export class AnimCollisionEntityDSG { }
export class AnimEntityDSG { }
export class TriggerVolume { }
export class RoadSegment { }
export class PathSegment { }

export class DynaLoadListDSG {
    mGiveItAFuckinName: tName

    mWorldSphereElems: SwapArray<WorldSphereDSG>
    mSEntityElems: SwapArray<StaticEntityDSG>
    mSPhysElems: SwapArray<StaticPhysDSG>
    mIntersectElems: SwapArray<IntersectDSG>
    mDPhysElems: SwapArray<DynaPhysDSG>
    mFenceElems: SwapArray<FenceEntityDSG>
    mAnimCollElems: SwapArray<AnimCollisionEntityDSG>
    mAnimElems: SwapArray<AnimEntityDSG>
    mTrigVolElems: SwapArray<TriggerVolume>
    mRoadSegmentElems: SwapArray<RoadSegment>
    mPathSegmentElems: SwapArray<PathSegment>
}
export class WorldSphereDSG extends IEntityDSG {
    mbActive: bool
    mPosn: rmt.Vector
    // mpCompDraw: tCompositeDrawable
    // mpGeos: SwapArray<tGeometry>
    // mpBillBoards: SwapArray<tBillboardQuadGroup>
    // mpMultiCon: tMultiController
    // mpFlare: LensFlareDSG

    override GetBoundingBox(box: rmt.Box3D) { }
    override GetBoundingSphere(sphere: rmt.Sphere) { }
}
