import { assert, readString } from '../util.js'
import { NamedArrayBufferSlice } from '../DataFetcher.js'
import { mat4, vec3 } from 'gl-matrix'

import { rmt } from './math.js'

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
    public get_offset() {
        return this.offset
    }
    public seek(offs: number) {
        assert(offs <= this.length)
        this.offset = offs
    }
    public seek_forward(offs: number) {
        this.seek(this.offset + offs)
    }
    public get_slice(len: number): ArrayBuffer {
        const slc = this.view.buffer.slice(this.offset, this.offset + len)
        this.offset += len
        return slc
    }
    public get_string(len: number) {
        const str = new TextDecoder('ascii')!.decode(this.get_slice(len))
        return str
    }
    public get_nstring() {
        const len = this.u8()
        return this.get_string(len).split(`\0`)[0]
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

export function read_vector(view: Reader): rmt._Vector {
    return new rmt._Vector(view.f32(), view.f32(), view.f32())
}
export function read_matrix(view: Reader): rmt.Matrix {
    return new rmt.Matrix(
        view.f32(), view.f32(), view.f32(), view.f32(),
        view.f32(), view.f32(), view.f32(), view.f32(),
        view.f32(), view.f32(), view.f32(), view.f32(),
        view.f32(), view.f32(), view.f32(), view.f32(),
    )
}
export function read_vec3(view: Reader): vec3 {
    return vec3.fromValues(view.f32(), view.f32(), view.f32())
}
export function read_mat4(view: Reader): mat4 {
    return mat4.fromValues(
        view.f32(), view.f32(), view.f32(), view.f32(),
        view.f32(), view.f32(), view.f32(), view.f32(),
        view.f32(), view.f32(), view.f32(), view.f32(),
        view.f32(), view.f32(), view.f32(), view.f32(),
    )
}