import { assert } from '../util.js'
import { Reader } from './reader.js'

const HEADER_SIZE: number = 12
const CHUNK_STACK_SIZE: number = 32

export type Chunk = {
    id: number;
    dataLength: number;
    chunkLength: number;
    startPosition: number;
}

export class tFile extends Reader {
    public GetPosition() { return this.get_offset() }
    public Advance(offs: number) { return this.seek(offs) }
}

export class tChunkFile {
    public chunkStack: Chunk[];
    public stackTop: number;

    constructor(public realFile: tFile) {

        let fileChunk: number = this.realFile.u32()

        this.BeginChunk_overload(fileChunk);
    }
    public ChunksRemaining(): boolean {
        let chunk: Chunk = this.chunkStack[this.stackTop];
        return (chunk.chunkLength > chunk.dataLength)
            && (this.realFile.GetPosition() < (chunk.startPosition + chunk.chunkLength));

    }
    public BeginChunk_overload(chunkID: number): number {
        this.stackTop++;
        assert(this.stackTop == 0); // only the p3d file chunk should call this version of the funciton

        this.chunkStack[this.stackTop].startPosition = this.realFile.GetPosition() - 4;
        this.chunkStack[this.stackTop].id = chunkID;
        this.chunkStack[this.stackTop].dataLength = this.GetUInt();
        this.chunkStack[this.stackTop].chunkLength = this.GetUInt();

        return this.chunkStack[this.stackTop].id;
    }
    public BeginChunk() {

        this.stackTop++;
        assert(this.stackTop < CHUNK_STACK_SIZE);

        // advance to the start of the subchunks
        if (this.stackTop != 0) {
            assert(this.chunkStack[this.stackTop - 1].dataLength < this.chunkStack[this.stackTop - 1].chunkLength);

            let start: number = this.chunkStack[this.stackTop - 1].startPosition
                + this.chunkStack[this.stackTop - 1].dataLength;
            if (this.realFile.GetPosition() < start)
                this.realFile.Advance(start - this.realFile.GetPosition());
        }

        // read chunk header
        this.chunkStack[this.stackTop].startPosition = this.realFile.GetPosition();
        this.chunkStack[this.stackTop].id = this.GetUInt();
        this.chunkStack[this.stackTop].dataLength = this.GetUInt();
        this.chunkStack[this.stackTop].chunkLength = this.GetUInt();

        return this.chunkStack[this.stackTop].id;
    }
    public EndChunk() { // return this.chunkStack[this.stackTop].id }
        let start: number = this.chunkStack[this.stackTop].startPosition;
        let chLength: number = this.chunkStack[this.stackTop].chunkLength;
        let dataLength: number = this.chunkStack[this.stackTop].dataLength;

        assert(this.stackTop > 0);
        assert(this.realFile.GetPosition() <= (start + chLength));

        this.realFile.Advance((start + chLength) - this.realFile.GetPosition());
        this.stackTop--;
    }

    public GetCurrentID(): number { return this.chunkStack[this.stackTop].id }
    public GetCurrentDataLength(): number { return this.chunkStack[this.stackTop].dataLength - HEADER_SIZE }
    public GetCurrentOffset(): number { return this.realFile.GetPosition() - this.chunkStack[this.stackTop].startPosition - HEADER_SIZE }

    public GetFloat(): number { return this.realFile.f32() }
    public GetLong(): number { return this.realFile.u32() }
    public GetUInt(): number { return this.realFile.u32() }
    public GetInt(): number { return this.realFile.i32() }
    public GetUShort(): number { return this.realFile.u16() }
    public GetShort(): number { return this.realFile.i16() }
    public GetUChar(): number { return this.realFile.u8() }
    public GetChar(): number { return this.realFile.i8() }
}

