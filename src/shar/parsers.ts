import { NamedArrayBufferSlice } from "../DataFetcher.js";

export interface Header {
  chunk_id: number;
  data_size: number;
  chunk_size: number;
}

export function parse_header(buffer: NamedArrayBufferSlice): Header {
  const view = buffer.createDataView();

  const header: Header = {
    chunk_id: view.getUint32(0x0, true),
    data_size: view.getUint32(0x4, true),
    chunk_size: view.getUint32(0x8, true)
  };

  return header;
}
// let chunkTableIdx = 0x10;
// for (let i = 0; i < numChunks; i++) {
//   const idxDataOffs = view.getUint32(chunkTableIdx + 0x00, true);
//   const idxDataCount = view.getUint32(chunkTableIdx + 0x04, true);
//   const posDataOffs = view.getUint32(chunkTableIdx + 0x08, true);
//   const posDataCount = view.getUint32(chunkTableIdx + 0x0c, true);
//
//   const indexData = buffer.createTypedArray(
//     Uint16Array,
//     idxDataOffs,
//     idxDataCount,
//   );
//   const positionData = buffer.createTypedArray(
//     Float32Array,
//     posDataOffs,
//     posDataCount * 3,
//   );
//
//   chunks.push({ indexData, positionData });
//   chunkTableIdx += 0x10;
// }

