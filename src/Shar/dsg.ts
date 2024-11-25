import { assert } from '../util.js'
import { vec3, mat4, vec4 } from 'gl-matrix'
import { read_vec3 } from './reader.js'
import { SRR2 } from './srrchunks.js'
import { Pure3D, Simulation } from './chunkids.js'
import { tSimpleChunkHandler, tChunkFile } from './file.js'
import { Sc, WorldScene } from './world.js'
import { AABB } from '../Geometry.js'
import { Color, colorNewFromRGBA } from '../Color.js'

type spatial_node = { axis: number, pos: number }
const AXIS_ALIGNED_SNAPPING_FACTOR: number = 0.9999

export class tEntity {
    name: string
}
export class Tree extends tEntity implements tSimpleChunkHandler {
    n_nodes: number
    bounds_min: vec3
    bounds_max: vec3
    nodes: spatial_node[] = []

    load_object(sc: Sc, sector: number, f: tChunkFile): tEntity {
        const tree = new Tree
        tree.n_nodes = f.real_file.i32()
        tree.bounds_min = read_vec3(f.real_file)
        tree.bounds_max = read_vec3(f.real_file)

        while (f.chunks_remaining()) {
            f.begin_chunk()
            switch (f.get_current_id()) {
                case SRR2.ChunkID.CONTIGUOUS_BIN_NODE: {
                    const sub_tree_size = f.real_file.i32()
                    const parent_offset = f.real_file.i32()

                    f.begin_chunk()
                    switch (f.get_current_id()) {
                        case SRR2.ChunkID.SPATIAL_NODE: {
                            const axis = f.real_file.i8()
                            const pos = f.real_file.f32()
                            const sentity_elems = f.real_file.i32()
                            const sphys_elems = f.real_file.i32()
                            const intersect_elems = f.real_file.i32()
                            const dphys_elems = f.real_file.i32()
                            const fence_elems = f.real_file.i32()
                            const roadsegment_elems = f.real_file.i32()
                            const pathsegment_elems = f.real_file.i32()
                            const anim_elems = f.real_file.i32()
                            tree.nodes.push({ axis, pos })
                            f.end_chunk()
                            break
                        }
                    }
                }
            }
            f.end_chunk()
        }
        sc.scene.set_tree(tree)
        return new tEntity
    }
}
export class Fence extends tEntity implements tSimpleChunkHandler {
    start: vec3
    end: vec3
    normal: vec3

    load_object(sc: Sc, sector: number, f: tChunkFile): tEntity {
        f.begin_chunk()
        const fence = new Fence
        switch (f.get_current_id()) {
            case SRR2.ChunkID.WALL: {
                fence.start = read_vec3(f.real_file)
                fence.end = read_vec3(f.real_file)
                fence.normal = read_vec3(f.real_file)
            }
        }
        f.end_chunk()
        sc.scene.place_fence(fence)
        return fence
    }
}
export class Intersect extends tEntity implements tSimpleChunkHandler {
    mTriIndices: number[] = []
    mTriPts: vec3[] = []
    mTriNorms: vec3[] = []
    mTerrainType: number[] = []

    load_object(sc: Sc, sector: number, f: tChunkFile): tEntity {
        const pIDSG = new Intersect

        let size = f.real_file.i32()
        for (let i = 0; i < size; i++) {
            pIDSG.mTriIndices.push(f.real_file.i32())
        }
        size = f.real_file.i32()
        for (let i = 0; i < size; i++) {
            pIDSG.mTriPts.push(read_vec3(f.real_file))
        }
        size = f.real_file.i32()
        for (let i = 0; i < size; i++) {
            pIDSG.mTriNorms.push(read_vec3(f.real_file))
        }
        while (f.chunks_remaining()) {
            f.begin_chunk()
            switch (f.get_current_id()) {
                case Pure3D.Mesh.BOX: {
                    const minx = f.real_file.f32()
                    const miny = f.real_file.f32()
                    const minz = f.real_file.f32()
                    const maxx = f.real_file.f32()
                    const maxy = f.real_file.f32()
                    const maxz = f.real_file.f32()

                    // pIDSG.SetBoundingBox(minx, miny, minz, maxx, maxy, maxz)
                    break
                }
                case Pure3D.Mesh.SPHERE: {
                    const cx = f.real_file.f32()
                    const cy = f.real_file.f32()
                    const cz = f.real_file.f32()
                    const r = f.real_file.f32()

                    // pIDSG.SetBoundingSphere(cx, cy, cz, r)
                    break
                }
                case SRR2.ChunkID.TERRAIN_TYPE: {
                    const version = f.real_file.i32()
                    size = f.real_file.i32()
                    for (let i = 0; i < size; i++) {
                        pIDSG.mTerrainType.push(f.real_file.u8())
                    }
                    break
                }
                default:
                    break
            } // switch
            f.end_chunk()
        }
        // mpListenerCB.OnChunkLoaded( pIDSG, mUserData, _id )
        assert(sc.scene.sectors[sector] != null)
        sc.scene.sectors[sector].place_intersect(pIDSG)

        return new tEntity// NULL//pIDSG
    }
}
export class CollisionObject extends tEntity implements tSimpleChunkHandler {
    nStringData: string
    mNumJoint: number
    mIsStatic: boolean
    mDefaultArea: number
    mCollisionVolumeOwner: CollisionVolumeOwner | null = null
    mCollisionVolume: CollisionVolume | null = null
    mSimState: SimState
    mSelfCollisionList: SelfCollision[] = []

    load_object(sc: Sc, sector: number, f: tChunkFile): tEntity {
        const newCollisionObject = new CollisionObject
        newCollisionObject.mCollisionVolumeOwner = new CollisionVolumeOwner

        newCollisionObject.name = f.real_file.get_nstring()
        const version = f.real_file.i32()

        newCollisionObject.nStringData = f.real_file.get_nstring()
        newCollisionObject.mNumJoint = f.real_file.i32()
        let currentOwner = 0
        const numOwner = f.real_file.i32()
        newCollisionObject.mCollisionVolumeOwner.SetNumOwnerList(numOwner)

        while (f.chunks_remaining()) {
            f.begin_chunk()
            switch (f.get_current_id()) {
                case Simulation.Collision.OWNER: {
                    const numNames = f.real_file.i32()
                    if (numNames > 0) {
                        newCollisionObject.mCollisionVolumeOwner.mOwnerList//[currentOwner]
                            = Array.from({ length: numNames }, () => '')
                        while (f.chunks_remaining()) {
                            f.begin_chunk();
                            switch (f.get_current_id()) {
                                case Simulation.Collision.OWNERNAME: {
                                    const newName = f.real_file.get_nstring()
                                    newCollisionObject.mCollisionVolumeOwner.mOwnerList[currentOwner]
                                        // .push(tEntity.MakeUID(newName))
                                        // .push(newName)
                                        = newName
                                    break
                                }
                            }
                            f.end_chunk()
                        }
                    }
                    currentOwner++
                    break
                }
                case Simulation.Collision.SELFCOLLISION: {
                    const index1 = f.real_file.i32()
                    const index2 = f.real_file.i32()
                    const self1 = f.real_file.u16() == 0 ? false : true
                    const self2 = f.real_file.u16() == 0 ? false : true
                    newCollisionObject.AddSelfCollision(index1, index2, self1, self2)
                    break
                }
                case Simulation.Collision.VOLUME: {
                    const collisionVolume: CollisionVolume = this.LoadCollisionVolume(f)
                    // assert(collisionVolume, 'oops!')
                    newCollisionObject.SetCollisionVolume(collisionVolume)
                    break
                }
                case Simulation.Collision.ATTRIBUTE: {
                    newCollisionObject.mIsStatic = f.real_file.u16() == 0 ? false : true
                    newCollisionObject.mDefaultArea = f.real_file.i32()
                    const canRoll = f.real_file.u16() == 0 ? false : true
                    const canSlide = f.real_file.u16() == 0 ? false : true
                    const canSpin = f.real_file.u16() == 0 ? false : true
                    const canBounce = f.real_file.u16() == 0 ? false : true
                    const extraAttribute1 = f.real_file.i32()
                    const extraAttribute2 = f.real_file.i32()
                    const extraAttribute3 = f.real_file.i32()

                    // CollisionAnalyserPossibleEvent possibleEvent = cCollisionAnalyserPossibleEventAll
                    // if (!canRoll)   possibleEvent -= cCollisionAnalyserPossibleEventRolling
                    // if (!canSlide)  possibleEvent -= cCollisionAnalyserPossibleEventSliding
                    // if (!canSpin)   possibleEvent -= cCollisionAnalyserPossibleEventSpinning
                    // if (!canBounce) possibleEvent -= cCollisionAnalyserPossibleEventBouncing

                    // newCollisionObject.SetPossibleCollisionEvents(possibleEvent)
                    break
                }
            }
            f.end_chunk()
        }
        // PhysicsProperties* tmpprop = PhysicsProperties.FindPhysicsProperty(stringData, store);
        // PhysicsProperties* tmpprop = NULL
        // if (!tmpprop) {
        //     if (nbSubObject == 0) { tmpprop = PhysicsProperties.DefaultPhysicsProperties(store) }
        //                      else { tmpprop = PhysicsProperties.DefaultArtPhysicsProperties(store) }
        // }
        // newCollisionObject.SetPhysicsProperties(tmpprop)

        assert(sc.scene.sectors[sector] != null)
        // scene.sectors[sector].place_static_phys(newCollisionObject)
        return newCollisionObject
    }
    SetCollisionVolume(inCollisionVolume: CollisionVolume) {
        this.mCollisionVolume = inCollisionVolume
        for (let i = 0; i < this.mSelfCollisionList.length; i++)
            this.SetSelfCollision(this.mSelfCollisionList[i])
    }
    SetSelfCollision(inSelfColl: SelfCollision) {
        inSelfColl.mCollisionVolume1 = this.mCollisionVolume!.GetSubCollisionVolume(inSelfColl.mIndex1, inSelfColl.mSelf1)
        inSelfColl.mCollisionVolume2 = this.mCollisionVolume!.GetSubCollisionVolume(inSelfColl.mIndex2, inSelfColl.mSelf2)
    }
    LoadCollisionVolume(file: tChunkFile): CollisionVolume {
        const objrefIndex = file.real_file.i32();
        const ownerIndex = file.real_file.i32();
        const numSubVolume = file.real_file.i32();

        let newCollisionVolume: CollisionVolume | null = null

        file.begin_chunk()
        switch (file.get_current_id()) {
            case Simulation.Collision.SPHERE: {
                const radius = file.real_file.i32()
                const p: vec3 = LoadVectorFromCollisionVectorChunk(file)
                newCollisionVolume = new SphereVolume(p, radius) as CollisionVolume
                break
            }
            case Simulation.Collision.CYLINDER: {
                const radius = file.real_file.f32()
                const length = file.real_file.f32()
                const flatEnd = file.real_file.u16() == 0 ? false : true
                const p: vec3 = LoadVectorFromCollisionVectorChunk(file)
                const o: vec3 = LoadVectorFromCollisionVectorChunk(file)
                newCollisionVolume = new CylinderVolume(p, o, length, radius, flatEnd) as CollisionVolume
                break
            }
            case Simulation.Collision.OBBOX: {
                const l0 = file.real_file.f32()
                const l1 = file.real_file.f32()
                const l2 = file.real_file.f32()
                const p: vec3 = LoadVectorFromCollisionVectorChunk(file)
                const o0: vec3 = LoadVectorFromCollisionVectorChunk(file)
                const o1: vec3 = LoadVectorFromCollisionVectorChunk(file)
                const o2: vec3 = LoadVectorFromCollisionVectorChunk(file)
                newCollisionVolume = new OBBoxVolume(p, o0, o1, o2, l0, l1, l2) as CollisionVolume
                break
            }
            case Simulation.Collision.WALL: {
                const p: vec3 = LoadVectorFromCollisionVectorChunk(file)
                const n: vec3 = LoadVectorFromCollisionVectorChunk(file)
                newCollisionVolume = new WallVolume(p, n) as CollisionVolume
                break
            }
            case Simulation.Collision.BBOX: {
                newCollisionVolume = new BBoxVolume as CollisionVolume
                const dum = file.real_file.i32()
                break
            }
        }
        file.end_chunk()

        // newCollisionVolume.SetObjRefIndex(objrefIndex)
        // newCollisionVolume.SetOwnerIndex(ownerIndex)
        newCollisionVolume!.mSubVolumeList = Array.from({ length: numSubVolume }, () => null)
        for (let i = 0; i < numSubVolume; i++) {
            file.begin_chunk()
            const newSubCollisionVolume = this.LoadCollisionVolume(file)
            file.end_chunk()
            newCollisionVolume!.AddSubVolume(newSubCollisionVolume)
        }
        // assert(newCollisionVolume)

        // if (numSubVolume) { assert(newCollisionVolume.SubVolumeList().GetSize() == numSubVolume) }
        return newCollisionVolume!
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
class CollisionVolumeOwner {
    mNumOwner: number = 0
    mOwnerList: Array<tUID>
    mVisible: Array<boolean>

    SetNumOwnerList(inNum: number) {
        this.mNumOwner = inNum
        this.mOwnerList = Array.from({ length: this.mNumOwner }, () => 0)
        this.mVisible = Array.from({ length: this.mNumOwner }, () => true)
    }
}
class SelfCollision {
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
export class StaticPhysDSG extends tEntity implements tSimpleChunkHandler {
    mpSimStateObj: SimState
    mPosn: vec3
    mBBox: AABB
    mSphere: any

    color: Color = colorNewFromRGBA(Math.random(), Math.random(), Math.random(), 1)

    load_object(sc: Sc, sector: number, f: tChunkFile): tEntity {
        const name = f.real_file.get_nstring()
        const version = f.real_file.i32()

        const pStaticPhysDSG = new StaticPhysDSG
        pStaticPhysDSG.name = name
        // const pCollAttr: CollisionAttributes | null = null

        while (f.chunks_remaining()) {
            f.begin_chunk()
            switch (f.get_current_id()) {
                case Simulation.Collision.OBJECT: {
                    const pCollObj: CollisionObject = new CollisionObject().load_object(sc, sector, f) as CollisionObject
                    pStaticPhysDSG.SetSimState(SimState.CreateStaticSimState(pCollObj))
                    break
                }
                case SRR2.ChunkID.OBJECT_ATTRIBUTES: {
                    const classType = f.real_file.i32()
                    const physPropID = f.real_file.i32()
                    const tempsound = f.real_file.get_nstring()

                    // pCollAttr = GetATCManager().CreateCollisionAttributes(classType, physPropID, 0.0f);
                    // pCollAttr->SetSound(tempsound);
                    // pStaticPhysDSG.SetCollisionAttributes(pCollAttr)
                    break
                }
            }
            f.end_chunk()
        }

        assert(sc.scene.sectors[sector] != null, '')
        sc.scene.sectors[sector].place_static_phys(pStaticPhysDSG)
        return pStaticPhysDSG
    }
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
class SimState {
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
export class Locator extends tEntity implements tSimpleChunkHandler {
    msZoneNameCount: number = 0
    mLocation: vec3
    load_object(sc: Sc, sector: number, f: tChunkFile): tEntity {
        const name = f.real_file.get_nstring()
        const ttype: LocatorType.Type = f.real_file.u32()
        const numElements = f.real_file.u32()
        const elements = f.real_file.get_slice(numElements * 4)
        const pos: vec3 = vec3.fromValues(f.real_file.f32(), f.real_file.f32(), f.real_file.f32())
        let locator: Locator = new Locator
        const numTriggers = f.real_file.u32()
        const hasSubChunks = true

        if (ttype as number != LocatorType.Type.DYNAMIC_ZONE) return new tEntity
        switch (ttype) {
            case LocatorType.Type.GENERIC: { break }
            case LocatorType.Type.EVENT: { break }
            case LocatorType.Type.SPLINE: { break }
            case LocatorType.Type.DYNAMIC_ZONE: {
                const eventloc = new ZoneEventLocator
                eventloc.mZoneSize = numElements * 4 + 1
                eventloc.SetZone(new TextDecoder('ascii').decode(elements))
                locator = eventloc
                break
            }
            case LocatorType.Type.CAR_START: { break }
            case LocatorType.Type.OCCLUSION: { break }
            case LocatorType.Type.INTERIOR_ENTRANCE: { break }
            case LocatorType.Type.DIRECTIONAL: { break }
            case LocatorType.Type.ACTION: { break }
            case LocatorType.Type.FOV: { break }
            case LocatorType.Type.BREAKABLE_CAMERA: { break }
            case LocatorType.Type.STATIC_CAMERA: { break }
            case LocatorType.Type.PED_GROUP: { break }
            case LocatorType.Type.SCRIPT: { break }
            case LocatorType.Type.COIN: { break }
            default: { break }
        }

        if (locator != null) {
            if (hasSubChunks) {
                locator.SetNumTriggers(numTriggers)
                while (f.chunks_remaining()) {
                    f.begin_chunk()
                    switch (f.get_current_id()) {
                        case SRR2.ChunkID.TRIGGER_VOLUME: {
                            let b = this.LoadTriggerVolume(sc.scene, sector, f, locator as TriggerLocator)
                            if (b == false) return new tEntity
                            break
                        }
                        case SRR2.ChunkID.SPLINE: { break }
                        case SRR2.ChunkID.EXTRA_MATRIX: { break }
                    }
                    f.end_chunk()
                }
            }
            locator.name = name
            locator.mLocation = pos
        }

        if (ttype == LocatorType.Type.DYNAMIC_ZONE) {
            if (name.substring(0, 4) == `load`) {
                this.msZoneNameCount++
                locator.name = `mfa${this.msZoneNameCount}${name}`
            }
        }
        return locator
    }
    LoadTriggerVolume(scene: WorldScene, sector: number, f: tChunkFile, locator: TriggerLocator, addToTracker: boolean = true) {
        let good = true
        if (f.get_current_id() == SRR2.ChunkID.TRIGGER_VOLUME) {
            let vol: TriggerVolume = new TriggerVolume
            const volname = f.real_file.get_nstring()
            const voltype = f.real_file.u32()
            const scale = vec3.fromValues(f.real_file.f32(), f.real_file.f32(), f.real_file.f32())
            const mat = mat4.fromValues(f.real_file.f32(), f.real_file.f32(), f.real_file.f32(), f.real_file.f32(),
                                        f.real_file.f32(), f.real_file.f32(), f.real_file.f32(), f.real_file.f32(),
                                        f.real_file.f32(), f.real_file.f32(), f.real_file.f32(), f.real_file.f32(),
                                        f.real_file.f32(), f.real_file.f32(), f.real_file.f32(), f.real_file.f32())
            const pos = vec3.create()
            mat4.getTranslation(pos, mat)

            switch (voltype) {
                case TriggerVolume.Type.SPHERE: {
                    const sphere = new SphereTriggerVolume
                    sphere.mRadius = scale[0]
                    vol = sphere
                    break
                }
                case TriggerVolume.Type.RECTANGLE: {
                    vol = new RectTriggerVolume(pos,
                                                vec3.fromValues(mat[0], mat[4], mat[8]),
                                                vec3.fromValues(mat[1], mat[5], mat[9]),
                                                vec3.fromValues(mat[2], mat[6], mat[10]),
                                                scale[0], scale[1], scale[2])
                }
            }
            vol.name = volname
            vol.mLocator = locator
            locator.AddTriggerVolume(vol)
            vol.mPosition = pos
            if (addToTracker) {
                // assert(scene.sectors[sector] != null)
                if (scene.sectors[sector] == null) { return false }
                if (sector == -1) { scene.place_loadzone(vol) }
                // scene.sectors[sector].place_trigger(vol)
            }
            good = true
        } else { good = false }
        return good
    }
    SetNumTriggers(num: number) {}
    AddTriggerVolume(volume: TriggerVolume) {}
}
class TriggerLocator extends Locator {
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
class EventLocator extends TriggerLocator { }
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
export class TriggerVolume extends tEntity {
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

function LoadVectorFromCollisionVectorChunk(file: tChunkFile): vec3 {
    file.begin_chunk()
    const v = vec3.fromValues(file.real_file.f32(),
        file.real_file.f32(),
        file.real_file.f32())
    file.end_chunk()
    return v
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

    const Name: string[] = ["Event",
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
        "Spawn Point"]
}
