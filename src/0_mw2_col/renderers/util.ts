import { vec3 } from 'gl-matrix'

export function vToVn(vs: vec3[]) {
  return vs.flatMap((_, i) => {
    if (i % 3)
      return []

    const [v0, v1, v2] = [vs[i + 0], vs[i + 1], vs[i + 2]]
    const t = vec3.create()
    vec3.cross(
      t,
      [v1[0] - v0[0], v1[1] - v0[1], v1[2] - v0[2]],
      [v2[0] - v0[0], v2[1] - v0[1], v2[2] - v0[2]]
    )
    vec3.normalize(t, t)

    return [t, t, t]
  })
}

export function triFanToTris(vs: vec3[]) {
  // return vs.slice(1, -1).flatMap((v, i) => {
  //   // return [vs[0], v, vs[i + 2]]
  //   return [vs[0], vs[i + 1], vs[i + 2]]
  // })
  const out = []
  for (let i = 1; i < vs.length - 1; i++) {
    out.push(vs[0], vs[i + 0], vs[i + 1])
    out.push(vs[0], vs[i + 0], vs[i + 1])
  }
  return out
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

