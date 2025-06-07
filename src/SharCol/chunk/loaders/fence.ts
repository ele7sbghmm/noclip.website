import { vec3 } from 'gl-matrix'

import { ChunkHandler } from '../chunkHandler.js'
import { ID } from '../id.js'
import { Entity } from './util.js'

export class Fence {
  start: vec3
  end: vec3
  normal: vec3
}

export class FenceLoader {
  static LoadObject(c: ChunkHandler) {
    const fence = new Fence

    while (c.remaining()) {
      switch (c.begin()) {
        case ID.WALL: {
          fence.start = c.vec3()
          fence.end = c.vec3()
          fence.normal = c.vec3()
        } break
      }
      c.end()
    }

    return fence
  }
}
