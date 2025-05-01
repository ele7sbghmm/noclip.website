import { assert } from '../../util.js'
import ArrayBufferSlice from '../../ArrayBufferSlice.js'


import { PgfFile, VBGeomData, PrimitiveListData } from './parse.js'

export class Pgf {
    vbGeoms: VBGeom[] = []
    constructor(public file: PgfFile) {
        for (let i = 0; i < 0x30; i++) {
            this.vbGeoms.push(new VBGeom(file, 0x30 * i))
        }
    }
}
export class VBGeom {
    vertexStartIndex: number
    primitiveList: PrimitiveList[] = []
    constructor(
        file: PgfFile,
        vbGeomPtr: number
    ) {
        const vbGeomData = new VBGeomData(file.vbGeomData, vbGeomPtr)

        this.vertexStartIndex = file.vertexResources.getUint32(vbGeomData.vertexBufferPtrs[0] + 4, true)
        const indexStartIndex = file.indexResources.getUint32(vbGeomData.indexBufferPtr + 4, true)

        for (let i = 0; i < vbGeomData.numOfRenderLists; i++) {
            this.primitiveList.push(new PrimitiveList(file, vbGeomData.primitiveListPtr, indexStartIndex))

        }
    }
}
export class PrimitiveList {
    indexBuffer: Uint16Array
    constructor(
        file: PgfFile,
        primitiveListPtr: number,
        indexPtr: number
    ) {
        const primitiveList = new PrimitiveListData(file.primitiveListData, primitiveListPtr)
        const actualNumOfPrimitives = Photon_GetNumVertices(
            primitiveList.primitiveType,
            primitiveList.numOfPrimitives
        )
        const indexSlice = file.indexData.subarray(
            indexPtr + primitiveList.startIndex,
            actualNumOfPrimitives,
            true
        )
        this.indexBuffer = primitiveToList(
            primitiveList.primitiveType,
            primitiveList.numOfPrimitives,
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
    }
}
function primitiveToList(
    primitiveType: PRIMITIVETYPE,
    numOfPrimitives: number,
    indexData: Uint16Array
) {
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
