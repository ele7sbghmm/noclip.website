import { float } from '../../../../type_aliases.js';

export namespace RadicalMathLibrary {
  export class Matrix {
    public m: float[][]; // [4][4]

    constructor(
      a: float, b: float, c: float, d: float,
      e: float, f: float, g: float, h: float,
      i: float, j: float, k: float, l: float,
      m2: float, n: float, o: float, p: float,
    ) {
      this.m[0][0] = a; this.m[0][1] = b; this.m[0][2] = c; this.m[0][3] = d;
      this.m[1][0] = e; this.m[1][1] = f; this.m[1][2] = g; this.m[1][3] = h;
      this.m[2][0] = i; this.m[2][1] = j; this.m[2][2] = k; this.m[2][3] = l;
      this.m[3][0] = m2; this.m[3][1] = n; this.m[3][2] = o; this.m[3][3] = p;
    }
  }
}

