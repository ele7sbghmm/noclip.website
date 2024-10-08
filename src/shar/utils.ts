
export type u8 = number;
export type i8 = number;
export type u16 = number;
export type i16 = number;
export type u32 = number;
export type i32 = number;
export type f32 = number;

/// radical types
export interface rmt_vector { x: f32, y: f32, z: f32 };
export interface pddi_colour { r: f32, g: f32, b: f32, a: f32 };
///

export interface Header {
  chunk_id: u32;
  data_size: u32; // header (12) + this chunk's data
  chunk_size: u32; // data_size + all subchunks
}

export function unhead(parser: any, buf: DataView, offs: number): any {
  parse_header(buf, offs);
  return parser(buf, offs + 12);
}

export function parse_rmt_vector(buf: DataView, offs: number): rmt_vector {
  const vector: rmt_vector = {
    x: buf.getFloat32(offs, true),
    y: buf.getFloat32(offs + 4, true),
    z: buf.getFloat32(offs + 8, true),
  }
  return vector;
}

export function parse_header(buf: DataView, offs: number): Header {
  const header: Header = {
    chunk_id: buf.getUint32(offs, true),
    data_size: buf.getUint32(offs + 4, true),
    chunk_size: buf.getUint32(offs + 8, true),
  };
  return header;
}

