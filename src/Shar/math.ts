import { mat4, vec2, vec3 } from "gl-matrix";
import { AABB } from "../Geometry.js";

type float = number
type bool = boolean

export namespace rmt {
    export type Vector2 = vec2
    // export type Vector = vec3
    export type Vector = vec3
    export type Matrix = mat4
    export class Box3D extends AABB {
        low = this.min
        high = this.max
    }
    export class Sphere {
        centre: Vector
        radius: float
    }
    export const Epsilon = (x: number, n: number, e: number = 0.000001): bool => {
        return (x >= -e + n) && (x <= e + n)
    }
}
