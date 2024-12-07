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

export const P3D_IMAGE              = 0x3510;
export const P3D_IMAGE_DATA         = 0x3511;
export const P3D_IMAGE_FILENAME     = 0x3512;

// Skeleton Chunks
export const P3D_SKELETON                  = 0x4500;
export const P3D_SKELETON_JOINT            = 0x4501;
export const P3D_SKELETON_JOINT_PHYSICS    = 0x4502;
export const P3D_SKELETON_JOINT_MIRROR_MAP = 0x4503;
export const P3D_SKELETON_JOINT_FIX_FLAG   = 0x4504;

export const P3D_COMPOSITE_DRAWABLE           = 0x4512;
export const P3D_COMPOSITE_DRAWABLE_SKIN_LIST = 0x4513;
export const P3D_COMPOSITE_DRAWABLE_PROP_LIST = 0x4514;
export const P3D_COMPOSITE_DRAWABLE_SKIN      = 0x4515;
export const P3D_COMPOSITE_DRAWABLE_PROP      = 0x4516;
export const P3D_COMPOSITE_DRAWABLE_EFFECT_LIST = 0x4517;
export const P3D_COMPOSITE_DRAWABLE_EFFECT    = 0x4518;
export const P3D_COMPOSITE_DRAWABLE_SORTORDER = 0x4519;

// Frame Controller chunks
export const P3D_FRAME_CONTROLLER       = 0x4520;

export const P3D_MULTI_CONTROLLER         = 0x48A0;
export const P3D_MULTI_CONTROLLER_TRACKS  = 0x48A1;
export const P3D_MULTI_CONTROLLER_TRACK   = 0x48A2;

export const P3D_CAMERA             = 0x2200;

export const P3D_LIGHT_GROUP         = 0x2380;

// 0x7000 - 0x7FFF  Tool Specific data (unused by games, or for debugging)
export const P3D_HISTORY            = 0x7000;
export const P3D_ALIGN              = 0x7001;

// Used by the maya exporter
export const P3D_EXPORT_INFO         = 0x7030;
export const P3D_EXPORT_NAMED_STRING = 0x7031;
export const P3D_EXPORT_NAMED_INT    = 0x7032;

//********************************
// Chunks needed for conversions
//********************************
export const P3D_EXPRESSION_PRESET         = 0x4A00;
export const P3D_EXPRESSION_GROUP          = 0x4A01;
export const P3D_EXPRESSION_ANIM           = 0x4A10;
export const P3D_EXPRESSION_ANIM_CHANNEL   = 0x4A11;
export const P3D_EXPRESSION_MIXER          = 0x4A20;

export const P3D_VERTEXOFFSET              = 0x4A80;
export const P3D_VERTEXOFFSET_ANIM         = 0x4A81;
export const P3D_VERTEX_OFFSET_EXPRESSION  = 0x4A82;

export const P3D_SG_TRANSFORM_ANIM        = 0x9150;

// Visibility animation
export const P3D_VISIBILITY_ANIM           = 0x4290;
export const P3D_VISIBILITY_ANIM_CHANNEL   = 0x4291;

// Texture animation
export const P3D_TEXTURE_ANIM         = 0x3520;
export const P3D_TEXTURE_ANIM_CHANNEL = 0x3521;

// V12 Animation chunks
export const P3D_POSE_ANIM            = 0x4700;
export const P3D_JOINT_LIST           = 0x4201;
export const P3D_ANIM_CHANNEL         = 0x4702;
export const P3D_POSE_ANIM_MIRRORED   = 0x4703;

export const P3D_CHANNEL_1DOF          = 0x4800;
export const P3D_CHANNEL_3DOF          = 0x4801;
export const P3D_CHANNEL_1DOF_ANGLE    = 0x4802;
export const P3D_CHANNEL_3DOF_ANGLE    = 0x4803;
export const P3D_CHANNEL_STATIC        = 0x4804;
export const P3D_CHANNEL_STATIC_ANGLE  = 0x4805;
export const P3D_CHANNEL_QUATERNION    = 0x4806;
export const P3D_CHANNEL_STATIC_QUATERNION = 0x4807;

export const P3D_CAMERA_ANIM                      = 0x4900;
export const P3D_CAMERA_ANIM_CHANNEL              = 0x4901;
export const P3D_CAMERA_ANIM_POS_CHANNEL          = 0x4902;
export const P3D_CAMERA_ANIM_LOOK_CHANNEL         = 0x4903;
export const P3D_CAMERA_ANIM_UP_CHANNEL           = 0x4904;
export const P3D_CAMERA_ANIM_FOV_CHANNEL          = 0x4905;

// V16 Camera Animation Chunks.
// Added by Bryan Ewert on 22 Feb 2002
export const P3D_CAMERA_ANIM_NEARCLIP_CHANNEL     = 0x4906;
export const P3D_CAMERA_ANIM_FARCLIP_CHANNEL      = 0x4907;

export const P3D_LIGHT_ANIM                 = 0x4980;
export const P3D_LIGHT_ANIM_CHANNEL         = 0x4981;
export const P3D_LIGHT_ANIM_COLOUR_CHANNEL  = 0x4982;
export const P3D_LIGHT_ANIM_PARAM_CHANNEL   = 0x4983;
export const P3D_LIGHT_ANIM_ENABLE_CHANNEL  = 0x4985;

export const P3D_ENTITY_ANIM_CHANNEL = 0x42A0;
export const P3D_KEYLIST_COLOUR       = 0x4216;

// v17 Vertex Animaion Chunks
export const P3D_VERTEX_ANIM      = 0x4a00;
export const P3D_VERTEX_ANIM_CHANNEL      = 0x4a01;

//------------------------------------------------------------------------------------------
// UNUSED CHUNKS
//------------------------------------------------------------------------------------------
