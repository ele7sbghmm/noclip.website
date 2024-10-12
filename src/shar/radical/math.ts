import { float } from "../types.js";

export class rmtVector {
  constructor(
    public x: float,
    public y: float,
    public z: float,
  ) {}
}
export class rmtMatrix {
  constructor(
    public m00: float,
    public m01: float,
    public m02: float,
    public m03: float,
    public m10: float,
    public m11: float,
    public m12: float,
    public m13: float,
    public m20: float,
    public m21: float,
    public m22: float,
    public m23: float,
    public m30: float,
    public m31: float,
    public m32: float,
    public m33: float,
  ) {}
}
