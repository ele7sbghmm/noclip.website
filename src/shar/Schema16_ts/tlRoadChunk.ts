import { ULONG } from './util.js';
import { SRR2 } from './srrchunks.js';

import tlRoadSegmentChunk from './tlRoadSegmentChunk.js';

// const subchunk = [tlRoadSegmentChunk];
// const chunk_id = SRR2.ChunkID.ROAD;
export type tlRoadChunk = {
    Name: string;
    Type: ULONG;
    StartIntersection: string;
    EndIntersection: string;
    Density: ULONG;
    Speed: ULONG;
}

