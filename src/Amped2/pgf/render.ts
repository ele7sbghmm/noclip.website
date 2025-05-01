import ArrayBufferSlice from '../../ArrayBufferSlice.js'
import { GfxDevice, GfxBuffer } from '../../gfx/platform/GfxPlatform.js'

import { Program } from '../render.js'
import { VBGeom, PrimitiveList } from './pgf.js'

class PgfRenderer {
    vertexDataBuffer: GfxBuffer
    constructor() { }
    destroy(device: GfxDevice) { }
    prepareToRender() { }
}
class VBGeomRenderer {
    constructor() { }
    destroy(device: GfxDevice) { }
    prepareToRender() { }
}
class PrimListRenderer {
    indexDataBuffer: GfxBuffer
    constructor(primList: PrimitiveList) { }
    destroy(device: GfxDevice) { }
    prepareToRender() { }
}

