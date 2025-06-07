import { ID } from './ids.js'
import { ChunkHandler, IEntityDSG } from '../chunkHandler.js'
import { MeshLoader } from './staticEntityLoader.js'

export class WorldSphereLoader {
  name: string
  worldSpheres: IEntityDSG[] = []
  constructor(c: ChunkHandler) {
    this.name = c.pString()

    const version = c.u32()
    const pMC = null
    const numMeshes = c.u32()
    const numBillboardQuadGroups = c.u32()

    while (c.chunksRemaining()) {
      switch (c.beginChunk()) {
        case ID.MESH: {
          const inst = new IEntityDSG
          new MeshLoader(c, inst)
          this.worldSpheres.push(inst)
        } break
        case ID.P3D_COMPOSITE_DRAWABLE: { } break
        case ID.P3D_SKELETON: { } break
        case ID.LENS_FLARE_DSG: { } break
        // case ID.ANIMATION: { } break
        // case ID.FRAME_CONTROLLER: { } break
        // case ID.P3D_MULTICONTROLLER: { } break
        // case ID.QUAD_GROUP: { } break
      }
      c.endChunk()
    }
    const pFlare = null
  }
}
