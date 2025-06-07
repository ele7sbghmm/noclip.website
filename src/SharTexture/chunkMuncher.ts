import ArrayBufferSlice from '../ArrayBufferSlice.js'
import { NamedArrayBufferSlice } from '../DataFetcher.js'

import { ID } from './chunks/ids.js'
import { ChunkHandler } from './chunkHandler.js'
import { StaticEntityLoader } from './chunks/staticEntityLoader.js'
import { InstStatEntityLoader } from './chunks/instStatEntityLoader.js'
import { DynaPhysLoader } from './chunks/dynaPhysEntityLoader.js'
import { WorldSphereLoader } from './chunks/worldSphereLoader.js'
import { TextureLoader } from './chunks/textureLoader.js'
import { ShaderLoader } from './chunks/shaderLoader.js'
import { ShaderList, ShaderParams } from './chunks/shaderLoader.js'
import { Scene, Sector } from './renderer.js'

export class Muncher {
  constructor(buffers: NamedArrayBufferSlice[], scene: Scene) {
    buffers.forEach((buffer, index) => {
      let n = buffer.name.slice(0, -4).split('/').pop()
      const sector = new Sector(n!, index > 2 && index < 6)
      const c = new ChunkHandler(buffer)
      c.p3dChunk()

      let numTextures = 0
      let numShaders = 0

      while (c.chunksRemaining()) {
        switch (c.beginChunk()) {
          case ID.ENTITY_DSG: {
            sector.staticEntityLoaders.push(new StaticEntityLoader(c))
          } break
          case ID.INSTA_ENTITY_DSG: {
            sector.instStatEntityLoaders.push(new InstStatEntityLoader(c))
          } break
          case ID.DYNA_PHYS_DSG: {
            sector.dynaPhysLoaders.push(new DynaPhysLoader(c))
          } break
          case ID.WORLD_SPHERE_DSG: {
            scene.worldSphereLoaders.push(new WorldSphereLoader(c))
          } break
          case ID.TEXTURE: {
            numTextures++
            new TextureLoader(c, scene.texturesSlice)
          } break
          case ID.SHADER: {
            numShaders++
            new ShaderLoader(c, scene.shaderList)
          } break
        }
        c.endChunk()
      }
      scene.sectors.push(sector)
    })
  }
}
