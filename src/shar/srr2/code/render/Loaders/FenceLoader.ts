import { unsigned_int } from '../../../../type_aliases.js';

import { SRR2 } from '../../constants/srrchunks.js';
import { FenceEntityDSG } from '../DSG/FenceEntityDSG.js';
import { IWrappedLoader } from './IWrappedLoader.js';
import { BoxPts } from '../Culling/BoxPts.js';
import { tSimpleChunkHandler } from '../../../libs/pure3d/p3d/loadmanager.js';
import { tChunkFile } from '../../../libs/pure3d/p3d/chunkfile.js';
import { tEntityStore } from '../../../libs/pure3d/p3d/inventory.js';
import { tEntity } from '../../../libs/pure3d/p3d/entity.js';

export class FenceLoader extends tSimpleChunkHandler implements IWrappedLoader {
  public mFenceCount: unsigned_int = 0;

  constructor() {
    super(SRR2.ChunkID.FENCE_DSG);
  }

  public override LoadObject(f: tChunkFile, store: tEntityStore): tEntity {
    const pFenceDSG = new FenceEntityDSG();

    while (f.ChunksRemaining()) {
      f.BeginChunk();

      switch (f.GetCurrentID()) {
        case SRR2.ChunkID.WALL: {
          // f.GetData(&(pFenceDSG->mStartPoint),   3, tFile::DWORD);
          // f.GetData(&(pFenceDSG->mEndPoint),     3, tFile::DWORD);
          // f.GetData(&(pFenceDSG->mNormal),       3, tFile::DWORD);

          const WorldBBox: BoxPts = GetRenderManager().pWorldScene().mStaticTreeWalker.rIthNode(0).mBBox;
          // pFenceDSG.mStartPoint.y = WorldBBox.mBounds.mMin.y;
          // pFenceDSG.mEndPoint.y = WorldBBox.mBounds.mMax.y;

          break;
        }
        default: break;
      }
      f.EndChunk();
    }

    // mpListenerCB.OnChunkLoaded(pFenceDSG, mUserData, this._id);

    ++this.mFenceCount;

    pFenceDSG.SetName(`FenceDSG${this.mFenceCount}`);


    return pFenceDSG;
  }
}


