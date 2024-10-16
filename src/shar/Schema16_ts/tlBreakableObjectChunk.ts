import { ULONG } from './util.js';
import { SRR2 } from './srrchunks.js';

import tlAnimatedObjectChunk from './tlAnimatedObjectChunk.js';
import tlFrameControllerChunk from './tlFrameControllerChunk.js';
import tlMeshChunk from './tlMeshChunk.js';
import tlCompositeDrawableChunk16 from './tlCompositeDrawableChunk16.js';
import tlSkeletonChunk16 from './tlSkeletonChunk16.js';
import tlAnimationChunk from './tlAnimationChunk.js';
import tlParticleSystemChunk from './tlParticleSystemChunk.js';
import tlMultiControllerChunk16 from './tlMultiControllerChunk16.js';

// const subchunk = [tlAnimatedObjectFactoryChunk,
//   tlAnimatedObjectChunk,
//   tlFrameControllerChunk,
//   tlMeshChunk,
//   tlAnimationChunk,
//   tlMultiControllerChunk16,
//   tlSkeletonChunk16,
//   tlParticleSystemFactoryChunk,
//   tlParticleSystemChunk,
//   tlCompositeDrawableChunk16
//  ];
// const chunk_id = SRR2.ChunkID.BREAKABLE_OBJECT;
export type tlBreakableObjectChunk = {
  BreakableType: ULONG;
  MaxInstances: ULONG;
}

