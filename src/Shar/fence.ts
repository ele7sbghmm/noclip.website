import { SRR2 } from './srrchunks.js'
import { tChunkFile } from './chunkfile.js'

export class fencedsg {
    public start: number
    public end: number
    public normal: number
}

export class fenceloader {
    public load_object(f: tChunkFile): fencedsg {
        const pfence = new fencedsg()

        while (f.ChunksRemaining()) {
            switch (f.GetCurrentID()) {
                case SRR2.ChunkID.WALL: {
                    pfence.start = f.realFile.f32()
                    pfence.end = f.realFile.f32()
                    pfence.normal = f.realFile.f32()
                }
            }
        }
        return pfence
    }
}

