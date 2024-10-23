import { float } from '../../../../type_aliases.js';

export const rmt = RadicalMathLibrary;

export namespace RadicalMathLibrary {
  export class Vector {
    constructor(
      public x: float,
      public y: float,
      public z: float,
    ) { }
  }
}

