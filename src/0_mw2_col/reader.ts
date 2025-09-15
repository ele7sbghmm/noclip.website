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
  cstr() {
    let len = 0
    while (this.view.getUint8(this.offs + len++) != 0) { }

    const text = new TextDecoder('ascii')
      .decode(new DataView(this.view.buffer, this.offs, len))
      .replace(/\x00/g, '')

    this.offs += len
    return text
  }
  str(len: number) {
    this.offs += len
    return new TextDecoder('ascii')
      .decode(new DataView(this.view.buffer, this.offs - len, len))
      .replace(/\x00/g, '')
  }
  f32r(r: number, le: boolean = true) {
    const n = r ? Math.pow(10, r) : 1
    return Math.round(this.f32(le) * n) / n
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

