import { const_char_p } from '../../../../../type_aliases.js';

import { ILoadManager } from './radload.js';
import { radLoadFileLoader, radLoadDataLoader } from './loader.js';
import { RefHashTable } from './hashtable.js';

export function radLoadInitialize() { // init: radLoadInit) {
  // if (!init) { init = new radLoadInit(); }
  ILoadManager.s_instance = new radLoadManager();
}

type radLoadClassID = number;

export class radLoadManager extends ILoadManager {
  public m_pFileLoaders: RefHashTable<radLoadFileLoader>;
  public m_pDataLoaders: RefHashTable<radLoadDataLoader>;

  public override AddDataLoader(dataLoader: radLoadDataLoader, id: radLoadClassID) {
    this.m_pDataLoaders.Store(id, dataLoader);
  }
  public override AddFileLoader(fileLoader: radLoadFileLoader, extension: const_char_p) {
    this.m_pDataLoaders.Store(extension, fileLoader);
  }
  public GetDataLoader(id: radLoadClassID): radLoadDataLoader {
    return this.m_pDataLoaders.Find(id);
  }
  public GetFileLoader(extension: const_char_p): radLoadFileLoader {
    return this.m_pFileLoaders.Find(extension);
  }
}

