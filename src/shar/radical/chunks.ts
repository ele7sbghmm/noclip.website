import { unsigned, long } from '../type_aliases.js';

/*===========================================================================
    File:: chunks.h

    Chunk codes for Pure3D data types

    Copyright (c)1995 - 1998 Radical Entertainment, Inc.  All rights reserved.

    Mark removed the log from this file, since it was taking up too much space.
    
===========================================================================*/

//
// Chunks ranges:
//
// 0x0000 - 0x0FFF     unused
// 0x1000 - 0x1FFF     unused
// 0x2000 - 0x2FFF     Various data
// 0x3000 - 0x3EFF     Geo file
// 0x3E00 - 0x3FFF        H-spline
// 0x4000 - 0x4FFF     Animation Chunks 

// 0x5000 - 0x5FFF     PC specific chunks (future)
// 0x6000 - 0x6FFF     PSX specific chunks

// 0x7000 - 0x7FFF     Tool Specific data (unused by games, or for debugging)

// 0x8000 - 0x8FFF     reserved for game specific data chunks

// 0x9000 - 0x9FFF     Rendering Data Structures (BSP etc)

// 0xA000 - 0xAFFF     2D bitmap chunks

// 0xB000 - 0xBFFF     twaddler chunks

// 0xC000 - 0xCFFF     physic object chunks

// 0xFF00 - 0xFFFF     File types
//

//? #ifndef _CHUNKS_H
//? #define _CHUNKS_H
export namespace CHUNK {
  export const P3D_IMAGE: unsigned = 0x3510;
  export const P3D_IMAGE_DATA: unsigned = 0x3511;
  export const P3D_IMAGE_FILENAME: unsigned = 0x3512;

  // Skeleton Chunks
  export const P3D_SKELETON: unsigned = 0x4500;
  export const P3D_SKELETON_JOINT: unsigned = 0x4501;
  export const P3D_SKELETON_JOINT_PHYSICS: unsigned = 0x4502;
  export const P3D_SKELETON_JOINT_MIRROR_MAP: unsigned = 0x4503;
  export const P3D_SKELETON_JOINT_FIX_FLAG: unsigned = 0x4504;

  export const P3D_COMPOSITE_DRAWABLE: unsigned = 0x4512;
  export const P3D_COMPOSITE_DRAWABLE_SKIN_LIST: unsigned = 0x4513;
  export const P3D_COMPOSITE_DRAWABLE_PROP_LIST: unsigned = 0x4514;
  export const P3D_COMPOSITE_DRAWABLE_SKIN: unsigned = 0x4515;
  export const P3D_COMPOSITE_DRAWABLE_PROP: unsigned = 0x4516;
  export const P3D_COMPOSITE_DRAWABLE_EFFECT_LIST: unsigned = 0x4517;
  export const P3D_COMPOSITE_DRAWABLE_EFFECT: unsigned = 0x4518;
  export const P3D_COMPOSITE_DRAWABLE_SORTORDER: unsigned = 0x4519;

  // Frame Controller chunks
  export const P3D_FRAME_CONTROLLER: unsigned = 0x4520;

  export const P3D_MULTI_CONTROLLER: unsigned = 0x48A0;
  export const P3D_MULTI_CONTROLLER_TRACKS: unsigned = 0x48A1;
  export const P3D_MULTI_CONTROLLER_TRACK: unsigned = 0x48A2;

  export const P3D_CAMERA: unsigned = 0x2200;

  export const P3D_LIGHT_GROUP: unsigned = 0x2380;

  // 0x7000 - 0x7FFF  Tool Specific data (unused by games, or for debugging)
  export const P3D_HISTORY: unsigned = 0x7000;
  export const P3D_ALIGN: unsigned = 0x7001;

  // Used by the maya exporter
  export const P3D_EXPORT_INFO: unsigned = 0x7030;
  export const P3D_EXPORT_NAMED_STRING: unsigned = 0x7031;
  export const P3D_EXPORT_NAMED_INT: unsigned = 0x7032;

  //********************************
  // Chunks needed for conversions
  //********************************
  export const P3D_EXPRESSION_PRESET: unsigned = 0x4A00;
  export const P3D_EXPRESSION_GROUP: unsigned = 0x4A01;
  export const P3D_EXPRESSION_ANIM: unsigned = 0x4A10;
  export const P3D_EXPRESSION_ANIM_CHANNEL: unsigned = 0x4A11;
  export const P3D_EXPRESSION_MIXER: unsigned = 0x4A20;

  export const P3D_VERTEXOFFSET: unsigned = 0x4A80;
  export const P3D_VERTEXOFFSET_ANIM: unsigned = 0x4A81;
  export const P3D_VERTEX_OFFSET_EXPRESSION: unsigned = 0x4A82;

  export const P3D_SG_TRANSFORM_ANIM: unsigned = 0x9150;

  // Visibility animation
  export const P3D_VISIBILITY_ANIM: unsigned = 0x4290;
  export const P3D_VISIBILITY_ANIM_CHANNEL: unsigned = 0x4291;

  // Texture animation
  export const P3D_TEXTURE_ANIM: unsigned = 0x3520;
  export const P3D_TEXTURE_ANIM_CHANNEL: unsigned = 0x3521;

  // V12 Animation chunks
  export const P3D_POSE_ANIM: unsigned = 0x4700;
  export const P3D_JOINT_LIST: unsigned = 0x4201;
  export const P3D_ANIM_CHANNEL: unsigned = 0x4702;
  export const P3D_POSE_ANIM_MIRRORED: unsigned = 0x4703;

  export const P3D_CHANNEL_1DOF: unsigned = 0x4800;
  export const P3D_CHANNEL_3DOF: unsigned = 0x4801;
  export const P3D_CHANNEL_1DOF_ANGLE: unsigned = 0x4802;
  export const P3D_CHANNEL_3DOF_ANGLE: unsigned = 0x4803;
  export const P3D_CHANNEL_STATIC: unsigned = 0x4804;
  export const P3D_CHANNEL_STATIC_ANGLE: unsigned = 0x4805;
  export const P3D_CHANNEL_QUATERNION: unsigned = 0x4806;
  export const P3D_CHANNEL_STATIC_QUATERNION: unsigned = 0x4807;

  export const P3D_CAMERA_ANIM: unsigned = 0x4900;
  export const P3D_CAMERA_ANIM_CHANNEL: unsigned = 0x4901;
  export const P3D_CAMERA_ANIM_POS_CHANNEL: unsigned = 0x4902;
  export const P3D_CAMERA_ANIM_LOOK_CHANNEL: unsigned = 0x4903;
  export const P3D_CAMERA_ANIM_UP_CHANNEL: unsigned = 0x4904;
  export const P3D_CAMERA_ANIM_FOV_CHANNEL: unsigned = 0x4905;

  // V16 Camera Animation Chunks.
  // Added by Bryan Ewert on 22 Feb 2002
  export const P3D_CAMERA_ANIM_NEARCLIP_CHANNEL: unsigned = 0x4906;
  export const P3D_CAMERA_ANIM_FARCLIP_CHANNEL: unsigned = 0x4907;

  export const P3D_LIGHT_ANIM: unsigned = 0x4980;
  export const P3D_LIGHT_ANIM_CHANNEL: unsigned = 0x4981;
  export const P3D_LIGHT_ANIM_COLOUR_CHANNEL: unsigned = 0x4982;
  export const P3D_LIGHT_ANIM_PARAM_CHANNEL: unsigned = 0x4983;
  export const P3D_LIGHT_ANIM_ENABLE_CHANNEL: unsigned = 0x4985;

  export const P3D_ENTITY_ANIM_CHANNEL: unsigned = 0x42A0;
  export const P3D_KEYLIST_COLOUR: unsigned = 0x4216;

  // v17 Vertex Animaion Chunks
  export const P3D_VERTEX_ANIM: unsigned = 0x4a00;
  export const P3D_VERTEX_ANIM_CHANNEL: unsigned = 0x4a01;

  //------------------------------------------------------------------------------------------
  // UNUSED CHUNKS
  //------------------------------------------------------------------------------------------

  //? #if 0
  // new:
  export const P3D_DATA_FILE: unsigned = 0xFF443350;       // New P3D wrapper ID
  export const P3D_DATA_FILE_SWAP: unsigned = 0x503344FF;       // New P3D wrapper ID on big endian
  export const P3D_16BIT_DATA_FILE: unsigned = 0xFF04;


  export const ATTR_VERTEX: unsigned = 0x7010;
  export const ATTR_POLY: unsigned = 0x7011;

  export const P3D_EXPORTER_VERSION: unsigned = 0x7023;

  // The following chunks represent Pure3D data.
  export const P3D_MATRIX: unsigned = 0x2000;
  export const P3D_POS_ROT: unsigned = 0x2001;
  export const P3D_COLOR_RGB: unsigned = 0x2002;
  export const P3D_COLOR_RGBA: unsigned = 0x2003;
  export const P3D_FOV: unsigned = 0x2004;
  export const P3D_DIRECTION: unsigned = 0x2005;
  export const P3D_POSITION: unsigned = 0x2006;
  export const P3D_ROTATION_AXIS: unsigned = 0x2007;
  export const P3D_BOX: unsigned = 0x2008;
  export const P3D_SPHERE: unsigned = 0x2009;
  export const P3D_PLANE: unsigned = 0x200A;
  export const P3D_PARAMETERS: unsigned = 0x200B;
  export const P3D_SPHERE_LIST: unsigned = 0x200C;

  // this is the main wrapper chunk for .p3d files - ie. general chunk based p3d data files
  // it is equivalent to P3D_YTR_FILE, P3D_GEO_FILE, P3D_PRO_FILE, and P3D_ANIM_FILE
  // eventually it is the only one of these that should be used, so that P3D load 
  // doesn't have to check for all these types of chunks.

  // Particle system data
  export const P3D_PARTICLE_SYSTEM: unsigned = 0x2100;
  export const P3D_POINT_EMITTER: unsigned = 0x2101;
  export const P3D_SPRITE_EMITTER: unsigned = 0x2102;

  export const P3D_PARTICLE_LIFE_CHANNEL: unsigned = 0x2110;
  export const P3D_PARTICLE_SPEED_CHANNEL: unsigned = 0x2111;
  export const P3D_PARTICLE_WEIGHT_CHANNEL: unsigned = 0x2112;
  export const P3D_PARTICLE_LIFE_VAR_CHANNEL: unsigned = 0x2113;
  export const P3D_PARTICLE_SPEED_VAR_CHANNEL: unsigned = 0x2114;
  export const P3D_PARTICLE_WEIGHT_VAR_CHANNEL: unsigned = 0x2115;
  export const P3D_PARTICLE_LIFE_OL_CHANNEL: unsigned = 0x2116;
  export const P3D_PARTICLE_SPEED_OL_CHANNEL: unsigned = 0x2117;
  export const P3D_PARTICLE_WEIGHT_OL_CHANNEL: unsigned = 0x2118;
  export const P3D_PARTICLE_NUM_PARTICLES_CHANNEL: unsigned = 0x2119;
  export const P3D_PARTICLE_EMISSION_RATE_CHANNEL: unsigned = 0x211A;
  export const P3D_PARTICLE_SIZE_CHANNEL: unsigned = 0x211B;
  export const P3D_PARTICLE_SPIN_CHANNEL: unsigned = 0x211C;
  export const P3D_PARTICLE_TRANSPARENCY_CHANNEL: unsigned = 0x211D;
  export const P3D_PARTICLE_COLOUR_CHANNEL: unsigned = 0x211E;
  export const P3D_PARTICLE_SIZE_VAR_CHANNEL: unsigned = 0x211F;
  export const P3D_PARTICLE_SPIN_VAR_CHANNEL: unsigned = 0x2120;
  export const P3D_PARTICLE_TRANSPARENCY_VAR_CHANNEL: unsigned = 0x2121;
  export const P3D_PARTICLE_COLOUR_VAR_CHANNEL: unsigned = 0x2122;
  export const P3D_PARTICLE_SIZE_OL_CHANNEL: unsigned = 0x2123;
  export const P3D_PARTICLE_SPIN_OL_CHANNEL: unsigned = 0x2124;
  export const P3D_PARTICLE_TRANSPARENCY_OL_CHANNEL: unsigned = 0x2125;
  export const P3D_PARTICLE_COLOUR_OL_CHANNEL: unsigned = 0x2126;
  export const P3D_PARTICLE_CHANNEL: unsigned = 0x2127;
  export const P3D_PARTICLE_POINT_GENERATOR: unsigned = 0x2128;
  export const P3D_PARTICLE_PLANE_GENERATOR: unsigned = 0x2129;
  export const P3D_PARTICLE_SPHERE_GENERATOR: unsigned = 0x212A;
  export const P3D_PARTICLE_GRAVITY_CHANNEL: unsigned = 0x212B;
  export const P3D_PARTICLE_GENERATOR_HORIZ_SPREAD: unsigned = 0x212E;
  export const P3D_PARTICLE_GENERATOR_VERT_SPREAD: unsigned = 0x212F;
  export const P3D_PARTICLE_POSITION_CHANNEL: unsigned = 0x2130;
  export const P3D_PARTICLE_ROTATION_CHANNEL: unsigned = 0x2131;


  export const P3D_FONT: unsigned = 0x3062;
  export const P3D_FONT_GLYPHS: unsigned = 0x3063;
  export const P3D_TEXTURE_FONT: unsigned = 0x3064;
  export const P3D_TEXTURE_GLYPH: unsigned = 0x3065;
  export const P3D_IMAGE_FONT: unsigned = 0x3066;
  export const P3D_IMAGE_GLYPH: unsigned = 0x3067;


  // The following chunks are relevant to the geometry file format.

  // V12 geometry format
  export const P3D_MESH: unsigned = 0x3100;
  export const P3D_VERTEX_LIST: unsigned = 0x3101;
  export const P3D_NORMAL_LIST: unsigned = 0x3102;
  export const P3D_UV_LIST: unsigned = 0x3103;
  export const P3D_COLOUR_LIST: unsigned = 0x3104;
  export const P3D_MATERIAL_LIST: unsigned = 0x3105;
  export const P3D_FACE_LIST: unsigned = 0x3106;
  export const P3D_PRIM_GROUP: unsigned = 0x3107;
  export const P3D_FACE_NORMAL_LIST: unsigned = 0x3108;

  export const P3D_EDGE_LIST: unsigned = 0x31a9;  // For experimental 'toon renderer

  // V12 Skin format
  export const P3D_SKIN: unsigned = 0x3700;
  export const P3D_BONE_WEIGHTING: unsigned = 0x3701;
  // TODO, remove this
  export const P3D_BONE_MAPPING: unsigned = 0x3701;


  // V12 material format
  export const P3D_MATERIAL: long = 0x3120;
  export const P3D_MATERIAL_PASS: long = 0x3125;

  // V14 shader format
  export const P3D_SHADER: long = 0x3130;
  export const P3D_SHADER_DEFINITION: long = 0x3131;
  export const P3D_SHADER_TEXTURE_PARAM: long = 0x3132;
  export const P3D_SHADER_INT_PARAM: long = 0x3133;
  export const P3D_SHADER_FLOAT_PARAM: long = 0x3134;
  export const P3D_SHADER_COLOUR_PARAM: long = 0x3135;
  export const P3D_SHADER_VECTOR_PARAM: long = 0x3136;
  export const P3D_SHADER_MATRIX_PARAM: long = 0x3137;

  // the 0x3000 MESH chunks are the old style mesh
  export const GEO_MESH: unsigned = 0x3000;
  export const GEO_VERTEX_LIST: unsigned = 0x3001;
  export const GEO_FACE_LIST_TEX: unsigned = 0x3005;
  export const GEO_UV_LIST: unsigned = 0x3006;
  export const GEO_NORMAL_LIST: unsigned = 0x3007;
  export const GEO_MATERIAL_GROUP: unsigned = 0x3008;
  export const GEO_HIT: unsigned = 0x3009;
  export const GEO_FLAGS: unsigned = 0x300A;
  export const GEO_ANIM_VERTEX_LIST: unsigned = 0x300B;
  export const GEO_ANIM_NORMAL_LIST: unsigned = 0x300C;

  // chunks for colour by vertex information
  export const GEO_COLOUR_LIST: unsigned = 0x300D;
  export const GEO_VERTEX_COLOUR_LIST: unsigned = 0x300E;

  // chunks for binary properties file
  export const GEO_PRO_TEXTURE: unsigned = 0x3010;
  export const GEO_PRO_TEX_PAL: unsigned = 0x3011;
  export const GEO_PRO_TEX_PIXELS: unsigned = 0x3012;
  export const GEO_PRO_ALPHA_PIXELS: unsigned = 0x3013;


  export const GEO_PRO_MATERIAL: unsigned = 0x3020;
  export const GEO_PRO_MAT_COLOUR: unsigned = 0x3021;
  export const GEO_PRO_MAT_TEXTURE: unsigned = 0x3022;
  export const GEO_PRO_MAT_TRANSP: unsigned = 0x3023;
  export const GEO_PRO_MAT_BLENDMODE: unsigned = 0x3024;


  export const P3D_BMP_IMAGE: unsigned = 0x3040;
  export const P3D_SPRITE: unsigned = 0x3041;

  // Tri Strips
  export const P3D_TRI_STRIP_MESH: unsigned = 0x3200;
  export const P3D_TRI_STRIP: unsigned = 0x3201;

  // BACKGROUND (for things like background maps and colours from MAX)
  export const P3D_BACKGROUND: unsigned = 0x3300;

  // Image references

  export const P3D_BMP_IMAGE_REF: unsigned = 0x3400;

  // New texture format

  export const P3D_TEXTURE: unsigned = 0x3500;

  // chunks for H-spline
  export const P3D_HSPLINE: unsigned = 0x3E00;

  export const P3D_HS_SB_LIST: unsigned = 0x3E10;
  export const P3D_HS_STORAGE_BLOCK: unsigned = 0x3E11;

  export const P3D_HS_GN_LIST: unsigned = 0x3E30;
  export const P3D_HS_GRAFTING_NODE: unsigned = 0x3E31;

  export const P3D_HS_CONTRIB_LIST: unsigned = 0x3E40;
  export const P3D_HS_CONTRIBUTOR: unsigned = 0x3E41;

  export const P3D_HS_EDGE_LIST: unsigned = 0x3E50;
  export const P3D_HS_EDGE: unsigned = 0x3E51;

  export const P3D_HS_OFFSET_LIST: unsigned = 0x3E60;
  export const P3D_HS_OFFSET: unsigned = 0x3E61;
  export const P3D_HS_OFFSET_ADD: unsigned = 0x3E62;
  export const P3D_HS_OFFSET_TANGENT: unsigned = 0x3E63;
  export const P3D_HS_OFFSET_JOINT: unsigned = 0x3E64;
  export const P3D_HS_OFFSET_PHANTOM: unsigned = 0x3E65;
  export const P3D_HS_OFFSET_FRAME: unsigned = 0x3E66;

  export const P3D_HS_COPY_LIST: unsigned = 0x3E70;
  export const P3D_HS_COPY_CN: unsigned = 0x3E71;

  export const P3D_HS_CONTROL_NODE: unsigned = 0x3E81;

  export const P3D_HS_CCPATCH_LIST: unsigned = 0x3E90;
  export const P3D_HS_CCPATCH: unsigned = 0x3E91;

  export const P3D_HS_REF_FRAME_LIST: unsigned = 0x3EA0;
  export const P3D_HS_REF_CN: unsigned = 0x3EA1;

  export const P3D_HSTREE: unsigned = 0x3EF0;
  export const P3D_HSTREE_JOINT: unsigned = 0x3EF1;
  export const P3D_HSTREE_MAPPED_HSTREE: unsigned = 0x3EF2;
  export const P3D_HSTREE_MAPPING: unsigned = 0x3EF3;
  export const P3D_HSTREE_REST_POSE: unsigned = 0x3EF4;
  export const P3D_HSTREE_PARENT_INDEX: unsigned = 0x3EF5;

  // H-Spline Stitcher Chunks

  export const P3D_HS_STITCHER: unsigned = 0x3F00;
  export const P3D_HS_STITCH: unsigned = 0x3F01;
  export const P3D_HS_STITCH_PATCH: unsigned = 0x3F02;
  export const P3D_HS_STITCH_PATCHLIST: unsigned = 0x3F03;
  export const P3D_HS_STITCH_TARGETLIST: unsigned = 0x3F04;
  export const P3D_HS_STITCH_SKIN: unsigned = 0x3F05;

  // H-Spline tessellation

  export const P3D_HS_TESSELLATION: unsigned = 0x3F10;
  export const P3D_HS_INDEX_MAPPING: unsigned = 0x3F11;

  export const P3D_HS_SKIN: unsigned = 0x3F20;
  export const P3D_HS_SKIN_OFFSET_GROUP: unsigned = 0x3F21;
  export const P3D_HS_SKIN_CONNECT: unsigned = 0x3F22;
  export const P3D_HS_SKIN_VERT_CONNECT: unsigned = 0x3F23;

  export const P3D_HS_POLYSKIN: unsigned = 0x3F30;

  export const P3D_HS_OFFSET_ANIM: unsigned = 0x3F40;
  export const P3D_HS_ANIM_CHANNEL: unsigned = 0x3F41;
  export const P3D_HS_CHANNEL_OFFSET_DYNAMIC: unsigned = 0x3F42;
  export const P3D_HS_CHANNEL_OFFSET_STATIC: unsigned = 0x3F43;

  // animation
  export const GEO_ANIM: unsigned = 0x4001;
  export const GEO_ANIM_JOINT: unsigned = 0x4002;
  export const GEO_ANIM_TRANSL_LIST: unsigned = 0x4003;
  export const GEO_ANIM_ROTATE_LIST: unsigned = 0x4004;
  export const GEO_ANIM_QUAT_ROTATE_LIST: unsigned = 0x4010;
  export const GEO_ANIM_SCALE_LIST: unsigned = 0x4005;
  export const GEO_ANIM_CLUT: unsigned = 0x4006;

  export const P3D_DEFORM_POLYSKIN: unsigned = 0x4A88;
  export const P3D_DEFORM_POLYSKIN_JOINT: unsigned = 0x4A89;
  export const P3D_DEFORM_POLYSKIN_STATE: unsigned = 0x4A8A;

  // hybrid animation
  export const GEO_COMPOSITE_ANIM: unsigned = 0x4007;
  export const GEO_ANIM_TEX: unsigned = 0x4008;

  export const GEO_ANIM_ROOT_TRANS: unsigned = 0x4009;

  // vertex animation
  export const GEO_ANIM_VERT: unsigned = 0x400A;
  export const GEO_ANIM_VERT_SPHERE: unsigned = 0x400B;
  export const GEO_ANIM_VERT_FRAMES: unsigned = 0x400C;

  // compressed vertex animation
  export const GEO_ANIM_CVERT: unsigned = 0x400D;
  export const GEO_ANIM_CVERT_SPHERE: unsigned = 0x400E;
  export const GEO_ANIM_CVERT_FRAMES: unsigned = 0x400F;

  // animation preferred hierarchy types
  export const GEO_ANIM_TREETYPE: unsigned = 0x4011;
  export const TREETYPE_UNDEFINED: unsigned = 0;
  export const TREETYPE_STREE: unsigned = 1;
  export const TREETYPE_ETREE: unsigned = 2;
  export const TREETYPE_MTREE: unsigned = 3;
  export const TREETYPE_HSTREE: unsigned = 4;

  export const ANIM_SEQ: unsigned = 0x4012;

  export const P3D_VIZ_ANIM: unsigned = 0x4020;
  export const P3D_VIZ_ANIM_DATA: unsigned = 0x4021;

  // uv animation
  export const P3D_UV_ANIM: unsigned = 0x4030;
  export const P3D_UV_ANIM_FRAMES: unsigned = 0x4031;

  // cbv animation
  export const P3D_CBV_ANIM: unsigned = 0x4040;
  export const P3D_CBV_ANIM_FRAMES: unsigned = 0x4041;
  export const P3D_CBV_PARAM_ANIM: unsigned = 0x4050;
  export const P3D_CBV_PARAM_ANIM_FRAMES: unsigned = 0x4051;
  // event animation
  export const P3D_EVENT_ANIM: unsigned = 0x4060;
  export const P3D_EVENT_ANIM_EVENT: unsigned = 0x4061;
  export const P3D_EVENT_ANIM_DATA: unsigned = 0x4062;


  // Simple Scene Chunks
  // export const P3D_SIMPLE_SCENE: unsigned = 0x4510;
  // export const P3D_SIMPLE_SCENE_NODE: unsigned = 0x4511;
  // SimpleScene renamed to CompoundMesh, June 13, 2000
  // same hex id's
  //export const P3D_COMPOUND_MESH: unsigned = 0x4510;
  //export const P3D_COMPOUND_MESH_NODE: unsigned = 0x4511;
  // New "UberSkin" called the tCompositeDrawable


  // ALL these deformer chunks (0x4410 - 0x441C) are deprecated
  // Skin Deformation Chunks (reserved 0x4410 to 0x4420)
  export const P3D_JOINT_STATE: unsigned = 0x4410;
  export const P3D_STATE_VERTEX_MAP: unsigned = 0x4411;
  export const P3D_STATE_CHANNEL: unsigned = 0x4412;
  export const P3D_JOINT_DEFORMER: unsigned = 0x4413;
  export const P3D_DEFORMER_JOINT_STATE_MAP: unsigned = 0x4414;

  // old unused chunk IDs (TODO: remove them)
  export const P3D_DEFORM_SKIN: unsigned = 0x4416;
  export const P3D_DEFORMER: unsigned = 0x4417;
  export const P3D_DEFORMER_CHANNEL: unsigned = 0x4418;
  export const P3D_DEFORMER_JOINT_DRIVER: unsigned = 0x4419;
  export const P3D_DEFORMER_JOINT_DRIVER_DATA: unsigned = 0x441A;
  export const P3D_DEFORMER_DRIVER_MAP: unsigned = 0x441B;
  export const P3D_DEFORMER_CHANNEL_GROUP: unsigned = 0x441C;

  // Tree Chunks
  export const MTR_MTREE: unsigned = 0x4100;
  export const MTR_MTREE_JOINT: unsigned = 0x4101;

  export const MTR_BILLBOARD: unsigned = 0x4110;

  export const STR_STREE: unsigned = 0x4120;
  export const STR_STREE_JOINT: unsigned = 0x4121;
  export const STR_MAPPED_STREE: unsigned = 0x4122;
  export const STR_STREE_MAPPING: unsigned = 0x4123;
  export const STR_STREE_WEIGHTING: unsigned = 0x4124;
  export const STR_STREE_REST_POSE: unsigned = 0x4125;
  export const STR_STREE_PARENT_INDEX: unsigned = 0x4126;

  export const ETR_ETREE: unsigned = 0x4140;
  export const ETR_ETREE_JOINT: unsigned = 0x4141;

  // V11 Animation chunks
  export const P3D_TRAN_ANIM: unsigned = 0x4200;
  export const P3D_JOINT: unsigned = 0x4202;
  export const P3D_TIME_INDEX: unsigned = 0x4203;
  export const P3D_JOINT_NAMES: unsigned = 0x4204;
  export const P3D_JOINT_INFO: unsigned = 0x4205;

  export const P3D_KEYLIST_1DOF: unsigned = 0x4210;
  export const P3D_KEYLIST_2DOF: unsigned = 0x4211;
  export const P3D_KEYLIST_3DOF: unsigned = 0x4212;
  export const P3D_KEYLIST_1DOF_ANGLE: unsigned = 0x4213;
  export const P3D_KEYLIST_2DOF_ANGLE: unsigned = 0x4214;
  export const P3D_KEYLIST_3DOF_ANGLE: unsigned = 0x4215;
  export const P3D_KEYLIST_QUAT: unsigned = 0x4217;
  export const P3D_KEYLIST_ROT: unsigned = 0x4218;
  export const P3D_KEYLIST_SCALEMATRIX: unsigned = 0x4219;

  export const P3D_STATIC_ROT_KEYLIST: unsigned = 0x4220;
  export const P3D_STATIC_TRANS_KEYLIST: unsigned = 0x4221;
  export const P3D_STATIC_SCALE_KEYLIST: unsigned = 0x4222;
  export const P3D_STATIC_QUAT_KEYLIST: unsigned = 0x4223;
  export const P3D_STATIC_SCALEMATRIX: unsigned = 0x4224;
  export const P3D_STATIC_ROTATION: unsigned = 0x4225;
  export const P3D_STATIC_TRANSLATION: unsigned = 0x4226;

  export const P3D_KEYLIST_HS_OFF_3DOF: unsigned = 0x4230;

  // generic parameter animation
  export const P3D_PARAM_ANIM: unsigned = 0x4300;
  export const P3D_PARAM_ANIM_PARAM: unsigned = 0x4301;
  export const P3D_HSPLINE_PARAM_ANIM: unsigned = 0x4400; // temporary for release 9

  // parameter anim types             (not chunks!)
  export const P3D_USER_PARAM_ANIM: unsigned = 0x80000000;
  export const P3D_PARAM_UNDEFINED_ANIM: unsigned = 0;
  export const P3D_PARAM_CAM_ANIM: unsigned = 0x001;
  export const P3D_PARAM_TARGETCAM_ANIM: unsigned = 0x002;
  export const P3D_PARAM_LIGHT_ANIM: unsigned = 0x101;
  export const P3D_PARAM_HS_ABS_OFF_ANIM: unsigned = 0x201;
  export const P3D_PARAM_HS_REL_OFF_ANIM: unsigned = 0x202;
  export const P3D_PARAM_CBV_ANIM: unsigned = 0x300;
  // create your own param anims from 0x80000000 on

  // Psx chunks for parameter animation
  export const PSX_KEYLIST_1DOF: unsigned = 0x4283;
  export const PSX_KEYLIST_3DOF: unsigned = 0x4285;

  // chunks for progressive mesh information
  export const P3D_PM_MESH: unsigned = 0x5000;
  export const P3D_PM_SKIN: unsigned = 0x5001;
  export const P3D_PM_PRIM_GROUP: unsigned = 0x5002;
  export const P3D_PM_HISTORY: unsigned = 0x5005;
  export const P3D_PM_HISTORY_ELEMENT: unsigned = 0x5006;

  // chunks for view-dependant progressive meshes
  export const P3D_VDPM_GEO: unsigned = 0x5010;
  export const P3D_VDPM_STREE: unsigned = 0x5011;
  export const P3D_VDPM_HISTORY: unsigned = 0x5012;
  export const P3D_VDPM_JOINT_HISTORY: unsigned = 0x5013;
  export const P3D_VDPM_HISTORY_LEVEL: unsigned = 0x5014;

  // param anim param types        (not chunks!)
  export const PARAM_UNDEFINED: unsigned = 0;

  export const PARAM_CAM_ROT: unsigned = 0x001;
  export const PARAM_CAM_TRANS: unsigned = 0x002;
  export const PARAM_CAM_FOV_X: unsigned = 0x011;
  export const PARAM_CAM_FOV_Y: unsigned = 0x012;
  export const PARAM_CAM_TARGET: unsigned = 0x021;
  export const PARAM_CAM_ROLL: unsigned = 0x022;

  export const PARAM_LIGHT_ROT: unsigned = 0x101;
  export const PARAM_LIGHT_TRANS: unsigned = 0x102;
  export const PARAM_LIGHT_COLOUR_RGB: unsigned = 0x111;
  export const PARAM_LIGHT_COLOUR_HSV: unsigned = 0x112;
  export const PARAM_LIGHT_MULTIPLIER: unsigned = 0x120;


  export const PARAM_HS_OFFSET_TRANS: unsigned = 0x202;
  // create your own param anim params from 0x8000000 on


  // The following chunks are used to represent lights
  export const P3D_LIGHT: unsigned = 0x2300;
  export const P3D_LIGHT_EXCLUSION: unsigned = 0x2310;
  export const P3D_LIGHT_ATTENUATION: unsigned = 0x2320;
  export const P3D_LIGHT_SHADOW: unsigned = 0x2330;
  export const P3D_LIGHT_SHADOW_MAPPED: unsigned = 0x2331;
  export const P3D_LIGHT_EXTRA: unsigned = 0x2340;

  // Optic Effect chunks
  export const P3D_CORONA: unsigned = 0x2400;
  export const P3D_LENSFLARE: unsigned = 0x2401;
  export const P3D_LENSFLARE_FLARE: unsigned = 0x2402;

  export const SPACE_WORLD: unsigned = 1;
  export const SPACE_RELATIVE: unsigned = 0;

  export const ROT_X_AXIS: unsigned = 0;
  export const ROT_Y_AXIS: unsigned = 1;
  export const ROT_Z_AXIS: unsigned = 2;
  export const ROT_ARBITRARY: unsigned = 3;

  export const PSX_VERSION: unsigned = 0x6000;
  export const PSX_MATERIALS: unsigned = 0x6001;
  export const PSX_GEOMETRY: unsigned = 0x6002;
  export const PSX_COLLISION_GEOM: unsigned = 0x6003;
  export const PSX_VERT_ANIM: unsigned = 0x6004;
  export const PSX_NORM_ANIM: unsigned = 0x6005;
  export const PSX_CLUT_ANIM: unsigned = 0x6006;
  export const PSX_TEX_ANIM: unsigned = 0x6007;
  export const PSX_TEXTURE: unsigned = 0x6008;
  export const PSX_PRIMS: unsigned = 0x6009;
  export const PSX_TEX_ANIM_FRAMES: unsigned = 0x600A;
  export const PSX_TEX_ANIM_OFFSETS: unsigned = 0x600B;
  export const PSX_CLUT_ANIM_FRAMES: unsigned = 0x600C;
  export const PSX_CLUT_ANIM_OFFSETS: unsigned = 0x600D;

  export const PSX_UV_ANIM: unsigned = 0x600E;
  export const PSX_UV_ANIM_FRAMES: unsigned = 0x600F;
  export const PSX_UV_ANIM_OFFSETS: unsigned = 0x6010;

  export const PSX_CBV_ANIM: unsigned = 0x6011;
  export const PSX_CBV_ANIM_FRAMES: unsigned = 0x6012;
  export const PSX_CBV_ANIM_OFFSETS: unsigned = 0x6013;

  export const PSX_CBV_PARAM_ANIM: unsigned = 0x6021;
  export const PSX_CBV_PARAM_ANIM_FRAMES: unsigned = 0x6022;
  export const PSX_CBV_PARAM_ANIM_OFFSETS: unsigned = 0x6023;

  export const PSX_SEQUENCE_ANIM: unsigned = 0x6040;

  export const PSX_MAIN_RAM_TEX_ANIM: unsigned = 0x6050;
  export const PSX_MAIN_RAM_TEX_ANIM_NAMES: unsigned = 0x6051;
  export const PSX_MAIN_RAM_TEX_ANIM_FRAMES: unsigned = 0x6052;

  export const PSX_STREE: unsigned = 0x6120;
  export const PSX_STREE_JOINT: unsigned = 0x6121;
  export const PSX_MAPPED_STREE: unsigned = 0x6122;
  export const PSX_STREE_WEIGHTING: unsigned = 0x6124;
  export const PSX_STREE_REST_POSE: unsigned = 0x6125;

  export const PSX_MTREE: unsigned = 0x6130;
  export const PSX_MTREE_JOINT: unsigned = 0x6131;

  export const PSX_ETREE: unsigned = 0x6140;
  export const PSX_ETREE_JOINT: unsigned = 0x6141;

  export const PSX_TRAN_ANIM: unsigned = 0x6400;

  export const PSX_TEXTURE_REF: unsigned = 0x6500;

  export const PSX_PRIM_OFFSETS: unsigned = 0x6600;

  export const PSX_MATRIX: unsigned = 0x6F00;

  // the following are defined for flags bits in the binary properties file chunks
  // GEO_PRO_MATERIAL flags
  export const MAT_USELIGHT: unsigned = 0x00000001;
  export const MAT_GOURAUD: unsigned = 0x00000002;
  export const MAT_COLOURBYVERTEX: unsigned = 0x00000004;
  export const MAT_PERSP: unsigned = 0x00000008;
  export const MAT_ENVMAP: unsigned = 0x00000010;
  export const MAT_TILED: unsigned = 0x00000020;
  export const MAT_STIPPLEALPHA: unsigned = 0x00000040;
  export const MAT_MONOLIT: unsigned = 0x00000080;
  export const MAT_ALPHA: unsigned = 0x00000100;
  export const MAT_WIREFRAME: unsigned = 0x00000200;
  export const MAT_ALPHATEST: unsigned = 0x00000400;

  // GEO_PRO_MAT_BLENDMODE values
  export const MAT_BLEND_ZERO: unsigned = 0x00000001;
  export const MAT_BLEND_ONE: unsigned = 0x00000002;
  export const MAT_BLEND_SRC: unsigned = 0x00000003;
  export const MAT_BLEND_ONE_MINUS_SRC: unsigned = 0x00000004;
  export const MAT_BLEND_DEST: unsigned = 0x00000005;
  export const MAT_BLEND_ONE_MINUS_DEST: unsigned = 0x00000006;
  export const MAT_BLEND_SRCALPHA: unsigned = 0x00000007;
  export const MAT_BLEND_ONE_MINUS_SRCALPHA: unsigned = 0x00000008;
  export const MAT_BLEND_DESTALPHA: unsigned = 0x00000009;
  export const MAT_BLEND_ONE_MINUS_DESTALPHA: unsigned = 0x0000000a;
  export const MAT_BLEND_SRCALPHASATURATE: unsigned = 0x0000000b;

  // GEO_PRO_TEXTURE flags
  export const TEX_COLOURKEY: unsigned = 0x00000001;
  export const TEX_ONEBITALPHA: unsigned = 0x00000002;

  // Bits for the GEO_HIT chunk
  export const HIT_RENDER: unsigned = 1;
  export const HIT_FACE_COLLISION: unsigned = 2;
  export const HIT_BOX_COLLISION: unsigned = 4;
  export const HIT_SPHERE_COLLISION: unsigned = 8;

  // BSP tree chunks
  export const BSP_TREE: unsigned = 0x9000;
  export const BSP_NODE_SPLIT: unsigned = 0x9001;
  export const BSP_NODE_LEAF: unsigned = 0x9002;
  export const BSP_NODE_NULL: unsigned = 0x9003;

  // Scenegraph chunks
  export const P3D_SG_SCENEGRAPH: unsigned = 0x9100;
  export const P3D_SG_ROOT: unsigned = 0x9101;
  export const P3D_SG_BRANCH: unsigned = 0x9102;
  export const P3D_SG_TRANSFORM: unsigned = 0x9103;
  export const P3D_SG_DRAWABLE: unsigned = 0x9104;
  export const P3D_SG_CAMERA: unsigned = 0x9105;
  export const P3D_SG_LIGHTGROUP: unsigned = 0x9106;
  export const P3D_SG_ATTACHMENT: unsigned = 0x9107;
  export const P3D_SG_ATTACHMENTPOINT: unsigned = 0x9108;
  export const P3D_SG_VISIBILITY: unsigned = 0x9109;

  export const P3D_SG_TRANSFORM_CONTROLLER: unsigned = 0x9151;

  // chunks for physics
  export const PHY_OBJ_OLD: unsigned = 0xC000;
  export const PHY_OBJ: unsigned = 0xC111;
  export const PHY_OBJ_IMAT: unsigned = 0xC001;
  export const PHY_OBJ_COLLEL: unsigned = 0xC002;
  export const PHY_OBJ_COLLEL_SPHERE: unsigned = 0xC003;
  export const PHY_OBJ_COLLEL_CYL: unsigned = 0xC004;
  export const PHY_OBJ_COLLEL_OBBOX: unsigned = 0xC005;
  export const PHY_OBJ_COLLEL_WALL: unsigned = 0xC006;
  export const PHY_OBJ_COLLEL_BBOX: unsigned = 0xC007;
  export const PHY_VECTOR: unsigned = 0xC010;
  export const PHY_OBJ_JOINT: unsigned = 0xC011;
  export const PHY_OBJ_JOINT_DOF: unsigned = 0xC012;
  export const PHY_OBJ_SELFCOLL: unsigned = 0xC020;
  export const PHY_OBJ_SELFCOLL_ITEM: unsigned = 0xC021;

  export const PHY_FOOTSTEPS: unsigned = 0xC100;

  export const PHY_FLEX_GEOM: unsigned = 0xC200;
  export const PHY_FLEX_JOINT: unsigned = 0xC201;
  export const PHY_FLEX_PARAM: unsigned = 0xC210;
  export const PHY_FLEX_FIX_PARTICLE: unsigned = 0xC211;
  export const PHY_FLEX_MAP_VL: unsigned = 0xC212;
  export const PHY_FLEX_TRI_MAP: unsigned = 0xC213;
  export const PHY_FLEX_EDGE_MAP: unsigned = 0xC214;
  export const PHY_FLEX_EDGE_LEN: unsigned = 0xC215;
  export const PHY_FLEX_COLL_JOINT: unsigned = 0xC216;
  export const PHY_FLEX_JOINT_DEF: unsigned = 0xC220;

  export const PHY_LINK: unsigned = 0xC320;
  export const PHY_LINK_IK: unsigned = 0xC321;
  export const PHY_LINK_REACH: unsigned = 0xC322;
  export const PHY_LINK_TRACKER: unsigned = 0xC323;
  export const PHY_LINK_TARGET: unsigned = 0xC330;
  export const PHY_TARGET_NODE: unsigned = 0xC331;
  export const PHY_TARGET_POSE: unsigned = 0xC332;

  // TWADDLER CHUNKS

  // the Twaddler world
  export const TW_WORLD: unsigned = 0xB000;

  // Twaddler objects
  export const TW_OBJ_POINT: unsigned = 0xB001;
  export const TW_OBJ_LINE: unsigned = 0xB002;
  export const TW_OBJ_MESH: unsigned = 0xB003;
  export const TW_OBJ_ICON: unsigned = 0xB004;
  export const TW_OBJ_VOLUME: unsigned = 0xB005;
  export const TW_OBJ_SPHERE: unsigned = 0xB006;
  export const TW_OBJ_LIGHT: unsigned = 0xB007;

  export const TW_BLOCK_VOLUME: unsigned = 0xBB00;
}
//? #endif
//? #endif

