import { UWORD, ULONG, float } from './util.js';

// const subchunk = [
//   tlCollisionVolumeOwnerChunk,
//   tlSelfCollisionChunk,
//   tlCollisionVolumeChunk,
//   tlCollisionObjectAttributeChunk
// ];
// const chunk_id = Simulation::Collision::OBJECT;
export type tlCollisionObjectChunk = {
  Name: string;
  Version: ULONG;
  StringData: string;
  NumSubObject: ULONG;
  NumOwner: ULONG;
}

// const chunk_id = Simulation::Collision::ATTRIBUTE;
export type tlCollisionObjectAttributeChunk = {
  StaticAttribute: UWORD;
  DefaultArea: ULONG;
  CanRoll: UWORD;
  CanSlide: UWORD;
  CanSpin: UWORD;
  CanBounce: UWORD;
  ExtraAttribute1: ULONG;
  ExtraAttribute2: ULONG;
  ExtraAttribute3: ULONG;
}

// const subchunk = [tlCollisionVolumeOwnerNameChunk];
// const chunk_id = Simulation::Collision::OWNER;
export type tlCollisionVolumeOwnerChunk = {
  NumNames: ULONG;
}

// const chunk_id = Simulation::Collision::OWNERNAME;
export type tlCollisionVolumeOwnerNameChunk = {
  Name: string;
}

// const chunk_id = Simulation::Collision::SELFCOLLISION;
export type tlSelfCollisionChunk = {
  JointIndex1: ULONG;
  JointIndex2: ULONG;
  SelfOnly1: UWORD;
  SelfOnly2: UWORD;
}

// const subchunk = [
//   tlBBoxVolumeChunk,
//   tlSphereVolumeChunk,
//   tlCylinderVolumeChunk,
//   tlOBBoxVolumeChunk,
//   tlWallVolumeChunk,
//   tlCollisionVolumeChunk
// ];
// const chunk_id = Simulation::Collision::VOLUME;
export type tlCollisionVolumeChunk = {
  ObjectReferenceIndex: ULONG;
  OwnerIndex: ULONG;
  NumSubVolume: ULONG;
}

// chunk_id = Simulation::Collision::BBOX;
export type tlBBoxVolumeChunk = {
  Nothing: ULONG;
}

// const subchunk = [tlCollisionVectorChunk];
// const chunk_id = Simulation::Collision::SPHERE;
export type tlSphereVolumeChunk = {
  SphereRadius: float;
}

// const subchunk = [tlCollisionVectorChunk];
// const chunk_id = Simulation::Collision::CYLINDER;
export type tlCylinderVolumeChunk = {
  CylinderRadius: float;
  Length: float;
  FlatEnd: UWORD;
}

// const subchunk = [tlCollisionVectorChunk];
// const chunk_id = Simulation::Collision::OBBOX;
export type tlOBBoxVolumeChunk = {
  Length1: float;
  Length2: float;
  Length3: float;
}

// const subchunk = [tlCollisionVectorChunk];
// const chunk_id = Simulation::Collision::WALL;
export type tlWallVolumeChunk = {}

// const chunk_id = Simulation::Collision::VECTOR;
export type tlCollisionVectorChunk = {
  X: float;
  Y: float;
  Z: float;
}

