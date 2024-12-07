import { NamedArrayBufferSlice } from '../DataFetcher.js'

import { Reader } from './reader.js'
import { SRR2 } from './srrchunks.js'
import { IntersectLoader, PathLoader, StaticPhysLoader, FenceLoader, TreeDSGLoader, LocatorLoader } from './loaders.js'
// import { GetRenderManager } from './world.js'
import { IEntityDSG } from './dsg.js'
import { Instance } from './scenes.js'

export class AllWrappers {

}
class tSimpleChunkHandler {
    // mpListenerCB = GetRenderManager()
    constructor(public id: number) { }
    LoadObject(level_instance: Instance, f: tChunkFile): IEntityDSG | null { return null }
    Load(level_instance: Instance, file: tChunkFile) { this.LoadObject(level_instance, file) }
}
const HEADER_SIZE = 12
const data_handlers: { [key: number]: tSimpleChunkHandler } = {
    [SRR2.ChunkID.TREE_DSG]: new TreeDSGLoader,
    [SRR2.ChunkID.FENCE_DSG]: new FenceLoader,
    [SRR2.ChunkID.INTERSECT_DSG]: new IntersectLoader,
    [SRR2.ChunkID.STATIC_PHYS_DSG]: new StaticPhysLoader,
    [SRR2.ChunkID.LOCATOR]: new LocatorLoader,
    [SRR2.ChunkID.PED_PATH]: new PathLoader,
    [SRR2.ChunkID.PED_PATH_SEGMENT]: new PathLoader,
}
type Chunk = { id: number, ds: number, cs: number, sp: number }
export class tChunkFile {
    realFile: Reader
    chunkStack: Chunk[]
    stackTop: number = -1
    constructor(slice: NamedArrayBufferSlice) {
        this.realFile = new Reader(slice)
        this.chunkStack = Array.from(
            { length: 32 }, () => { return { id: 0, ds: 0, cs: 0, sp: 0 } }
        )
        this.BeginChunk()
    }
    GetFloat() { return this.realFile.f32() }
    GetLong() { return this.realFile.i32() }
    GetInt() { return this.realFile.i32() }
    GetShort() { return this.realFile.i16() }
    GetChar() { return this.realFile.i8() }
    GetUInt() { return this.realFile.u32() }
    GetUShort() { return this.realFile.u16() }
    GetUChar() { return this.realFile.u8() }
    GetByte() { return this.realFile.u8() }

    BeginInset() {
        return this.realFile
    }
    EndInset() { }
    ChunksRemaining() {
        const chunk: Chunk = this.chunkStack[this.stackTop]
        return (chunk.cs > chunk.ds)
            && (this.realFile.get_offset() < (chunk.sp + chunk.cs))
    }
    BeginChunk(chunkID?: number) {
        this.stackTop++;
        if (this.stackTop != 0) {
            const start = this.chunkStack[this.stackTop - 1].sp
                + this.chunkStack[this.stackTop - 1].ds
            if (this.realFile.get_offset() < start)
                this.realFile.seek_forward(start - this.realFile.get_offset())
        }
        this.chunkStack[this.stackTop].sp =
            (chunkID ? -4 : 0) + this.realFile.get_offset()

        this.chunkStack[this.stackTop].id = chunkID ?? this.realFile.u32()
        this.chunkStack[this.stackTop].ds = this.realFile.u32()
        this.chunkStack[this.stackTop].cs = this.realFile.u32()

        return this.chunkStack[this.stackTop].id;
    }
    EndChunk() {
        this.realFile.seek_forward(
            this.chunkStack[this.stackTop].sp
            + this.chunkStack[this.stackTop].cs
            - this.realFile.get_offset()
        )
        this.stackTop--
    }
    GetCurrentID() {
        return this.chunkStack[this.stackTop].id
    }
    GetCurrentDataSize() {
        return this.chunkStack[this.stackTop].ds - HEADER_SIZE
    }
    GetCurrentOffset() {
        return this.realFile.get_offset()
            - this.chunkStack[this.stackTop].sp - HEADER_SIZE
    }
}
export class tP3DFileHandler {
    chunk_file: tChunkFile
    load(level_instance: Instance, slice: NamedArrayBufferSlice) {
        const chunk_file = new tChunkFile(slice)
        while (chunk_file.ChunksRemaining()) {
            chunk_file.BeginChunk()
            const h: tSimpleChunkHandler = data_handlers[chunk_file.GetCurrentID()]
            if (h !== undefined && h != null) {
                h.Load(level_instance, chunk_file)
                let _
            }
            chunk_file.EndChunk()
        }
    }
}
