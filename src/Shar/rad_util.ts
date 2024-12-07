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
            <= this.mBounds.min[irPlane.mAxis]) {
            return -1.0
        }
        if (irPlane.mPosn + this.msIntersectionEpsilon
            >= this.mBounds.max[irPlane.mAxis]) {
            return 1.0
        }
        return 0.0
    }
    CompareTo__Vector3f(irPoint: Vector3f): float {
        if (irPoint[0] < this.mBounds.min[0]) return 1.0
        if (irPoint[1] < this.mBounds.min[1]) return 1.0
        if (irPoint[2] < this.mBounds.min[2]) return 1.0
        if (irPoint[0] > this.mBounds.max[0]) return 1.0
        if (irPoint[1] > this.mBounds.max[1]) return 1.0
        if (irPoint[2] > this.mBounds.max[2]) return 1.0
        return -1.0
    }
    CompareToXZ(irPoint: Vector3f): float {
        if (irPoint[0] < this.mBounds.min[0]) return 1.0
        if (irPoint[2] < this.mBounds.min[2]) return 1.0
        if (irPoint[0] > this.mBounds.max[0]) return 1.0
        if (irPoint[2] > this.mBounds.max[2]) return 1.0
        return -1.0
    }
    CutOffGT(irPlane3f: AAPlane3f) {
        if (this.mBounds.max[irPlane3f.mAxis] > irPlane3f.mPosn) {
            this.mBounds.max[irPlane3f.mAxis] = irPlane3f.mPosn
            if (this.mBounds.min[irPlane3f.mAxis] > irPlane3f.mPosn) {
                this.mBounds.min[irPlane3f.mAxis] = irPlane3f.mPosn
            }
        }
    }
    CutOffLT(irPlane3f: AAPlane3f) {
        if (this.mBounds.min[irPlane3f.mAxis] < irPlane3f.mPosn) {
            this.mBounds.min[irPlane3f.mAxis] = irPlane3f.mPosn
            if (this.mBounds.max[irPlane3f.mAxis] < irPlane3f.mPosn) {
                this.mBounds.max[irPlane3f.mAxis] = irPlane3f.mPosn
            }
        }
    }
    SetTo(irBounds: Bounds3f) { this.mBounds = irBounds }
}
export class Bounds3f extends AABB {
    Accumulate__xyz(iX: float, iY: float, iZ: float) {
        if (iX < this.min[0]) this.min[0] = iX
        if (iX > this.max[0]) this.max[0] = iX
        if (iY < this.min[1]) this.min[1] = iY
        if (iY > this.max[1]) this.max[1] = iY
        if (iZ < this.min[2]) this.min[2] = iZ
        if (iZ > this.max[2]) this.max[2] = iZ
    }
    Accumulate__Vector(ipPoint: rmt.Vector) {
        for (let i = 0; i < 3; i++) {
            if (ipPoint[i] < this.min[i]) {
                this.min[i] = ipPoint[i]
            } else {
                if (ipPoint[i] > this.max[i]) {
                    this.max[i] = ipPoint[i]
                }
            }
        }
    }
}
export class AAPlane3f {
    public mAxis: number
    public mPosn: number
}
export type Vector3f = vec3