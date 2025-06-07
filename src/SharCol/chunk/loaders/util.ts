import ArrayBufferSlice from '../../../ArrayBufferSlice.js'

export class Entity {
  positionData: ArrayBufferSlice
  normalData?: ArrayBufferSlice
  colorData?: ArrayBufferSlice
  uvData?: ArrayBufferSlice
  indexData?: ArrayBufferSlice
}

