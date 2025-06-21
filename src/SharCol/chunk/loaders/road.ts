import { mat4, mat3, vec3 } from 'gl-matrix'
import { assert } from '../../../util.js'

import { ChunkHandler } from '../chunkHandler.js'


let scratchVec = vec3.create()
let scratchVec_2 = vec3.create()
let scratchMat3 = mat3.create()
let scratchMat4 = mat4.create()
const KPH_2_MPS = 1. / 3.6

export class RoadLoader {
    static numRoadsLoaded = 0
    static numRoadSegmentsLoaded = 0

    loadRoadSegment(c: ChunkHandler, rm: RoadManager, obj: { value: number }) {
        const name = c.pstr()
        const segDataName = c.pstr()
        const hierachy = c.mat4()

        const scale = c.mat4(false)
        const z = vec3.create()
        vec3.set(z, 0., 0., 1.)
        vec3.transformMat4(z, z, scale)
        const scaleAlongFacing = z[2]

        // const rm = RoadManager.GetInstance()
        const rsd = rm.findRoadSegmentData(segDataName)!
        const rs = rm.getFreeRoadSegment()!

        rs.setName(name)
        rs.init(rsd, hierachy, scaleAlongFacing)

        rm.addRoadSegment(rs)
        obj.value = rsd!.getNumLanes()

        RoadLoader.numRoadSegmentsLoaded++
        return rs
    }
    load(c: ChunkHandler, rm: RoadManager) {
        const name = c.pstr()
        const type = c.u32()

        const start = c.pstr()
        const startIntersection = rm.findIntersection(start)
        if (startIntersection == null)
            return

        const end = c.pstr()
        const endIntersection = rm.findIntersection(end)
        if (endIntersection == null)
            return

        const density = c.u32()
        const speed = c.u32()

        const segments: RoadSegment[] = []
        let firstSeg = true
        let numLanes = 0

        if (!c.remaining())
            return

        let segCount = 0
        let tmpNumLanes
        let segment: RoadSegment
        while (c.remaining()) {
            c.begin()

            tmpNumLanes = { value: 0 }
            segment = this.loadRoadSegment(c, rm, tmpNumLanes)
            if (firstSeg)
                numLanes = tmpNumLanes.value

            segments.push(segment)
            segCount++

            c.end()
        }

        const road = rm.getFreeRoad()
        if (road == null)
            assert(false, 'oops!')

        road.setName(name)
        rm.addRoad(road)
        road.setDestinationIntersection(endIntersection)
        road.setSourceIntersection(startIntersection)
        road.setNumLanes(numLanes)

        const SPEED_MASK = 0x0000_00ff
        const DIFFIC_MASK = 0x0000_ff00
        const SC_MASK = 0x0001_0000

        road.setSpeed(speed & SPEED_MASK)
        road.setDifficulty((speed & DIFFIC_MASK) >> 8)
        road.setShortCut(!!(speed & SC_MASK))
        road.setDensity(density)

        startIntersection!.addRoadOut(road)
        endIntersection!.addRoadIn(road)

        road.allocateSegments(segments.length)

        let dist = 10000000000.
        let closest: RoadSegment | null = null
        const startPoint = vec3.create()
        startIntersection.getLocation(startPoint)

        for (let i = 0; i < segments.length; i++) {
            segment = segments[i]

            const origin = vec3.create()
            segment.getCorner(0, origin)
            vec3.sub(origin, origin, startPoint)
            const segToInt = vec3.squaredLength(origin)

            if (segToInt < dist) {
                closest = segment
                dist = segToInt
            }
        }

        let numAllocated = 0
        let allocatedSegments: RoadSegment[] = []

        allocatedSegments.push(closest!)
        numAllocated++

        let current = closest
        let found = false
        let seg: RoadSegment
        let currentTrailingLeft: vec3
        let segOrigin: vec3
        while (allocatedSegments.length < segments.length) {
            found = false

            for (let i = 0; i < segments.length; i++) {
                seg = segments[i]
                currentTrailingLeft = vec3.create()
                segOrigin = vec3.create()

                current?.getCorner(1, currentTrailingLeft)
                seg.getCorner(0, segOrigin)

                if (vec3EpsilonEquals(currentTrailingLeft, segOrigin, .5)) {
                    current = seg
                    allocatedSegments.push(seg)
                    numAllocated++

                    found = true
                    break
                }
            }

            assert(found, "oops!")
        }

        let roadLen = 0.
        for (let i = 0; i < allocatedSegments.length; i++) {
            seg = allocatedSegments[i]
            seg.setRoad(road!)
            road.addRoadSegment(seg)

            const segLen = seg.getSegmentLength()
            roadLen += segLen
        }

        road.setRoadLength(roadLen)
        road.createLanes()
        RoadLoader.numRoadsLoaded = 0
    }
}

function vec3EpsilonEquals(a: vec3, b: vec3, epsilon: number) {
    return (
        Math.abs(a[0] - b[0]) <= epsilon &&
        Math.abs(a[1] - b[1]) <= epsilon &&
        Math.abs(a[2] - b[2]) <= epsilon
    );
}

export class RoadManager {
    roads = Array.from({ length: 150 }, () => new Road)
    roadSegments = Array.from({ length: 1200 }, () => new RoadSegment)
    roadSegmentData = Array.from({ length: 1200 }, () => new RoadSegmentData)
    intersections = Array.from({ length: 60 }, () => new Intersection)
    numRoads = 150
    numRoadSegments = 1200
    numRoadSegmentDatas = 1200
    numIntersections = 60
    numRoadsUsed = 0
    numRoadSegmentsUsed = 0
    numRoadSegmentDatasUsed = 0
    numIntersectionsUsed = 0

    findRoadSegmentData(name: string) {
        for (const seg of this.roadSegmentData) {
            if (seg.name == name)
                return seg
        }
        // assert(false, 'oops!')
        return null
    }
    findIntersection(name: string) {
        for (let i = 0; i < this.numIntersectionsUsed; i++) {
            if (this.intersections[i].name == name)
                return this.intersections[i]
        }
        // assert(false, 'oops!')
        return null
    }
    getFreeRoad() {
        if (0 <= this.numRoadsUsed && this.numRoadsUsed < this.numRoads)
            return this.roads[this.numRoadsUsed]
        return null
    }
    getFreeRoadSegment() {
        if (0 <= this.numRoadSegmentsUsed && this.numRoadSegmentsUsed < this.numRoadSegments)
            return this.roadSegments[this.numRoadSegmentsUsed]
        return null
    }
    getFreeRoadSegmentData() {
        if (0 <= this.numRoadSegmentDatasUsed && this.numRoadSegmentDatasUsed < this.numRoadSegmentDatas)
            return this.roadSegmentData[this.numRoadSegmentDatasUsed]
        return null
    }
    getFreeIntersection() {
        if (0 <= this.numIntersectionsUsed && this.numIntersectionsUsed < this.numIntersections)
            return this.intersections[this.numIntersectionsUsed]
        return null
    }
    addRoadSegment(roadSegment: RoadSegment) {
        assert(this.roadSegments[this.numRoadSegmentsUsed] === roadSegment)

        this.numRoadSegmentsUsed++
    }
    addRoadDataSegment(roadDataSegment: RoadSegmentData) {
        assert(this.roadSegmentData[this.numRoadSegmentDatasUsed] === roadDataSegment)

        this.numRoadSegmentDatasUsed++
    }
    addIntersection(intersection: Intersection) {
        assert(this.intersections[this.numIntersectionsUsed] === intersection, 'ooops!')
        this.numIntersectionsUsed++
    }
    addRoad(road: Road) {
        assert(this.roads[this.numRoadsUsed] === road)

        this.numRoadsUsed++
    }
}

export class Road {
    name: string
    sourceIntersection: Intersection | null = null
    destinationIntersection: Intersection | null = null
    laneList: Lane[]
    numLanes = 0
    roadSegmentArray: RoadSegment[]
    maxRoadSegments = 0
    numRoadSegments = 0
    speed = 0
    density = 0
    difficulty = 0
    isShortCut = false
    length: number
    box: Box3D
    sphere: { center: vec3, radius: number }

    setRoadLength(len: number) { this.length = len }
    setDensity(density: number) { this.density = density }
    setShortCut(is: boolean) { this.isShortCut = is }
    setDifficulty(diff: number) { this.difficulty = diff }
    setSpeed(speed: number) { this.speed = speed }
    setNumLanes(numLanes: number) { this.numLanes = numLanes }
    setSourceIntersection(intersection: Intersection) { this.sourceIntersection = intersection }
    setDestinationIntersection(intersection: Intersection) { this.destinationIntersection = intersection }
    setName(name: string) { this.name = name }
    allocateSegments(numSegments: number) {
        this.numRoadSegments = numSegments
        this.roadSegmentArray = Array.from({ length: numSegments }, () => new RoadSegment)
    }
    getSpeed() { return this.speed }
    getNumRoadSegments() { return this.numRoadSegments }
    getDensity() { return this.density }
    addRoadSegment(roadSegment: RoadSegment) {
        this.roadSegmentArray[this.numRoadSegments] = roadSegment
        roadSegment.setSegmentIndex(this.numRoadSegments)
        this.numRoadSegments++

        const numVertices = 4
        for (let i = 0; i < numVertices; i++) {
            roadSegment.getCorner(i, scratchVec)
            if (this.numRoadSegments == 1 && i == 0) {
                vec3.copy(this.box.low, scratchVec)
                vec3.copy(this.box.high, scratchVec)
            } else {
                vec3.min(this.box.low, this.box.low, scratchVec)
                vec3.max(this.box.high, this.box.high, scratchVec)
            }
        }

        vec3.lerp(this.sphere.center, this.box.low, this.box.high, .5)
        this.sphere.radius = vec3.length(scratchVec)
    }
    createLanes() {
        this.laneList = Array.from({ length: this.numLanes }, () => new Lane)
        let totalDensity = this.getDensity()
        const laneDensity = totalDensity / this.numLanes

        for (let i = 0; i < this.numLanes; i++) {
            let density = 0
            if (i == this.numLanes - 1) {
                density = totalDensity
            } else {
                density = laneDensity
            }

            this.laneList[i].create(density, this)
            totalDensity -= laneDensity
            this.laneList[i].setSpeedLimit(this.getSpeed() * KPH_2_MPS)
            this.laneList[i].allocatePoints(this.getNumRoadSegments() + 1)
        }

        for (let i = 0; i < this.numRoadSegments; i++) {
            const seg = this.roadSegmentArray[i]
            for (let j = 0; j < this.numLanes; j++) {
                const start = vec3.create(), facing = vec3.create()
                seg.getLaneLocation(0., j, start, facing)
                this.laneList[j].setPoint(i, start)
            }
        }
        const seg = this.roadSegmentArray[this.numRoadSegments - 1]
        for (let i = 0; i < this.numLanes; i++) {
            const end = vec3.create(), facing = vec3.create()
            seg.getLaneLocation(1., i, end, facing)
            this.laneList[i].setPoint(this.numRoadSegments, end)
        }
    }
    getNumLanes() { return this.numLanes }
}

class TrafficVehicle { }

class Lane {
    waitingVehicle: TrafficVehicle
    desiredDensity: number
    parentRoad: Road
    trafficVehicles: TrafficVehicle[]
    speedLimit: number
    points: vec3[]
    numPoints: number
    create(density: number, parentRoad: Road) {
        this.desiredDensity = density
        this.parentRoad = parentRoad
        if (density > 0)
            this.trafficVehicles = Array.from({ length: density }, () => new TrafficVehicle)
    }
    setDensity(numCars: number) { this.desiredDensity = numCars }
    setSpeedLimit(metresPerSecond: number) { this.speedLimit = metresPerSecond }
    allocatePoints(numPoints: number) {
        this.points = Array.from({ length: numPoints }, () => vec3.create())
        this.numPoints = numPoints
    }
    setPoint(index: number, point: vec3) { this.points[index] = point }
}

export class RoadSegmentData {
    name: string
    corners = [vec3.create(), vec3.create(), vec3.create(), vec3.create()]
    edgeNormals = [vec3.create(), vec3.create(), vec3.create(), vec3.create()]
    normal = vec3.create()
    direction: vec3
    top: vec3
    bottom: vec3
    numLanes = 0
    type: LocatorType

    getCorner(index: number) { return this.corners[index] }
    getEdgeNormal(index: number) { return this.edgeNormals[index] }
    getSegmentNormal() { return this.normal }
    getNumLanes() { return this.numLanes }
    setName(name: string) { this.name = name }
    setType(type: LocatorType) { this.type = type }
    setData(direction: vec3, top: vec3, bottom: vec3, numLanes: number) {
        this.direction = direction
        this.top = top
        this.bottom = bottom
        this.numLanes = numLanes
    }
    load(c: ChunkHandler, rm: RoadManager) {
        const name = c.pstr()
        const type = c.u32()
        const numLanes = c.u32()
        const hasShoulder = !!c.u32()

        const direction = vec3.create()
        vec3.set(direction, c.f32(), c.f32(), c.f32())

        const top = vec3.create()
        vec3.set(top, c.f32(), c.f32(), c.f32())

        const bottom = vec3.create()
        vec3.set(bottom, c.f32(), c.f32(), c.f32())

        const rsd = rm.getFreeRoadSegmentData()
        if (rsd == null)
            assert(false, 'oops!')

        rsd.setName(name)
        rsd.setData(direction, top, bottom, numLanes)

        rm.addRoadDataSegment(rsd)
    }
}

class RoadSegment {
    name: string
    road: Road | null = null
    segmentIndex = 0
    corners = [vec3.create(), vec3.create(), vec3.create(), vec3.create()]
    edgeNormals = [vec3.create(), vec3.create(), vec3.create(), vec3.create()]
    normal: vec3
    segmentLength: number
    laneWidth: number
    radius: number
    angle: number
    sphere: { center: vec3, radius: number }

    setName(name: string) { this.name = name }
    init(rsd: RoadSegmentData, hierachy: mat4, scaleAlongFacing: number) {
        for (let i = 0; i < 4; i++) {
            vec3.copy(this.corners[i], rsd.getCorner(i))
            vec3.copy(this.edgeNormals[i], rsd.getEdgeNormal(i))
        }

        vec3.lerp(scratchVec, this.corners[0], this.corners[3], .5)
        const width = vec3.length(scratchVec)
        this.laneWidth = width / rsd.getNumLanes()

        let cosTheta = vec3.dot(this.edgeNormals[0], this.edgeNormals[1])
        if (cosTheta < 0.)
            cosTheta = 0. - cosTheta
        if (cosTheta < .001)
            cosTheta = 0.

        vec3.sub(scratchVec, this.corners[0], this.corners[1])
        const interiorEdgeLength = vec3.length(scratchVec)
        vec3.sub(scratchVec, this.corners[2], this.corners[3])
        const exteriorEdgeLength = vec3.length(scratchVec)

        if (cosTheta != 0.) {
            let length = Math.min(interiorEdgeLength, exteriorEdgeLength)
            length /= 2.
            this.radius = length / cosTheta
            this.angle = Math.PI / 2 - Math.acos(cosTheta)
        } else {
            this.radius = 0.
            this.angle = 0.
        }

        for (let i = 0; i < 4; i++) {
            vec3.copy(scratchVec, rsd.getCorner(i))
            scratchVec[2] *= scaleAlongFacing
            vec3.transformMat4(scratchVec, scratchVec, hierachy)
            vec3.copy(this.corners[i], scratchVec)

            vec3.copy(scratchVec, rsd.getEdgeNormal(i))
            mat3.fromMat4(scratchMat3, hierachy)
            vec3.transformMat3(scratchVec, scratchVec, scratchMat3)
            vec3.copy(this.edgeNormals[i], scratchVec)
        }

        vec3.copy(scratchVec, rsd.getSegmentNormal())
        mat3.fromMat4(scratchMat3, hierachy)
        vec3.transformMat3(scratchVec, scratchVec, scratchMat3)
        vec3.copy(this.normal, scratchVec)

        vec3.lerp(scratchVec, this.corners[0], this.corners[3], .5)
        vec3.lerp(scratchVec_2, this.corners[1], this.corners[2], .5)
        vec3.add(scratchVec, scratchVec, scratchVec_2)
        this.segmentLength = vec3.length(scratchVec)

        const box = new Box3D ////////////////////////
        this.getBoundingBox(box)

        vec3.lerp(scratchVec, box.high, box.low, .5)
        this.sphere.center = scratchVec
        this.sphere.radius = vec3.length(scratchVec)
    }
    setRoad(road: Road) { this.road = road }
    getBoundingBox(box: Box3D) {
        const numVertices = 4
        for (let i = 0; i < numVertices; i++) {
            vec3.copy(scratchVec, this.corners[i])
            if (i == 0) {
                vec3.copy(box.low, scratchVec)
                vec3.copy(box.high, scratchVec)
            } else {
                vec3.min(box.low, box.low, scratchVec)
                vec3.max(box.high, box.high, scratchVec)
            }
        }
    }
    setSegmentIndex(index: number) { this.segmentIndex = index }
    getSegmentLength() { return this.segmentLength }
    getLaneLocation(t: number, index: number, position: vec3, facing: vec3) {
        const facingNormals = [vec3.create(), vec3.create()]
        this.getEdgeNormal(0, facingNormals[0])
        this.getEdgeNormal(2, facingNormals[1])
        vec3.lerp(facing, facingNormals[0], facingNormals[1], t)

        const edgeT = ((index << 1) + 1) / (this.getNumLanes() << 1)

        const [v0, v1, v2, v3] = [vec3.create(), vec3.create(), vec3.create(), vec3.create()]
        this.getCorner(0, v0)
        this.getCorner(1, v1)
        this.getCorner(2, v2)
        this.getCorner(3, v3)

        const bottomEdgeDir = vec3.create()
        const topEdgeDir = vec3.create()
        vec3.sub(bottomEdgeDir, v0, v3)
        vec3.sub(topEdgeDir, v1, v2)

        const start = vec3.create()
        const end = vec3.create()
        vec3.scale(start, bottomEdgeDir, edgeT)
        vec3.scale(end, topEdgeDir, edgeT)
        vec3.add(start, start, v3)
        vec3.add(end, end, v2)

        const laneDir = vec3.create()
        vec3.sub(laneDir, end, start)
        vec3.scale(position, laneDir, t)
        vec3.add(position, position, start)
    }
    getCorner(index: number, out: vec3) { vec3.copy(out, this.corners[index]) }
    getEdgeNormal(index: number, out: vec3) { vec3.copy(out, this.edgeNormals[index]) }
    getNumLanes() { return this.getRoad()!.getNumLanes() }
    getRoad() { return this.road }
}

export class Intersection {
    name: string
    type: LocatorType
    radius: number
    location: vec3

    roadListIn: Road[]
    roadListOut: Road[]
    numRoadsIn: number
    numRoadsOut: number
    addRoadIn(road: Road) {
        this.roadListIn[this.numRoadsIn] = road
        this.numRoadsIn++
    }
    addRoadOut(road: Road) {
        this.roadListOut[this.numRoadsOut] = road
        this.numRoadsOut++
    }
    getLocation(location: vec3) { vec3.copy(location, this.location) }
    load(c: ChunkHandler, rm: RoadManager) {
        const name = c.pstr()
        const loc = vec3.create()
        vec3.set(loc, c.f32(), c.f32(), c.f32())

        const radius = c.f32()
        const type = c.u32()
        let intersection = rm.findIntersection(name)
        if (intersection == null) {
            intersection = rm.getFreeIntersection()!
            intersection.setName(name)
            intersection.setType(type)
            intersection.setRadius(radius)
            intersection.setLocation(loc)

            rm.addIntersection(intersection)
        }
    }
    setName(name: string) { this.name = name }
    setType(type: LocatorType) { this.type = type as unknown as LocatorType }
    setRadius(radius: number) { this.radius = radius }
    setLocation(location: vec3) { this.location = location }
}

enum LocatorType {
    EVENT,
    SCRIPT,
    GENERIC,
    CAR_START,
    SPLINE,
    DYNAMIC_ZONE,
    OCCLUSION,
    INTERIOR_ENTRANCE,
    DIRECTIONAL,
    ACTION,
    FOV,
    BREAKABLE_CAMERA,
    STATIC_CAMERA,
    PED_GROUP,
    COIN,
    SPAWN_POINT
}

class Box3D {
    high: vec3
    low: vec3
}