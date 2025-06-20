import { vec3, mat4 } from 'gl-matrix'

import { ChunkHandler } from '../chunkHandler.js'
import { ID } from '../id.js'

let scratchVec3 = vec3.create()
export class StatPhys {
  LoadObject(c: ChunkHandler) {
    let pos: number[] = []
    let nrm: number[] = []

    const name = c.pstr()

    const shadowName = null

    const version = c.u32()

    while (c.remaining()) {
      switch (c.begin()) {
        case ID.OBJECT: {
          const [p, n] = new CollisionObject().LoadObject(c)
          pos = pos.concat(p)
          nrm = nrm.concat(n)
        } break
        case ID.OBJECT_ATTRIBUTES: { } break
      }
      c.end()
    }

    return [pos, nrm]
  }
}
class CollisionObject {
  LoadObject(c: ChunkHandler) {
    let pos: number[] = []
    let nrm: number[] = []

    const name = c.pstr()
    const version = c.u32()
    const stringData = c.pstr()
    const nbSubObject = c.u32()
    const numOwner = c.u32()

    while (c.remaining()) {
      switch (c.begin()) {
        case ID.OWNER: {
          const numNames = c.u32()
          if (numNames) {

            while (c.remaining()) {
              switch (c.begin()) {
                case ID.OWNERNAME: {
                  const newName = c.pstr()
                }
              }
              c.end()
            }
          }
        } break
        case ID.SELFCOLLISION: {
          const index1 = c.u32()
          const index2 = c.u32()
          const self1 = !!c.u16()
          const self2 = !!c.u16()
        } break
        case ID.VOLUME: {
          const [p, n] = LoadCollisionVolume(c)
          pos = pos.concat(p)
          nrm = nrm.concat(n)
        } break
        case ID.ATTRIBUTE: {
          const isStatic = !!c.u16()
          const defaultArea = c.u32()
          const canRoll = !!c.u16()
          const canSlide = !!c.u16()
          const canSpin = !!c.u16()
          const canBounce = !!c.u16()
          const extraAttribute1 = c.u32()
          const extraAttribute2 = c.u32()
          const extraAttribute3 = c.u32()
        } break
      }
      c.end()
    }
    return [pos, nrm]
  }
}
function LoadCollisionVolume(c: ChunkHandler) {
  let pos: number[] = []
  let nrm: number[] = []
  const objrefIndex = c.u32()
  const ownerIndex = c.u32()
  const numSubVolume = c.u32()
  let newCollisionVolume = null
  const _sides = 12
  const _doubleSided = false
  switch (c.begin()) {
    case ID.SPHERE: {
      const radius = c.f32()
      const center = LoadVectorFromCollisionVectorChunk(c)
      const [sphPos, sphNrm] = new SphereVolume(center, radius).getBuffers(_sides, _doubleSided)
      pos = pos.concat(sphPos)
      nrm = nrm.concat(sphNrm)
    } break
    case ID.CYLINDER: {
      const radius = c.f32()
      const length = c.f32()
      const flatEnd = c.u16()
      const p = LoadVectorFromCollisionVectorChunk(c)
      const o = LoadVectorFromCollisionVectorChunk(c)
      const [cylPos, cylNrm] = new CylinderVolume(p, o, length, radius, !!flatEnd).getBuffers(_sides, _doubleSided)
      pos = pos.concat(cylPos)
      nrm = nrm.concat(cylNrm)
    } break
    case ID.OBBOX: {
      const l0 = c.f32()
      const l1 = c.f32()
      const l2 = c.f32()
      const p = LoadVectorFromCollisionVectorChunk(c)
      const o0 = LoadVectorFromCollisionVectorChunk(c)
      const o1 = LoadVectorFromCollisionVectorChunk(c)
      const o2 = LoadVectorFromCollisionVectorChunk(c)
      const [obboxPos, obboxNrm] = new OBBoxVolume(p, o0, o1, o2, l0, l1, l2).getBuffers()
      pos = pos.concat(obboxPos)
      nrm = nrm.concat(obboxNrm)

    } break
    case ID.WALL_: { } break
    case ID.BBOX: { } break
  }
  c.end()

  for (let i = 0; i < numSubVolume; i++) {
    c.begin()
    const [p, n] = LoadCollisionVolume(c)
    pos = pos.concat(p)
    nrm = nrm.concat(n)
    c.end()
  }
  return [pos, nrm]
}
function LoadVectorFromCollisionVectorChunk(c: ChunkHandler) {
  c.begin()
  const v = vec3.fromValues(c.f32(), c.f32(), c.f32())
  c.end()
  return v
}
class SphereVolume {
  constructor(public center: vec3, public radius: number) { }
  getPoints(sides: number) {
    let row: vec3[] = [], rows: vec3[][] = []
    let r: number, r2: number, d: number, d2: number, rad: number

    for (d2 = -90; d2 <= 90; d2 += Math.floor(360 / sides)) {
      r2 = d2 * (Math.PI / 180)
      rad = Math.cos(r2) * this.radius
      row = []
      for (d = 0; d < 360; d += Math.floor(360 / sides)) {
        r = d * (Math.PI / 180)

        scratchVec3 = vec3.fromValues(
          Math.sin(r) * rad,
          -Math.cos(r) * rad,
          Math.sin(r2) * this.radius
        )
        row.push(scratchVec3)
      }
      rows.push(row)
    }

    return rows.map(row => row.map(v => {
      scratchVec3 = vec3.clone(v)
      vec3.add(scratchVec3, scratchVec3, this.center)
      return scratchVec3
    }))
  }
  getBuffers(sides: number, doubleSided: boolean = false) {
    const pos: number[] = [], nrm: number[] = [], box: vec3[] = []
    let trow: vec3[], nrow: vec3[]
    let tp: vec3, tq: vec3, np: vec3, nq: vec3
    const rows = this.getPoints(sides)

    let i, j
    for (i = 0; i < rows.length - 1; i++) {
      trow = rows[i + 0]
      nrow = rows[i + 1]
      for (j = 0; j < sides; j++) {
        tp = trow[j + 0]
        tq = j < sides - 1 ? trow[j + 1] : trow[0]
        np = nrow[j + 0]
        nq = j < sides - 1 ? nrow[j + 1] : nrow[0]
        box.push(tp, nq, np)
        box.push(tp, tq, nq)
        if (doubleSided) {
          box.push(tp, np, nq)
          box.push(tp, nq, tq)
        }
      }
    }
    box.forEach(v => {
      scratchVec3 = vec3.clone(v)
      pos.push(scratchVec3[0], scratchVec3[1], scratchVec3[2])
    })
    const normals = calcNormals(box)
    normals.forEach(n => { nrm.push(n[0], n[1], n[2]) })
    return [pos, nrm]
  }
}
class CylinderVolume {
  transformMatrix: mat4
  constructor(center: vec3, axis: vec3, public length: number, public radius: number, public flatEnd: boolean) {
    const rotationMatrix = mat4.create()
    axisToRotationMatrix(rotationMatrix, axis, mat4.create())

    this.transformMatrix = mat4.clone(rotationMatrix)
    this.transformMatrix[12] = center[0]
    this.transformMatrix[13] = center[1]
    this.transformMatrix[14] = center[2]
  }
  getBuffers(sides: number, doubleSided: boolean = false) {
    const pos: number[] = [], nrm: number[] = []
    const top: vec3[][] = [], bot: vec3[][] = []

    let scratchVec3 = vec3.create()
    let roww = []
    let i: number, j: number, r: number, r2: number, d: number, d2: number, b: number, rad: number

    const idk = (this.flatEnd ? 1 : 90)
    for (d2 = 0; d2 < idk; d2 += Math.floor(360 / sides)) {
      r2 = d2 * (Math.PI / 180)
      rad = Math.cos(r2) * this.radius
      roww = []
      for (d = 0; d < 360; d += Math.floor(360 / sides)) {
        r = d * (Math.PI / 180)

        scratchVec3 = vec3.fromValues(
          Math.sin(r) * rad,
          Math.sin(r2) * this.radius,
          Math.cos(r) * rad
        )
        roww.push(scratchVec3)
      }
      top.push(roww)
    }
    for (d2 = 0; d2 < idk; d2 += Math.floor(360 / sides)) {
      r2 = d2 * (Math.PI / 180)
      rad = Math.cos(r2) * this.radius
      roww = []
      for (d = 0; d < 360; d += Math.floor(360 / sides)) {
        r = d * (Math.PI / 180)

        scratchVec3 = vec3.fromValues(
          Math.sin(r) * rad,
          -Math.sin(r2) * this.radius,
          Math.cos(r) * rad
        )
        roww.push(scratchVec3)
      }
      bot.push(roww)
    }
    top.push(Array.from({ length: sides }, () => vec3.fromValues(0, this.flatEnd ? 0 : this.radius, 0)))
    bot.push(Array.from({ length: sides }, () => vec3.fromValues(0, this.flatEnd ? 0 : -this.radius, 0)))

    const box: vec3[] = []
    let trow: vec3[], nrow: vec3[]
    let tp: vec3, np: vec3
    let tq: vec3, nq: vec3
    const topTransformed = top.map(r => r.map(v => {
      scratchVec3 = vec3.clone(v)
      vec3.add(scratchVec3, scratchVec3, vec3.fromValues(0, this.length, 0))
      vec3.transformMat4(scratchVec3, scratchVec3, this.transformMatrix)
      return scratchVec3
    }))
    const botTransformed = bot.map(r => r.map(v => {
      scratchVec3 = vec3.clone(v)
      vec3.add(scratchVec3, scratchVec3, vec3.fromValues(0, -this.length, 0))
      vec3.transformMat4(scratchVec3, scratchVec3, this.transformMatrix)
      return scratchVec3
    }))
    for (i = 0; i < top.length - 1; i++) {
      trow = topTransformed[i + 0]
      nrow = topTransformed[i + 1]
      for (j = 0; j < sides; j++) {
        tp = trow[j + 0]
        tq = j < sides - 1 ? trow[j + 1] : trow[0]
        np = nrow[j + 0]
        nq = j < sides - 1 ? nrow[j + 1] : nrow[0]
        box.push(tp, nq, np)
        box.push(tp, tq, nq)
        if (doubleSided) {
          box.push(tp, np, nq)
          box.push(tp, nq, tq)
        }
      }
    }
    for (i = 0; i < bot.length - 1; i++) {
      trow = botTransformed[i + 0]
      nrow = botTransformed[i + 1]
      for (j = 0; j < sides; j++) {
        tp = trow[j + 0]
        tq = j < sides - 1 ? trow[j + 1] : trow[0]
        np = nrow[j + 0]
        nq = j < sides - 1 ? nrow[j + 1] : nrow[0]
        box.push(tp, np, nq)
        box.push(tp, nq, tq)
        if (doubleSided) {
          box.push(tp, nq, np)
          box.push(tp, tq, nq)
        }
      }
    }
    for (i = 0; i < sides; i++) {
      j = i < sides - 1 ? i + 1 : 0
      box.push(botTransformed[0][i], topTransformed[0][j], topTransformed[0][i])
      box.push(botTransformed[0][i], botTransformed[0][j], topTransformed[0][j])
      if (doubleSided) {
        box.push(botTransformed[0][i], topTransformed[0][i], topTransformed[0][j])
        box.push(botTransformed[0][i], topTransformed[0][j], botTransformed[0][j])
      }
    }

    box.forEach(v => {
      scratchVec3 = vec3.clone(v)
      pos.push(scratchVec3[0], scratchVec3[1], scratchVec3[2])
    })
    const normals = calcNormals(box)
    normals.forEach(n => { nrm.push(n[0], n[1], n[2]) })
    return [pos, nrm]
  }
}
class OBBoxVolume {
  mat: mat4
  points: vec3[]
  normals: vec3[]
  center: vec3
  constructor(center: vec3, axis0: vec3, axis1: vec3, axis2: vec3, l0: number, l1: number, l2: number) {
    this.center = center
    this.mat = mat4.fromValues(
      axis0[0], axis0[1], axis0[2], 0,
      axis1[0], axis1[1], axis1[2], 0,
      axis2[0], axis2[1], axis2[2], 0,
      0., 0., 0., 1.
    )
    this.points = getCubePoints([l0, l1, l2], false).map(v => {
      vec3.transformMat4(v, v, this.mat)
      vec3.add(v, v, this.center)
      return v
    })
    this.normals = calcNormals(this.points)
  }
  getBuffers() {
    const pos: number[] = []
    const nrm: number[] = []
    this.points.forEach((v: vec3) => {
      pos.push(v[0])
      pos.push(v[1])
      pos.push(v[2])
    })
    this.normals.forEach(n => {
      nrm.push(n[0])
      nrm.push(n[1])
      nrm.push(n[2])
    })
    return [pos, nrm]
  }
}
function getCubePoints(l: number[], doubleSided: boolean = false) {
  if (!doubleSided) {
    return [
      vec3.fromValues(l[0], l[1], l[2]),
      vec3.fromValues(l[0], -l[1], -l[2]),
      vec3.fromValues(l[0], l[1], -l[2]),
      vec3.fromValues(l[0], l[1], l[2]),
      vec3.fromValues(l[0], -l[1], l[2]),
      vec3.fromValues(l[0], -l[1], -l[2]),

      vec3.fromValues(-l[0], l[1], l[2]),
      vec3.fromValues(-l[0], l[1], -l[2]),
      vec3.fromValues(-l[0], -l[1], -l[2]),
      vec3.fromValues(-l[0], l[1], l[2]),
      vec3.fromValues(-l[0], -l[1], -l[2]),
      vec3.fromValues(-l[0], -l[1], l[2]),


      vec3.fromValues(l[0], l[1], l[2]),
      vec3.fromValues(l[0], l[1], -l[2]),
      vec3.fromValues(-l[0], l[1], -l[2]),
      vec3.fromValues(l[0], l[1], l[2]),
      vec3.fromValues(-l[0], l[1], -l[2]),
      vec3.fromValues(-l[0], l[1], l[2]),

      vec3.fromValues(l[0], -l[1], l[2]),
      vec3.fromValues(-l[0], -l[1], -l[2]),
      vec3.fromValues(l[0], -l[1], -l[2]),
      vec3.fromValues(l[0], -l[1], l[2]),
      vec3.fromValues(-l[0], -l[1], l[2]),
      vec3.fromValues(-l[0], -l[1], -l[2]),


      vec3.fromValues(l[0], l[1], l[2]),
      vec3.fromValues(-l[0], l[1], l[2]),
      vec3.fromValues(-l[0], -l[1], l[2]),
      vec3.fromValues(l[0], l[1], l[2]),
      vec3.fromValues(-l[0], -l[1], l[2]),
      vec3.fromValues(l[0], -l[1], l[2]),

      vec3.fromValues(l[0], l[1], -l[2]),
      vec3.fromValues(-l[0], -l[1], -l[2]),
      vec3.fromValues(-l[0], l[1], -l[2]),
      vec3.fromValues(l[0], l[1], -l[2]),
      vec3.fromValues(l[0], -l[1], -l[2]),
      vec3.fromValues(-l[0], -l[1], -l[2]),
    ]
  }
  return [
    vec3.fromValues(l[0], l[1], l[2]),
    vec3.fromValues(l[0], -l[1], -l[2]),
    vec3.fromValues(l[0], l[1], -l[2]),
    vec3.fromValues(l[0], l[1], l[2]),
    vec3.fromValues(l[0], -l[1], l[2]),
    vec3.fromValues(l[0], -l[1], -l[2]),

    vec3.fromValues(-l[0], l[1], l[2]),
    vec3.fromValues(-l[0], l[1], -l[2]),
    vec3.fromValues(-l[0], -l[1], -l[2]),
    vec3.fromValues(-l[0], l[1], l[2]),
    vec3.fromValues(-l[0], -l[1], -l[2]),
    vec3.fromValues(-l[0], -l[1], l[2]),


    vec3.fromValues(l[0], l[1], l[2]),
    vec3.fromValues(l[0], l[1], -l[2]),
    vec3.fromValues(-l[0], l[1], -l[2]),
    vec3.fromValues(l[0], l[1], l[2]),
    vec3.fromValues(-l[0], l[1], -l[2]),
    vec3.fromValues(-l[0], l[1], l[2]),

    vec3.fromValues(l[0], -l[1], l[2]),
    vec3.fromValues(-l[0], -l[1], -l[2]),
    vec3.fromValues(l[0], -l[1], -l[2]),
    vec3.fromValues(l[0], -l[1], l[2]),
    vec3.fromValues(-l[0], -l[1], l[2]),
    vec3.fromValues(-l[0], -l[1], -l[2]),


    vec3.fromValues(l[0], l[1], l[2]),
    vec3.fromValues(-l[0], l[1], l[2]),
    vec3.fromValues(-l[0], -l[1], l[2]),
    vec3.fromValues(l[0], l[1], l[2]),
    vec3.fromValues(-l[0], -l[1], l[2]),
    vec3.fromValues(l[0], -l[1], l[2]),

    vec3.fromValues(l[0], l[1], -l[2]),
    vec3.fromValues(-l[0], -l[1], -l[2]),
    vec3.fromValues(-l[0], l[1], -l[2]),
    vec3.fromValues(l[0], l[1], -l[2]),
    vec3.fromValues(l[0], -l[1], -l[2]),
    vec3.fromValues(-l[0], -l[1], -l[2]),

    //

    vec3.fromValues(l[0], l[1], l[2]),
    vec3.fromValues(l[0], l[1], -l[2]),
    vec3.fromValues(l[0], -l[1], -l[2]),
    vec3.fromValues(l[0], l[1], l[2]),
    vec3.fromValues(l[0], -l[1], -l[2]),
    vec3.fromValues(l[0], -l[1], l[2]),

    vec3.fromValues(-l[0], l[1], l[2]),
    vec3.fromValues(-l[0], -l[1], -l[2]),
    vec3.fromValues(-l[0], l[1], -l[2]),
    vec3.fromValues(-l[0], l[1], l[2]),
    vec3.fromValues(-l[0], -l[1], l[2]),
    vec3.fromValues(-l[0], -l[1], -l[2]),


    vec3.fromValues(l[0], l[1], l[2]),
    vec3.fromValues(-l[0], l[1], -l[2]),
    vec3.fromValues(l[0], l[1], -l[2]),
    vec3.fromValues(l[0], l[1], l[2]),
    vec3.fromValues(-l[0], l[1], l[2]),
    vec3.fromValues(-l[0], l[1], -l[2]),

    vec3.fromValues(l[0], -l[1], l[2]),
    vec3.fromValues(l[0], -l[1], -l[2]),
    vec3.fromValues(-l[0], -l[1], -l[2]),
    vec3.fromValues(l[0], -l[1], l[2]),
    vec3.fromValues(-l[0], -l[1], -l[2]),
    vec3.fromValues(-l[0], -l[1], l[2]),


    vec3.fromValues(l[0], l[1], l[2]),
    vec3.fromValues(-l[0], -l[1], l[2]),
    vec3.fromValues(-l[0], l[1], l[2]),
    vec3.fromValues(l[0], l[1], l[2]),
    vec3.fromValues(l[0], -l[1], l[2]),
    vec3.fromValues(-l[0], -l[1], l[2]),

    vec3.fromValues(l[0], l[1], -l[2]),
    vec3.fromValues(-l[0], l[1], -l[2]),
    vec3.fromValues(-l[0], -l[1], -l[2]),
    vec3.fromValues(l[0], l[1], -l[2]),
    vec3.fromValues(-l[0], -l[1], -l[2]),
    vec3.fromValues(l[0], -l[1], -l[2]),
  ]
}
function calcNormals(points: vec3[]) {
  const normals: vec3[] = []
  for (let i = 0; i < points.length; i += 3) {
    const t0 = points[i + 0]
    const t1 = points[i + 1]
    const t2 = points[i + 2]

    const t = vec3.cross(
      vec3.create(),
      vec3.sub(vec3.create(), t0, t1),
      vec3.sub(vec3.create(), t0, t2)
    )
    vec3.normalize(t, t)

    normals.push(t, t, t)
  }
  return normals
}

function axisToRotationMatrix(out: mat4, axis: vec3, objectMatrix: mat4) {
  const normalizedAxis = vec3.create()
  vec3.normalize(normalizedAxis, axis)

  const localAxis = vec3.fromValues(0, 1, 0)
  const rotationAxis = vec3.create()
  vec3.cross(rotationAxis, localAxis, normalizedAxis)

  const dot = vec3.dot(localAxis, normalizedAxis)
  const angle = Math.acos(Math.max(-1, Math.min(1, dot)))

  const rotationMatrix = mat4.create()
  if (vec3.length(rotationAxis) > 0.0001) {
    vec3.normalize(rotationAxis, rotationAxis)
    mat4.fromRotation(rotationMatrix, angle, rotationAxis)
  } else if (dot < -.9999) {
    mat4.fromRotation(rotationMatrix, Math.PI, vec3.fromValues(1., 0., 0.,))
  }

  mat4.multiply(out, rotationMatrix, objectMatrix)
}
