import { ULONG, tlPoint } from './util.js';
import { SRR2 } from './srrchunks.js';

import tlWBRailCamChunk from './tlWBRailCamChunk.js';

//const subchunk = tlWBRailCamChunk;
//const chunk_id = SRR2.ChunkID.SPLINE;
export type tlWBSplineChunk = {
  Name: string;
  NumCVs: ULONG;
  CVs: [tlPoint]; // [NumCVs]
}

