import { ID } from './ids.js'
import { ChunkHandler } from '../chunkHandler.js'

export class ShaderLoader {
  name: string
  version: number
  shaderName: string
  hasTranslucency: number
  vertexNeeds: number
  vertexMask: number
  count: number
  params = { 'tex': '' }
  constructor(c: ChunkHandler) {
    const nameLen = c.view.getUint8(c.offset + 0)
    c.offset += 1 + nameLen

    this.version = c.view.getUint32(c.offset + 0, true)
    const shaderNameLen = c.view.getUint8(c.offset + 4)
    c.offset += 5 + shaderNameLen

    this.hasTranslucency = c.view.getUint32(c.offset + 0, true)
    this.vertexNeeds = c.view.getUint32(c.offset + 4, true)
    this.vertexMask = c.view.getUint32(c.offset + 8, true)
    this.count = c.view.getUint32(c.offset + 12, true)
    c.offset += 16

    while (c.chunksRemaining()) {
      switch (c.beginChunk()) {
        case ID.SHADER_DEFINITION: { break }
        case ID.TEXTURE_PARAM: {
          const param = c.view.getUint32(c.offset + 0, true)
          const texNameLen = c.view.getUint8(c.offset + 4)
          this.params['tex'] = new TextDecoder('utf-8')
            .decode(new DataView(c.view.buffer, c.offset + 5, texNameLen))
            .replace(/\x00/g, '')
          c.offset += 5 + texNameLen
          break
        }
        case ID.INT_PARAM: { break }
        case ID.FLOAT_PARAM: { break }
        case ID.COLOUR_PARAM: { break }
        case ID.VECTOR_PARAM: { break }
        case ID.MATRIX_PARAM: { break }
      }
      c.endChunk()
    }
  }
}

