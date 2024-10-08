import { rmt_vector, parse_rmt_vector, parse_header } from "../utils.js";

interface Fence {
  start: rmt_vector;
  end: rmt_vector;
  normal: rmt_vector;
};

export function parse_fence(buf: DataView, offs: number): Fence {
  parse_header(buf, offs);
  const fence: Fence = {
    start: parse_rmt_vector(buf, offs + 12),
    end: parse_rmt_vector(buf, offs + 24),
    normal: parse_rmt_vector(buf, offs + 36),
  };
  return fence;
}

