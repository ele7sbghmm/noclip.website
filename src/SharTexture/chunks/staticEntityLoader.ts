import ArrayBufferSlice from '../../ArrayBufferSlice.js'
import { ID } from './ids.js'
import { ChunkHandler } from '../chunkHandler.js'
import { StaticEntityBuffers } from '../staticEntity.js'

export class StaticEntityLoader {
  static getBuffers(c: ChunkHandler) {
    const nameLen = c.view.getUint8(c.offset + 0)
    const name = new TextDecoder('ascii')
      .decode(new DataView(c.view.buffer, c.offset + 1, nameLen))
      .replace(/\x00/g, '')
    c.offset += 1 + nameLen

    const version = c.view.getUint32(c.offset + 0, true)
    const hasAlpha = c.view.getUint32(c.offset + 4, true)
    c.offset += 8

    var mesh
    while (c.chunksRemaining()) {
      switch (c.beginChunk()) {
        case ID.MESH: {
          mesh = MeshLoader.getBuffers(c)
        }
      }
      c.endChunk()
    }
    return mesh
  }
}

class MeshLoader {
  static getBuffers(c: ChunkHandler) {
    const nameLen = c.view.getUint8(c.offset + 0)
    const name = new TextDecoder('ascii')
      .decode(new DataView(c.view.buffer, c.offset + 1, nameLen))
      .replace(/\x00/g, '')
    c.offset += 1 + nameLen

    const version = c.view.getUint32(c.offset + 0, true)
    const mPrimGroup = c.view.getUint32(c.offset + 4, true)
    c.offset += 8

    var primGroup
    while (c.chunksRemaining()) {
      switch (c.beginChunk()) {
        case ID.PRIMGROUP: {
          primGroup = PrimGroupLoader.getBuffers(c)
        }
      }
      c.endChunk()
    }
    return primGroup
  }
}

class PrimGroupLoader {
  static getBuffers(c: ChunkHandler): StaticEntityBuffers {
    const version = c.view.getUint32(c.offset + 0, true)
    c.offset += 4

    const shaderNameLen = c.view.getUint8(c.offset + 0)
    const shaderName = new TextDecoder('ascii')
      .decode(new DataView(c.view.buffer, c.offset + 1, shaderNameLen))
      .replace(/\x00/g, '')
    c.offset += 1 + shaderNameLen

    const mPrimType = c.view.getUint32(c.offset + 0, true)
    const mVertexFormat = c.view.getUint32(c.offset + 4, true)
    const mVertexCount = c.view.getUint32(c.offset + 8, true)
    const mIndexCount = c.view.getUint32(c.offset + 12, true)
    const mMatrixCount = c.view.getUint32(c.offset + 16, true)
    c.offset += 20

    let positionData = new ArrayBufferSlice(new Uint32Array().buffer)
    let normalData = new ArrayBufferSlice(new Uint32Array().buffer)
    let colorData = new ArrayBufferSlice(new Uint32Array().buffer)
    let uvData = new ArrayBufferSlice(new Uint32Array().buffer)
    let indexData = new ArrayBufferSlice(new Uint32Array().buffer)
    while (c.chunksRemaining()) {
      switch (c.beginChunk()) {
        case ID.POSITIONLIST: {
          const count = c.view.getUint32(c.offset + 0, true)
          const size = count * 12
          positionData = c.buffer.subarray(c.offset + 4, size, true)
          c.offset += 4 + size
          break
        }
        case ID.NORMALLIST: {
          const count = c.view.getUint32(c.offset + 0, true)
          const size = count * 12
          normalData = c.buffer.subarray(c.offset + 4, size, true)
          c.offset += 4 + size
          break
        }
        case ID.COLOURLIST: {
          const count = c.view.getUint32(c.offset + 0, true)
          const size = count * 4
          colorData = c.buffer.subarray(c.offset + 4, size, true)
          c.offset += 4 + size
          break
        }
        case ID.MULTICOLOURLIST: { }
        case ID.UVLIST: {
          const count = c.view.getUint32(c.offset + 0, true)
          const size = count * 8
          uvData = c.buffer.subarray(c.offset + 4, size, true)
          c.offset += 4 + size
          break
        }
        case ID.INDEXLIST: {
          const count = c.view.getUint32(c.offset + 0, true)
          const size = count * 4
          indexData = c.buffer.subarray(c.offset + 4, size, true)
          c.offset += 4 + size

          if (mPrimType == 1) {
            indexData = triList2Tris(indexData)
          }
          break
        }
        case ID.WEIGHTLIST: { break }
        case ID.MATRIXLIST: { break }
      }
      c.endChunk()
    }
    return {
      positionData: positionData,
      normalData: normalData,
      colorData: colorData,
      uvData: uvData,
      indexData: indexData,
    }
  }
}

const triList2Tris = (buffer: ArrayBufferSlice) => {
  const indicesIn = new Uint32Array(buffer.arrayBuffer)
  const indicesOut = new Uint32Array((buffer.byteLength - 2) * 3)

  for (let i = 0; i < indicesIn.length - 2; i++) {
    if (i % 2) {
      indicesOut[i * 3 + 0] = indicesIn[i + 0]
      indicesOut[i * 3 + 2] = indicesIn[i + 1]
      indicesOut[i * 3 + 1] = indicesIn[i + 2]
    } else {
      indicesOut[i * 3 + 0] = indicesIn[i + 0]
      indicesOut[i * 3 + 1] = indicesIn[i + 1]
      indicesOut[i * 3 + 2] = indicesIn[i + 2]
    }
  }
  return new ArrayBufferSlice(indicesOut.buffer)
}

