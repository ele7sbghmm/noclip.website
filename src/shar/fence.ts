import { BufReader } from './reader.js';
import { rmtVector, parse_header, parse_rmtVector } from './chunks.js';


export class Fence {
  constructor(
    public start: rmtVector,
    public end: rmtVector,
    public normal: rmtVector,
  ) { }

  public static parse(buf: BufReader): Fence {
    let wall_header = parse_header(buf);
    return new Fence(
      parse_rmtVector(buf),
      parse_rmtVector(buf),
      parse_rmtVector(buf),
    );
  }
}


