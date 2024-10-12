import { u32, rmt_Box3D, rmt_Matrix, rmt_Sphere, rmt_Vector, rmt_SimState, tDrawable } from "./utils.js";
import { BufReader } from "./reader.js";

import { ChunkEnum, parse_header } from "./p3d/chunks.js";
import { CollisionObject } from "./p3d/collision.js";

type StaticPhysDSGChunk = {
  name: string;
  version: u32;
}
export class StaticPhysDSG {
  // subchunks
  // ObjectAttributeChunk
  // CollisionObjectChunk
  // public

  // protected
  public mBBox: rmt_Box3D;
  public mSphere: rmt_Sphere;
  public mPosn: rmt_Vector;
  public mpSimStateObj: rmt_SimState;
  public mShadow: tDrawable;
  public mpShadowMatrix: rmt_Matrix;

  public static parse_chunk(buf: BufReader): StaticPhysDSGChunk {
    let str = buf.read_u8_string();
    let version = buf.le_u32();
    const chunk: StaticPhysDSGChunk = {
      name: str,
      version: version,
    }
    return chunk;
  }
}

type ObjectAttributeChunk = {
  ClassType: u32;
  PhyPropID: u32;
  Sound: string;
}
export class ObjectAttribute {
  public static parse_chunk(buf: BufReader): ObjectAttributeChunk {
    const class_type: u32 = buf.le_u32();
    const phy_prop_id: u32 = buf.le_u32();
    const sound = buf.read_u8_string();
    const chunk: ObjectAttributeChunk = {
      ClassType: class_type,
      PhyPropID: phy_prop_id,
      Sound: sound,
    }
    return chunk;
  }
}

