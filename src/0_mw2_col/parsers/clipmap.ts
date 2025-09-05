import { vec3 } from 'gl-matrix'

import { Reader } from '../reader.js'

export class Clipmap {
  planes: Plane[]
  brushSides: BrushSide[]
  brushes: Brush[]
  brushBounds: Bounds[]
  brushContents: number[]

  constructor(r: Reader, ptrs: number[]) {
    const name = r.u32()
    const _isInUse = r.u32()
    const planeCount = r.u32()
    const _planes = r.u32()
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
    const leafbrushNodeCount = r.u32()
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
    // ... mapEnts, smodelNodes, dynEntCount etc...

    r.seek(ptrs[1])
    this.planes = Array.from({ length: planeCount }, () => Plane.parse(r))

    r.seek(ptrs[2])
    const brushSides: number[] = Array.from({ length: numBrushSides }, () => BrushSide.parse(this, r))
    const planePtrsBase: number = Math.min(...brushSides) - Plane.SIZE
    const a = brushSides.map(side => (side - planePtrsBase) / Plane.SIZE)
    this.brushSides = a.map(planeIndex => new BrushSide(this.planes[planeIndex]))

    r.seek(ptrs[3])
    const brushes = Array.from({ length: numBrushes }, () => Brush.parse(this, r))
    const first = brushes.map(brush => brush[0])
    const brushSidePtrsBase = Math.min(...brushes.map(brush => brush[0]).filter((x): x is number => x !== undefined))
    const corrected = brushes.map(sides => sides.map(ptr => ptr - brushSidePtrsBase))
    this.brushes = corrected.map(sides => new Brush(sides.map(ptr => this.brushSides[ptr])))

    this.brushBounds = Array.from({ length: numBrushes }, () => Bounds.parse(r))
    this.brushContents = Array.from({ length: numBrushes }, () => r.u32())
  }
}

export class Brush {
  constructor(public sides: BrushSide[]) { }

  static parse(cm: Clipmap, r: Reader): number[] {
    const numsides = r.u16()
    const glassPieceIndex = r.u16()
    const sidePtr = r.u32()

    const baseAdjacentSide = r.u32()
    const axialMaterialNum = r.seekCur(12)
    const firstAdjacentSideOffset = r.seekCur(6)
    const edgeCount = r.seekCur(6)

    const sidePtrs = []
    for (let i = 0; i < numsides; i++) {
      sidePtrs.push(sidePtr + i)
    }

    return sidePtrs
  }
}

class BrushSide {
  constructor(public plane: Plane) { }

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

  constructor(public n: vec3, public d: number, t: number) { }

  static parse(r: Reader): Plane {
    const plane = new Plane(vec3.fromValues(r.f32(), r.f32(), r.f32()), r.f32(), r.u8())
    r.seekCur(3)
    return plane
  }
}

class Bounds {
  constructor(public mid: vec3, public half: vec3) { }

  static parse(r: Reader) {
    return new Bounds(
      vec3.fromValues(r.f32(), r.f32(), r.f32()),
      vec3.fromValues(r.f32(), r.f32(), r.f32())
    )
  }
}

