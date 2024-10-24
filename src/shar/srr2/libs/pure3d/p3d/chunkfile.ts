import { assert } from '../../../../../util.js';

import { P3D_U32, float, char_p, int, char, short, unsigned, unsigned_char, unsigned_short } from '../../../../type_aliases.js';
import { Pure3D } from '../constants/chunkids.js';
import { tFile } from './file.js';
import { radLoadStream } from '../../radcontent/src/radload/loader.js';

export const HEADER_SIZE: int = 12;
export const CHUNK_STACK_SIZE: int = 32;

type Chunk = {
  id: unsigned;
  dataLength: unsigned;
  chunkLength: unsigned;
  startPosition: unsigned;
};

export class tChunkFile extends radLoadStream {
  public chunkStack: Chunk[]; // [CHUNK_STACK_SIZE]
  public stackTop: int = -1;
  public realFile: tFile;

  constructor(file: tFile) {
    super();

    // tRefCounted::Assign(this.realFile,file);
    this.realFile = file;

    let fileChunk: P3D_U32 = 0;
    // this.GetData(fileChunk, 4);

    switch (fileChunk) {
      case Pure3D.DATA_FILE_COMPRESSED_SWAP:
        this.realFile.SetEndianSwap(!this.realFile.GetEndianSwap());
      // // fallthrough
      case Pure3D.DATA_FILE_COMPRESSED: {
        let fileSize: int = 0;
        // this.GetData(fileSize, 1, tFile.DWORD);
        this.realFile.SetUncompressedSize(fileSize);
        this.realFile.SetCompressed(true);
        // this.GetData(fileChunk, 1, tFile.Enum.DWORD);
        break;
      }
      case Pure3D.DATA_FILE_SWAP:
        // this.realFile.SetEndianSwap(!this.realFile.GetEndianSwap());
        fileChunk = Pure3D.DATA_FILE;
      case Pure3D.DATA_FILE:
      default: break;
    }
    this.BeginChunk(fileChunk);
  }
  public GetPosition() {
    return this.realFile.GetPosition();
  }
  public ChunksRemaining(): boolean {
    const chunk: Chunk = this.chunkStack[this.stackTop];
    return (chunk.chunkLength > chunk.dataLength) && (this.realFile.GetPosition() < (chunk.startPosition + chunk.chunkLength));
  }
  public BeginChunk(chunkID?: unsigned): unsigned {
    this.stackTop++;

    if (chunkID) { // only the p3d file chunk
      assert(this.stackTop == 0); // P3DASSERT(stackTop == 0);
      this.chunkStack[this.stackTop].startPosition = this.realFile.GetPosition() - 4;
      this.chunkStack[this.stackTop].id = chunkID;
    } else {
      assert(this.stackTop < CHUNK_STACK_SIZE); // P3DASSERT(stackTop < CHUNK_STACK_SIZE);

      if (this.stackTop != 0) {
        assert(this.chunkStack[this.stackTop - 1].dataLength < this.chunkStack[this.stackTop - 1].chunkLength); // P3DASSERT(chunkStack[stackTop-1].dataLength < chunkStack[stackTop-1].chunkLength);

        let start: unsigned = this.chunkStack[this.stackTop - 1].startPosition + this.chunkStack[this.stackTop - 1].dataLength;
        if (this.realFile.GetPosition() < start) {
          this.realFile.Advance(start - this.realFile.GetPosition());
        }
      }
      // read chunk header
      this.chunkStack[this.stackTop].startPosition = this.realFile.GetPosition();
      this.chunkStack[this.stackTop].id = this.GetUInt();
    }

    this.chunkStack[this.stackTop].dataLength = this.GetUInt();
    this.chunkStack[this.stackTop].chunkLength = this.GetUInt();

    return this.chunkStack[this.stackTop].id;
  }
  public EndChunk() {
    const start: unsigned = this.chunkStack[this.stackTop].startPosition;
    const chLength: unsigned = this.chunkStack[this.stackTop].chunkLength;
    const dataLength: unsigned = this.chunkStack[this.stackTop].dataLength;

    // P3DASSERT(stackTop > 0);
    // P3DASSERT(this.realFile.GetPosition() <=  start + chLength); 
    // P3DASSERT(oldChunkFormat || (chLength == dataLength) || (realFile->GetPosition() == start+chLength));

    this.realFile.Advance((start + chLength) - this.realFile.GetPosition());
    this.stackTop--;
  }

  public GetFilename() { return this.realFile.GetFilename; }

  public GetCurrentID(): unsigned { return this.chunkStack[this.stackTop].id; }
  public GetCurrentDataLength(): unsigned { return this.chunkStack[this.stackTop].dataLength - HEADER_SIZE; }
  public GetCurrentOffset(): unsigned { return this.realFile.GetPosition() - this.chunkStack[this.stackTop].startPosition - HEADER_SIZE; }
  public GetUInt(): unsigned { return this.realFile.GetDWord(); }
  public GetInt(): int { return this.realFile.GetDWord(); }
  public GetUShort(): unsigned_short { return this.realFile.GetWord(); }
  public GetShort(): short { return this.realFile.GetWord(); }
  public GetUChar(): unsigned_char { return this.realFile.GetByte(); }
  public GetChar(): char { return this.realFile.GetByte(); }
  public GetFloat(): float { return this.realFile.GetDWord(); }
  public GetString(str: char_p): char_p {
    return this.realFile._get_u8_string();
  }

}

