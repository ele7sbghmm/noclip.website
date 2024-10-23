import { P3D_U8, P3D_U16, P3D_U32, P3D_U64, int, unsigned, unsigned_int, char_p, const_char_p, } from '../../../../type_aliases.js';
import { radLoadDataStream } from '../../radcontent/src/radload/stream.js';

enum DataType {
  BYTE = 1,
  WORD = 2,
  DWORD = 4,
  QWORD = 8
};


export abstract class tFile { // extends radLoadStream {
  public fullFilename: char_p;
  public filename: char_p;
  public extension: char_p;
  public compressed: boolean;

  constructor() {
    this.fullFilename = '';
    this.filename = '';
    this.extension = '';
    this.compressed = false;
  }

  public EndOfFile(): boolean { return false; };
  public Advance(offset: unsigned): void { }

  public GetData(buf: any, count: unsigned, type: DataType = DataType.BYTE): boolean { return false; };

  public GetByte(): P3D_U8 { return 0; }
  public GetWord(): P3D_U16 { return 0; }
  public GetDWord(): P3D_U32 { return 0; }
  public GetQWord(): P3D_U64 { return 0; }

  public Read(data: any, count: unsigned, size: unsigned): boolean {
    return this.GetData(data, count, size);
  }

  public GetFullFilename(): char_p { return this.fullFilename; }
  public GetFilename(): char_p { return this.filename; }
  public GetExtension(): char_p { return this.extension; }

  public SetCompressed(b: boolean) { this.compressed = b; }
  public GetCompressed(): boolean { return this.compressed; }
  public SetUncompressedSize(size: int) { }

  public static SetFilename(c: const_char_p) { };
}

export class tFileMem extends tFile {
  public dataStream: radLoadDataStream;
  public del: boolean;
  public length: unsigned_int;

  public override EndOfFile(): boolean { return !(this.GetPosition() < this.GetSize()); };
  public GetSize(): unsigned { return this.dataStream.GetSize(); }
  public override Advance(offset: unsigned) { /* Read( NULL, offset, 1 ); */ }
  public GetPosition(): unsigned { return this.dataStream.GetPosition(); }
  public override GetData(buf: any, count: unsigned, type: DataType = DataType.BYTE): boolean { return false; };
  public static override SetFilename(c: const_char_p) { tFile.SetFilename(c); }

  public override SetCompressed(b: boolean) { /* pass */ }
}
