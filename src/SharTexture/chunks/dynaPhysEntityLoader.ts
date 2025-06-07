import { mat4, vec3 } from 'gl-matrix'

import { ChunkHandler, IEntityDSG, BoundingBox, BoundingSphere } from '../chunkHandler.js'
import { MeshLoader } from './staticEntityLoader.js'
import { ID } from './ids.js'

class InstDynaPhysDSG extends IEntityDSG {
  clone(name: string, matrix: mat4) {
    const clone = new InstDynaPhysDSG
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
export class DynaPhysLoader {
  pShadow: null

  instDynaPhys: InstDynaPhysDSG[] = []

  constructor(c: ChunkHandler) {
    const inst = new InstDynaPhysDSG
    inst.name = c.pString()
    const pShadow = null

    const version = c.u32()
    const hasAlpha = c.u32()
    inst.translucent = !!hasAlpha

    let instanceCount = 0
    while (c.chunksRemaining()) {
      switch (c.beginChunk()) {
        case ID.INSTANCES: {
          c.beginChunk() //Instances >> Scenegraph
          c.beginChunk() //Scenegraph >> ScenegraphRoot
          c.beginChunk() //ScenegraphRoot >> ScenegraphBranch
          c.beginChunk() //ScenegraphBranch >> ScenegraphTransform

          // ScenegraphTransform >> real ScenegraphTransform
          while (c.chunksRemaining()) {
            instanceCount++
            c.beginChunk()

            const name = c.pString()
            const numChild = c.u32()

            const matrix = c.mat4(false)
            const clone = inst.clone(name, matrix)
            this.instDynaPhys.push(clone)
            c.endChunk()
          }
          c.endChunk()
          c.endChunk()
          c.endChunk()
          c.endChunk()
        } break
        case ID.MESH: {
          new MeshLoader(c, inst)
        } break
        case ID.P3D_COMPOSITE_DRAWABLE: { } break
        case ID.PHYS_OBJECT: { } break
        case ID.COLL_OBJECT: { } break
        case ID.OBJECT_ATTRIBUTES: { } break
      }
      c.endChunk()
    }
    // if (foundInstances == false) {}
  }
}
