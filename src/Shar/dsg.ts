import { Reader, read_vector } from './reader'
import { rmt } from './egg/math'
import { SRR2 } from './egg/srrchunks'
import { tSimpleChunkHandler, tChunkFile } from './file'
import { WorldScene } from './world'

export class tEntity { }
export class Tree { }
export class Fence extends tEntity implements tSimpleChunkHandler {
    start: rmt.Vector
    end: rmt.Vector
    normal: rmt.Vector

    load_object(scene: WorldScene, f: tChunkFile): tEntity {
        f.begin_chunk()
        const fence = new Fence
        switch (f.get_current_id()) {
            case SRR2.ChunkID.WALL: {
                fence.start = read_vector(f.real_file)
                fence.end = read_vector(f.real_file)
                fence.normal = read_vector(f.real_file)
            }
        }
        scene.place(fence)
        return fence
    }
}

