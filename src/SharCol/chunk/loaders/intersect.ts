import { assert } from '../../../util.js'
import { ChunkHandler } from '../chunkHandler.js'
import { Entity } from './util.js'
import { ID } from '../id.js'

export class IntersectLoader {
  LoadObject(c: ChunkHandler) {
    assert(c.top().id == ID.INTERSECT_DSG, `wrong id`)

    const indices = Array.from({ length: c.u32() }, () => c.u32())
    const v = Array.from({ length: c.u32() }, () => [c.f32(), c.f32(), c.f32()])
    const len = c.u32()
    const n = Array.from({ length: len }, () => [c.f32(), c.f32(), c.f32()])
    let t: number[] = []

    while (c.remaining()) {
      switch (c.begin()) {
        case ID.TERRAIN_TYPE: {
          const version = c.u32()
          const size = c.u32()
          t = Array.from({ length: len }, () => c.u8())
        }
      }
      c.end()
    }
    const colors: number[] = [
      0xff694847, // road
      0xff0b9b3f, // grass
      0xffbddcf6, // sand
      0xff8b7e7f, // gravel
      0xffc4a27a, // water
      0xff5284c3, // wood
      0xff786e4a, // metal
      0xff5c78a1  // dirt
    ]
    const vertices: number[][] = []
    const normals: number[][] = []
    const terrainTypes: number[] = []
    indices.forEach((index, i) => {
      const tri = Math.floor(i / 3)
      vertices.push(v[index])
      normals.push(n[tri])
      terrainTypes.push(colors[t[tri]] ?? colors[0])
    })
    return [vertices.flat(), normals.flat(), terrainTypes]
  }
}

