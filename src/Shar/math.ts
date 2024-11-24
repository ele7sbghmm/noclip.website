type float = number

export namespace rmt {
    export class Vector {
        constructor(
            public x: number,
            public y: number,
            public z: number,
        ) { }
        _to_array() { return [this.x, this.y, this.z] }

        Set(C1: float, C2: float, C3: float) { this.x = C1; this.y = C2; this.z = C3 }
        Add(vect: Vector): Vector {
            return new Vector(
                this.x + vect.x,
                this.y + vect.y,
                this.z + vect.z
            )
        }
        static Add(vect1: Vector, vect2: Vector): Vector {
            return new Vector(
                vect1.x + vect2.x,
                vect1.y + vect2.y,
                vect1.z + vect2.z
            )
        }
        Sub(vect: Vector) {
            this.x -= vect.x
            this.y -= vect.y
            this.z -= vect.z
        }
        static Sub(vect1: Vector, vect2: Vector): Vector {
            return new Vector(
                vect1.x - vect2.x,
                vect1.y - vect2.y,
                vect1.z - vect2.z
            )
        }
        Scale(scaleFactor: float) {
            this.x *= scaleFactor
            this.y *= scaleFactor
            this.z *= scaleFactor
        }
        Magnitude(): float {
            return Math.sqrt(this.MagnitudeSqr())
        }
        MagnitudeSqr(): float {
            return Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z, 2)
        }
    }
    export class Matrix {
        constructor(
            public m00: float, public m01: float, public m02: float, public m03: float,
            public m10: float, public m11: float, public m12: float, public m13: float,
            public m20: float, public m21: float, public m22: float, public m23: float,
            public m30: float, public m31: float, public m32: float, public m33: float,
        ) { }
    }
    export class Box3D {
        low: Vector
        high: Vector
    }
    export class Sphere {
        centre: Vector
        radius: float
    }
}
