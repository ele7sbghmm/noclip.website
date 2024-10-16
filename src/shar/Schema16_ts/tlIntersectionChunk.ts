import { ULONG, float, tlPoint } from 'util.js';
import SRR2 from 'srrchunks.js';

// const chunk_id = SRR2::ChunkID::INTERSECTION;
type tlIntersectionChunk = {
    Name: string;
    Centre: tlPoint;
    Radius: float;
    Type: ULONG;
}

