import { BufReader } from "./reader.js";

import { rmtVector } from "./math.js";
import { tChunkFile } from "./chunkfile.hpp.js";
import { parse_header } from "./chunks.js";

class FenceLoader {
  public mFenceCount: number;
  public name: string;

  public LoadObject(f: tChunkFile): FenceEntityDSG { // tEntity {
    const pFenceDSG = new FenceEntityDSG();

    // const header = BeginChunk();
    const header = parse_header(f);
    while (f.ChunksRemaining()) {
      f.BeginChunk();
      switch (header.chunk_id) {
        case ChunkID.WALL: {
          pFenceDSG.mStartPoint = rmt_Vector.parse(f);
          pFenceDSG.mEndPoint = rmt_Vector.parse(f);
          pFenceDSG.mNormal = rmt_Vector.parse(f);
        }
      }
      f.EndChunk();
    }
    // mpListenerCB->OnChunkLoaded( pFenceDSG, mUserData, _id );

    this.name = `FenceDSG${this.mFenceCount}`;
    ++this.mFenceCount;

    return pFenceDSG;
  }
}


export class FenceEntityDSG implements tEntity {
  public mStartPoint: rmt_Vector;
  public mEndPoint: rmt_Vector;
  public mNormal: rmt_Vector;
}

