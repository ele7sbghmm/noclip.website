import { vec3 } from 'gl-matrix'
import ArrayBufferSlice from '../../ArrayBufferSlice.js'

import { ChunkHandler, IEntityDSG, BoundingBox, BoundingSphere } from '../chunkHandler.js'
import { ID } from './ids.js'

export class StaticEntityLoader {
  staticEntities: IEntityDSG[] = []
  constructor(c: ChunkHandler) {
    const inst = new IEntityDSG
    inst.name = c.pString()

    const version = c.u32()
    const hasAlpha = c.u32()
    inst.translucent = !!hasAlpha

    while (c.chunksRemaining()) {
      switch (c.beginChunk()) {
        case ID.MESH: {
          new MeshLoader(c, inst)
          this.staticEntities.push(inst)
        } break
      }
      c.endChunk()
    }
  }
}

export class MeshLoader {
  constructor(c: ChunkHandler, entity: IEntityDSG) {
    const name = c.pString()

    const version = c.u32()
    const mPrimGroup = c.u32()

    while (c.chunksRemaining()) {
      switch (c.beginChunk()) {
        case ID.PRIMGROUP: {
          new PrimGroupLoader(c, entity)
        } break
        case ID.BOX: {
          entity.boundingBox = {
            mn: c.vec3(),
            mx: c.vec3()
          }
        } break
        case ID.SPHERE: {
          entity.boundingSphere = {
            c: c.vec3(),
            r: c.f32()
          }
        } break
        case ID.RENDERSTATUS: {
          entity.castsShadow = c.u32() == 0
        }
      }
      c.endChunk()
    }
  }
}

class PrimGroupLoader {
  constructor(c: ChunkHandler, entity: IEntityDSG) {
    const version = c.view.getUint32(c.offset + 0, true)
    c.offset += 4

    const shaderName = c.pString()

    const primType = c.view.getUint32(c.offset + 0, true)
    const vertexFormat = c.view.getUint32(c.offset + 4, true)
    const vertexCount = c.view.getUint32(c.offset + 8, true)
    const indexCount = c.view.getUint32(c.offset + 12, true)
    const matrixCount = c.view.getUint32(c.offset + 16, true)
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
        } break
        case ID.NORMALLIST: {
          const count = c.view.getUint32(c.offset + 0, true)
          const size = count * 12
          normalData = c.buffer.subarray(c.offset + 4, size, true)
          c.offset += 4 + size
        } break
        case ID.COLOURLIST: {
          const count = c.view.getUint32(c.offset + 0, true)
          const size = count * 4
          colorData = c.buffer.subarray(c.offset + 4, size, true)
          c.offset += 4 + size
        } break
        case ID.MULTICOLOURLIST: { } break
        case ID.UVLIST: {
          const count = c.view.getUint32(c.offset + 0, true)
          const channel = c.view.getUint32(c.offset + 0, true)
          const size = count * 8
          uvData = c.buffer.subarray(c.offset + 8, size, true)
          c.offset += 8 + size
        } break
        case ID.INDEXLIST: {
          const count = c.view.getUint32(c.offset + 0, true)
          const size = count * 4
          indexData = c.buffer.subarray(c.offset + 4, size, true)
          c.offset += 4 + size

          if (primType == 1) {
            indexData = triList2Tris(indexData)
          }
        } break
        case ID.WEIGHTLIST: { } break
        case ID.MATRIXLIST: { } break
      }
      c.endChunk()
    }

    entity.shaderName = shaderName
    entity.positionData = positionData
    entity.normalData = normalData
    entity.colorData = colorData
    entity.uvData = uvData
    entity.indexData = indexData
  }
}

const triList2Tris = (buffer: ArrayBufferSlice) => {
  const indicesIn = new Uint32Array(buffer.arrayBuffer)
  const indicesOut = new Uint32Array((indicesIn.length - 2) * 3)

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

