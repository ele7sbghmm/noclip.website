class FileHandler { }
export function GetLoadingManager(): LoadingManager {
    return LoadingManager.GetInstance()
}
export class LoadingManager {
    static spInstance: LoadingManager
    mRequests: LoadingManager.LoadingRequest[]
    static CreateInstance(): LoadingManager {
        LoadingManager.spInstance = new LoadingManager
        return LoadingManager.spInstance
    }
    static GetInstance(): LoadingManager {
        return LoadingManager.spInstance
    }
    AddRequest() { }
}
namespace LoadingManager {
    export interface LoadingRequest {
        filename: string //char[LOADING_FILENAME_LENGTH = 128]
        pFileHandler: FileHandler
        pUserData: any
    }
}