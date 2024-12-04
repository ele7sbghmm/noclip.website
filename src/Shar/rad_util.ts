import { vec2, vec3 } from 'gl-matrix'
import { assert } from '../util.js'
import { rmt } from './math.js'
import { AABB } from '../Geometry.js'

export type float = number
export type int = number
export type const_char_p = string

export type tUidUnaligned = { u0: int, u1: int }
export type radKey = tUidUnaligned
export type tUID = radKey
export type tName = string

export type pddiVector = vec3
export type pddiVector2 = vec2
export class tEntity {
    name: tName
    SetName(name: const_char_p) { this.name = name }
}
export class FixedArray<T> {
    mSize: number
    mpData: T[] | null
    constructor(factory: () => T, iSize?: number) {
        iSize ? this.Allocate(factory, iSize)
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
            <= this.mBounds.mMin[irPlane.mAxis]) {
            return -1.0
        }
        if (irPlane.mPosn + this.msIntersectionEpsilon
            >= this.mBounds.mMax[irPlane.mAxis]) {
            return 1.0
        }
        return 0.0
    }
    CompareTo__Vector3f(irPoint: Vector3f): float {
        if (irPoint[0] < this.mBounds.mMin[0]) return 1.0
        if (irPoint[1] < this.mBounds.mMin[1]) return 1.0
        if (irPoint[2] < this.mBounds.mMin[2]) return 1.0
        if (irPoint[0] > this.mBounds.mMax[0]) return 1.0
        if (irPoint[1] > this.mBounds.mMax[1]) return 1.0
        if (irPoint[2] > this.mBounds.mMax[2]) return 1.0
        return -1.0
    }
    CompareToXZ(irPoint: Vector3f): float {
        if (irPoint[0] < this.mBounds.mMin[0]) return 1.0
        if (irPoint[2] < this.mBounds.mMin[2]) return 1.0
        if (irPoint[0] > this.mBounds.mMax[0]) return 1.0
        if (irPoint[2] > this.mBounds.mMax[2]) return 1.0
        return -1.0
    }
    CutOffGT(irPlane3f: AAPlane3f) {
        if (this.mBounds.mMax[irPlane3f.mAxis] > irPlane3f.mPosn) {
            this.mBounds.mMax[irPlane3f.mAxis] = irPlane3f.mPosn
            if (this.mBounds.mMin[irPlane3f.mAxis] > irPlane3f.mPosn) {
                this.mBounds.mMin[irPlane3f.mAxis] = irPlane3f.mPosn
            }
        }
    }
    CutOffLT(irPlane3f: AAPlane3f) {
        if (this.mBounds.mMin[irPlane3f.mAxis] < irPlane3f.mPosn) {
            this.mBounds.mMin[irPlane3f.mAxis] = irPlane3f.mPosn
            if (this.mBounds.mMax[irPlane3f.mAxis] < irPlane3f.mPosn) {
                this.mBounds.mMax[irPlane3f.mAxis] = irPlane3f.mPosn
            }
        }
    }
    SetTo(irBounds: Bounds3f) { this.mBounds = irBounds }
}
export class Bounds3f extends AABB {
    mMin = this.min
    mMax = this.max
    Accumulate__xyz(iX: float, iY: float, iZ: float) {
        if (iX < this.mMin[0]) this.mMin[0] = iX
        if (iX > this.mMax[0]) this.mMax[0] = iX
        if (iY < this.mMin[1]) this.mMin[1] = iY
        if (iY > this.mMax[1]) this.mMax[1] = iY
        if (iZ < this.mMin[2]) this.mMin[2] = iZ
        if (iZ > this.mMax[2]) this.mMax[2] = iZ
    }
    Accumulate__Vector(ipPoint: rmt.Vector) {
        for (let i = 0; i < 3; i++) {
            if (ipPoint[i] < this.mMin[i]) {
                this.mMin[i] = ipPoint[i]
            } else {
                if (ipPoint[i] > this.mMax[i]) {
                    this.mMax[i] = ipPoint[i]
                }
            }
        }
    }
}
export class AAPlane3f {
    public mAxis: number
    public mPosn: number
}
// export class Vector3f extends rmt.Vector {
//     SetTo(vect: rmt.Vector): rmt.Vector {
//         this.x = vect.x
//         this.y = vect.y
//         this.z = vect.z
//         return this
//     }
// }
type Vector3f = vec3