import ArrayBufferSlice from '../../ArrayBufferSlice.js'

import { ID } from './ids.js'
import { ChunkHandler } from '../chunkHandler.js'

type PngList = Record<string, ArrayBufferSlice>
export class TextureLoader {
  constructor(c: ChunkHandler, pngList: PngList) {
    const nameLen = c.view.getUint8(c.offset + 0)
    const name = new TextDecoder('utf-8')
      .decode(new DataView(c.view.buffer, c.offset + 1, nameLen))
      .replace(/\x00/g, '')
    c.offset += 1 + nameLen

    const version = c.view.getUint32(c.offset + 0, true)
    const width = c.view.getUint32(c.offset + 4, true)
    const height = c.view.getUint32(c.offset + 8, true)
    const bpp = c.view.getUint32(c.offset + 12, true)
    const alphaDepth = c.view.getUint32(c.offset + 16, true)
    const numMipMaps = c.view.getUint32(c.offset + 20, true)

    const textureType = c.view.getUint32(c.offset + 24, true)
    const usage = c.view.getUint32(c.offset + 28, true)
    const priority = c.view.getUint32(c.offset + 32, true)
    c.offset += 36

    while (c.chunksRemaining()) {
      switch (c.beginChunk()) {
        case ID.IMAGE: {
          new ImageLoader(c, pngList)
          break
        }
        case ID.VOLUME_IMAGE: { break }
      }
      c.endChunk()
    }
  }
}

class ImageLoader {
  constructor(c: ChunkHandler, pngList: PngList) {
    const nameLen = c.view.getUint8(c.offset + 0)
    const name = new TextDecoder('utf-8')
      .decode(new DataView(c.view.buffer, c.offset + 1, nameLen))
      .replace(/\x00/g, '')
    c.offset += 1 + nameLen

    const version = c.view.getUint32(c.offset + 0, true)
    const width = c.view.getUint32(c.offset + 4, true)
    const height = c.view.getUint32(c.offset + 8, true)
    const bpp = c.view.getUint32(c.offset + 12, true)
    const palettized = c.view.getUint32(c.offset + 16, true)
    const alpha = c.view.getUint32(c.offset + 20, true)
    const format = c.view.getUint32(c.offset + 24, true)
    c.offset += 28

    while (c.chunksRemaining()) {
      switch (c.beginChunk()) {
        case ID.IMAGE_DATA: {
          const size = c.view.getUint32(c.offset + 0, true)
          const data = c.buffer.subarray(c.offset + 4, size, true)
          pngList[name] = data
          break
        }
        case ID.IMAGE_FILENAME: { break }
      }
      c.endChunk()
    }
  }
}
