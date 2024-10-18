import { assert } from '../../util.js';
import { NamedArrayBufferSlice } from '../../DataFetcher.js';

import { Pure3D } from './chunkids.js';
import { unsigned, unsigned_int, const_char_p } from '../type_aliases.js';
import { tChunkFile } from './chunkfile.js';
import { tEntity, tEntityStore } from './entity.js';

const P3DASSERT = assert;

enum tLoadStatus { LOAD_OK, LOAD_ERROR };

class tSimpleChunkHandler {
  constructor(
    protected _id: unsigned_int,
    protected m_NameOverride: const_char_p,
    protected status: tLoadStatus,
  ) { }
  public Load(file: tChunkFile, store: tEntityStore): tLoadStatus {
    this.status = tLoadStatus.LOAD_OK;

    if (file.GetCurrentID() != this._id) {
      return tLoadStatus.LOAD_ERROR;
    }
    // const t: tEntity = this.LoadObject(file, store);
    // if (!t) {
    //   return (this.status == tLoadStatus.LOAD_OK) ? tLoadStatus.LOAD_ERROR : this.status;
    // }

    // const inv: tInventory = store;
    // if (inv && inv.TestCollision) {
    //   this.HandleCollision(t);
    //   // t = null;
    // return LOAD_ERROR;
    // } else {
    //  if (this.m_NameOverride) {
    //    // t.SetName(this.m_NameOverride);
    //    this.m_NameOverride = '';
    //  }
    // store.StoreHandlingCollisions(t);
    // }

    return tLoadStatus.LOAD_OK;
  }
  public CheckChunkID(id: unsigned): boolean {
    return id == this._id;
  }
  public GetChunkID() { return this._id; }
  protected LoadObject(file: tChunkFile, store: tEntityStore): {} { // tEntity {
    return {};
  }
}

export class tP3DFileHandler {
  public Load(file: NamedArrayBufferSlice, store: tEntityStore): tLoadStatus {
    //? #ifdef P3D_TRACK_LOAD_STATS
    // radMemoryAllocator old = :: radMemorySetCurrentAllocator(RADMEMORY_ALLOC_TEMP);
    const chunkFile: tChunkFile = new tChunkFile(file);
    // ::radMemorySetCurrentAllocator( old );
    // chunkFile->AddRef();
    let fileStatus: tLoadStatus = tLoadStatus.LOAD_OK;

    assert(chunkFile.GetCurrentID() == Pure3D.DATA_FILE);
    while (chunkFile.ChunksRemaining()) {
      //? #ifdef P3D_TRACK_LOAD_STATS
      chunkFile.BeginChunk();

      const h: tChunkHandler = radLoad.GetDataLoader(chunkFile.GetCurrentID());
      // if (h != null) {
      let status: tLoadStatus = h.Load(chunkFile, store);
      if (fileStatus == tLoadStatus.LOAD_ERROR) fileStatus = status;
      // } else {
      // console.log(`Unrecognized chunk ${chunkFile.GetCurrentID()} in ${file.GetFilename()}\n`);
      console.log(`Unrecognized chunk ${chunkFile.GetCurrentID()} in ${file.name}\n`);
      // }

      //? #ifdef P3D_TRACK_LOAD_STATS
      chunkFile.EndChunk();
      assert(chunkFile.GetCurrentID() == Pure3D.DATA_FILE);
    }
    // chunkFile -> Release();

    return fileStatus;
  }
  public AddHandler() { }
}
