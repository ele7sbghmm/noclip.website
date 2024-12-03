import { nArray } from '../util.js'
import { vec3, mat4 } from 'gl-matrix'
import { AABB } from '../Geometry.js'
import { Color, colorNewFromRGBA } from '../Color.js'

type SpatialNode = { axis: number, pos: number }
const AXIS_ALIGNED_SNAPPING_FACTOR: number = 0.9999

export abstract class IEntityDSG {
    name: string
}
export class SpatialTree extends IEntityDSG {
    n_nodes: number
    bounds_min: vec3
    bounds_max: vec3
    nodes: SpatialNode[] = []

}

export class FenceEntityDSG extends IEntityDSG {
    start: vec3
    end: vec3
    normal: vec3
}
export class IntersectDSG extends IEntityDSG {
    mTriIndices: number[] = []
    mTriPts: vec3[] = []
    mTriNorms: vec3[] = []
    mTerrainType: number[] = []
}
export class CollisionObject extends IEntityDSG {
    nStringData: string
    mNumJoint: number
    mIsStatic: boolean
    mDefaultArea: number
    mCollisionVolumeOwner: CollisionVolumeOwner | null = null
    mCollisionVolume: CollisionVolume | null = null
    mSimState: SimState
    mSelfCollisionList: SelfCollision[] = []

    SetCollisionVolume(inCollisionVolume: CollisionVolume) {
        this.mCollisionVolume = inCollisionVolume
        for (let i = 0; i < this.mSelfCollisionList.length; i++)
            this.SetSelfCollision(this.mSelfCollisionList[i])
    }
    SetSelfCollision(inSelfColl: SelfCollision) {
        inSelfColl.mCollisionVolume1 = this.mCollisionVolume!.GetSubCollisionVolume(inSelfColl.mIndex1, inSelfColl.mSelf1)
        inSelfColl.mCollisionVolume2 = this.mCollisionVolume!.GetSubCollisionVolume(inSelfColl.mIndex2, inSelfColl.mSelf2)
    }
    AddSelfCollision(inIndex1: number, inIndex2: number, inSelf1: boolean, inSelf2: boolean) {
        // this.mSelfCollisionEnabled = true

        const sc: SelfCollision = new SelfCollision
        sc.Set(inIndex1, inIndex2, inSelf1, inSelf2)

        this.mSelfCollisionList.push(sc)
        if (this.mCollisionVolume) {
            this.SetSelfCollision(sc)
        }
    }
    GetCollisionVolume(): CollisionVolume { return this.mCollisionVolume! }
}
export class CollisionVolume {
    mSphereRadius: number = 1.0
    mType: CollisionVolumeTypeEnum = CollisionVolumeTypeEnum.CollisionVolumeType
    mOwnerIndex: number = -1
    mCollisionObject: CollisionObject | null = null
    public mPosition: vec3 = vec3.fromValues(0, 0, 0)
    mBoxSize: vec3 = vec3.fromValues(0, 0, 0)
    mDP: vec3 = vec3.fromValues(0, 0, 0)

    mSubVolumeList: Array<CollisionVolume | null>
    mVisible: boolean
    mUpdated: boolean

    mAxisOrientation: VolAxisOrientation
    mObjRefIndex: number

    SetObjRefIndex(ref: number) {
        this.mObjRefIndex = ref
        if (this.mSubVolumeList != null) {
            for (let i = 0; i < this.mSubVolumeList.length; i++) {
                this.mSubVolumeList[i]!.SetObjRefIndex(ref)
            }
        }
    }
    AddSubVolume(inEl: CollisionVolume) {
        if (this.mSubVolumeList == null) {
            this.mSubVolumeList = new Array<CollisionVolume>
        }
        this.mSubVolumeList.push(inEl)
        inEl.SetCollisionObject(this.mCollisionObject!)
    }
    SetCollisionObject(obj: CollisionObject) {
        if (this.mCollisionObject === obj) return

        this.mCollisionObject = obj
        if (this.mSubVolumeList != null) {
            for (let i = 0; i < this.mSubVolumeList.length; i++) {
                this.mSubVolumeList[i]!.SetCollisionObject(this.mCollisionObject)
            }
        }
    }
    GetSubCollisionVolume(inObjRefIndex: number, inSelfOnly: boolean): CollisionVolume | null {
        let ret: CollisionVolume | null = null

        if (this.mObjRefIndex <= inObjRefIndex) {
            if ((this.mType != CollisionVolumeTypeEnum.BBoxVolumeType || !inSelfOnly)
                && this.mObjRefIndex == inObjRefIndex) {
                ret = this
            }
            if (!ret && this.mSubVolumeList) {
                for (let i = 0; i < this.mSubVolumeList.length; i++) {
                    let cv: CollisionVolume | null = this.mSubVolumeList[i]
                    if (cv!.mObjRefIndex == inObjRefIndex
                        && cv!.mType != CollisionVolumeTypeEnum.BBoxVolumeType) {
                        ret = cv
                        break
                    } else {
                        cv = cv!.GetSubCollisionVolume(inObjRefIndex, inSelfOnly)
                        if (cv) {
                            ret = cv
                            break
                        }
                    }
                }
            }
        }
        return ret
    }
}
type tUID = number | string
export class CollisionVolumeOwner {
    mNumOwner: number = 0
    mOwnerList: Array<tUID>
    mVisible: Array<boolean>

    SetNumOwnerList(inNum: number) {
        this.mNumOwner = inNum
        this.mOwnerList = Array.from({ length: this.mNumOwner }, () => 0)
        this.mVisible = Array.from({ length: this.mNumOwner }, () => true)
    }
}
export class SelfCollision {
    mIndex1: number = 0
    mIndex2: number = 0
    mSelf1: boolean = false
    mSelf2: boolean = false

    mCollisionVolume1: CollisionVolume | null = null
    mCollisionVolume2: CollisionVolume | null = null

    Set(inIndex1: number, inIndex2: number, inSelf1: boolean, inSelf2: boolean) {
        this.mIndex1 = inIndex1
        this.mIndex2 = inIndex2
        this.mSelf1 = inSelf1
        this.mSelf2 = inSelf2
    }
}
export class SphereVolume extends CollisionVolume {
    constructor(
        public override mPosition: vec3,
        public mSphrereRadius: number
    ) {
        super()
        this.mType = CollisionVolumeTypeEnum.SphereVolumeType
        this.mDP = mPosition
        this.mBoxSize = vec3.fromValues(mSphrereRadius, mSphrereRadius, mSphrereRadius)
    }
}
export class CylinderVolume extends CollisionVolume {
    override mType = CollisionVolumeTypeEnum.CylinderVolumeType
    override mAxisOrientation: VolAxisOrientation
    constructor(
        public override mPosition: vec3,
        public mAxis: vec3,
        public mLength: number,
        public mCylinderRadius: number,
        public mFlatEnd: boolean
    ) {
        super()
        this.mDP = mPosition
        this.mSphereRadius = mFlatEnd
            ? Math.sqrt(Math.pow(this.mLength, 2) + Math.pow(mCylinderRadius, 2))
            : mLength + mCylinderRadius
        this.mAxisOrientation = VolAxisOrientation.VolAxisNotOriented
    }
}
export class OBBoxVolume extends CollisionVolume {
    override mType = CollisionVolumeTypeEnum.OBBoxVolumeType
    override mAxisOrientation = VolAxisOrientation.VolAxisNotOriented
    mLength: vec3
    mAxis: vec3[]

    constructor(public override mPosition: vec3,
        o0: vec3, o1: vec3, o2: vec3,
        l0: number, l1: number, l2: number) {
        super()
        this.mDP = mPosition
        this.mLength = vec3.fromValues(l0, l1, l2)
        this.mSphereRadius = Math.sqrt(Math.pow(l0, 2)
            + Math.pow(l1, 2)
            + Math.pow(l2, 2))
        this.mAxis = [o0, o1, o2]
    }
}
export class WallVolume extends CollisionVolume {
    override mType = CollisionVolumeTypeEnum.WallVolumeType
    override mSphereRadius = Number.MAX_VALUE
    constructor(public override mPosition: vec3 = vec3.fromValues(0, 0, 0),
        public mNormal: vec3 = vec3.fromValues(0, 1, 0)) { super() }
}
export class BBoxVolume extends CollisionVolume {
    override mType = CollisionVolumeTypeEnum.BBoxVolumeType
    override mAxisOrientation = VolAxisOrientation.VolAxisNotOriented
    override mBoxSize = vec3.fromValues(1, 1, 1)
    override mSphereRadius = 0
    constructor() { super() }
}
export class StaticPhysDSG extends IEntityDSG {
    _color: Color = colorNewFromRGBA(Math.random(), Math.random(), Math.random(), 1)
    mpSimStateObj: SimState
    mPosn: vec3
    mBBox: AABB
    mSphere: any
    SetSimState(ipCollObj: SimState) {
        this.OnSetSimState(ipCollObj)
    }
    OnSetSimState(ipSimState: SimState) {
        this.mpSimStateObj = ipSimState
        this.SetInternalState()
    }
    SetInternalState() {
        this.mPosn = this.mpSimStateObj.GetCollisionObject().GetCollisionVolume().mPosition!

        // this.mBBox.low   = this.mPosn
        // this.mBBox.high  = this.mPosn
        // this.mBBox.high += this.mpSimStateObj.GetCollisionObject().GetCollisionVolume().mBoxSize
        // this.mBBox.low  -= this.mpSimStateObj.GetCollisionObject().GetCollisionVolume().mBoxSize

        // this.mSphere.centre.Sub(this.mBBox.high, this.mBBox.low)
        // this.mSphere.centre *= 0.5
        // this.mSphere.centre.Add(this.mBBox.low)
        // this.mSphere.radius = this.mpSimStateObj.GetCollisionObject().GetCollisionVolume().mSphereRadius
    }
}
type SimControlEnum = any
export class SimState {
    mTransform: mat4 = mat4.identity(mat4.create())
    mCollisionObject: CollisionObject | null = null
    mScale = 1.0
    constructor(public mControl?: SimControlEnum) { }
    SetCollisionObject(inObject: CollisionObject) {
        this.mCollisionObject = inObject
    }
    static CreateStaticSimState(inCollisionObject: CollisionObject): SimState {
        return SimState.CreateSimState(inCollisionObject, null)
    }
    static CreateSimState(collObj: CollisionObject, simOBj: any): SimState {
        const simState = new SimState
        if (collObj) {
            // collObj.SetSimState(simState)
            simState.SetCollisionObject(collObj)
        }
        return simState
    }
    GetCollisionObject(): CollisionObject { return this.mCollisionObject! }
}
export class Locator extends IEntityDSG {
    mLocation: vec3
    mData: number
    mEventType: LocatorEvent.Event
    SetNumTriggers(num: number) {}
    AddTriggerVolume(volume: TriggerVolume) {}
}
export class TriggerLocator extends Locator {
    mTriggerVolumes: TriggerVolume[] = []
    mPlayerEntered: boolean = false
    mMaxNumTriggers: number = 0
    override AddTriggerVolume(volume: TriggerVolume) {
        // assert(this.mMaxNumTriggers >= this.mTriggerVolumes.length)
        if (volume != null) this.mTriggerVolumes.push(volume)
    }
    override SetNumTriggers(num: number) {
        // this.mTriggerVolumes = Array.from({ length: num }, () => new TriggerVolume)
        // this.mMaxNumTriggers = num
    }
}
export class EventLocator extends TriggerLocator { }
export class ZoneEventLocator extends EventLocator {
    mZoneSize: number = 0
    mInteriorSection: number = 0
    mInteriorLoad: boolean = false
    mInteriorDump: boolean = false
    mZone: string
    mLoadZones: number[]
    mDumpZones: number[]
    mLWSActivates: number[]
    mLWSDeactivates: number[]

    // SetEventType(LocatorEvent.DYNAMICZONE)
    SetZone(zone: string) {
        this.mZone = zone

        this.mLoadZones =      []//Array.from({ length: this.mZoneSize/6 }, () => 0)
        this.mDumpZones =      []//Array.from({ length: this.mZoneSize/6 }, () => 0)
        this.mLWSDeactivates = []//Array.from({ length: this.mZoneSize/6 }, () => 0)
        this.mLWSActivates =   []//Array.from({ length: this.mZoneSize/6 }, () => 0)

        for(let startPosn = 0, i = 0; i < zone.length; i++) {
            switch(this.mZone[i]) {
                case ';':
                    this.mLoadZones.push(startPosn)
                    i++
                    startPosn = i
                    break
                case ':':
                    this.mDumpZones.push(startPosn)
                    i++
                    startPosn = i
                    break
                case '@':
                    this.mInteriorLoad = true;
                    this.mInteriorSection = startPosn
                    this.mLoadZones.push(startPosn)
                    i++
                    startPosn = i
                    break
                case '$':
                    this.mInteriorDump = true;
                    this.mDumpZones.push(startPosn)
                    i++
                    startPosn = i
                    break
                case '&':
                    this.mLWSDeactivates.push(startPosn)
                    i++
                    startPosn = i
                    break
                case '*':
                    this.mLWSActivates.push(startPosn)
                    i++
                    startPosn = i
                    break
                case '\0':
                    break
                default: 
                    break
            }
        }
    }
}
export class TriggerVolume extends IEntityDSG {
    numVerts: number
    numFaces: number
    verts: vec3[]
    faces: number[]
    mLocator: TriggerLocator
    mPosition: vec3
    mRadius: number
}
export namespace TriggerVolume {
    export enum Type {
        SPHERE,
        RECTANGLE
    }
}
export class SphereTriggerVolume extends TriggerVolume { }
export class RectTriggerVolume extends TriggerVolume {
    constructor(public override mPosition: vec3, 
                public mAxisX: vec3, 
                public mAxisY: vec3, 
                public mAxisZ: vec3,
                public mExtentX: number,
                public mExtentY: number,
                public mExtentZ: number) {
        super()
        this.mRadius = Math.sqrt(Math.pow(mExtentX, 2)
                               + Math.pow(mExtentY, 2)
                               + Math.pow(mExtentZ, 2))
    }
}
export class StaticEntityDSG {
    mTranslucent: boolean = false
    // mpDrawstuff: tGeometry
}
/*export class tGeometry extends IEntityDSG {
    primGroup: (tPrimGroup | null)[] = []
    box: { low: vec3, high: vec3 }
    sphere: { centre: vec3, radius: number }
    constructor(nPG: number) {
        super()
        this.primGroup = Array.from({ length: nPG }, () => null)
    }
    SetBoundingSphere(centerx: number, centery: number, centerz: number, radius: number) {
        this.sphere.centre = vec3.fromValues(centerx, centery, centerz)
        this.sphere.radius = radius
    }
    SetBoundingBox(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, ) {
        this.box.low  = vec3.fromValues(x1, y1, z1)
        this.box.high = vec3.fromValues(x2, y2, z2)
    }
}
class tPrimGroup { }
class tPrimGroupOptimised {
    constructor(i: number) { }
    SetShader = (i: any) => { }
    SetPrimType = (i: any) => { }
    SetVertexFormat = (i: number) => { }
}
class tPrimGroupSkinnedOptimised {
    constructor(i: number) { }
    SetShader = (i: any) => { }
    SetPrimType = (i: any) => { }
    SetVertexFormat = (i: number) => { }
}
class pddiPrimBufferStream { }
const PddiNumColourSets = (i: number) => { }
export class tPrimGroupLoader {
    mVertexFormat: number
    mVertexFormatMask: number
    mVertexCount: number
    mShader: any
    mPrimType: any
    Load(f: tChunkFile, bones: mat4, optimize: boolean, deform: boolean): tPrimGroup | null {
        // pddiExtHardwareSkinning* hwSkin = p3d::context->GetHardwareSkinning();
        // if (!ParseHeader) return null
        // if (bones && !hwSkin) { ... }
        // else if (!optimise) { ... }
        const tmpPositions = vec3.create()
        // if deform { ... }
        const version = undefined
        const param = undefined
        const bufferSize = undefined
        let primGroup: tPrimGroupOptimised | tPrimGroupSkinnedOptimised
        if (bones) { primGroup = new tPrimGroupSkinnedOptimised(this.mVertexCount)}
        else { primGroup = new tPrimGroupOptimised(this.mVertexCount) }
        // let primBuffer: pddiPrimBuffer
        let primBufferInitialized = false
        primGroup.SetShader(this.mShader)
        primGroup.SetPrimType(this.mPrimType)
        primGroup.SetVertexFormat(this.mVertexFormatMask)

        const nColourChannels = PddiNumColourSets(this.mVertexFormat)
        const nUVChannel = this.mVertexFormat & 0xf
        let stream: pddiPrimBufferStream | null = null
        let memoryImaged = false

        while (f.chunks_remaining()) {
            f.begin_chunk()
            switch (f.get_current_id()) {
                case Pure3D.Mesh.MEMORYIMAGEVERTEXLIST: {
                    memoryImaged = true
                    primBufferInitialized = true
                    // pddiPrimBufferDesc desc(mPrimType, mVertexFormat, mVertexCount, mIndexCount);
                    desc.SetMemoryImaged(true)
                    desc.SetMatrixCount(this.mMatrixCount)
                    // primBuffer  = p3d::device->NewPrimBuffer(&desc)
                    primGroup.SetBuffer(primBuffer)
                    break
                }
                case Pure3D.Mesh.POSITIONLIST:
                case Pure3D.Mesh.NORMALLIST:
                case Pure3D.Mesh.PACKEDNORMALLIST:
                case Pure3D.Mesh.COLOURLIST:
                case Pure3D.Mesh.UVLIST: {
                    if (!primBufferInitialized) {
                        primBufferInitialized = true
                        // pddiPrimBufferDesc desc(mPrimType, mVertexFormat, mVertexCount, mIndexCount);
                        decodeString.SetMatrixCount(this.mMatrixCount)
                        // primBuffer  = p3d::device->NewPrimBuffer(&desc)
                        primGroup.SetBuffer(primBuffer)
                        break
                    }
                }
                default:
                    break
            }
            if (primBufferInitialized) { 
                assert(false, `stream = primBuffer.Lock() :(`)
                // stream = primBuffer.Lock()
            }
            switch (f.get_current_id()) {
                case Pure3D.Mesh.POSITIONLIST: {
                    const count = f.real_file.i32()
                    for (let a = 0; a < count; a++) {
                        const v = vec3.fromValues(f.real_file.f32(), f.real_file.f32(), f.real_file.f32())
                        // stream.Coord(v[0], v[1], v[2])
                        // if (tmpPositoins) { tmpPositions[a] = v}
                    }
                    break
                }
                case Pure3D.Mesh.NORMALLIST: {
                    if (!(this.mVertexFormat & PDDI_V_NORMAL)) break
                    const count = f.real_file.i32()
                    for (let a = 0; a < count; a++) {
                        const v = vec3.fromValues(f.real_file.f32(), f.real_file.f32(), f.real_file.f32())
                        stream!.Normal(v[0], v[1], v[2])
                        stream!.Next()
                    }
                    break
                }
                case Pure3D.Mesh.COLOURLIST: {
                    if (!(this.mVertexCount & PDDI_V_COLOUR)) break
                    const count = f.real_file.i32()
                    for (let a = 0; a < count; a++) {
                        const v = vec3.fromValues(f.real_file.f32(), f.real_file.f32(), f.real_file.f32())
                        stream!.Colour(v[0], v[1], v[2])
                        stream!.Next()
                    }
                    break
                }
                case Pure3D.Mesh.MULTICOLOURLIST: {
                    if (!(this.mVertexFormat & PDDI_V_COLOUR2)) break
                    const count = f.real_file.i32()
                    const channel = f.real_file.i32()
                    if (channel >= this.nColourChannels) break
                    assert(count == this.mVertexCount)
                    for (let a = 0; a < count; a++) {
                        const c = f.real_file.f32()
                        stream!.Colour(c, channel)
                        stream!.Next()
                    }
                    break
                }
                case Pure3D.Mesh.UVLIST: {
                    const count = f.real_file.i32()
                    const channel = f.real_file.i32()
                    if (channel >= nUVChannel) break
                    assert(count == this.mVertexCount)
                    for (let a = 0; a < count; a++) { 
                        const u = f.real_file.f32()
                        const v = f.real_file.f32()
                        stream!.UV(u, v, channel)
                        stream!.Next()
                    }
                    break
                }
                case Pure3D.Mesh.INDEXLIST: {
                    const count = f.real_file.i32()
                    const tempIndexList = nArray(count, () => 0)
                    for (let a = 0; a < count; a++) {
                        tempIndexList[a] = f.real_file.i32()
                    }
                    primBuffer.SetIndices(tempIndexList, count)
                    p3d.FreeTemp(tempIndexList)
                    break
                }
                case Pure3D.Mesh.WEIGHTLIST: {
                    const count = f.real_file.i32()
                    // let weight: number[] = []
                    for (let a = 0; a < count; a++) {
                        const weight = vec3.fromValues(f.real_file.f32(), f.real_file.f32(), f.real_file.f32())
                        stream.SkinWeights(weight[0], weight[1], weight[2])
                        stream.Next()
                    }
                    break
                }
                case Pure3D.Mesh.MATRIXLIST: {
                    const count = f.real_file.i32()
                    for (let a = 0; a < count; a++) {
                        const index = [f.real_file.i8(), f.real_file.i8(), f.real_file.i8(), f.real_file.i8()]
                        stream.SkinIndices(index[3], index[2], index[1], index[0])
                        stream.Next()
                    }
                    break
                }
                case Pure3D.Mesh.MATRIXPALETTE: {
                    const count = f.real_file.i32()
                    const skin = primGroup as tPrimGroupSkinnedOptimised
                    skin.nMatrices = count
                    skin.matrixPalette = nArray(count, () => mat4.create())
                    for (let a = 0; a < count; a++) {
                        const index = f.real_file.i32()
                        skin.matrixPalette[a] = bones[index]
                    }
                    break
                }
                case Pure3D.Mesh.INSTANCEINFO: {
                    primGroup.instanceCount = f.real_file.i32()
                    const vCount = f.real_file.i32()
                    const iCount = f.real_file.i32()
                    primGroup.instanceSize = (this.mIndexCount > 0) ? iCount : vCount
                    break
                }
                case Pure3D.Mesh.MEMORYIMAGEVERTEXLIST: {
                    assert(false, `Pure3D.Mesh.MEMORYIMAGEVERTEXLIST :(`)
                    // memoryImage = true
                    // const version = f.real_file.i32()
                    // const param = f.real_file.i32()
                    // const bufferSize = f.real_file.i32()
                    // primBufferInitialized.SetMemImageParam(f.get_current_id(), param)
                    // let ptr = primBuffer.LockMemImage(bufferSize)
                    // ptr = nArray(bufferSize, () => f.real_file.i8())
                    // primBufferInitialized.UnlockMemImage()
                    // break
                }
                case Pure3D.Mesh.MEMORYIMAGEVERTEXDESCRIPTIONLIST: {
                    assert(false, `Pure3D.Mesh.MEMORYIMAGEVERTEXDESCRIPTIONLIST :(`)
                    // memoryImaged = true
                    // const version = f.real_file.i32()
                    // const param = f.real_file.i32()
                    // const bufferSize = f.real_file.i32()
                    // primBuffer.SetMemImageParam(f.get_current_id(), param)
                    // let prt = primBuffer.LockMemImage(bufferSize);
                    // ptr = nArray(bufferSize, () => f.real_file.i8())
                    // primBufferInitialized.UnlockMemImage()
                    // break
                }
                case Pure3D.Mesh.MEMORYIMAGEINDEXLIST: {
                    assert(false, `Pure3D.Mesh.MEMORYIMAGEINDEXLIST :(`)
                    // memoryImage = true
                    // const version = f.real_file.i32()
                    // const param = f.real_file.i32()
                    // const bufferSize = f.real_file.i32()
                    // primBuffer.SetMemImageParam(f.get_current_id(), param)
                    // let index = primBuffer.LockIndexBuffer(bufferSize);
                    // index = nArray(bufferSize, () => f.real_file.i8())
                    // primBufferInitialized.UnlockIndexBuffer()
                    // break
                }
                default:
                    break
            }
            if (stream) {
                primBufferInitialized.Unlock(stream)
                stream = null
            }
            f.end_chunk()
        }
        if (primGroup && tmpPositions)
            primGroup.tempPositions = tmpPositions
        primBufferInitialized.Finalize()

        return primGroup
    }
    SetVertexFormatMask(m: number) { this.mVertexFormatMask = m }
}
export class tGeometryLoader extends tSimpleChunkHandler implements IEntityDSG {
    mVertexMask: number = 0xffff_ffff
    mEnableFaceNormals: boolean = false
    LoadObject(f: tChunkFile): IEntityDSG {
        const name = f.real_file.get_nstring()
        const version = f.real_file.i32()
        // bool bOptimized = ( version != GEOMETRY_NONOPTIMIZE_VERSION );
        const nPrimGroup = f.real_file.i32()
        const Allocate = (nPrimGroup: number) => new tGeometry(nPrimGroup)
        const geo = Allocate(nPrimGroup)
        geo.name = name
        
        let primGroupCount = 0

        while (f.chunks_remaining()) {
            f.begin_chunk()
            switch (f.get_current_id()) {
                case Pure3D.Mesh.PRIMGROUP: {
                    const pgLoader = new tPrimGroupLoader
                    pgLoader.SetVertexFormatMask(mVertexMask)
                    const pg: tPrimGroup = pgLoader.Load(f, NULL, mOptimize && bOptimized, false)
                    geo.SetPrimGroup(primGroupCount, pg)
                    ++primGroupCount
                    break
                }
                case Pure3D.Mesh.BOX: {
                    const minx = f.real_file.f32()
                    const miny = f.real_file.f32()
                    const minz = f.real_file.f32()
                    const maxx = f.real_file.f32()
                    const maxy = f.real_file.f32()
                    const maxz = f.real_file.f32()

                    geo.SetBoundingBox(minx, miny, minz, maxx, maxy, maxz)
                    break
                }
                case Pure3D.Mesh.SPHERE: {
                    const cx = f.real_file.f32()
                    const cy = f.real_file.f32()
                    const cz = f.real_file.f32()
                    const  r = f.real_file.f32()
                    geo.SetBoundingSphere(cx, cy, cz, r)
                    break
                }
                case Pure3D.Mesh.RENDERSTATUS: {
                    geo.SetCastsShadow(!(f.real_file.i32() as unknown as boolean))
                }
                default:
                    break
            }
            f.end_chunk()
        }

        return geo
    }
}
*/

export class PathManager {
    static MAX_PATHS = 125
    static mInstance: PathManager | null = null
    mPaths: Path[] = []
    mnPaths: number = 0
    mNextFreePath: number = 0
    // static GetInstance() {
    //     if (PathManager.mInstance == null) { PathManager.mInstance = new PathManager }
    //     return PathManager.mInstance }
    constructor() { this.AllocatePaths(PathManager.MAX_PATHS) }
    AllocatePaths(nPaths: number) {
        this.mnPaths = nPaths
        this.mPaths = nArray(nPaths, () => new Path)
    }
    GetFreePath() {
        this.mNextFreePath++
        return this.mPaths[this.mNextFreePath-1]
    }
}
export class PathSegment extends IEntityDSG {
    mParentPath: Path
    mIndexToParentPath: number
    mStartPos: vec3
    mEndPos: vec3
    mRadius: number
    Initialize(parent: Path, index: number, start: vec3, end: vec3) {
        this.mParentPath = parent
        this.mIndexToParentPath = index
        this.mStartPos = start
        this.mEndPos = end
        const tmp = vec3.create()
        vec3.sub(tmp, this.mEndPos, this.mStartPos)
        this.mRadius = vec3.length(tmp) / 2
    }
}
class Path {
    static MAX_PEDESTRIANS = 3
    mIsClosed: boolean = false
    mNumPathSegments: number = 0
    mNumPeds: number = 0
    mPathSegments: PathSegment[] = []
    AllocateSegments(nSegments: number) {
        this.mPathSegments = nArray(nSegments, () => new PathSegment)
        this.mNumPathSegments = nSegments
    }
    GetPathSegmentByIndex(index: number): PathSegment {
        return this.mPathSegments[index]
    }
    SetIsClosed(isClosed: boolean) {
        this.mIsClosed = isClosed
    }
}
export enum CollisionVolumeTypeEnum {
    CollisionVolumeType = 0,
    SphereVolumeType,
    CylinderVolumeType,
    OBBoxVolumeType,
    WallVolumeType,
    BBoxVolumeType,
    MaxCollisionVolumeEnum
}
enum VolAxisOrientation {
    VolAxisNotOriented = 0,
    VolAxisOriented,
    VolAxisXOriented,
    VolAxisYOriented,
    VolAxisZOriented
}
export namespace LocatorType {
    export enum Type {
        EVENT,
        SCRIPT,
        GENERIC,
        CAR_START,
        SPLINE,
        DYNAMIC_ZONE,
        OCCLUSION,
        INTERIOR_ENTRANCE,
        DIRECTIONAL,
        ACTION,
        FOV,
        BREAKABLE_CAMERA,
        STATIC_CAMERA,
        PED_GROUP,
        COIN,
        SPAWN_POINT,

        NUM_TYPES
    }

    const Name: string[] = [
        "Event",
        "Script",
        "Generic",
        "Car Start",
        "Spline",
        "Dynamic Zone",
        "Occlusion",
        "Interior Entrance",
        "Directional",
        "Action",
        "FOV",
        "Breakable Camera",
        "Static Camera",
        "Ped Group",
        "Coin",
        "Spawn Point"
    ]
}
export namespace LocatorEvent {
    export enum Event {
        FLAG,           //Capture the flag - Flag
        CAMERA_CUT,     //Used for static position cameras
        CHECK_POINT,    //Used by missions
        BASE,           //Capture the flag - Base
        DEATH,          //Death Zones!
        INTERIOR_EXIT,  //Leave an interior environment
        BOUNCEPAD,      // Bounce the character towards the locator.
        //
        // Trigger a change of ambient sound
        //
        AMBIENT_SOUND_CITY,
        AMBIENT_SOUND_SEASIDE,
        AMBIENT_SOUND_SUBURBS,
        AMBIENT_SOUND_FOREST,
        AMBIENT_KWIK_E_MART_ROOFTOP,
        AMBIENT_SOUND_FARM,
        AMBIENT_SOUND_BARN,
        AMBIENT_SOUND_POWERPLANT_EXTERIOR,
        AMBIENT_SOUND_POWERPLANT_INTERIOR,
        AMBIENT_SOUND_RIVER,

        AMBIENT_SOUND_CITY_BUSINESS,
        AMBIENT_SOUND_CONSTRUCTION,
        AMBIENT_SOUND_STADIUM,
        AMBIENT_SOUND_STADIUM_TUNNEL,
        AMBIENT_SOUND_EXPRESSWAY,
        AMBIENT_SOUND_SLUM,
        AMBIENT_SOUND_RAILYARD,
        AMBIENT_SOUND_HOSPITAL,

        AMBIENT_SOUND_LIGHT_CITY,
        AMBIENT_SOUND_SHIPYARD,
        AMBIENT_SOUND_QUAY,
        AMBIENT_SOUND_LIGHTHOUSE,
        AMBIENT_SOUND_COUNTRY_HIGHWAY,
        AMBIENT_SOUND_KRUSTYLU,
        AMBIENT_SOUND_DAM,

        AMBIENT_SOUND_FOREST_HIGHWAY,
        AMBIENT_SOUND_RETAINING_WALL_TUNNEL,
        AMBIENT_SOUND_KRUSTYLU_EXTERIOR,
        AMBIENT_SOUND_DUFF_EXTERIOR,
        AMBIENT_SOUND_DUFF_INTERIOR,

        AMBIENT_SOUND_STONE_CUTTER_TUNNEL,
        AMBIENT_SOUND_STONE_CUTTER_HALL,
        AMBIENT_SOUND_SEWERS,
        AMBIENT_SOUND_BURNS_TUNNEL,
        AMBIENT_SOUND_PP_ROOM_1,
        AMBIENT_SOUND_PP_ROOM_2,
        AMBIENT_SOUND_PP_ROOM_3,
        AMBIENT_SOUND_PP_TUNNEL_1,
        AMBIENT_SOUND_PP_TUNNEL_2,
        AMBIENT_SOUND_MANSION_INTERIOR,
        
        PARKED_BIRDS,
        
        WHACKY_GRAVITY,
        
        FAR_PLANE,

        AMBIENT_SOUND_COUNTRY_NIGHT,
        AMBIENT_SOUND_SUBURBS_NIGHT,
        AMBIENT_SOUND_FOREST_NIGHT,
        
        AMBIENT_SOUND_HALLOWEEN1,
        AMBIENT_SOUND_HALLOWEEN2,
        AMBIENT_SOUND_HALLOWEEN3,
        AMBIENT_SOUND_PLACEHOLDER3,
        AMBIENT_SOUND_PLACEHOLDER4,
        AMBIENT_SOUND_PLACEHOLDER5,
        AMBIENT_SOUND_PLACEHOLDER6,
        AMBIENT_SOUND_PLACEHOLDER7,
        AMBIENT_SOUND_PLACEHOLDER8,
        AMBIENT_SOUND_PLACEHOLDER9,

        GOO_DAMAGE,
        COIN_ZONE,
        LIGHT_CHANGE,
        TRAP,

        AMBIENT_SOUND_SEASIDE_NIGHT,
        AMBIENT_SOUND_LIGHTHOUSE_NIGHT,
        AMBIENT_SOUND_BREWERY_NIGHT,
        AMBIENT_SOUND_PLACEHOLDER10,
        AMBIENT_SOUND_PLACEHOLDER11,
        AMBIENT_SOUND_PLACEHOLDER12,
        AMBIENT_SOUND_PLACEHOLDER13,
        AMBIENT_SOUND_PLACEHOLDER14,
        AMBIENT_SOUND_PLACEHOLDER15,
        AMBIENT_SOUND_PLACEHOLDER16,
        
        SPECIAL, //This denotes the end of the regular events. Only the World builder
                 //Uses this, please add events before this that you want to show up as 
                 //normal info-less events, all events after this are specialy controlled
                 //in the worldbuilder.

        DYNAMIC_ZONE = SPECIAL, //This is used in a special locator only for dynamic loading.

        OCCLUSION_ZONE,

        CAR_DOOR,           //This is only used to detect when the player is close enough to a car.
        ACTION_BUTTON,      //This is for Object switches
        INTERIOR_ENTRANCE,  //This is for going into interiors
        GENERIC_BUTTON_HANDLER_EVENT,
		FOUNTAIN_JUMP,
        LOAD_PED_MODEL_GROUP,
        GAG,
        
        NUM_EVENTS
    }
    const Name: string[] = [
        "Flag",
        "Camera Cut",
        "Check Point",
        "Base",
        "Death",
        "Interior Exit",
        "Bounce Pad",
        "Ambient Sound - City",
        "Ambient Sound - Seaside",
        "Ambient Sound - Suburbs",
        "Ambient Sound - Forest",
        "Ambient Sound - KEM Rooftop",
        "Ambient Sound - Farm",
        "Ambient Sound - Barn",
        "Ambient Sound - PP - Interior",
        "Ambient Sound - PP - Exterior",
        "Ambient Sound - River",

        "Ambient Sound - Business",
        "Ambient Sound - Construction",
        "Ambient Sound - Stadium",
        "Ambient Sound - Stadium Tunnel",
        "Ambient Sound - Expressway",
        "Ambient Sound - Slum",
        "Ambient Sound - Railyard",
        "Ambient Sound - Hospital",

        "Ambient Sound - Light City",
        "Ambient Sound - Shipyard",
        "Ambient Sound - Quay",
        "Ambient Sound - Lighthouse",
        "Ambient Sound - Country Highway",
        "Ambient Sound - Krustylu",
        "Ambient Sound - Dam",
        
        "Ambient Sound - Forest Highway",
        "Ambient Sound - Retaining Wall",
        "Ambient Sound - Krustylu Ext.",
        "Ambient Sound - Duff Exterior",
        "Ambient Sound - Duff Interior",

        "Ambient Sound - Stonecutter Tunnel",
        "Ambient Sound - stonecutter Hall",
        "Ambient Sound - Sewers",
        "Ambient Sound - Burns Tunnel",
        "Ambient Sound - PP Room 1",
        "Ambient Sound - PP Room 2",
        "Ambient Sound - PP Room 3",
        "Ambient Sound - PP Tunnel 1",
        "Ambient Sound - PP Tunnel 2",
        "Ambient Sound - Mansion Interior",

        "Park Birds",
        "Whacky Gravity",
        "Far Plane Change",
        
        "Ambient Sound - Country Night",
        "Ambient Sound - Suburbs Night",
        "Ambient Sound - Forest Night",

        "Ambient Sound - Halloween1",
        "Ambient Sound - Halloween2",
        "Ambient Sound - Halloween3",
        "Ambient Sound - Placeholder3",
        "Ambient Sound - Placeholder4",
        "Ambient Sound - Placeholder5",
        "Ambient Sound - Placeholder6",
        "Ambient Sound - Placeholder7",
        "Ambient Sound - Placeholder8",
        "Ambient Sound - Placeholder9",

        "Goo Damage",
        "Coin Zone",        //Not used, just loaded.
        "Light Change",
        "Trap",

        "Ambient Sound - Seaside Night",
        "Ambient Sound - Lighthouse Night",
        "Ambient Sound - Brewery Night",
        "Ambient Sound - Placeholder10",
        "Ambient Sound - Placeholder11",
        "Ambient Sound - Placeholder12",
        "Ambient Sound - Placeholder13",
        "Ambient Sound - Placeholder14",
        "Ambient Sound - Placeholder15",
        "Ambient Sound - Placeholder16",

        //This and below not used in any offline tool!
        "Dynamic Zone",
        "Occlusion Zone",
        "Car Door",         
        "Action Button",
        "Interior Entrance",
        "Start Bonus Mission Dialogue",
        "Talk to Character",
		"Jump on Fountain",
        "Load Pedestrian Model Group",
        "Gag"
    ]
}
