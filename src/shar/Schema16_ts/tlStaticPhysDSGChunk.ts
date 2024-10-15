import { ULONG } from './util.js';
import SRR2 from 'srrchunks.js';

import tlCollisionObjectChunkfrom from './tlCollisionObjectChunk.js';
import tlObjectAttributeChunk from './tlObjectAttributeChunk.js';

// const subchunk = [
//  tlObjectAttributeChunk,
//  tlCollisionObjectChunk
// ];
// const chunk_id = SRR2::ChunkID::STATIC_PHYS_DSG;
type tlStaticPhysDSGChunk = {
  Name: string;
  Version: ULONG;
}

