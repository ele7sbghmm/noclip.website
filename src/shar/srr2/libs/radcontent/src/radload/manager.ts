import { ILoadManager } from './radload.js';
import { radLoadFileLoader, radLoadDataLoader } from './loader.js';

export function radLoadInitialize() { // init: radLoadInit) {
  // if (!init) { init = new radLoadInit(); }
  ILoadManager.s_instance = new radLoadManager();
}

export class radLoadManager extends ILoadManager {
  public m_pFileLoaders: Record<string, radLoadFileLoader>;
  public m_pDataLoaders: Record<string, radLoadDataLoader>;

  public AddDataLoader(dataLoader: radLoadDataLoader) { }
  public override AddFileLoader() { }
}

