import { assert } from '../../util.js';
import { NamedArrayBufferSlice } from '../../DataFetcher.js'
import { BufReader } from '../reader.js';
import {
  int,
  short,
  char,
  char_p,
  float,
  unsigned,
  unsigned_short,
  unsigned_char,
} from '../type_aliases.js';

const HEADER_SIZE: int = 12;

export type Chunk = {
  id: unsigned;
  dataLength: unsigned;
  chunkLength: unsigned;
  startPosition: unsigned;
}

export class tChunkFile {
  protected chunkStack: Chunk[];
  protected realFile: BufReader;

  constructor(
    protected file: NamedArrayBufferSlice,
    protected stackTop: int = -1,
  ) {
    this.realFile = new BufReader(file);

    // P3D_U32 fileChunk = this.realFile.le_u32();

    // switch (fileChunk) {
  }
}

ChunksRemaining(): boolean {
  const chunk = this.chunkStack[this.stackTop];
  return (
    chunk.chunkLength > chunk.dataLength
    && this.realFile.get_offs() < chunk.startPosition + chunk.chunkLength
  )
}
BeginChunk(): unsigned {
  this.stackTop++;
  if (this.stackTop != 0) {
    const start: unsigned = this.chunkStack[this.stackTop - 1].startPosition
      + this.chunkStack[this.stackTop - 1].dataLength;

    if (this.realFile.get_offs() < start) {
      this.realFile.Advance(start - this.realFile.get_offs());
    }
  }

  this.chunkStack[this.stackTop].startPosition = this.realFile.get_offs();
  this.chunkStack[this.stackTop].id = this.GetUInt();
  this.chunkStack[this.stackTop].dataLength = this.GetUInt();
  this.chunkStack[this.stackTop].chunkLength = this.GetUInt();

  return this.chunkStack[this.stackTop].id;
}
BeginChunk_overload_for_root_p3d_chunk(chunkID: unsigned): unsigned {
  this.stackTop++;

  this.chunkStack[this.stackTop].startPosition = this.realFile.get_offs() - 4;
  this.chunkStack[this.stackTop].id = chunkID;
  this.chunkStack[this.stackTop].dataLength = this.GetUInt();
  this.chunkStack[this.stackTop].chunkLength = this.GetUInt();

  return this.chunkStack[this.stackTop].id;
}
EndChunk() {
  const start: unsigned = this.chunkStack[this.stackTop].startPosition;
  const chLength: unsigned = this.chunkStack[this.stackTop].chunkLength;
  const dataLength: unsigned = this.chunkStack[this.stackTop].dataLength;

  this.realFile.Advance((start + chLength) - this.realFile.get_offs());
  this.stackTop--;
}

GetCurrentID() {
  return this.chunkStack[this.stackTop].id;
}
GetCurrentDataLength() {
  return this.chunkStack[this.stackTop].dataLength - HEADER_SIZE;
}
GetCurrentOffset() {
  return this.realFile.get_offs() - this.chunkStack[this.stackTop].startPosition - HEADER_SIZE;
}

GetUInt(): unsigned { return this.realFile.le_u32(); }
GetInt(): int { return this.realFile.le_u32(); }
GetUShort(): unsigned_short { return this.realFile.le_u16(); }
GetShort(): short { return this.realFile.le_u16(); }
GetUChar(): unsigned_char { return this.realFile.u8(); }
GetChar(): char { return this.realFile.u8(); }
GetFloat(): float { return this.realFile.le_f32(); }
GetString(): char_p { return this.realFile.read_u8_string(); }
}
