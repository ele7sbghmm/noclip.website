import ArrayBufferSlice from '../ArrayBufferSlice.js'

import { ID } from './chunks/ids.js'
import { ChunkHandler } from './chunkHandler.js'
import { StaticEntityLoader } from './chunks/staticEntityLoader.js'
import { TextureLoader } from './chunks/textureLoader.js'
import { ShaderLoader } from './chunks/shaderLoader.js'
import { ShaderList, ShaderParams } from './chunks/shaderLoader.js'
import { Scene } from './renderer.js'

export class Muncher {
  constructor(buffer: ArrayBufferSlice, scene: Scene) {
    const c = new ChunkHandler(buffer)
    c.p3dChunk()

    while (c.chunksRemaining()) {
      switch (c.beginChunk()) {
        case ID.ENTITY_DSG: {
          scene.staticEntityLoaders.push(new StaticEntityLoader(c))
        }
        case ID.TEXTURE: {
          new TextureLoader(c, scene.texturesSlice)
        }
        case ID.SHADER: {
          new ShaderLoader(c, scene.shaders)
        }
      }
      c.endChunk()
    }
  }
}
