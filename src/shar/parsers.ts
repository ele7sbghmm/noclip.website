import { Header, rmt_vector } from "./utils.js";

export function unhead(parser: any, buf: DataView): any {
  parse_header(buf);
  return parser(buf);
}
export function parse_rmt_vector(buf: DataView): rmt_vector {
  const vector: rmt_vector = {
    x: buf.getFloat32(0, true),
    y: buf.getFloat32(4, true),
    z: buf.getFloat32(8, true),
  }
  return vector;
}

export function parse_header(buf: DataView): Header {
  const header: Header = {
    chunk_id: buf.getUint32(0x0, true),
    data_size: buf.getUint32(0x4, true),
    chunk_size: buf.getUint32(0x8, true),
  };
  return header;
}

