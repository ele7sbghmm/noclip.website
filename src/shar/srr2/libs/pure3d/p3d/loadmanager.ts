import { assert } from '../../../../../util.js';

import { unsigned, char_p } from './../../../../type_aliases.js';

import { Pure3D } from '../constants/chunkids.js';
import { tEntity } from './entity.js';
import { tChunkFile } from './chunkfile.js';
import { tEntityStore } from './inventory.js';
import { radLoadManagerWrapper, ILoadManager } from '../../radcontent/src/radload/radload.js';
import { radLoadFileLoader, radLoadDataLoader } from '../../radcontent/src/radload/loader.js';
import { tRefCounted } from './refcounted.js';
import { tFile } from './file.js';
import { tInventory } from './inventory.js';

export enum tLoadStatus { LOAD_OK, LOAD_ERROR };

// radLoadManagerWrapper radLoad;
const radLoad = radLoadManagerWrapper;

abstract class tFileHandler extends radLoadFileLoader {
  public abstract Load(file: tFile, store: tEntityStore): tLoadStatus;
}

class tChunkHandler extends radLoadDataLoader {
  public Load(file: tChunkFile, store: tEntityStore): tLoadStatus { return tLoadStatus.LOAD_OK; }
  public GetChunkID() { }
}

export abstract class tSimpleChunkHandler extends tChunkHandler {
  constructor(public _id: number) { super(); }
  public override Load(file: tChunkFile, store: tEntityStore): tLoadStatus {
    let status = tLoadStatus.LOAD_OK;

    if (file.GetCurrentID() != this._id) return tLoadStatus.LOAD_ERROR;

    let t: tEntity = this.LoadObject(file, store);
    if (!t) return (status == tLoadStatus.LOAD_OK) ? tLoadStatus.LOAD_ERROR : status;

    const inv: tInventory = store;
    /* if (inv.TestCollision(t)) {
      this.HandleCollision(t);
      return tLoadStatus.LOAD_ERROR;
    } else {
      if (this.m_NameOverride) {
        t.SetName(this.m_NameOverride);
        this.m_NameOverride = '';
      }
      store.StoreHandlingCollisions(t);
    } */
    return tLoadStatus.LOAD_OK;
  }
  public abstract LoadObject(file: tChunkFile, store: tEntityStore): tEntity;
}

export class tP3DFileHandler extends tFileHandler {
  public override Load(file: tFile, store: tEntityStore): tLoadStatus {
    const chunkFile: tChunkFile = new tChunkFile(file);
    // chunkFile.AddRef();
    let fileStatus: tLoadStatus = tLoadStatus.LOAD_OK;

    assert(chunkFile.GetCurrentID() == Pure3D.DATA_FILE);
    // P3DASSERT(chunkFile->GetCurrentID() == Pure3D::DATA_FILE);
    while (chunkFile.ChunksRemaining()) {
      chunkFile.BeginChunk();

      let h: tChunkHandler = radLoad.GetDataLoader(chunkFile.GetCurrentID());
      if (h != null) {
        let status: tLoadStatus = h.Load(chunkFile, store);
        if (fileStatus == tLoadStatus.LOAD_ERROR) fileStatus = status;
      } else {
        // p3d:: printf("Unrecognized chunk (%x) in %s\n", this.chunkFile->GetCurrentID(), file->GetFilename());
        console.log(`Unrecognized chunk (${chunkFile.GetCurrentID()}) in ${file.GetFilename()}\n`);
      }

      chunkFile.EndChunk();
      // P3DASSERT(this.chunkFile.GetCurrentID() == Pure3D.DATA_FILE);
    }
    return fileStatus;
  }
  public AddHandler(l: tChunkHandler, chunkID?: unsigned): tChunkHandler {
    radLoad.AddDataLoader(l, chunkID ? chunkID : l.GetChunkID());
    return l;
  }
}


export class tLoadManager extends tRefCounted {
  public AddHandler(l: tFileHandler, ext: char_p): tFileHandler {
    radLoad.AddFileLoader(l, ext);
    return l;
  }
}

