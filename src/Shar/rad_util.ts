import { Vector } from './math.js'

export class tEntity {
    name: string
}
export type Bounds3f = {
    mMin: Vector
    mMax: Vector
}
export type AAPlane3f = {
    mAxis: number
    mPosn: number
}
export class FixedArray<T> {
    mSize: number
    mpData: T[]

    constructor(iSize?: number) {
        this.mpData = new Array(iSize) || null
    }
    public Allocate(iSize: number) {
        this.mSize = iSize
        this.mpData = new Array(iSize) as T[]
    }
}
export class SwapArray<T> {
    mSize: number
    mUseSize: number
    mpData: T[]
    mSwapT: T

    constructor(iSize?: number) {
        this.mUseSize = 0
        this.mpData = new Array(iSize) || null
    }
}
export class NodeSwapArray<T> extends SwapArray<T> { }
export type BoxPts = {}
