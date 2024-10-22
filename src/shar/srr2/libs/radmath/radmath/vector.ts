import { float } from '../../../../type_aliases.js';

export const rmt = RadicalMathLibrary;

namespace RadicalMathLibrary {
  export class Vector {
    constructor(
      public x: float,
      public y: float,
      public z: float,
    ) { }
  }
}

