import { rmt } from './math.js'

type float = number
type int = number
type unsigned_int = number
type char_p = string
type const_char_p = string

export class tName { }
export class tEntity {
    name: string// tName
    SetName(name: const_char_p) { this.name = name }
}
export type Bounds3f = {
    mMin: rmt.Vector
    mMax: rmt.Vector
}
export type AAPlane3f = {
    mAxis: number
    mPosn: number
}
export class FixedArray<T> {
    mSize: number = 0
    mpData: T[] = []

    constructor(iSize?: number) {
        this.mpData = new Array(iSize) as T[] || null
    }
    public Allocate(iSize: number) {
        this.mSize = iSize
        this.mpData = new Array(iSize) as T[]
    }
}
export class SwapArray<T> {
    mSize: number = 0
    mUseSize: number
    mpData: T[]
    mSwapT: T

    constructor(iSize?: number) {
        this.mUseSize = 0
        this.mpData = new Array(iSize) as T[] || null
    }
}
export class NodeSwapArray<T> extends SwapArray<T> { }
export class BoxPts {
    public mBounds: Bounds3f

    public CutOffGT(irPlane3f: AAPlane3f) {
        //if (this.mBounds.mMax[irPlane3f.mAxis] > irPlane3f.mPosn) {
        //    this.mBounds.mMax[irPlane3f.mAxis] = irPlane3f.mPosn
        //
        //    if (this.mBounds.mMin[irPlane3f.mAxis] > irPlane3f.mPosn) {
        //        this.mBounds.mMin[irPlane3f.mAxis] = irPlane3f.mPosn
        //    }
        //}
    }
    public CutOffLT(irPlane3f: AAPlane3f) {
        //if (this.mBounds.mMin[irPlane3f.mAxis] < irPlane3f.mPosn) {
        //    this.mBounds.mMin[irPlane3f.mAxis] = irPlane3f.mPosn
        //
        //    if (this.mBounds.mMax[irPlane3f.mAxis] < irPlane3f.mPosn) {
        //        this.mBounds.mMax[irPlane3f.mAxis] = irPlane3f.mPosn
        //    }
        //}
    }
}
