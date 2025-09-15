import { assert } from '../../util.js'
import { vec3 } from 'gl-matrix'

import { Plane, Brush, Bounds } from '../parsers/clipmap.js'

let scratchVec3 = vec3.create()

function planeToPoly(plane: Plane, h: number) {
  const [u, v] = planeBasis(plane)

  const c = vec3.create()
  vec3.scale(c, plane.n, plane.d)

  const p = [vec3.create(), vec3.create(), vec3.create(), vec3.create()]

  vec3.add(p[0], c, vec3.scale(vec3.create(), u, h))
  vec3.add(p[0], p[0], vec3.scale(vec3.create(), v, h))
  vec3.add(p[1], c, vec3.scale(vec3.create(), u, -h))
  vec3.add(p[1], p[1], vec3.scale(vec3.create(), v, h))
  vec3.add(p[2], c, vec3.scale(vec3.create(), u, -h))
  vec3.add(p[2], p[2], vec3.scale(vec3.create(), v, -h))
  vec3.add(p[3], c, vec3.scale(vec3.create(), u, h))
  vec3.add(p[3], p[3], vec3.scale(vec3.create(), v, -h))

  return p
}

function planeBasis(plane: Plane) {
  const n = vec3.create()
  vec3.normalize(n, plane.n)

  let t = Math.abs(n[0]) < .9
    ? vec3.fromValues(1, 0, 0)
    : vec3.fromValues(0, 1, 0)

  const u = vec3.create()
  const v = vec3.create()
  vec3.cross(u, n, t)
  vec3.normalize(u, u)
  vec3.cross(v, n, u)

  return [u, v]
}

function clip(plane: Plane, poly: vec3[]) {
  const points = []

  for (let i = 0; i < poly.length; i++) {
    const v1 = vec3.clone(poly[i])
    const v2 = vec3.clone(poly[(i + 1) % poly.length])

    const d1 = vec3.dot(v1, plane.n) - plane.d
    const d2 = vec3.dot(v2, plane.n) - plane.d

    let coef = 10
    let d1r = d1
    let d2r = d2
    d1r = Math.round(d1 * coef) / coef
    d2r = Math.round(d2 * coef) / coef

    if (d1r <= 0) {
      if (d2r <= 0) {
        points.push(vec3.clone(v2))
      } else {
        const t = d1 / (d1 - d2)

        vec3.sub(scratchVec3, v2, v1)
        vec3.scale(scratchVec3, scratchVec3, t)
        vec3.add(scratchVec3, scratchVec3, v1)

        points.push(vec3.clone(scratchVec3))
      }
    } else if (d2r <= 0) {
      const t = d1 / (d1 - d2)

      vec3.sub(scratchVec3, v2, v1)
      vec3.scale(scratchVec3, scratchVec3, t)
      vec3.add(scratchVec3, scratchVec3, v1)

      points.push(vec3.clone(scratchVec3))
      points.push(v2)
    }
  }

  return points
}

export function brushToHull(brush: Brush) {
  const DEFAULT_SIZE = 100_000

  const boundsPlanes = boundsToPlanes(brush.bounds)
  const planes: Plane[] = [
    ...boundsPlanes,
    ...brush.sides.map(side => side.plane)
  ]
  // const polies = planes.map(plane => planeToPoly(plane, DEFAULT_SIZE + plane.d))
  const polies: vec3[][] = []
  for (let i = 0; i < planes.length; i++) {
    const plane = planes[i]
    if (plane == undefined) {
      return []
    }
    // assert(plane !== undefined, `plane undefined ${brush.n}`)
    const poly = planeToPoly(plane, DEFAULT_SIZE + plane.d)
    polies.push(poly)
  }

  let temp: vec3[]
  return polies.map(poly => {
    temp = poly

    for (let i = 0; i < planes.length; i++) {
      temp = clip(planes[i], temp)
    }

    return temp
  })
}

function boundsToPlanes(bounds: Bounds) {
  const [mx, my, mz] = bounds.mid
  const [hx, hy, hz] = bounds.half
  const [x, y, z] = [mx + hx, my + hy, mz + hz]
  const [nx, ny, nz] = [mx - hx, my - hy, mz - hz]

  return [
    new Plane(vec3.fromValues(1, 0, 0), x, 0),
    new Plane(vec3.fromValues(0, 1, 0), y, 0),
    new Plane(vec3.fromValues(0, 0, 1), z, 0),
    new Plane(vec3.fromValues(-1, 0, 0), -nx, 0),
    new Plane(vec3.fromValues(0, -1, 0), -ny, 0),
    new Plane(vec3.fromValues(0, 0, -1), -nz, 0)
  ]
}

