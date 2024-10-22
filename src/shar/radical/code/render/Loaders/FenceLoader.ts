import { SRR2 } from '../../constants/srrchunks.js';
import { tSimpleChunkHandler } from '../../../libs/pure3d/p3d/loadmanager.js';
import { tChunkFile } from '../../../libs/pure3d/p3d/chunkfile.js';
import { tEntityStore } from '../../../libs/pure3d/p3d/inventory.js';
import { tEntity } from '../../../libs/pure3d/p3d/entity.js';
import { FenceEntityDSG } from '../DSG/FenceEntityDSG.js';

export class FenceLoader extends tSimpleChunkHandler {
  constructor() { super(SRR2.ChunkID.FENCE_DSG); }
  public override LoadObject(f: tChunkFile, store: tEntityStore): tEntity {
    const pFenceDSG = new FenceEntityDSG();

    return pFenceDSG;
  }
}


