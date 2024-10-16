import { ULONG } from './util.js';
import SRR2 from './srrchunks.js';

import tlMeshChunk from './tlMeshChunk.js';
import tlFrameControllerChunk16 from './tlFrameControllerChunk16.js';
import tlMultiControllerChunk16 from './tlMultiControllerChunk16.js';
import tlCompositeDrawableChunk16 from './tlCompositeDrawableChunk16.js';
import tlBillBoardObjectChunk from './tlBillBoardObjectChunk.js';
import tlSkeletonChunk16 from './tlSkeletonChunk16.js';
import tlAnimationChunk from './tlAnimationChunk.js';
import tlLensFlareDSGChunk from './tlLensFlareDSGChunk.js';

//const subchunk = [
//   tlMeshChunk,
//   tlMultiControllerChunk16,
//   tlFrameControllerChunk16,
//   tlSkeletonChunk16,
//   tlAnimationChunk,
//   tlCompositeDrawableChunk16,
//   tlBillboardQuadGroupChunk,
//   tlLensFlareDSGChunk
//];
//const chunk_id = SRR2.ChunkID.WORLD_SPHERE_DSG;
type tlWorldSphereDSGChunk = {
   Name: string;
   Version: ULONG;
   NumMeshes: ULONG;
   NumBillBoardQuads: ULONG;
}

