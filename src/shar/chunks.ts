import { parse_fence } from "./chunks/fence.js";

type ID = number;

export enum ChunkEnum {
  P3D,
  FENCE,
  // WALL,
  COLLISION_OBJECT,
  SKIP,
}
export function from_id(id: ID): ChunkEnum {
  console.log(`id: ${id}`);
  switch (id) {
    case 0x503344ff:
    case 0xff443350:
      return ChunkEnum.P3D;
    case 0x03f00007:
    case 0x0700f003:
      return ChunkEnum.FENCE;
    default:
      return ChunkEnum.SKIP;
  }
}
export function get_parser(chunk: ChunkEnum): any {
  switch (chunk) {
    case ChunkEnum.P3D: return () => { };
    case ChunkEnum.SKIP: return () => { };
    case ChunkEnum.FENCE: return parse_fence;
    default: throw new Error(`unimplemented chunk: ${chunk}`);
  }
}

