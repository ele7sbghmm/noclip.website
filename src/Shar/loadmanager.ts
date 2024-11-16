import { tP3DFileHandler, tFileHandler, radLoad, tLoadStatus } from './loaders'

// import { radKey } from "./rad_util"
type radKey = number | string
type unsigned_int = number
type radLoadClassID = unsigned_int
type char_p = string
type const_char_p = string
type RefHashTable<T> = Record<radKey, T>

function radMakeCaseInsensitiveKey(pToken: const_char_p) {
    return pToken.toLowerCase()
}
export abstract class radLoadFileLoader { }
export abstract class radLoadDataLoader { }
class radLoadOptions { }
class radLoadRequest { }
export class radLoadManager {
    m_pFileLoaders: RefHashTable<radLoadFileLoader>
    m_pDataLoaders: RefHashTable<radLoadDataLoader>
    constructor() {
        this.m_pFileLoaders = new Object as RefHashTable<radLoadFileLoader>// init.fileLoaderListSize, 200, init.fileLoaderListSize );
        this.m_pDataLoaders = new Object as RefHashTable<radLoadDataLoader>// init.dataLoaderListSize, 200, init.dataLoaderListSize );
    }
    Load(options: radLoadOptions, request: radLoadRequest) { }
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
class tLoadRequest {
    options: any
    request: any
    IsDummy(): boolean { return false }
}
class tLoadManager {
    Load(request: tLoadRequest): tLoadStatus {
        if(!request.IsDummy()) {
            radLoad.Load(request.options, request.request)
        }
        return tLoadStatus.LOAD_OK
    }
    AddHandler(l: tFileHandler, ext: char_p): tFileHandler {
        radLoad.AddFileLoader(l, ext)
        return l
    }
    GetHandler(ext: char_p): tFileHandler {
        return radLoad.GetFileLoader(ext) as tFileHandler
    }
    GetP3DHander(): tP3DFileHandler {
        return this.GetHandler(`.p3d`) as tP3DFileHandler
    }
}
