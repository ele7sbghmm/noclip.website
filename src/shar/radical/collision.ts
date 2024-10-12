import { BufReader } from "./reader.js";
import { u32, f32, bool, rmt_Vector, rmt_Matrix, pddi_colour } from "./utils.js";
import { HEADER_SIZE } from "./chunks.js";

type tUID = string;
type tPose = undefined;

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


// const AXIS_ALIGNED_SNAPPING_FACTOR = 0.9999;
type CollisionVolumeSubChunks = [
  CollisionVolume |
  SphereVolume |
  CylinderVolume |
  OBBoxVolume |
  WallVolume |
  BBoxVolume
];

type CollisionObjectChunk = { // OBJECT 0x07010000
  // CollisionVolumeOwner
  // SelfCollision
  // CollisionVolume
  // CollisionObjectAttribute
  name: string;
  version: u32;
  stringData: string;
  numSubObject: u32;
  numOwner: u32;
}
export class CollisionObject {
  public mStringDataUID: tUID;
  public mCollisionVolume: CollisionVolume;
  public mNumJoint: u32;
  public mPose: tPose;
  public mSelfCollisionList: SelfCollision[];
  public mCollisionVolumeOwner: CollisionVolumeOwner;
  public mIsStatic: boolean;
  public mCollideWithStatic: boolean;
  public mDefaultArea: u32;
  // private
  public mHasMoved: boolean;
  public mHasRelocated: boolean;
  public mSceneGraphTransform: rmt_Matrix;
  public mIsDynamic: boolean;

  public static parser(buf: BufReader): CollisionObjectChunk {
    const name = buf.read_u8_string();
    const version = buf.le_u32();
    const stringData = buf.read_u8_string();
    const numSubObject = buf.le_u32();
    const numOwner = buf.le_u32();

    const chunk: CollisionObjectChunk = {
      name: name,
      version: version,
      stringData: stringData,
      numSubObject: numSubObject,
      numOwner: numOwner,
    };
    return chunk;
  }
}

type CollisionObjectAttributeChunk = { // ATTRIBUTE 0x07010023
  staticAttribute: u32;
  defaultArea: u32;
  canRoll: bool;
  canSlide: bool;
  canSpin: bool;
  canBounce: bool;
  extraAttribute_1: u32;
  extraAttribute_2: u32;
  extraAttribute_3: u32;
}
class CollisionObjectAttribute {
  public static parser(buf: BufReader): CollisionObjectAttributeChunk {
    const chunk: CollisionObjectAttributeChunk = {
      staticAttribute: buf.le_u32(),
      defaultArea: buf.le_u32(),
      canRoll: buf.u8(),
      canSlide: buf.u8(),
      canSpin: buf.u8(),
      canBounce: buf.u8(),
      extraAttribute_1: buf.le_u32(),
      extraAttribute_2: buf.le_u32(),
      extraAttribute_3: buf.le_u32(),
    };
    return chunk;
  }
}

type CollisionVolumeOwnerChunk = { // OWNER 0x07010021
  // CollisionVolumeOwner
  numNames: u32;
}
class CollisionVolumeOwner {
  public mNumOwner: u32;
  public mOwnerList: tUID;
  public mVisible: boolean[];
  public static parser(buf: BufReader): CollisionVolumeOwnerChunk {
    const chunk: CollisionVolumeOwnerChunk = {
      numNames: buf.le_u32(),
    }
    return chunk;
  }
}

type CollisionVolumeOwnerNameChunk = { // OWNERNAME 0x07010022
  name: string;
}
class CollisionVolumeOwnerName {
  public static parser(buf: BufReader): CollisionVolumeOwnerNameChunk {
    const chunk: CollisionVolumeOwnerNameChunk = {
      name: buf.read_u8_string(),
    };
    return chunk;
  }
}

type SelfCollisionChunk = { // SELFCOLLISION 0x07010020
  jointIndex1: u32;
  jointIndex2: u32;
  selfOnly1: bool;
  selfOnly2: bool;
}
class SelfCollision {
  public mIndex1: u32;
  public mIndex2: u32;
  public mSelf1: boolean;
  public mSelf2: boolean;
  public mCollisionVolume1: CollisionVolume;
  public mCollisionVolume2: CollisionVolume;
  public static parser(buf: BufReader): SelfCollisionChunk {
    const chunk: SelfCollisionChunk = {
      jointIndex1: buf.le_u32(),
      jointIndex2: buf.le_u32(),
      selfOnly1: 0xff,
      selfOnly2: 0xff,
    };
    return chunk;
  }
}

type CollisionVolumeChunk = { // VOLUME 0x07010001
  // BBoxVolume
  // SphereVolume
  // CylinderVolume
  // OBBoxVolume
  // WallVolume
  // CollisionVolume
  objectReferenceIndex: u32;
  ownerIndex: u32;
  numSubVolume: u32;
}
class CollisionVolume {
  public mPosition: rmt_Vector;
  public mBoxSize: rmt_Vector;
  public mSphereRadius: f32;

  public mType: CollisionVolumeTypeEnum;
  public mObjRefIndex: u32;
  public mOwnerIndex: u32;
  public mCollisionObject: CollisionObject | null;
  public mSubVolumeList: CollisionVolumeSubChunks[] | null;
  public mVisible: boolean;
  public mUpdated: boolean;
  public mDP: rmt_Vector;
  public mColour: pddi_colour;

  constructor(
    mSphereRadius = 1.,
    mType = CollisionVolumeTypeEnum.CollisionVolumeType,
    mObjRefIndex = -1,
    mOwnerIndex = -1,
    mCollisionObject = null,
    mSubVolumeList = null,
    mVisible = true,
    mUpdated: boolean = false,
  ) {
    this.mSphereRadius = mSphereRadius;
    this.mType = mType;
    this.mObjRefIndex = mObjRefIndex;
    this.mOwnerIndex = mOwnerIndex;
    this.mCollisionObject = mCollisionObject;
    this.mSubVolumeList = mSubVolumeList;
    this.mVisible = mVisible;
    this.mUpdated = mUpdated;

    this.mPosition = { x: 0, y: 0, z: 0 };
    this.mBoxSize = { x: 0, y: 0, z: 0 };
    this.mDP = { x: 0, y: 0, z: 0 };
    this.mColour = { r: 0, g: 255, b: 0, a: 255 };
  }

  public static parser(buf: BufReader): CollisionVolumeChunk {
    const chunk: CollisionVolumeChunk = {
      objectReferenceIndex: buf.le_u32(),
      ownerIndex: buf.le_u32(),
      numSubVolume: buf.le_u32(),
    }
    return chunk;
  }
}

type BBoxVolumeChunk = { // BBOX 0x07010006
  nothing: u32;
}
class BBoxVolume {
  public static parser(buf: BufReader): BBoxVolumeChunk {
    const chunk: BBoxVolumeChunk = {
      nothing: buf.le_f32(),
    }
    return chunk;
  }
}

type SphereVolumeChunk = { // SPHERE 0x07010002
  sphereRadius: f32;
  p: CollisionVector;
}
class SphereVolume {
  public static parser(buf: BufReader): SphereVolumeChunk {
    return {
      sphereRadius: buf.le_f32(),
      p: CollisionVector.parse(buf),
    }
  }
}

type CylinderVolumeChunk = { // CYLINDER 0x07010003
  cylinderRadius: f32;
  length: f32;
  flatEnd: bool;
  p: CollisionVectorChunk;
  o: CollisionVectorChunk;
}
class CylinderVolume { // CYLINDER
  public mAxis: rmt_Vector;
  public mLength: f32;
  public mCylinderRadius: f32;
  public mFlatEnd: bool;
  public mAxisOrientation: VolAxisOrientation;

  public static parser(buf: BufReader): CylinderVolumeChunk {
    return {
      cylinderRadius: buf.le_f32(),
      length: buf.le_f32(),
      flatEnd: buf.le_u16(),
      p: CollisionVector.parse(buf),
      o: CollisionVector.parse(buf),
    }
  }
}

type OBBoxVolumeChunk = { // OBBOX 0x07010004
  length1: f32;
  length2: f32;
  length3: f32;
  p: CollisionVector;
  o0: CollisionVector;
  o1: CollisionVector;
  o2: CollisionVector;
}
class OBBoxVolume {
  mAxis: rmt_Vector[];
  mLength: f32[];
  // volAxisOrientation: undefined; // VolAxisOrientation
  // mC: rmt_Vector[]; /* #ifdef OBBoxStorePoints */// vec3f[4];

  public static parser(buf: BufReader): OBBoxVolumeChunk {
    return {
      length1: buf.le_f32(),
      length2: buf.le_f32(),
      length3: buf.le_f32(),
      p: CollisionVector.parse(buf),
      o0: CollisionVector.parse(buf),
      o1: CollisionVector.parse(buf),
      o2: CollisionVector.parse(buf),
    }
  }
}

type WallVolumeChunk = { // WALL 0x07010005
  p: CollisionVectorChunk;
  n: CollisionVectorChunk;
}
class WallVolume {
  public nNormal: rmt_Vector;
  public static parse(buf: BufReader): WallVolumeChunk {
    return {
      p: CollisionVector.parse(buf),
      n: CollisionVector.parse(buf),
    }
  }
}

type CollisionVectorChunk = { // VECTOR 0x07010007
  x: f32;
  y: f32;
  z: f32;
}
class CollisionVector {
  public static parse(buf: BufReader): CollisionVectorChunk {
    return {
      x: buf.le_u32(),
      y: buf.le_u32(),
      z: buf.le_u32(),
    }
  }
}

