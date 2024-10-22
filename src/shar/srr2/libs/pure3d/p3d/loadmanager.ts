import { unsigned, char_p } from './../../../../type_aliases.js';
import { tEntity } from './entity.js';
import { tChunkFile } from './chunkfile.js';
import { tEntityStore } from './inventory.js';
import { radLoadManagerWrapper, ILoadManager } from '../../radcontent/src/radload/radload.js';
import { radLoadFileLoader, radLoadDataLoader } from '../../radcontent/src/radload/loader.js';

enum tLoadStatus { LOAD_OK, LOAD_ERROR };

// radLoadManagerWrapper radLoad;
const radLoad: radLoadManagerWrapper = ILoadManager.s_instance;

class tFileHandler extends radLoadFileLoader {
  public Load(file: tChunkFile, store: tEntityStore): tLoadStatus { return tLoadStatus.LOAD_OK; }
}
class tChunkHandler extends radLoadDataLoader {
  public Load(file: tChunkFile, store: tEntityStore): tLoadStatus { return tLoadStatus.LOAD_OK; }
}
export class tSimpleChunkHandler extends tChunkHandler {
  constructor(public _id: number) { super(); }
  public override Load(file: tChunkFile, store: tEntityStore): tLoadStatus { return tLoadStatus.LOAD_OK; }
  public LoadObject(file: tChunkFile, store: tEntityStore): tEntity { return {}; }
}
export class tP3DFileHandler extends tFileHandler {
  public override Load(file: tChunkFile, store: tEntityStore): tLoadStatus { return tLoadStatus.LOAD_OK; }
  public AddHandler(l: tChunkHandler): tChunkHandler;
  public AddHandler(l: tChunkHandler, chunkID: unsigned): tChunkHandler;
  public AddHandler(l: tChunkHandler, chunkID?: unsigned): tChunkHandler {
    radLoad.AddDataLoader(l, chunkID ? chunkID : l.GetChunkID());
    return l;
  }
}
export class tLoadManager { // tRefCounted
  public AddHandler(l: tFileHandler, ext: char_p): tFileHandler {
    radLoad.AddFileLoader(l, ext);
    return l;
  }
}

