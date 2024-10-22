import { tEntity } from './entity.js';
import { tChunkFile } from './chunkfile.js';
import { tEntityStore } from './inventory.js';

enum tLoadStatus { LOAD_OK, LOAD_ERROR };

class tFileHandler { // extends radLoadFileLoader {
  public Load(file: tChunkFile, store: tEntityStore): tLoadStatus { return tLoadStatus.LOAD_OK; }
}

class tChunkHandler { // extends radLoadDataLoader {
  public Load(file: tChunkFile, store: tEntityStore): tLoadStatus { return tLoadStatus.LOAD_OK; }
}

export class tSimpleChunkHandler extends tChunkHandler {
  constructor(public _id: number) { super(); }
  public override Load(file: tChunkFile, store: tEntityStore): tLoadStatus { return tLoadStatus.LOAD_OK; }
  public LoadObject(file: tChunkFile, store: tEntityStore): tEntity { return {}; }
}

export class tP3DFileHandler extends tFileHandler {
  public override Load(file: tChunkFile, store: tEntityStore): tLoadStatus { return tLoadStatus.LOAD_OK; }
  public AddHandler(l: tChunkHandler): tChunkHandler { return {}; }
}

