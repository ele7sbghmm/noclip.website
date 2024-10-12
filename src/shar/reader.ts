import { NamedArrayBufferSlice } from "../DataFetcher.js";
import { assert } from "../util.js";
import { f32, u32, i32, u16, i16, u8, i8 } from "./utils.js";

export class BufReader {
  readonly name: string;
  readonly view: DataView;
  readonly len: number;
  protected offs: number;

  constructor(buf: NamedArrayBufferSlice) {
    this.name = buf.name;
    this.view = buf.createDataView();
    this.offs = buf.byteOffset;
    this.len = buf.byteLength;
  }

  public get_name(): string {
    return this.name;
  }
  public get_offs(): number {
    return this.offs;
  }
  public get_len(): number {
    return this.len;
  }
  public get_remaining(): number {
    return this.len - this.offs;
  }

  public seek(offset: number) {
    assert(this.len >= offset, `this.len=${this.len} < offset=${offset}`);
    this.offs = offset;
  }
  public seek_forward(offset: number) {
    this.seek(this.offs + offset);
  }
  public seek_back(offset: number) {
    this.seek(this.offs - offset);
  }

  public read_u8_string(offset: number = 0): string {
    const string_len: u8 = this.u8();
    return this.read_string(offset, string_len);
  }
  public read_null_terminated_string(offset: number = 0): string {
    let char: i8 = 0xff;
    let str = ``;
    this.seek_forward(offset);
    while (((char = this.i8()), char != 0)) {
      assert(char > 0, `char=${char} > 0`);
      str += String.fromCharCode(char);
    }
    return str;
  }
  public read_string(str_len: number, offset: number = 0): string {
    let str = ``;
    for (let i = offset; i < str_len + offset; i++) {
      str += String.fromCharCode(this.i8(offset));
    }
    return str;
  }

  public le_f32(
    offset: number = 0,
    byteSize: number = 4,
    peek: boolean = false,
  ): f32 {
    assert(
      this.len >= this.offs + offset + byteSize,
      `this.len=${offset} >= offset=${offset} + byteSize=${byteSize}`,
    );
    const num: f32 = this.view.getFloat32(this.offs + offset, true);
    if (!peek) this.offs += byteSize;
    return num;
  }
  public le_u32(
    offset: number = 0,
    byteSize: number = 4,
    peek: boolean = false,
  ): u32 {
    assert(
      this.len >= this.offs + offset + byteSize,
      `this.len=${offset} >= offset=${offset} + byteSize=${byteSize}`,
    );
    const num: u32 = this.view.getUint32(this.offs + offset, true);
    if (!peek) this.offs += byteSize;
    return num;
  }
  public be_u32(
    offset: number = 0,
    byteSize: number = 4,
    peek: boolean = false,
  ): u32 {
    assert(
      this.len >= this.offs + offset + byteSize,
      `this.len=${offset} >= offset=${offset} + byteSize=${byteSize}`,
    );
    const num: u32 = this.view.getUint32(this.offs + offset, false);
    if (!peek) this.offs += byteSize;
    return num;
  }
  public le_i32(
    offset: number = 0,
    byteSize: number = 4,
    peek: boolean = false,
  ): i32 {
    assert(
      this.len >= this.offs + offset + byteSize,
      `this.len=${offset} >= offset=${offset} + byteSize=${byteSize}`,
    );
    const num: i32 = this.view.getInt32(this.offs + offset, true);
    if (!peek) this.offs += byteSize;
    return num;
  }
  public be_i32(
    offset: number = 0,
    byteSize: number = 4,
    peek: boolean = false,
  ): i32 {
    assert(
      this.len >= this.offs + offset + byteSize,
      `this.len=${offset} >= offset=${offset} + byteSize=${byteSize}`,
    );
    const num: i32 = this.view.getInt32(this.offs + offset, false);
    if (!peek) this.offs += byteSize;
    return num;
  }
  public le_u16(
    offset: number = 0,
    byteSize: number = 2,
    peek: boolean = false,
  ): u16 {
    assert(
      this.len >= this.offs + offset + byteSize,
      `this.len=${offset} >= offset=${offset} + byteSize=${byteSize}`,
    );
    const num: u16 = this.view.getUint16(this.offs + offset, true);
    if (!peek) this.offs += byteSize;
    return num;
  }
  public be_u16(
    offset: number = 0,
    byteSize: number = 2,
    peek: boolean = false,
  ): u16 {
    assert(
      this.len >= this.offs + offset + byteSize,
      `this.len=${offset} >= offset=${offset} + byteSize=${byteSize}`,
    );
    const num: u16 = this.view.getUint16(this.offs + offset, false);
    if (!peek) this.offs += byteSize;
    return num;
  }
  public le_i16(
    offset: number = 0,
    byteSize: number = 2,
    peek: boolean = false,
  ): i16 {
    assert(
      this.len >= this.offs + offset + byteSize,
      `this.len=${offset} >= offset=${offset} + byteSize=${byteSize}`,
    );
    const num: i16 = this.view.getInt16(this.offs + offset, true);
    if (!peek) this.offs += byteSize;
    return num;
  }
  public be_i16(
    offset: number = 0,
    byteSize: number = 2,
    peek: boolean = false,
  ): i16 {
    assert(
      this.len >= this.offs + offset + byteSize,
      `this.len=${offset} >= offset=${offset} + byteSize=${byteSize}`,
    );
    const num: i16 = this.view.getInt16(this.offs + offset, false);
    if (!peek) this.offs += byteSize;
    return num;
  }
  public u8(
    offset: number = 0,
    byteSize: number = 1,
    peek: boolean = false,
  ): u8 {
    assert(
      this.len >= this.offs + offset + byteSize,
      `this.len=${offset} >= offset=${offset} + byteSize=${byteSize}`,
    );
    const num: u16 = this.view.getUint8(this.offs + offset);
    if (!peek) this.offs += byteSize;
    return num;
  }
  public i8(
    offset: number = 0,
    byteSize: number = 1,
    peek: boolean = false,
  ): i8 {
    assert(
      this.len >= this.offs + offset + byteSize,
      `this.len=${offset} >= offset=${offset} + byteSize=${byteSize}`,
    );
    const num: i8 = this.view.getInt8(this.offs + offset);
    if (!peek) this.offs += byteSize;
    return num;
  }
}
