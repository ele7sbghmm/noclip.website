// c++ types
type __int64 = number;
type unsigned___int64 = number;
type char = number;
type unsigned_char = number;
type char_p = string;
type unsigned = number;
type unsigned_short = number;
type short = number;
type int = number;
type float = number;

// radical aliases
type P3D_S64 = __int64;
type P3D_U64 = unsigned___int64;
type P3D_S32 = int;
type P3D_U32 = unsigned;
type P3D_S8 = char;
type P3D_U8 = unsigned_char;
type P3D_S16 = short;
type P3D_U16 = unsigned_short;
type P3D_UNICODE = unsigned_short;

enum DataType {
  BYTE = 1,
  WORD = 2,
  DWORD = 4,
  QWORD = 8,
}

export class tChunkFile {
  // char* fullFime;
  // ilena me;
  // char* extension;
  // bool compressed;

  // public fullFilename: string;
  // public filename: string;
  // public extension: string;
  // public compressed: boolean;

  public GetData(buf: any, count: number, type: DataType = DataType.BYTE): boolean { return false; };
  public GetByte() { }
  public GetWord() { }
  public GetDWord() { }
  public GetQWord() { }
}

export class tChunkFile {
  // struct Chunk {
  //   unsigned id,
  //   dataLength,
  //   chunkLength,
  //   startPosition;
  // } chunkStack[CHUNK_STACK_SIZE];
  // union FloatInt {
  //   unsigned un;
  //   float    fn;
  // };
  // int stackTop;
  // tFile* realFile;
  // bool     ChunksRemaining(void);
  // unsigned BeginChunk(void);
  // void     EndChunk(void);

  constructor(
    public realFile: tFile,
  ) { }

  public ChunksRemaining(): boolean { return false; }
  // bool tChunkFile::ChunksRemaining(void) {
  //   Chunk* chunk = &chunkStack[stackTop];
  //   return (
  //     chunk->chunkLength > chunk->dataLength)
  //      && (realFile->GetPosition() < (chunk->startPosition + chunk->chunkLength)
  //     );
  // }
  public BeginChunk(): unsigned { return 0; }
  public EndChunk(): void { }

  public GetCurrentID(): unsigned { return 0; }
  public GetCurrentDataLength(): unsigned { return 0; }
  public GetCurrentOffset(): unsigned { return 0; }

  public GetUInt() { return this.realFile.GetDWord(); }
  public GetInt() { return this.realFile.GetDWord(); }
  public GetUShort() { return this.realFile.GetWord(); }
  public GetShort() { return this.realFile.GetWord(); }
  public GetUChar() { return this.realFile.GetByte(); }
  public GetChar() { return this.realFile.GetByte(); }
  // public GetFloat()  {
  //   FloatInt tmp;
  //   tmp.un = realFile->GetDWord();
  //   return tmp.fn;
  // }
  // public GetString(char* string) {
  //   unsigned len = (unsigned)realFile->GetByte();
  //   realFile->GetData(string, len);
  //   string[len] = 0;
  //   return string;
  // }

}


























