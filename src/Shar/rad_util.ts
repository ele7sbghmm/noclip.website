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
export interface FixedArray<T> extends Array<T> {
    mSize: number
    mpData: T[]
}
export interface SwapArray<T> extends Array<T> {
    mUseSize: number
}
export type NodeSwapArray<T> = SwapArray<T>
export type BoxPts = {}
