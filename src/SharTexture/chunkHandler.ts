import { vec3, mat4 } from 'gl-matrix'
import ArrayBufferSlice from '../ArrayBufferSlice.js'

export class IEntityDSG {
  boundingBox: BoundingBox
  boundingSphere: BoundingSphere
  matrix: mat4 = mat4.create()

  name: string
  shaderName: string
  translucent: boolean = false
  castsShadow: boolean = false

  positionData: ArrayBufferSlice
  normalData: ArrayBufferSlice
  colorData: ArrayBufferSlice
  uvData: ArrayBufferSlice
  indexData: ArrayBufferSlice
}
export type BoundingBox = {
  mn: vec3,
  mx: vec3
}
export type BoundingSphere = {
  c: vec3,
  r: number
}
class Chunk {
  startIndex: number
  chunkId: number
  dataSize: number
  chunkSize: number
  parse(c: ChunkHandler) {
    this.startIndex = c.offset
    this.chunkId = c.u32()
    this.dataSize = c.u32()
    this.chunkSize = c.u32()
  }
}

export class ChunkHandler {
  view: DataView
  offset: number = 0
  length: number
  buffer: ArrayBufferSlice

  stack = Array.from({ length: 32 }, () => new Chunk)
  stackTop: number = 0

  constructor(buffer: ArrayBufferSlice) {
    this.buffer = buffer
    this.view = buffer.createDataView()
    this.length = buffer.byteLength
  }
  beginChunk() {
    const currentChunk = this.stack[this.stackTop]
    const start = currentChunk.startIndex + currentChunk.dataSize
    const pos = this.offset
    if (pos < start) {
      this.offset = start
    }

    this.stackTop++
    this.stack[this.stackTop].parse(this)

    return this.stack[this.stackTop].chunkId
  }
  p3dChunk() {
    this.stack[this.stackTop].parse(this)

    return this.stack[this.stackTop].chunkId
  }
  endChunk() {
    const cur = this.stack[this.stackTop]
    this.offset = cur.startIndex + cur.chunkSize
    this.stackTop--
  }
  chunksRemaining() {
    const cur = this.stack[this.stackTop]
    if (this.offset >= this.length) return false
    return this.offset < (cur.startIndex + cur.chunkSize)
      && (cur.dataSize < cur.chunkSize)
  }
  pString() {
    const n = this.u8()
    const str = new TextDecoder('ascii')
      .decode(new DataView(this.view.buffer, this.offset, n))
      .replace(/\x00/g, '')
    this.offset += n
    return str
  }
  f32() {
    const value = this.view.getFloat32(this.offset + 0, true)
    this.offset += 4
    return value
  }
  u32(le: boolean = true) {
    const value = this.view.getUint32(this.offset + 0, le)
    this.offset += 4
    return value
  }
  u16(le: boolean = true) {
    const value = this.view.getUint16(this.offset + 0, le)
    this.offset += 2
    return value
  }
  u8() {
    const value = this.view.getUint8(this.offset + 0)
    this.offset += 1
    return value
  }
  vec3() {
    return vec3.fromValues(this.f32(), this.f32(), this.f32())
  }
  mat4(rm: boolean = true) {
    const value = mat4.fromValues(
      this.f32(), this.f32(), this.f32(), this.f32(),
      this.f32(), this.f32(), this.f32(), this.f32(),
      this.f32(), this.f32(), this.f32(), this.f32(),
      this.f32(), this.f32(), this.f32(), this.f32(),
    )
    if (rm) { mat4.transpose(value, value) }
    return value
  }
}

