import { ULONG } from './util.js';
import { SRR2 } from './srrchunks.js';

// const chunk_id = SRR2::ChunkID::OBJECT_ATTRIBUTES;
export type tlObjectAttributeChunk = {
  ClassType: ULONG;
  PhyPropID: ULONG;
  Sound: string;
}

