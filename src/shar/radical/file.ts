import {
  unsigned_short,
  unsigned_char,
  unsigned_char_p,
  unsigned,
  int,
  P3D_U64,
  P3D_U32,
  P3D_U16,
  P3D_U8,
} from "../types.js";

class tFile {
  public:
    //new interface


    constructor(data: unsigned_char_p, len: unsigned, d): boolean
    : dataStream(NULL), del(d) {
      dataStream = new radLoadDataStream(data, len, d);
      dataStream -> AddRef();
      SetFilename("temp.p3d");
    }

  destroy() {
    if (dataStream) {
      dataStream -> Release();
    }
  }

  GetByte(): P3D_U8 { tmp: P3D_U8; GetData(& tmp, 1, tFile.DataType.BYTE); return tmp; }
  GetWord(): P3D_U16 { tmp: P3D_U16; GetData(& tmp, 1, WORD); return tmp; }
  GetDWord(): P3D_U32 { tmp: P3D_U32; GetData(& tmp, 1, DWORD); return tmp; }
  GetQWord(): P3D_U64 { tmp: P3D_U64; GetData(& tmp, 1, QWORD); return tmp; }

  Read(data: void_p, count: unsigned, size: unsigned): boolean { return GetData(data, count, static_cast<DataType>(size)); }

  GetFullFilename(): char_p { return fullFilename; }
  GetFilename(): char_p { return filename; }
  GetExtension(): char_p { return extension; }

  GetCompressed(): boolean { return compressed; }

  // need this to be public so you can set a filename for memory 


  GetEndianSwap(): boolean { return dataStream -> GetEndianSwap(); }
  // returns prevoius state of the endian swap bool
  SetEndianSwap(boolean swap): boolean { m_endianSwap = swap; return dataStream -> SetEndianSwap(swap); }

  protected:
    fullFilename: char_p;
  filename: char_p;
  extension: char_p;

  compressed: boolean;


  dataStream: radLoadDataStream_p;
  del: boolean;

  length: unsigned_int;

  GetData(buf: void_p, count: unsigned, DataType type): boolean {
    return dataStream -> Read(buf, count, static_cast<unsigned_int>(type));
  }

  EndOfFile(): boolean {
    return !(GetPosition() < GetSize());
  }

  GetSize(): unsigned {
    return dataStream -> GetSize();
  }

  Advance(offset: unsigned): void {
    Read(NULL, offset, 1);
  }

  GetPosition(): unsigned {
    return dataStream -> GetPosition();
  }

  GetMemory(): unsigned_char_p {
    return dataStream -> GetMemory();
  }

  SetCompressed(boolean b): void {
    if (b) {
      // Check that the uncompressed size has been set first
      rAssert(length);
      oldmem: unsigned_char_p = GetMemory();
      position: unsigned_char_p = oldmem;
      newmem: unsigned_char_p = new unsigned_char[length];
      output: unsigned_char_p = newmem;
      total: unsigned_int = 0;

      while (total < length) {
        inputsize: int = GetDWord();
        outsize: int = GetDWord();
        UncompressBlock(position, inputsize, output, outsize);
        total += outsize;
        output += outsize;
        position += inputsize;
      }
      dataStream -> Release();
      dataStream = new radLoadDataStream(newmem, length, del);

    }
  }

  SetUncompressedSize(size: int): void {
    length = size;
  }
  SetFilename(const char_p n): void {
    if (fullFilename)
      p3d:: FreeTemp(fullFilename);

    fullFilename = filename = extension = NULL;

    fullFilename = (char_p)p3d:: MallocTemp(strlen(n) + 1);
    strcpy(fullFilename, n);
    
    int i = 0;

    filename = fullFilename;

    for (i = strlen(fullFilename); i >= 0; i--) {
      if ((fullFilename[i] == '\\') || (fullFilename[i] == '/')) {
        filename = & fullFilename[i + 1];
        break;
      }
    }

    extension = & fullFilename[strlen(fullFilename)];

    for (i = strlen(fullFilename); i >= 0; i--) {
      if (fullFilename[i] == '.') {
        extension = & fullFilename[i];
        break;
      }
    }
  }

  UncompressBlock(
    input: unsigned_char_p,
    inputsize: unsigned_int,
    output: unsigned_char_p,
    outputsize: unsigned_int
  ) {
    lzr_decompress(input, inputsize, output, outputsize);
  }

};


namespace tFile {
  enum DataType {
    BYTE = 1, WORD = 2, DWORD = 4, QWORD = 8,
  }
};
