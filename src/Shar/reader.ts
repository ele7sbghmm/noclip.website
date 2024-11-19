import { assert } from '../util.js'
import { NamedArrayBufferSlice } from '../DataFetcher.js'

import { rmt } from './egg/math.js'
import { vec3 } from 'gl-matrix'

export class Reader {
    readonly name: string
    readonly view: DataView
    readonly length: number
    protected offset: number

    constructor(slice: NamedArrayBufferSlice) {
        this.name = slice.name
        this.view = slice.createDataView()
        this.offset = slice.byteOffset
        this.length = slice.byteLength
    }
    public seek(offs: number) {
        assert(offs <= this.length)
        this.offset = offs
    }
    public seek_forward(offs: number) {
        this.seek(this.offset + offs)
    }
    public get_offset(): number {
        return this.offset
    }
    public f32(size: number = 4, le: boolean = true) {
        const value = this.view.getFloat32(this.offset, le)
        this.seek_forward(size)
        return value
    }
    public u32(size: number = 4, le: boolean = true) {
        const value = this.view.getUint32(this.offset, le)
        this.seek_forward(size)
        return value
    }
    public i32(size: number = 4, le: boolean = true) {
        const value = this.view.getInt32(this.offset, le)
        this.seek_forward(size)
        return value
    }
    public u16(size: number = 2, le: boolean = true) {
        const value = this.view.getUint16(this.offset, le)
        this.seek_forward(size)
        return value
    }
    public i16(size: number = 2, le: boolean = true) {
        const value = this.view.getInt16(this.offset, le)
        this.seek_forward(size)
        return value
    }
    public u8(size: number = 1) {
        const value = this.view.getUint8(this.offset)
        this.seek_forward(size)
        return value
    }
    public i8(size: number = 1) {
        const value = this.view.getInt8(this.offset)
        this.seek_forward(size)
        return value
    }
}

export function read_vector(view: Reader): rmt.Vector {
    return new rmt.Vector(view.f32(), view.f32(), view.f32())
}
export function read_matrix(view: Reader): rmt.Matrix {
    return new rmt.Matrix(
        view.f32(), view.f32(), view.f32(), view.f32(),
        view.f32(), view.f32(), view.f32(), view.f32(),
        view.f32(), view.f32(), view.f32(), view.f32(),
        view.f32(), view.f32(), view.f32(), view.f32(),
    )
}

