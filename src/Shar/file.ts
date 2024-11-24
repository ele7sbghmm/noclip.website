import { NamedArrayBufferSlice } from '../DataFetcher.js'
import { SRR2 } from './srrchunks.js'
import { Simulation } from './chunkids.js'
import { tEntity, Tree, Fence, Intersect, StaticPhysDSG, Locator } from './dsg.js'
import { Reader } from './reader.js'
import { WorldScene } from './world.js'

const HEADER_SIZE = 12
const data_handlers: { [key: number]: tSimpleChunkHandler } = {
    [SRR2.ChunkID.TREE_DSG]: new Tree,
    [SRR2.ChunkID.FENCE_DSG]: new Fence,
    [SRR2.ChunkID.INTERSECT_DSG]: new Intersect,
    [SRR2.ChunkID.STATIC_PHYS_DSG]: new StaticPhysDSG,
    [SRR2.ChunkID.LOCATOR]: new Locator,
}
export interface tSimpleChunkHandler {
    load_object(scene: WorldScene, f: tChunkFile): tEntity
}
type Chunk = { id: number, ds: number, cs: number, sp: number }
export class tChunkFile {
    real_file: Reader
    chunk_stack: Chunk[]
    stack_top: number = -1
    constructor(slice: NamedArrayBufferSlice) {
        this.real_file = new Reader(slice)
        this.chunk_stack = Array.from(
            { length: 32 }, () => { return { id: 0, ds: 0, cs: 0, sp: 0 } }
        )
        this.begin_chunk()
    }
    chunks_remaining() {
        let chunk: Chunk = this.chunk_stack[this.stack_top]
        return (chunk.cs > chunk.ds)
            && (this.real_file.get_offset() < (chunk.sp + chunk.cs))
    }
    begin_chunk(chunk_id?: number) {
        this.stack_top++;
        if (this.stack_top != 0) {
            const start = this.chunk_stack[this.stack_top - 1].sp
                + this.chunk_stack[this.stack_top - 1].ds
            if (this.real_file.get_offset() < start)
                this.real_file.seek_forward(start - this.real_file.get_offset())
        }
        this.chunk_stack[this.stack_top].sp =
            (chunk_id ? -4 : 0) + this.real_file.get_offset()

        this.chunk_stack[this.stack_top].id = chunk_id ?? this.real_file.u32()
        this.chunk_stack[this.stack_top].ds = this.real_file.u32()
        this.chunk_stack[this.stack_top].cs = this.real_file.u32()

        return this.chunk_stack[this.stack_top].id;
    }
    end_chunk() {
        this.real_file.seek_forward(
            this.chunk_stack[this.stack_top].sp
                + this.chunk_stack[this.stack_top].cs
                - this.real_file.get_offset()
        )
        this.stack_top--
    }
    get_current_id() {
        return this.chunk_stack[this.stack_top].id
    }
    get_current_ds() {
        return this.chunk_stack[this.stack_top].ds - HEADER_SIZE
    }
    get_current_offset() {
        return this.real_file.get_offset()
            - this.chunk_stack[this.stack_top].sp - HEADER_SIZE
    }
}
export class tP3DFileHandler {
    chunk_file: tChunkFile
    load(scene: WorldScene, slice: NamedArrayBufferSlice) {
        const chunk_file = new tChunkFile(slice)
        while (chunk_file.chunks_remaining()) {
            chunk_file.begin_chunk()
            let h: tSimpleChunkHandler = data_handlers[chunk_file.get_current_id()]
            if (h !== undefined) h.load_object(scene, chunk_file)
            chunk_file.end_chunk()
        }
    }
}
