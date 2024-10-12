import { BufReader } from "../reader.js";

import { float, unsigned, int, unsigned_short, short, unsigned_char, char, char_p, P3D_U32 } from "../types.js";
import { Pure3D } from "./chunkids.js";

type Chunk = {
  id: unsigned,
  dataLength: unsigned;
  chunkLength: unsigned;
  startPosition: unsigned;
};

// stub class
interface tFile {
  GetPosition(...args: any[]): number;
  SetEndianSwap(...args: any[]): undefined;
  GetEndianSwap(...args: any[]): number;
  GetData(...args: any[]): boolean;
  GetUInt(...args: any[]): number;
  GetInt(...args: any[]): number;
  GetUShort(...args: any[]): number;
  GetShort(...args: any[]): number;
  GetUChar(...args: any[]): number;
  GetChar(...args: any[]): number;
  GetFloat(...args: any[]): number;
  GetByte(...args: any[]): number;
  GetWord(...args: any[]): number;
  GetDWord(...args: any[]): number;
  GetQWord(...args: any[]): number;
  SetUncompressedSize(...args: any[]): undefined;
  SetCompressed(...args: any[]): undefined;
  Advance(...args: any[]): undefined;
  GetSize(): unsigned;
  GetPosition(): unsigned;
  GetFullFilename(): char_p;
  GetFilename(): char_p;
}

namespace tFile {
  export type FloatInt =
    | float
    | unsigned;
  export enum DataType {
    BYTE = 1,
    WORD = 2,
    DWORD = 4,
    QWORD = 8
  };
}

const CHUNK_STACK_SIZE: number = 32;
const HEADER_SIZE: int = 12;

class tChunkFile { // extends radLoadStream {
  chunkStack: Chunk[]; // [CHUNK_STACK_SIZE]

  constructor(
    public stackTop: unsigned = -1,
    // public realFile: tFile,
    public buf: BufReader,
  ) {
    // tRefCounted:: Assign(realFile, file);

    // let fileChunk: P3D_U32 = 0;
    // this.GetData(fileChunk, 4);
    let fileChunk: P3D_U32 = this.buf.le_u32(); // file's fourCC (0x503344FF or 0xP3D\xff)

    switch (fileChunk) {
      case Pure3D.DATA_FILE_COMPRESSED_SWAP:
      // this.realFile.SetEndianSwap(!this.realFile.GetEndianSwap());
      // fallthrough
      case Pure3D.DATA_FILE_COMPRESSED: {
        let fileSize: int = 0;
        // this.GetData(fileSize, 1, tFile.DataType.DWORD);
        this.buf.le_u32();

        // this.realFile.SetUncompressedSize(fileSize);
        // this.realFile.SetCompressed(true);

        // this.GetData(fileChunk, 1, tFile.DataType.DWORD);
        this.buf.le_u32();

        break;
      }
      default:
        break;
    }

    switch (fileChunk) {
      case Pure3D.DATA_FILE:
        break;
      case Pure3D.DATA_FILE_SWAP:
        // this.realFile.SetEndianSwap(!this.realFile.GetEndianSwap());
        fileChunk = Pure3D.DATA_FILE;
        break;
      default:
        break;
    }

    this.BeginChunk__p3d(fileChunk);
  }

  // GetUInt(): unsigned { return this.realFile.GetDWord(); }
  // GetInt(): int { return this.realFile.GetDWord(); }
  // GetUShort(): unsigned_short { return this.realFile.GetWord(); }
  // GetShort(): short { return this.realFile.GetWord(); }
  // GetUChar(): unsigned_char { return this.realFile.GetByte(); }
  // GetChar(): char { return this.realFile.GetByte(); }
  // GetFloat(): float {
  //   let tmp: tFile.FloatInt = 0;
  //   tmp.un = this.realFile.GetDWord();
  //   return tmp.fn;
  // }
  // GetString(str: char_p): char_p {
  //   const len: unsigned = this.realFile.GetByte();
  //   this.realFile.GetData(str, len);
  //   // str[len] = 0;
  //   return str;
  // }
  // GetData(buf: unknown, count: unsigned, type: tFile.DataType = tFile.DataType.BYTE): boolean {
  //   return this.realFile.GetData(buf, count, type);
  // }
  // Read(data: unknown, count: unsigned, size: unsigned): boolean {
  //   return this.GetData(data, count, <tFile.DataType>size);
  // }
  // GetSize(): unsigned { return this.realFile.GetSize(); }
  // GetPosition(): unsigned { return this.realFile.GetPosition(); }
  //
  // GetFullFilename(): char_p { return this.realFile.GetFullFilename(); }
  // GetFilename(): char_p { return this.realFile.GetFilename(); }

  GetUInt(): unsigned { return this.buf.le_u32(); }
  GetInt(): unsigned { return this.buf.le_i32(); }
  GetUShort(): unsigned { return this.buf.le_u16(); }
  GetShort(): unsigned { return this.buf.le_i16(); }
  GetUChar(): unsigned { return this.buf.u8(); }
  GetChar(): unsigned { return this.buf.i8(); }
  GetFloat(): unsigned { return this.buf.le_f32(); }
  GetString(): string { return this.buf.read_u8_string(); }

  GetSize(): unsigned { return this.buf.get_len(); }
  GetPosition(): unsigned { return this.buf.get_offs(); }

  GetFullFilename(): char_p { return this.buf.get_name(); }
  GetFilename(): char_p { return this.buf.get_name(); }

  // legacy functions
  // GetUWord(): unsigned_short { return this.GetUShort(); }
  // GetWord(): short { return this.GetShort(); }
  // GetLong(): int { return this.GetInt(); }
  // GetPString(str: char_p): char_p { return this.GetString(str); }

  ChunksRemaining(): boolean {
    const chunk: Chunk = this.chunkStack[this.stackTop];
    return (chunk.chunkLength > chunk.dataLength)
      && (this.realFile.GetPosition() < (chunk.startPosition + chunk.chunkLength));
  };

  BeginChunk(): unsigned {
    this.stackTop++;
    // P3DASSERT(stackTop < CHUNK_STACK_SIZE);

    // advance to the start of the subchunks
    if (this.stackTop != 0) {
      // assert that this chunk has subchunks
      // P3DASSERT(chunkStack[stackTop - 1].dataLength < chunkStack[stackTop - 1].chunkLength);

      const start: unsigned = this.chunkStack[this.stackTop - 1].startPosition
        + this.chunkStack[this.stackTop - 1].dataLength;
      if (this.realFile.GetPosition() < start) {
        this.realFile.Advance(start - this.realFile.GetPosition());
      }
    }

    // read chunk header
    this.chunkStack[this.stackTop].startPosition = this.realFile.GetPosition();
    this.chunkStack[this.stackTop].id = this.GetUInt();
    this.chunkStack[this.stackTop].dataLength = this.GetUInt();
    this.chunkStack[this.stackTop].chunkLength = this.GetUInt();

    return this.chunkStack[this.stackTop].id;
  }

  BeginChunk__p3d(chunkID: unsigned): unsigned {
    this.stackTop++;
    // P3DASSERT(stackTop == 0); // only the p3d file chunk should call this version of the funciton

    this.chunkStack[this.stackTop].startPosition = this.realFile.GetPosition() - 4;
    this.chunkStack[this.stackTop].id = chunkID;
    this.chunkStack[this.stackTop].dataLength = this.GetUInt();
    this.chunkStack[this.stackTop].chunkLength = this.GetUInt();

    return this.chunkStack[this.stackTop].id;
  }

  EndChunk(): void {
    const start: unsigned = this.chunkStack[this.stackTop].startPosition;
    const chLength: unsigned = this.chunkStack[this.stackTop].chunkLength;
    const dataLength: unsigned = this.chunkStack[this.stackTop].dataLength;

    // P3DASSERT(stackTop > 0);
    // P3DASSERT(realFile->GetPosition() <=  start + chLength); 
    // // P3DASSERT(oldChunkFormat || (chLength == dataLength) || (realFile->GetPosition() == start+chLength));
    this.realFile.Advance((start + chLength) - this.realFile.GetPosition());
    this.stackTop--;
  }

  GetCurrentID(): unsigned {
    return this.chunkStack[this.stackTop].id;
  }

  GetCurrentDataLength(): unsigned {
    return this.chunkStack[this.stackTop].dataLength - HEADER_SIZE;
  }

  GetCurrentOffset(): unsigned {
    return this.realFile.GetPosition() - this.chunkStack[this.stackTop].startPosition - HEADER_SIZE;
  }

  BeginInset(): tFile | undefined {
    return this.realFile;
  }

  // void   tChunkFile::EndInset(tFile* f)
  // {
  //     P3DASSERT(realFile->GetPosition() <= chunkStack[stackTop].startPosition + chunkStack[stackTop].chunkLength);
  // }

  // protected:
  // int stackTop;
  // tFile* realFile;
};
