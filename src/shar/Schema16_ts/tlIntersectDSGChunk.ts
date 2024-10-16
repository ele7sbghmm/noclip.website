import { ULONG, tlPoint } from 'util.js';

import tlBBoxChunk from 'tlBBoxChunk.js';
import tlBSphereChunk from 'tlBSphereChunk .js';
import tlTerrainTypeChunk from 'tlTerrainTypeChunk .js';
import SRR2 from 'srrchunks .js';

//const subchunk: [tlBBoxChunk, tlBSphereChunk, tlTerrainTypeChunk] = [];
//const chunk_id = SRR2::ChunkID::INTERSECT_DSG;
type tlIntersectDSGChunk = {
   NumIndices: ULONG;
   Indices: ULONG[];

   NumPositions: ULONG;
   Positions: tlPoint[];

   NumNormals: ULONG;
   Normals: tlPoint[];
}

