import { mat4, vec3 } from 'gl-matrix'
import { Color, colorNewFromRGBA } from '../../Color.js'

import { ID } from './ids.js'
import { ChunkHandler } from '../chunkHandler.js'

export type ShaderParams = Record<string, string | number | Color | vec3 | mat4>
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
    this.name = c.pString()

    this.version = c.view.getUint32(c.offset + 0, true)
    c.offset += 4

    this.shaderName = c.pString()

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
            .decode(new DataView(c.view.buffer, c.offset, 4))
            .replace(/\x00/g, '')
          c.offset += 4

          const texName = c.pString().slice(0, -4)
          this.params[param] = texName
        } break
        case ID.INT_PARAM: {
          const param = new TextDecoder('utf-8')
            .decode(new DataView(c.view.buffer, c.offset, 4))
            .replace(/\x00/g, '')
          c.offset += 4

          this.params[param] = c.u32()
        } break
        case ID.FLOAT_PARAM: {
          const param = new TextDecoder('utf-8')
            .decode(new DataView(c.view.buffer, c.offset, 4))
            .replace(/\x00/g, '')
          c.offset += 4

          this.params[param] = c.f32()
        } break
        case ID.COLOUR_PARAM: {
          const param = new TextDecoder('utf-8')
            .decode(new DataView(c.view.buffer, c.offset, 4))
            .replace(/\x00/g, '')
          c.offset += 4

          const r = c.u8() / 255.
          const g = c.u8() / 255.
          const b = c.u8() / 255.
          const a = c.u8() / 255.
          this.params[param] = colorNewFromRGBA(r, g, b, a)
        } break
        case ID.VECTOR_PARAM: {
          const param = new TextDecoder('utf-8')
            .decode(new DataView(c.view.buffer, c.offset, 4))
            .replace(/\x00/g, '')
          c.offset += 4

          this.params[param] = vec3.fromValues(c.f32(), c.f32(), c.f32())
        } break
        case ID.MATRIX_PARAM: {
          const param = new TextDecoder('utf-8')
            .decode(new DataView(c.view.buffer, c.offset, 4))
            .replace(/\x00/g, '')
          c.offset += 4

          this.params[param] = mat4.fromValues(
            c.f32(), c.f32(), c.f32(), c.f32(),
            c.f32(), c.f32(), c.f32(), c.f32(),
            c.f32(), c.f32(), c.f32(), c.f32(),
            c.f32(), c.f32(), c.f32(), c.f32()
          )
        } break
      }
      c.endChunk()
    }
    shaderList[this.name] = this.params
  }
}

