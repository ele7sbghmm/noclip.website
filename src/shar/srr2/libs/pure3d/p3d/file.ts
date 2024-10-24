import { P3D_U8, P3D_U16, P3D_U32, P3D_U64, int, unsigned, unsigned_int, char_p, const_char_p, } from '../../../../type_aliases.js';
import { radLoadDataStream } from '../../radcontent/src/radload/stream.js';
import { radLoadStream } from '../../radcontent/src/radload/loader.js';

enum DataType {
  BYTE = 1,
  WORD = 2,
  DWORD = 4,
  QWORD = 8
};


export abstract class tFile extends radLoadStream {
  public fullFilename: char_p;
  public filename: char_p;
  public extension: char_p;
  public compressed: boolean;

  constructor() {
    super();

    this.fullFilename = '';
    this.filename = '';
    this.extension = '';
    this.compressed = false;
  }

  public abstract EndOfFile(): boolean;
  public abstract Advance(_: unsigned): void;
  public GetData(buf: any, count: unsigned, type: DataType = DataType.BYTE): boolean {
    return false;
  };

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

  /* tFile doesn't implement? */ public GetPosition() { return 0; };
  /* tFile doesn't implement? */ public GetEndianSwap() { return 0; };
  /* tFile doesn't implement? */ public SetEndianSwap() { return 0; };

  public _get_u8_string() { }
}

export class tFileMem extends tFile {
  public dataStream: radLoadDataStream;
  public del: boolean;
  public length: unsigned_int;

  public override EndOfFile(): boolean { return !(this.GetPosition() < this.GetSize()); };
  public GetSize(): unsigned { return this.dataStream.GetSize(); }
  public Advance(offset: unsigned) { /* Read( NULL, offset, 1 ); */ }
  public override GetPosition(): unsigned { return this.dataStream.GetPosition(); }
  public override GetEndianSwap(): unsigned { return this.dataStream.GetEndianSwap(); }
  public override SetEndianSwap(): unsigned { return this.dataStream.SetEndianSwap(); }
  public override GetData(buf: any, count: unsigned, type: DataType = DataType.BYTE): boolean {
    return false;
  };
  public static override SetFilename(c: const_char_p) { tFile.SetFilename(c); }

  public override SetCompressed(b: boolean) { /* pass */ }
}
