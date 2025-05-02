import { assert } from '../../util.js'
import ArrayBufferSlice from '../../ArrayBufferSlice.js'

import { PgfFile, VBGeomData, PrimitiveListData } from './parse.js'

export class Pgf {
    vertexData: ArrayBufferSlice
    vbGeoms: VBGeom[] = []
    constructor(buffer: ArrayBufferSlice) {
        const pgfFile = new PgfFile(buffer)
        this.vertexData = pgfFile.vertexData

        let offs
        let a = 0
        let l = 30
        for (let i = 0; i < pgfFile.numVBGeoms; i++) {
            // for (let i = a; i < a + l; i++) {
            offs = VBGeomData.size * i
            this.vbGeoms.push(new VBGeom(pgfFile, offs))
        }
    }
}
export class VBGeom {
    vertexStartIndex: number
    vertexStride: number
    primitiveList: PrimitiveList[] = []
    vbGeomData: VBGeomData
    constructor(file: PgfFile, vbGeomPtr: number) {
        this.vbGeomData = new VBGeomData(file.vbGeomData, vbGeomPtr)

        this.vertexStride = this.vbGeomData.vertexSize
        this.vertexStartIndex = file.vertexResources.getUint32(this.vbGeomData.vertexBufferPtrs[0] + 4, true)
        const indexStartIndex = file.indexResources.getUint32(this.vbGeomData.indexBufferPtr + 4, true)

        let offs
        for (let i = 0; i < this.vbGeomData.numOfRenderLists; i++) {
            offs = PrimitiveListData.size * i
            this.primitiveList.push(new PrimitiveList(
                file,
                this.vbGeomData.primitiveListPtr + 0x30 * i,
                indexStartIndex
            ))
        }
    }
}
export class PrimitiveList {
    indexBuffer: Uint16Array
    primitiveList: PrimitiveListData
    constructor(file: PgfFile, primitiveListPtr: number, indexPtr: number) {
        this.primitiveList = new PrimitiveListData(file.primitiveListData, primitiveListPtr)
        const actualNumOfPrimitives = Photon_GetNumVertices(
            this.primitiveList.primitiveType,
            this.primitiveList.numOfPrimitives
        )
        const indexSlice = file.indexData.subarray(
            indexPtr + this.primitiveList.startIndex,
            actualNumOfPrimitives * 2,
            true
        )
        this.indexBuffer = primitiveToList(
            this.primitiveList.primitiveType,
            this.primitiveList.numOfPrimitives,
            new Uint16Array(indexSlice.arrayBuffer)
        )
    }
}

enum PRIMITIVETYPE {
    POINTLIST = 1,
    LINELIST,
    LINELOOP,
    LINESTRIP,
    TRILIST,
    TRISTRIP,
    TRIFAN,
    QUADLIST,
    QUADSTRIP,
    POLYGON
}
function Photon_GetNumVertices(primitiveType: PRIMITIVETYPE, numOfPrimitives: number) {
    switch (primitiveType) {
        case PRIMITIVETYPE.POINTLIST:
        case PRIMITIVETYPE.LINELOOP:
        case PRIMITIVETYPE.POLYGON: return numOfPrimitives
        case PRIMITIVETYPE.LINELIST: return numOfPrimitives * 2
        case PRIMITIVETYPE.LINESTRIP: return numOfPrimitives + 1
        case PRIMITIVETYPE.TRILIST: return numOfPrimitives * 3
        case PRIMITIVETYPE.TRISTRIP:
        case PRIMITIVETYPE.TRIFAN: return numOfPrimitives + 2
        case PRIMITIVETYPE.QUADLIST: return numOfPrimitives << 2
        case PRIMITIVETYPE.QUADSTRIP: return numOfPrimitives * 2 + 2
        default: assert(false, `${primitiveType} unknown primitive`)
    }
}
function primitiveToList(primitiveType: PRIMITIVETYPE, numOfPrimitives: number, indexData: Uint16Array) {
    switch (primitiveType) {
        case PRIMITIVETYPE.POINTLIST:
        case PRIMITIVETYPE.LINELIST:
        case PRIMITIVETYPE.TRILIST: return indexData

        case PRIMITIVETYPE.TRISTRIP:
            const out = new Uint16Array(numOfPrimitives * 3)
            for (let i = 0; i < numOfPrimitives; i++) {
                if (i % 2) {
                    out[i * 3 + 0] = indexData[i + 0]
                    out[i * 3 + 1] = indexData[i + 2]
                    out[i * 3 + 2] = indexData[i + 1]
                } else {
                    out[i * 3 + 0] = indexData[i + 0]
                    out[i * 3 + 1] = indexData[i + 1]
                    out[i * 3 + 2] = indexData[i + 2]
                }
            }
            return out

        case PRIMITIVETYPE.LINELOOP:
        case PRIMITIVETYPE.LINESTRIP:
        case PRIMITIVETYPE.TRIFAN:
        case PRIMITIVETYPE.QUADLIST:
        case PRIMITIVETYPE.QUADSTRIP:
        case PRIMITIVETYPE.POLYGON: assert(false, `${primitiveType} not implemented`)
        default: assert(false, `${primitiveType} unknown primitive`)
    }
}
