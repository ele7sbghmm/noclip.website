import { vec3, mat4 } from 'gl-matrix'

import { InstStatEntityDSG } from '../dsg/instStatEntityDSG.js'
import { MeshLoader } from './staticEntityLoader.js'
import { ChunkHandler, IEntityDSG } from '../chunkHandler.js'
import { ID } from './ids.js'

type tGeometry = IEntityDSG

class Inst extends IEntityDSG {
  clone(name: string, matrix: mat4) {
    const clone = new Inst
    clone.name = name
    clone.matrix = matrix

    clone.boundingBox = this.boundingBox
    vec3.transformMat4(clone.boundingBox.mn, clone.boundingBox.mn, matrix)
    vec3.transformMat4(clone.boundingBox.mx, clone.boundingBox.mx, matrix)

    clone.boundingSphere = this.boundingSphere
    vec3.transformMat4(clone.boundingSphere.c, clone.boundingSphere.c, matrix)

    clone.shaderName = this.shaderName
    clone.translucent = this.translucent
    clone.positionData = this.positionData
    clone.normalData = this.normalData
    clone.colorData = this.colorData
    clone.uvData = this.uvData
    clone.indexData = this.indexData
    return clone
  }
}
export class InstStatEntityLoader {
  instances: Inst[] = []

  constructor(c: ChunkHandler) {
    const curStatEntity = new Inst

    let name = c.pString()

    const version = c.u32()
    const hasAlpha = c.u32() == 1

    let geo = new IEntityDSG
    let matrix: mat4 | null = null

    while (c.chunksRemaining()) {
      switch (c.beginChunk()) {
        case ID.INSTANCES: {
          c.beginChunk()
          c.beginChunk()
          c.beginChunk()
          c.beginChunk()

          while (c.chunksRemaining()) {
            c.beginChunk()
            name = c.pString()
            const numChild = c.u32()

            matrix = c.mat4()
            // curStatEntity.geo = geo
            // curStatEntity.shadowMatrix = mat4.getTranslation(vec3.create(), matrix)

            this.instances.push(curStatEntity.clone(name, matrix))

            c.endChunk()
          }

        } break
        case ID.MESH: {
          new MeshLoader(c, curStatEntity)
        } break
      }
      c.endChunk()
    }
  }
}

