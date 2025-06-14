import { vec3, mat4 } from 'gl-matrix'
import ArrayBufferSlice from '../../ArrayBufferSlice.js'

class Chunk {
  si: number
  id: number
  ds: number
  cs: number
  parse(c: ChunkHandler) {
    this.si = c.offs
    this.id = c.u32()
    this.ds = c.u32()
    this.cs = c.u32()
    return this
  }
}
export class ChunkHandler {
  buf: ArrayBufferSlice
  view: DataView
  offs: number = 0
  len: number

  stack = Array.from({ length: 32 }, () => new Chunk)
  stackTop: number = 0
  constructor(buffer: ArrayBufferSlice) {
    this.buf = buffer
    this.view = buffer.createDataView()
    this.len = buffer.byteLength
  }
  top() { return this.stack[this.stackTop] }
  remaining() {
    if (this.offs >= this.len) return false
    return (this.offs < (this.top().si + this.top().cs))
      && (this.top().ds < this.top().cs)
  }
  begin() {
    this.offs = Math.max(this.offs, this.top().si + this.top().ds)
    this.stackTop++
    this.top().parse(this)
    return this.top().id
  }
  end() {
    this.offs = this.top().si + this.top().cs
    this.stackTop--
  }
  p3dChunk() {
    this.top().parse(this)
  }

  str(len: number) {
    this.offs += len
    return new TextDecoder('ascii')
      .decode(new DataView(this.view.buffer, this.offs - len, len))
      .replace(/\x00/g, '')
  }
  pstr() {
    return this.str(this.u8())
  }
  f32() {
    this.offs += 4
    return this.view.getFloat32(this.offs - 4, true)
  }
  u32(le: boolean = true) {
    this.offs += 4
    return this.view.getUint32(this.offs - 4, le)
  }
  u16(le: boolean = true) {
    this.offs += 2
    return this.view.getUint16(this.offs - 2, le)
  }
  u8() {
    this.offs += 1
    return this.view.getUint8(this.offs - 1)
  }
  vec3() {
    return vec3.fromValues(this.f32(), this.f32(), this.f32())
  }
  mat4(rm: boolean = true) {
    const matrix = mat4.fromValues(
      this.f32(), this.f32(), this.f32(), this.f32(),
      this.f32(), this.f32(), this.f32(), this.f32(),
      this.f32(), this.f32(), this.f32(), this.f32(),
      this.f32(), this.f32(), this.f32(), this.f32()
    )
    return rm ? mat4.transpose(mat4.create(), matrix) : matrix
  }
  array(len: number, f: () => number) {
    return Array.from({ length: len }, () => 0).map(() => f())
  }
}
