import { mat4, vec3 } from 'gl-matrix'

import { ChunkHandler } from '../chunkHandler.js'

export class RoadLoader {
  LoadObject(c: ChunkHandler) { }
  LoadRoadSegment(c: ChunkHandler) {
    const name = c.pstr()
    const segDataName = c.pstr()
    const hierachy = c.mat4()

    const scale = c.mat4(false)
    const z = vec3.fromValues(0., 0., 1.)
    vec3.transformMat4(z, z, scale)
    const scaleAlongFacing = z[2]

    // const rm = RoadManager.GetInstance()
    // const rsd = rm.FindRoadSegmentData(segDataName)

    return new RoadSegment(name, null, scaleAlongFacing)
  }
}

class RoadManager {
  roads = Array.from({ length: 150 }, () => new Road)
  roadSegments = Array.from({ length: 1200 }, () => new RoadSegment)
  roadSegmentData = Array.from({ length: 1200 }, () => new RoadSegmentData)
  intersections = Array.from({ length: 60 }, () => new Intersection)
  numRoads = 150
  numRoadSegments = 1200
  numRoadSegmentDatas = 1200
  numIntersesctions = 60
  numRoadsUsed = 0
  numRoadSegmentsUsed = 0
  numRoadSegmentDatasUsed = 0
  numIntersesctionsUsed = 0
  
  findRoadSegmentData(name: string) {
    for (const seg of this.roadSegmentData) {
      if (seg.name == name)
        return seg
    }
    return null
  }
}

class Road {}

class RoadSegmentData {
  name: string
  corners = [vec3.create(), vec3.create(), vec3.create(), vec3.create()]
  edgeNormals = [vec3.create(), vec3.create(), vec3.create(), vec3.create()]
  normal = vec3.create()
  numLanes = 0
}

class RoadSegment {
  // constructor(public name: string, roadSegmentData: any, scale: number) { }
}

class Intersection {
  LoadObject(c: ChunkHandler) { }
}

