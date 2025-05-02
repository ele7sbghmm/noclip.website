import ArrayBufferSlice from '../../ArrayBufferSlice.js'

export class PgfFile {
    version: number

    totalFileSize: number
    totalDataSize: number
    textureDataSize: number
    numTextures: number
    shaderDataSize: number

    // textureResources: DataView
    // textureData: ArrayBufferSlice

    vbDataSize: number
    ibDataSize: number
    pbDataSize: number
    bvDataSize: number
    miscDataSize: number
    influenceDataSize: number
    limDataSize: number
    collisionDataSize: number
    stringTableSize: number
    numShaders: number
    numVertexBuffers: number
    numIndexBuffers: number
    numPushBuffers: number
    numPrimLists: number
    numVBGeoms: number
    numJoints: number

    vertexData: ArrayBufferSlice
    vertexResources: DataView
    indexData: ArrayBufferSlice
    indexResources: DataView
    // pushBufferData: ArrayBufferSlice
    // pushBufferResources: DataView

    // boundingVolumeData: DataView
    // miscData: DataView
    // influenceData: DataView
    // limData: DataView
    // collisionData: ArrayBufferSlice
    // stringTableData: ArrayBufferSlice
    primitiveListData: DataView
    vbGeomData: DataView

    constructor(buffer: ArrayBufferSlice) {
        const view = buffer.createDataView()

        let offs = 0
        this.version = view.getFloat32(offs + 0, true)
        offs += 4
        offs += 4

        this.totalFileSize = view.getUint32(offs + 0, true)
        this.totalDataSize = view.getUint32(offs + 4, true)
        this.textureDataSize = view.getUint32(offs + 8, true)
        this.numTextures = view.getUint32(offs + 12, true)
        this.shaderDataSize = view.getUint32(offs + 16, true)
        offs += 20
        offs += 4

        // textureResources
        offs += 20 * this.numTextures
        // textureData
        offs += this.textureDataSize
        offs += 4
        // shaderData
        offs += this.shaderDataSize
        offs += 4

        this.vbDataSize = view.getUint32(offs + 0, true)
        this.ibDataSize = view.getUint32(offs + 4, true)
        this.pbDataSize = view.getUint32(offs + 8, true)
        this.bvDataSize = view.getUint32(offs + 12, true)
        this.miscDataSize = view.getUint32(offs + 16, true)
        this.influenceDataSize = view.getUint32(offs + 20, true)
        this.limDataSize = view.getUint32(offs + 24, true)
        this.collisionDataSize = view.getUint32(offs + 28, true)
        this.stringTableSize = view.getUint32(offs + 32, true)
        this.numShaders = view.getUint32(offs + 36, true)
        this.numVertexBuffers = view.getUint32(offs + 40, true)
        this.numIndexBuffers = view.getUint32(offs + 44, true)
        this.numPushBuffers = view.getUint32(offs + 48, true)
        this.numPrimLists = view.getUint32(offs + 52, true)
        this.numVBGeoms = view.getUint32(offs + 56, true)
        this.numJoints = view.getUint32(offs + 60, true)
        offs += 64
        offs += 4

        this.vertexData = buffer.subarray(offs, this.vbDataSize, true)
        offs += this.vbDataSize
        this.vertexResources = buffer.createDataView(offs, 12 * this.numVertexBuffers)
        offs += 12 * this.numVertexBuffers
        this.indexData = buffer.subarray(offs, this.ibDataSize, true)
        offs += this.ibDataSize
        this.indexResources = buffer.createDataView(offs, 12 * this.numIndexBuffers)
        offs += 12 * this.numIndexBuffers
        offs += 4

        // this.pushBufferData
        offs += this.pbDataSize
        // this.pushBufferResources
        offs += 20 * this.numPushBuffers

        // this.boundingVolumeData
        offs += this.bvDataSize
        // this.miscData
        offs += this.miscDataSize
        // this.influenceData
        offs += this.influenceDataSize
        // this.limData
        offs += this.limDataSize
        // this.collisionData
        offs += this.collisionDataSize
        // this.stringTableData
        offs += this.stringTableSize
        this.primitiveListData = buffer.createDataView(offs, PrimitiveListData.size * this.numPrimLists)
        offs += PrimitiveListData.size * this.numPrimLists
        this.vbGeomData = buffer.createDataView(offs, VBGeomData.size * this.numVBGeoms)
        offs += VBGeomData.size * this.numVBGeoms
    }
}

export class VBGeomData {
    static size = 48

    unused: number
    vertexBufferPtrs: [number, number, number, number]
    indexBufferPtr: number
    auxDataPtr: number
    numOfRenderLists: number
    primitiveListPtr: number
    boundingVolumePtr: number
    vertexSize: number
    numOfVertices: number

    constructor(view: DataView, offs: number) {
        this.unused = view.getUint32(offs + 0, true)
        this.vertexBufferPtrs = [
            view.getUint32(offs + 4, true),
            view.getUint32(offs + 8, true),
            view.getUint32(offs + 12, true),
            view.getUint32(offs + 16, true),
        ]
        this.indexBufferPtr = view.getUint32(offs + 20, true)
        this.auxDataPtr = view.getUint32(offs + 24, true)
        this.numOfRenderLists = view.getUint32(offs + 28, true)
        this.primitiveListPtr = view.getUint32(offs + 32, true)
        this.boundingVolumePtr = view.getUint32(offs + 36, true)
        this.vertexSize = view.getUint32(offs + 40, true)
        this.numOfVertices = view.getUint32(offs + 44, true)
    }
}

export class PrimitiveListData {
    static size = 48

    unused: number
    startIndex: number
    numOfPrimitives: number
    primitiveType: number
    shaderPtr: [number, number, number]
    lodDistances: [number, number, number]
    pushBufferPtr: number
    auxDataPtr: number

    constructor(view: DataView, offs: number) {
        this.unused = view.getUint32(offs + 0, true)
        this.startIndex = view.getUint32(offs + 4, true)
        this.numOfPrimitives = view.getUint32(offs + 8, true)
        this.primitiveType = view.getUint32(offs + 12, true)
        this.shaderPtr = [
            view.getUint32(offs + 16, true),
            view.getUint32(offs + 20, true),
            view.getUint32(offs + 24, true),
        ]
        this.lodDistances = [
            view.getFloat32(offs + 28, true),
            view.getFloat32(offs + 32, true),
            view.getFloat32(offs + 36, true),
        ]
        this.pushBufferPtr = view.getUint32(offs + 40, true)
        this.auxDataPtr = view.getUint32(offs + 44, true)
    }
}
