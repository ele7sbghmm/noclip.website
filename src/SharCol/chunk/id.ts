
export enum ID {
  STATIC_PHYS_DSG   = 0x03f00001,
  FENCE_DSG         = 0x03f00007,
  WALL              = 0x03000000,
  ROAD_SEGMENT      = 0x03000002,
  ROAD              = 0x03000003,
  INTERSECTION      = 0x03000004,
  ROAD_SEGMENT_DATA = 0x03000009,

  INTERSECT_DSG     = 0x03f00003,
  TERRAIN_TYPE      = 0x0300000e,

  OBJECT            = 0x07010000,
  VOLUME            = 0x07010001,
  SPHERE            = 0x07010002,
  CYLINDER          = 0x07010003,
  OBBOX             = 0x07010004,
  WALL_             = 0x07010005,
  BBOX              = 0x07010006,
  VECTOR            = 0x07010007,
  SELFCOLLISION     = 0x07010020,
  OWNER             = 0x07010021,
  OWNERNAME         = 0x07010022,
  ATTRIBUTE         = 0x07010023,
  OBJECT_ATTRIBUTES = 0x03000600,
}
