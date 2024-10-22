import { unsigned } from '../../../type_aliases.js';

//CHUNK IDs
//0x03000000 - 0x03ffffff  Simpsons

export namespace SRR2 {
  export namespace ChunkID {
    //Track Editor / World Builder would like to reseve up to
    //0x030000ff
    export const WALL: unsigned = 0x03000000;
    export const FENCELINE: unsigned = 0x03000001;
    export const ROAD_SEGMENT: unsigned = 0x03000002;
    export const ROAD: unsigned = 0x03000003;
    export const INTERSECTION: unsigned = 0x03000004;

    export const LOCATOR: unsigned = 0x03000005;
    export const TRIGGER_VOLUME: unsigned = 0x03000006;
    export const SPLINE: unsigned = 0x03000007;
    export const INSTANCES: unsigned = 0x03000008;

    export const ROAD_SEGMENT_DATA: unsigned = 0x03000009;

    export const RAIL: unsigned = 0x0300000A;

    export const PED_PATH: unsigned = 0x0300000B;
    export const EXTRA_MATRIX: unsigned = 0x0300000C;
    export const PED_PATH_SEGMENT: unsigned = 0x0300000D;
    export const TERRAIN_TYPE: unsigned = 0x0300000E;

    //Camera data ids 
    export const FOLLOWCAM: unsigned = 0x03000100;
    export const WALKERCAM: unsigned = 0x03000101;

    // SFX chunk id's.
    export const CHUNK_SET: unsigned = 0x03000110;

    //Next usable ID 0x03000120


    //Object Attribute chunks for greg.
    export const OBJECT_ATTRIBUTES: unsigned = 0x03000600;
    export const PHYS_WRAPPER: unsigned = 0x03000601;
    export const ATTRIBUTE_TABLE: unsigned = 0x03000602;

    // Effects chunk id's
    export const BREAKABLE_OBJECT: unsigned = 0x03001000;
    export const INST_PARTICLE_SYSTEM: unsigned = 0x03001001;

    //DSG chunk id's
    export const ENTITY_DSG: unsigned = 0x03f00000;
    export const STATIC_PHYS_DSG: unsigned = 0x03f00001;
    export const DYNA_PHYS_DSG: unsigned = 0x03f00002;
    export const INTERSECT_DSG: unsigned = 0x03f00003;
    export const TREE_DSG: unsigned = 0x03f00004;
    export const CONTIGUOUS_BIN_NODE: unsigned = 0x03f00005;
    export const SPATIAL_NODE: unsigned = 0x03f00006;
    export const FENCE_DSG: unsigned = 0x03f00007;
    export const ANIM_COLL_DSG: unsigned = 0x03f00008;
    export const INSTA_ENTITY_DSG: unsigned = 0x03f00009;
    export const INSTA_STATIC_PHYS_DSG: unsigned = 0x03f0000A;
    export const WORLD_SPHERE_DSG: unsigned = 0x03f0000B;
    export const ANIM_DSG: unsigned = 0x03f0000C;
    export const LENS_FLARE_DSG: unsigned = 0x03f0000D;
    export const INSTA_ANIM_DYNA_PHYS_DSG: unsigned = 0x03f0000E;
    export const ANIM_DSG_WRAPPER: unsigned = 0x03f0000F;
    export const ANIM_OBJ_DSG_WRAPPER: unsigned = 0x03f00010;
  }
}
