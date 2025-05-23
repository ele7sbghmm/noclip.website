import { ID } from './ids.js'
import { ChunkHandler } from '../chunkHandler.js'

export type ShaderParams = Record<string, string | number>
export type ShaderList = Record<string, Partial<ShaderParams>>

export class ShaderLoader {
  name: string
  version: number
  shaderName: string
  hasTranslucency: number
  vertexNeeds: number
  vertexMask: number
  count: number
  params: Partial<ShaderParams> = {}
  constructor(c: ChunkHandler, shaderList: ShaderList) {
    const nameLen = c.view.getUint8(c.offset + 0)
    this.name = new TextDecoder('utf-8')
      .decode(new DataView(c.view.buffer, c.offset + 1, nameLen))
      .replace(/\x00/g, '')

    this.version = c.view.getUint32(c.offset + 0, true)
    c.offset += 5 + nameLen

    const shaderNameLen = c.view.getUint8(c.offset + 0)
    this.shaderName = new TextDecoder('utf-8')
      .decode(new DataView(c.view.buffer, c.offset + 1, nameLen))
      .replace(/\x00/g, '')
    c.offset += 1 + shaderNameLen

    this.hasTranslucency = c.view.getUint32(c.offset + 0, true)
    this.vertexNeeds = c.view.getUint32(c.offset + 4, true)
    this.vertexMask = c.view.getUint32(c.offset + 8, true)
    this.count = c.view.getUint32(c.offset + 12, true)
    c.offset += 16

    while (c.chunksRemaining()) {
      switch (c.beginChunk()) {
        case ID.SHADER_DEFINITION: { break }
        case ID.TEXTURE_PARAM: {
          const param = new TextDecoder('utf-8')
            .decode(new DataView(c.view.buffer, c.offset + 0, 4))
            .replace(/\x00/g, '')
          const texNameLen = c.view.getUint8(c.offset + 4)
          const texName = new TextDecoder('utf-8')
            .decode(new DataView(c.view.buffer, c.offset + 5, texNameLen))
            .replace(/\x00/g, '')
            .slice(0, -4)

          this.params[param] = texName
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
    shaderList[this.name] = this.params
  }
}

