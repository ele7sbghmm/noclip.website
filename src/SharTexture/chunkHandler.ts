import ArrayBufferSlice from '../ArrayBufferSlice.js'

class Chunk {
  startIndex: number
  chunkId: number
  dataSize: number
  chunkSize: number
  parse(c: ChunkHandler) {
    this.startIndex = c.offset
    this.chunkId = c.view.getUint32(c.offset + 0, true)
    this.dataSize = c.view.getUint32(c.offset + 4, true)
    this.chunkSize = c.view.getUint32(c.offset + 8, true)
    c.offset += 12
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
      this.offset = start - pos
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
    return this.offset < (cur.startIndex + cur.chunkSize)
      && (cur.dataSize < cur.chunkSize)
  }
}

