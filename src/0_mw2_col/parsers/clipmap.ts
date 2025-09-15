import { vec3 } from 'gl-matrix'

import { Reader } from '../reader.js'

export class Clipmap {
  planes: Plane[]
  brushSides: BrushSide[]
  brushes: Brush[]
  brushBounds: Bounds[]
  brushContents: number[]

  verts: vec3[]
  triIndices: number[][]
  triEdgeIsWalkable: number[]

  constructor(r: Reader, ptrs: number[]) {
    const name = r.u32()
    const _isInUse = r.u32()
    const planeCount = r.u32()
    const planesPtr = r.u32()
    const numStaticModels = r.u32()
    const _staticModelList = r.u32()
    const numMaterials = r.u32()
    const _materials = r.u32()

    const numBrushSides = r.u32()
    const _brushsides = r.u32()
    const numBrushEdges = r.u32()
    const _brushEdges = r.u32()
    const numNodes = r.u32()
    const _nodes = r.u32()
    const numLeafs = r.u32()
    const leafs = r.u32()
    const leafbrushNodesCount = r.u32()
    const _leafbrushNodes = r.u32()
    const numLeafBrushes = r.u32()
    const _leafbrushes = r.u32()
    const numLeafSurfaces = r.u32()
    const _leafsurfaces = r.u32()
    const vertCount = r.u32()
    const _verts = r.u32()
    const triCount = r.u32()
    const _triIndices = r.u32()
    const _triEdgeIsWalkable = r.u32()
    const borderCount = r.u32()
    const _borders = r.u32()
    const partitionCount = r.u32()
    const _patritions = r.u32()
    const aabbTreeCount = r.u32()
    const _aabbTrees = r.u32()
    const numSubModels = r.u32()
    const _cmodels = r.u32()
    const numBrushes = r.u32()
    const _brushes = r.u32()
    const _brushBounds = r.u32()
    const _brushContents = r.u32()
    const _mapEnts = r.u32()
    const _smodelNodeCount = r.u16()
    r.u16()
    const _smodelNodes = r.u32()
    const _dynEntCount = [r.u16(), r.u16()]
    const _dynEntDefList = [r.u32(), r.u32()]
    const _dynEntPoseList = [r.u32(), r.u32()]
    const _dynEntClientList = [r.u32(), r.u32()]
    const _dynEntCollList = [r.u32(), r.u32()]
    const _checksum = r.u32()
    r.seekCur(0x30)

    if (planesPtr == -1) {
      this.planes = Array.from({ length: planeCount }, () => Plane.parse(r))
    } else {
      const og = r.offs
      r.seek(ptrs[0])
      this.planes = Array.from({ length: planeCount }, () => Plane.parse(r))
      r.seek(og)
    }

    // 60813925
    const _staticModels = r.seekCur(0x4c * numStaticModels)
    const clipMaterialParsers = Array.from({ length: numMaterials }, () => new ClipMaterialParser(r))
    const clipMaterials = clipMaterialParsers.map(cmp => new ClipMaterial(this, r, cmp))

    // 
    const brushSides: number[] = Array.from({ length: numBrushSides }, () => BrushSide.parse(this, r))
    const __brushEdges = r.seekCur(numBrushEdges)
    const __nodes = r.seekCur(0x8 * numNodes)
    const __leafs = r.seekCur(0x28 * numLeafs)
    const __leafbrushes = r.seekCur(numLeafBrushes * 2)
    // 61884464
    const __leafbrushNodes = Array.from({ length: leafbrushNodesCount }, () => new LeafBrushNode(r))
    __leafbrushNodes.forEach(node => node.updatePtrs(r))
    const __leafsurfaces = r.seekCur(numLeafSurfaces * 0)

    // 62193148
    this.verts = Array.from({ length: vertCount }, () => vec3.fromValues(r.f32(), r.f32(), r.f32()))
    this.triIndices = Array.from({ length: triCount }, () => [r.u16(), r.u16(), r.u16()])
    this.triEdgeIsWalkable = Array.from({ length: (triCount * 3 + 0x1f) >> 5 << 2 }, () => r.u8())
    const __borders = r.seekCur(0x1c * borderCount)
    const __partitions = r.seekCur(0xc * partitionCount)
    const __aabbTrees = r.seekCur(0x20 * aabbTreeCount)
    const __cmodels = r.seekCur(0x44 * numSubModels)

    // 63122556
    const brushes = Array.from({ length: numBrushes }, () => Brush.parse(this, r))
    this.brushBounds = Array.from({ length: numBrushes }, () => Bounds.parse(r))
    this.brushContents = Array.from({ length: numBrushes }, () => r.u32())

    const planePtrsBase: number = Math.min(...brushSides) - Plane.SIZE
    const a = brushSides.map(side => (side - planePtrsBase) / Plane.SIZE)
    this.brushSides = a.map(planeIndex => new BrushSide(this.planes[planeIndex], planeIndex))

    const brushSidePtrsBase = Math.min(...brushes.map(brush => brush.sidePtr).filter((x): x is number => !!x && x !== undefined))
    this.brushes = brushes.map((brush, i) => {
      let index = (brush.sidePtr - brushSidePtrsBase) / 8
      const sides = Array.from({ length: brush.numsides }, () => index++)
      return new Brush(
        i,
        sides.map(ptr => this.brushSides[ptr]),
        index,
        this.brushBounds[i],
        this.brushContents[i]
      )
    })

  }
}

export class Brush {
  static SIZE = 0x24
  constructor(public n: number, public sides: BrushSide[], public sideIndex: number, public bounds: Bounds, public contents: number) { }
  static parse(cm: Clipmap, r: Reader) {
    const numsides = r.u16()
    const glassPieceIndex = r.u16()
    const sidePtr = r.u32()

    const baseAdjacentSide = r.u32()
    const axialMaterialNum = r.seekCur(12)
    const firstAdjacentSideOffset = r.seekCur(6)
    const edgeCount = r.seekCur(6)

    return { 'sidePtr': sidePtr, 'numsides': numsides }
  }
}

class BrushSide {
  static SIZE = 0x8
  constructor(public plane: Plane, public planeIndex: number) { }
  static parse(cm: Clipmap, r: Reader) {
    const planePtr = r.u32()
    const materialNum = r.u16()
    const firstAdjacentSideOffset = r.u8()
    const edgeCount = r.u8()

    return planePtr
  }
}

export class Plane {
  static SIZE = 0x14
  constructor(public n: vec3, public d: number, public t: number) { }
  static parse(r: Reader): Plane {
    const rnd = 6
    const plane = new Plane(vec3.fromValues(r.f32r(rnd), r.f32r(rnd), r.f32r(rnd)), r.f32r(rnd), r.u8())
    // const plane = new Plane(vec3.fromValues(r.f32(), r.f32(), r.f32()), r.f32(), r.u8())
    r.seekCur(3)
    return plane
  }
}

export class Bounds {
  static SIZE = 0x8
  constructor(public mid: vec3, public half: vec3) { }
  static parse(r: Reader) {
    const rnd = 6
    return new Bounds(
      vec3.fromValues(r.f32r(rnd), r.f32r(rnd), r.f32r(rnd)),
      vec3.fromValues(r.f32r(rnd), r.f32r(rnd), r.f32r(rnd))
    )
  }
}

class ClipMaterialParser {
  static SIZE = 0xc
  namePtr: number
  surfaceFlags: number
  contents: number
  constructor(r: Reader) {
    this.namePtr = r.i32()
    this.surfaceFlags = r.u32()
    this.contents = r.u32()
  }
}
class ClipMaterial {
  name: string
  surfaceFlags: number
  contents: number
  constructor(cm: Clipmap, r: Reader, cmp: ClipMaterialParser) {
    if (cmp.namePtr == -1) {
      this.name = r.cstr()
    }
    this.surfaceFlags = cmp.surfaceFlags
    this.contents = cmp.contents
  }
}

class LeafBrushNode {
  axis: number
  leafBrushCount: number
  contents: number
  brushesIndex: number
  brushes: number[]                 // - leaf
  dist: number                  // T internal
  range: number                 // |
  childOffset: [number, number] // J
  constructor(r: Reader) {
    this.axis = r.u8()
    r.u8()
    this.leafBrushCount = r.u16()
    this.contents = r.u32()
    this.brushesIndex = r.i32()
    r.seekCur(-4)
    this.dist = r.f32()
    this.range = r.f32()
    this.childOffset = [r.u16(), r.u16()]
  }
  updatePtrs(r: Reader) {
    if (this.brushesIndex == -1 && this.leafBrushCount > 0) {
      this.brushes = Array.from({ length: this.leafBrushCount }, () => r.u16())
    }
  }
}
