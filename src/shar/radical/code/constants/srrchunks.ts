//CHUNK IDs
//0x03000000 - 0x03ffffff  Simpsons

export namespace SRR2 {
  export namespace ChunkID {
    //Track Editor / World Builder would like to reseve up to
    //0x030000ff
    export const WALL: number = 0x03000000;
    export const FENCELINE: number = 0x03000001;
    export const ROAD_SEGMENT: number = 0x03000002;
    export const ROAD: number = 0x03000003;
    export const INTERSECTION: number = 0x03000004;

    export const LOCATOR: number = 0x03000005;
    export const TRIGGER_VOLUME: number = 0x03000006;
    export const SPLINE: number = 0x03000007;
    export const INSTANCES: number = 0x03000008;

    export const ROAD_SEGMENT_DATA: number = 0x03000009;

    export const RAIL: number = 0x0300000A;

    export const PED_PATH: number = 0x0300000B;
    export const EXTRA_MATRIX: number = 0x0300000C;
    export const PED_PATH_SEGMENT: number = 0x0300000D;
    export const TERRAIN_TYPE: number = 0x0300000E;

    //Camera data ids 
    export const FOLLOWCAM: number = 0x03000100;
    export const WALKERCAM: number = 0x03000101;

    // SFX chunk id's.
    export const CHUNK_SET: number = 0x03000110;

    //Next usable ID 0x03000120


    //Object Attribute chunks for greg.
    export const OBJECT_ATTRIBUTES: number = 0x03000600;
    export const PHYS_WRAPPER: number = 0x03000601;
    export const ATTRIBUTE_TABLE: number = 0x03000602;

    // Effects chunk id's
    export const BREAKABLE_OBJECT: number = 0x03001000;
    export const INST_PARTICLE_SYSTEM: number = 0x03001001;

    //DSG chunk id's
    export const ENTITY_DSG: number = 0x03f00000;
    export const STATIC_PHYS_DSG: number = 0x03f00001;
    export const DYNA_PHYS_DSG: number = 0x03f00002;
    export const INTERSECT_DSG: number = 0x03f00003;
    export const TREE_DSG: number = 0x03f00004;
    export const CONTIGUOUS_BIN_NODE: number = 0x03f00005;
    export const SPATIAL_NODE: number = 0x03f00006;
    export const FENCE_DSG: number = 0x03f00007;
    export const ANIM_COLL_DSG: number = 0x03f00008;
    export const INSTA_ENTITY_DSG: number = 0x03f00009;
    export const INSTA_STATIC_PHYS_DSG: number = 0x03f0000A;
    export const WORLD_SPHERE_DSG: number = 0x03f0000B;
    export const ANIM_DSG: number = 0x03f0000C;
    export const LENS_FLARE_DSG: number = 0x03f0000D;
    export const INSTA_ANIM_DYNA_PHYS_DSG: number = 0x03f0000E;
    export const ANIM_DSG_WRAPPER: number = 0x03f0000F;
    export const ANIM_OBJ_DSG_WRAPPER: number = 0x03f00010;
  }
}
