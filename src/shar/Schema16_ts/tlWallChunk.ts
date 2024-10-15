import { tlPoint } from './util.js';
import { SRR2 } from './srrchunks.js';

// const chunk_id = SRR2.ChunkID.WALL;
export type tlWallChunk = {
  Start: tlPoint;
  End: tlPoint;
  Normal: tlPoint;
}

