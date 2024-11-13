import { assert } from '../util.js'
import { rmt } from './math.js'

type float = number
type int = number
type const_char_p = string

export type tUidUnaligned = { u0: int, u1: int }
export type radKey = tUidUnaligned
export type tUID = radKey
export type tName = string
export class tEntity {
    name: tName
    SetName(name: const_char_p) { this.name = name }
}
export class FixedArray<T> {
    mSize: number
    mpData: T[] | null
    constructor(factory: () => T, iSize?: number) {
        iSize
            ? this.Allocate(factory, iSize)
            : this.mpData = null
    }
    Allocate(factory: () => T, iSize: number) {
        this.mSize = iSize
        this.mpData = Array.from({ length: iSize }, factory)
    }
}
export class ReserveArray<T> extends FixedArray<T> {
    mUseSize: number
    constructor(factory: () => T, iSize?: number) {
        super(factory, iSize)
        this.mUseSize = 0
    }
    AddUse(iCountSize: int) {
        assert((iCountSize + this.mUseSize) <= this.mSize)
        this.mUseSize += iCountSize
    }
}
export class SwapArray<T> extends ReserveArray<T> {
    mSwapT: T
    constructor(factory: () => T, iSize?: number) { super(factory, iSize) }
    ClearUse() { this.mUseSize = 0 }
    Add(irVal: T) {
        this.mpData![this.mUseSize] = irVal
        this.mUseSize
    }
}
export class NodeSwapArray<T> extends SwapArray<T> { }

export abstract class ISpatialProxyAA {
    msIntersectionEpsilon = 0.01
    abstract CompareTo__AAPlane3f(irPlane: AAPlane3f): float
     // <0.0   -   Inside Spatial Proxy
     // =0.0   -   On Spatial Proxy Surface
     // >0.0   -   Outside Spatial Proxy
    abstract CompareTo__Vector3f(irPoint: Vector3f): float
    abstract CompareToXZ(irPoint: Vector3f): float
}
export class BoxPts extends ISpatialProxyAA {
    mBounds: Bounds3f
     // <0.0   -   Inside Spatial Proxy
     // =0.0   -   On Spatial Proxy Surface
     // >0.0   -   Outside Spatial Proxy
    CompareTo__AAPlane3f(irPlane: AAPlane3f) {
        if (irPlane.mPosn - this.msIntersectionEpsilon
            <= this.mBounds._as_array__mMin()[irPlane.mAxis]) {
            return -1.0
        }
        if (irPlane.mPosn + this.msIntersectionEpsilon
            >= this.mBounds._as_array__mMax()[irPlane.mAxis]) {
            return 1.0
        }
        return 0.0
    }
    CompareTo__Vector3f(irPoint: Vector3f): float {
        if (irPoint.x < this.mBounds.mMin.x) return 1.0
        if (irPoint.y < this.mBounds.mMin.y) return 1.0
        if (irPoint.z < this.mBounds.mMin.z) return 1.0
        if (irPoint.x > this.mBounds.mMax.x) return 1.0
        if (irPoint.y > this.mBounds.mMax.y) return 1.0
        if (irPoint.z > this.mBounds.mMax.z) return 1.0
        return -1.0
    }
    CompareToXZ(irPoint: Vector3f): float {
        if (irPoint.x < this.mBounds.mMin.x) return 1.0
        if (irPoint.z < this.mBounds.mMin.z) return 1.0
        if (irPoint.x > this.mBounds.mMax.x) return 1.0
        if (irPoint.z > this.mBounds.mMax.z) return 1.0
        return -1.0
    }
    CutOffGT(irPlane3f: AAPlane3f) {
        if (this.mBounds.mMax._to_array()[irPlane3f.mAxis] > irPlane3f.mPosn) {
            this.mBounds.mMax._to_array()[irPlane3f.mAxis] = irPlane3f.mPosn
            if (this.mBounds.mMin._to_array()[irPlane3f.mAxis] > irPlane3f.mPosn) {
                this.mBounds.mMin._to_array()[irPlane3f.mAxis] = irPlane3f.mPosn
            }
        }
    }
    CutOffLT(irPlane3f: AAPlane3f) {
        if (this.mBounds.mMin._to_array()[irPlane3f.mAxis] < irPlane3f.mPosn) {
            this.mBounds.mMin._to_array()[irPlane3f.mAxis] = irPlane3f.mPosn
            if (this.mBounds.mMax._to_array()[irPlane3f.mAxis] < irPlane3f.mPosn) {
                this.mBounds.mMax._to_array()[irPlane3f.mAxis] = irPlane3f.mPosn
            }
        }
    }
    SetTo(irBounds: Bounds3f) { this.mBounds = irBounds }
}
export class Bounds3f {
    mMin: Vector3f
    mMax: Vector3f
    _as_array__mMin(): number[] { return [this.mMin.x, this.mMin.y, this.mMin.z] }
    _as_array__mMax(): number[] { return [this.mMax.x, this.mMax.y, this.mMax.z] }
    Accumulate__xyz(iX: float, iY: float, iZ: float) {
        if (iX < this.mMin.x) this.mMin.x = iX
        if (iX > this.mMax.x) this.mMax.x = iX
        if (iY < this.mMin.y) this.mMin.y = iY
        if (iY > this.mMax.y) this.mMax.y = iY
        if (iZ < this.mMin.z) this.mMin.z = iZ
        if (iZ > this.mMax.z) this.mMax.z = iZ
    }
    Accumulate__Vector(ipPoint: rmt.Vector) {
        for (let i = 0; i < 3; i++) {
            if (ipPoint._to_array()[i] < this.mMin._to_array()[i]) {
                this.mMin._to_array()[i] = ipPoint._to_array()[i]
            } else {
                if (ipPoint._to_array()[i] > this.mMax._to_array()[i]) {
                    this.mMax._to_array()[i] = ipPoint._to_array()[i]
                }
            }
        }
    }
}
export class AAPlane3f {
    public mAxis: number
    public mPosn: number
}
export class Vector3f extends rmt.Vector {
    SetTo(vect: rmt.Vector): rmt.Vector {
        this.x = vect.x
        this.y = vect.y
        this.z = vect.z
        return this
    }
}