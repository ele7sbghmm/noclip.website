import { ULONG } from './util.js';
import { SRR2 } from './srrchunks.js';

import { tlWallChunk } from './tlWallChunk.js';

//const subchunk: [tlWallChunk];
//const chunk_id = SRR2::ChunkID::FENCELINE;
export type tlFenceLineChunk = {
  NumWalls: ULONG;
}

