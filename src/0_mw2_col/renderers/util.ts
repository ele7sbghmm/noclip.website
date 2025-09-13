import { vec3 } from 'gl-matrix'

const scratchVec3 = vec3.create()

export function vToVn(vs: vec3[]) {
  return vs.flatMap((_, i) => {
    if (i % 3)
      return []

    const [v0, v1, v2] = [vs[i + 0], vs[i + 1], vs[i + 2]]
    vec3.cross(
      scratchVec3,
      [v1[0] - v0[0], v1[1] - v0[1], v1[2] - v0[2]],
      [v2[0] - v0[0], v2[1] - v0[1], v2[2] - v0[2]]
    )
    vec3.normalize(scratchVec3, scratchVec3)

    return [
      vec3.clone(scratchVec3),
      vec3.clone(scratchVec3),
      vec3.clone(scratchVec3)
    ]
  })
}

export function quadToTri(v: vec3[]) {
  const out: vec3[] = []
  let v0, v1, v2, v3

  v.forEach((_, i) => {
    if (i % 4)
      return

    v0 = v[i + 0]
    v1 = v[i + 1]
    v2 = v[i + 2]
    v3 = v[i + 3]

    out.push(v0, v1, v2, v0, v2, v3)
  })

  return out
}

export function triFanToTris(vs: vec3[]) {
  return vs.slice(1, -1).flatMap((v, i) => {
    return [vs[0], v, vs[i + 2]]
  })
}

export function doubleSided(v: vec3[]) {
  return v.flatMap((v0, i) => {
    if (i % 3)
      return []

    const v1 = v[i + 1]
    const v2 = v[i + 2]

    return [v0, v2, v1, v0, v1, v2]
  })
}

