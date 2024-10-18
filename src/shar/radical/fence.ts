import { unsigned_int, char_p } from '../type_aliases.js';
import { SRR2 } from './srrchunks.js';
import { rmt } from './rmt.js';
import { tChunkFile } from './chunkfile.js';
import { tEntity } from './entity.js';
import { IWrappedLoader } from './iwrappedloader.js';


class FenceEntityDSG extends tEntity {
  public mStartPoint: rmt.Vector;
  public mEndPoint: rmt.Vector;
  public mNormal: rmt.Vector;

  constructor() { super(); }
}

export class FenceLoader extends IWrappedLoader {
  private mFenceCount: unsigned_int;

  constructor() { super() }
  LoadObject(f: tChunkFile, store: tEntityStore): tEntity {
    const pFenceDSG: FenceEntityDSG = new FenceEntityDSG();

    while (f.ChunksRemaining()) {
      f.BeginChunk();
      switch (f.GetCurrentID()) {
        case SRR2.ChunkID.WALL: {
          // f.GetData(& (pFenceDSG.mStartPoint), 3, tFile.DWORD);
          // f.GetData(& (pFenceDSG.mEndPoint), 3, tFile.DWORD);
          // f.GetData(& (pFenceDSG.mNormal), 3, tFile.DWORD);
          pFenceDSG.mStartPoint = new rmt.Vector(f.GetFloat(), f.GetFloat(), f.GetFloat());
          pFenceDSG.mEndPoint = new rmt.Vector(f.GetFloat(), f.GetFloat(), f.GetFloat());
          pFenceDSG.mNormal = new rmt.Vector(f.GetFloat(), f.GetFloat(), f.GetFloat());

          // BoxPts WorldBBox = GetRenderManager().pWorldScene().mStaticTreeWalker.rIthNode(0).mBBox;
          // pFenceDSG.mStartPoint.y = WorldBBox.mBounds.mMin.y;
          // pFenceDSG.mEndPoint.y = WorldBBox.mBounds.mMax.y;
          pFenceDSG.mStartPoint.y = 10.;
          pFenceDSG.mEndPoint.y = -10.;

          break;
        }

        default:
          break;
      } // switch
      f.EndChunk();
    } // while

    // mpListenerCB.OnChunkLoaded(pFenceDSG, mUserData, _id);

    const name: char_p = `FenceDSG${this.mFenceCount}`;
    // console.log(name);
    ++this.mFenceCount;
    pFenceDSG.SetName(name);

    return pFenceDSG;
  }
}
