import { unsigned_int, const_char_p } from '../../../../../type_aliases.js';

import { radLoadFileLoader, radLoadDataLoader } from './loader.js';

type radLoadClassID = unsigned_int;

export abstract class ILoadManager {
  static s_instance: ILoadManager;

  public abstract AddFileLoader(fileLoader: radLoadFileLoader, extension: const_char_p): void;
  public abstract AddDataLoader(dataLoader: radLoadDataLoader, id: radLoadClassID): void;
}
export const radLoadManagerWrapper = ILoadManager.s_instance;

