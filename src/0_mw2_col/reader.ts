import ArrayBufferSlice from '../ArrayBufferSlice.js'

export class Reader {
  view: DataView
  len: number
  offs: number = 0
  constructor(public buf: ArrayBufferSlice) {
    this.view = buf.createDataView()
    this.len = buf.byteLength
  }
  seek(offs: number) {
    this.offs = offs
  }
  seekCur(offs: number) {
    this.offs += offs
  }
  f32(le: boolean = true) {
    this.offs += 4
    return this.view.getFloat32(this.offs - 4, le)
  }
  u32(le: boolean = true) {
    this.offs += 4
    return this.view.getUint32(this.offs - 4, le)
  }
  i32(le: boolean = true) {
    this.offs += 4
    return this.view.getInt32(this.offs - 4, le)
  }
  u16(le: boolean = true) {
    this.offs += 2
    return this.view.getUint16(this.offs - 2, le)
  }
  i16(le: boolean = true) {
    this.offs += 2
    return this.view.getInt16(this.offs - 2, le)
  }
  u8() {
    this.offs += 1
    return this.view.getUint8(this.offs - 1)
  }
  i8() {
    this.offs += 1
    return this.view.getInt8(this.offs - 1)
  }
}

