import { BufReader } from "./reader.js";
import { u32, f32 } from "./types.js";

// import { FenceEntityDSG } from "./fence.js";
import { Fence } from "./fence.js";

type ID = number;
export const HEADER_SIZE = 12;

export enum ChunkEnum {
  SKIP,
  P3D,
  FENCE,
  COLLISION_OBJECT,
  OBJECT_ATTRIBUTE,
  STATICPHYSDSG,
}
export function from_id(id: ID): ChunkEnum {
  // console.log(`id: ${id}`);
  switch (id) {
    case 0x503344ff:
    case 0xff443350:
      return ChunkEnum.P3D;
    case 0x03f00007:
    case 0x0700f003:
      return ChunkEnum.FENCE;
    // case 0x0:
    // case 0x0:
    //   return ChunkEnum.OBJECT_ATTRIBUTE;
    // case 0x0:
    // case 0x0:
    //   return ChunkEnum.STATICPHYSDSG;
    // case 0x07010000:
    // case 0x00000107:
    // return ChunkEnum.COLLISION_OBJECT;
    default:
      return ChunkEnum.SKIP;
  }
}
export function get_parser(chunk: ChunkEnum): any {
  switch (chunk) {
    case ChunkEnum.P3D:
      break;
    case ChunkEnum.SKIP:
      break;
    case ChunkEnum.FENCE:
      return Fence.parse;
    // case ChunkEnum.COLLISION_OBJECT: return CollisionObject.parser;
    // case ChunkEnum.COLLISION_OBJECT: return CollisionObject.parser;
    // case ChunkEnum.STATICPHYSDSG: return StaticPhysDsg.parse_chunk;
    // default: throw new Error(`unimplemented chunk: ${chunk}`);
  }
  return () => { };
}

export type Header = {
  chunk_id: u32,
  data_size: u32, // header (12) + this chunk's data
  chunk_size: u32, // data_size + all subchunks
};
export function parse_header(buf: BufReader, peek: boolean = false): Header {
  const header: Header = {
    chunk_id: buf.be_u32(),
    data_size: buf.le_u32(),
    chunk_size: buf.le_u32(),
  };
  return header;
}

export type rmtVector = {
  x: f32,
  y: f32, // header (12) + this chunk's data
  z: f32, // data_size + all subchunks
};
export function parse_rmtVector(buf: BufReader): rmtVector {
  return {
    x: buf.le_f32(),
    y: buf.le_f32(),
    z: buf.le_f32(),
  }
}

// export function parse_chunk(buf: BufReader)
//   : { rest_buf: ArrayBufferSlice, chunk_buf: ArrayBufferSlice, header: Header } {
//   const header: Header = parse_header(buf);
//
//   const chunk_buf: ArrayBufferSlice = buf.slice(HEADER_SIZE, header.chunk_size);
//   const rest_buf: ArrayBufferSlice = buf.slice(header.chunk_size, 0);
//
//   return { rest_buf, chunk_buf, header };
// }
