
type u32 = number;
type int = number;
type f32 = number;
type bool = number;
type rmt_vector = number[];
type pddi_colour = number[];

enum CollisionVolumeTypeEnum {

}

enum CollisionVolumeTypeEnum {
  CollisionVolumeType,
  SphereVolumeType,
  CylinderVolumeType,
  OBBoxVolumeType,
  WallVolumeType,
  BBoxVolumeType,
};
enum VolAxisOrientation {
  VolAxisNotOriented,
  VolAxisOriented,
  VolAxisXOriented,
  VolAxisYOriented,
  VolAxisZOriented
};

export interface CollisionObject { // OBJECT
  //  subchunks
  // CollisionVolumeOwner
  // SelfCollision
  // CollisionVolume
  // CollisionObjectAttribute
  //
  name: string;
  version: u32;
  string_data: string;
  num_sub_object: u32;
  num_owner: u32;
}

interface CollisionObjectAttribute { // ATTRIBUTE
  static_attribute: u32;
  default_area: u32;
  can_roll: bool;
  can_slide: bool;
  can_spin: bool;
  can_bounce: bool;
  extra_attribute_1: u32;
  extra_attribute_2: u32;
  extra_attribute_3: u32;
}

interface CollisionVolumeOwner { // OWNER
  //  subchunks
  // CollisionVolumeOwner
  num_names: u32;
}

interface CollisionVolumeOwnerName { // OWNERNAME
  name: string;
}

interface SelfCollision { // SELFCOLLISION
  joint_index_1: u32;
  joint_index_2: u32;
  self_only_1: u32;
  self_only_2: u32;
}

interface CollisionVolume { // VOLUME
  //  subchunks
  // BBoxVolume
  // SphereVolume
  // CylinderVolume
  // OBBoxVolume
  // WallVolume
  // CollisionVolume
  object_reference_index: u32;
  owner_index: u32;
  num_sub_volume: u32;

  m_position: f32;
  m_box_size: f32;
  m_sphere_radius: f32;
  m_type: CollisionVolumeTypeEnum;
  m_obj_ref_index: u32;
  m_owner_index: u32;
  m_collision_object: CollisionObject;
  m_sub_volume_list: CollisionVolume[];
  m_visible: bool;
  m_updated: bool;
  m_dp: rmt_vector;
  m_colour: pddi_colour;
}

interface BBoxVolume { // BBOX
  nothing: u32;
}

interface SphereVolumeChunk { // SPHERE
  sphere_radius: f32;
  p: CollisionVector;
}

interface CylinderVolume { // CYLINDER
  cylinder_radius: f32;
  length: f32;
  flat_end: bool;
  p: CollisionVector;
  o: CollisionVector;

  m_axis: rmt_vector;
  m_length: f32;
  m_cylinder_radius: f32;
  m_flat_end: bool;
  m_axis_orientation: VolAxisOrientation;
}

interface OBBoxVolume { // OBBOX
  length_1: f32;
  length_2: f32;
  length_3: f32;
  p: CollisionVector;
  o0: CollisionVector;
  o1: CollisionVector;
  o2: CollisionVector;

  m_axis: rmt_vector[];
  m_length: f32[];
  vol_axis_orientation: undefined; // VolAxisOrientation
  m_c: rmt_vector[]; /* #ifdef OBBoxStorePoints */// vec3f[4];
}

interface WallVolume { // WALL
  p: CollisionVector;
  n: CollisionVector;

  n_normal: rmt_vector;
  vol_axis_orientation: undefined; // VolAxisOrientation
}

interface CollisionVector { // VECTOR
  x: number;
  y: number;
  z: number;
}

