// import { radKey } from "./rad_util"
type radKey = number | string
type unsigned_int = number
type radLoadClassID = unsigned_int
type const_char_p = string
type RefHashTable<T> = Record<radKey, T>

function radMakeCaseInsensitiveKey(pToken: const_char_p) {
    return pToken.toLowerCase()
}
export abstract class radLoadFileLoader { }
export abstract class radLoadDataLoader { }
export class radLoadManager {
    m_pFileLoaders: RefHashTable<radLoadFileLoader>
    m_pDataLoaders: RefHashTable<radLoadDataLoader>
    AddDataLoader(dataLoader: radLoadDataLoader, id: radLoadClassID) {
        this.m_pDataLoaders[id] = dataLoader
    }
    AddFileLoader(fileLoader: radLoadFileLoader, extension: const_char_p) {
        this.m_pFileLoaders[radMakeCaseInsensitiveKey(extension)] = fileLoader
    }
    GetDataLoader(id: radLoadClassID): radLoadDataLoader {
        return this.m_pDataLoaders[id]
    }
    GetFileLoader(extension: const_char_p): radLoadFileLoader {
        let ext: const_char_p = extension
        ext = (ext === '.') ? ext.slice(1) : ext
        return this.m_pFileLoaders[radMakeCaseInsensitiveKey(ext)]
    }
}
