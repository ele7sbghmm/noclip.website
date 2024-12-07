import { assert, nArray } from '../util.js'
import { Color, colorNewFromRGBA } from '../Color.js'
import { AABB } from '../Geometry.js'

import { vec3, mat4, mat3 } from 'gl-matrix'
import { rmt } from './math.js'

const AXIS_ALIGNED_SNAPPING_FACTOR: number = 0.9999

export class tEntity { name: string }
export class IEntityDSG extends tEntity { }
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
export namespace sim {
    export class CollisionObject extends IEntityDSG {
        Relocated() {
            throw new Error('Method not implemented.')
        }
        Update() {
            throw new Error('Method not implemented.')
        }
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
        mCollisionObject: sim.CollisionObject | null = null
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
        SetCollisionObject(obj: sim.CollisionObject) {
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
    export class SimState {
        mTransform: mat4 = mat4.identity(mat4.create())
        mCollisionObject: sim.CollisionObject | null = null
        mScale = 1.0
        mObjectMoving: boolean
        mVelocityState: any
        mApproxSpeedMagnitude: number
        mArticulated: any
        mVirtualCM: any
        constructor(public mControl?: SimControlEnum) { }
        SetCollisionObject(inObject: sim.CollisionObject) {
            this.mCollisionObject = inObject
        }
        static CreateStaticSimState(inCollisionObject: sim.CollisionObject): SimState {
            return SimState.CreateSimState(inCollisionObject, null)
        }
        static CreateSimState(collObj: sim.CollisionObject, simOBj: any): SimState {
            const simState = new SimState
            if (collObj) {
                // collObj.SetSimState(simState)
                simState.SetCollisionObject(collObj)
            }
            return simState
        }
        GetCollisionObject(): sim.CollisionObject { return this.mCollisionObject! }

        SetControl(inControl: sim.SimControlEnum) { }
        SetTransform(inTransform: mat4, dt?: number) {
            this.mObjectMoving = !this.SameMatrix(this.mTransform, inTransform)
            if (this.mControl == sim.SimControlEnum.simAICtrl) {
                if (this.mObjectMoving) { 
                    if (dt != 0) {
                        this.ExtractVelocityFromMatrix(
                            this.mTransform, inTransform, this.mScale, dt, this.mVelocityState
                        )
                    } else {
                        this.ResetVelocities()
                        if (this.mCollisionObject) {
                            this.mCollisionObject.Relocated()
                            this.mCollisionObject.Update()
                        }
                    }
                } else { this.ResetVelocities() }
            }
            if (this.mCollisionObject && this.mObjectMoving) { 
                this.MoveCollisionObject(this.mTransform, inTransform)
            }
            this.mTransform = inTransform
            if (this.mVirtualCM) {
                this.mVirtualCM.Update(this.GetPosition(), this.GetLinearVelocity(), dt)
            }
            if (!this.mArticulated) {
                const tmp = this.mVelocityState.mLinear.dot(this.mVelocityState.mLinear)
                if (tmp > Math.pow(this.UpApproxSpeedMagnitude(), 2)) {
                    this.mApproxSpeedMagnitude = Math.sqrt(tmp)
                    if (this.mCollisionObject) { this.mCollisionObject.Relocated() }
                } else if(tmp < this.DownApproxSpeedMagnitde()) { 
                    this.mApproxSpeedMagnitude = Math.sqrt(tmp)
                }
            }
        }
        DownApproxSpeedMagnitde() {
            throw new Error('Method not implemented.')
        }
        GetLinearVelocity(): any {
            throw new Error('Method not implemented.')
        }
        GetPosition(): any {
            throw new Error('Method not implemented.')
        }
        SameMatrix(mTransform: mat4, inTransform: mat4): boolean {
            throw new Error('Method not implemented.')
        }
        ExtractVelocityFromMatrix(mTransform: mat4, inTransform: mat4, mScale: number, dt: number | undefined, mVelocityState: any) {
            throw new Error('Method not implemented.')
        }
        ResetVelocities() {
            throw new Error('Method not implemented.')
        }
        MoveCollisionObject(mTransform: any, inTransform: mat4) {
            throw new Error('Method not implemented.')
        }
        UpApproxSpeedMagnitude(): number {
            throw new Error('Method not implemented.')
        }
    }
    export enum SimControlEnum {
        simAICtrl,
        simSimulationCtrl
    }
}
export class StaticPhysDSG extends IEntityDSG {
    _color: Color = colorNewFromRGBA(Math.random(), Math.random(), Math.random())
    mpSimStateObj: sim.SimState
    mPosn: vec3
    mBBox: AABB
    mSphere: any
    SetSimState(ipCollObj: sim.SimState) {
        this.OnSetSimState(ipCollObj)
    }
    OnSetSimState(ipSimState: sim.SimState) {
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
// export class tGeometry extends IEntityDSG {
//     primGroup: (tPrimGroup | null)[] = []
//     box: { low: vec3, high: vec3 }
//     sphere: { centre: vec3, radius: number }
//     constructor(nPG: number) {
//         super()
//         this.primGroup = Array.from({ length: nPG }, () => null)
//     }
//     SetBoundingSphere(centerx: number, centery: number, centerz: number, radius: number) {
//         this.sphere.centre = vec3.fromValues(centerx, centery, centerz)
//         this.sphere.radius = radius
//     }
//     SetBoundingBox(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, ) {
//         this.box.low  = vec3.fromValues(x1, y1, z1)
//         this.box.high = vec3.fromValues(x2, y2, z2)
//     }
// }
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
export class DynaPhysDSG { }
export class AnimCollisionEntityDSG { }
export class AnimEntityDSG { }
export class WorldSphereDSG { }
export class RoadManager {
    mNumRoadsUsed           = 0
    mNumRoadSegmentsUsed    = 0
    mNumIntersectionsUsed   = 0
    mNumRoadSegmentDataUsed = 0
    mNumRoads               = 150
    mNumRoadSegments        = 1200
    mNumIntersections       = 60
    mNumRoadSegmentData     = 1200
    mRoads           = nArray( 150, () => new Road)
    mRoadSegments    = nArray(1200, () => new RoadSegment)
    mIntersections   = nArray(  60, () => new Intersection)
    mRoadSegmentData = nArray(1200, () => new RoadSegmentData)
    GetInstance() { return this }
    AddRoad = (pRoad: Road) => {
        assert(this.mNumRoadsUsed < this.mNumRoads, ``)
        assert(pRoad == this.mRoads[this.mNumRoadsUsed], ``)
        ++this.mNumRoadsUsed
    }
    AddIntersection(pIntersection: Intersection) {
        assert(this.mNumIntersectionsUsed < this.mNumIntersections)
        assert(pIntersection === this.mIntersections[this.mNumIntersectionsUsed])
        ++this.mNumIntersectionsUsed
    }
    AddRoadSegment(pRoadSegment: RoadSegment) { 
        assert(this.mNumRoadSegmentsUsed < this.mNumRoadSegments)
        assert(pRoadSegment === this.mRoadSegments[this.mNumRoadSegmentsUsed] )
        ++this.mNumRoadSegmentsUsed
    }
    AddRoadSegmentData(pRoadSegmentData: RoadSegmentData) {
        assert(this.mNumRoadSegmentDataUsed < this.mNumRoadSegmentData)
        assert(pRoadSegmentData === this.mRoadSegmentData[this.mNumRoadSegmentDataUsed])
        ++this.mNumRoadSegmentDataUsed
    }
    FindRoadSegmentData(name: string) {
        for (let i = 0; i < this.mNumRoadSegmentDataUsed; ++i) {
            if (this.mRoadSegmentData[i].GetNameUID() == name) {
                return this.mRoadSegmentData[i]
            }
        }
        return null
    }
    FindIntersection_str(name: string): Intersection | null {
        for (let i = 0; i < this.mNumIntersectionsUsed; ++i) {
            if (this.mIntersections[i].GetNameUID() == name) {
                return this.mIntersections[i]
            }
        }
        return null
    }
    FindIntersection_vec3(point: vec3): Intersection | null {
        for (let i = 0; i < this.mNumIntersectionsUsed; ++i) {
            if (this.mIntersections[i].IsPointInIntersection(point)) {
                return this.mIntersections[i]
            }
        }
        return null
    }
    FindIntersection_number(iIndex: number) { return this.mIntersections[iIndex] }
    GetFreeRoadMemory() {
        if (0 <= this.mNumRoadsUsed && this.mNumRoadsUsed < this.mNumRoads) {
            return this.mRoads[this.mNumRoadsUsed]
        }
        return null
    }
    GetFreeRoadSegmentDataMemory() {
        if (0 <= this.mNumRoadSegmentsUsed
            && this.mNumRoadSegmentDataUsed < this.mNumRoadSegmentData
        ) {
            return this.mRoadSegmentData[this.mNumRoadSegmentDataUsed]
        } else {
            //console.log(`NUMROADSUSED = ${this.mNumRoadSegmentDataUsed}, NUMROADS = ${mNumRoadSegmentData}\n`)
        }
        return null
    }
    GetFreeRoadSegmentMemory() {
        if (0 <= this.mNumRoadSegmentsUsed
            && this.mNumRoadSegmentsUsed < this.mNumRoadSegments) {
            return this.mRoadSegments[this.mNumRoadSegmentsUsed]
        }
        return null
    }
    GetFreeIntersectionMemory() {
        if(0 <= this.mNumIntersectionsUsed
            && this.mNumIntersectionsUsed < this.mNumIntersections) {
            return this.mIntersections[this.mNumIntersectionsUsed]
        }

        return null
    }
}
export class Road {
    name: string = ``
    mnLanes: number
    mSpeed: number
    mDifficulty: number
    mIsShortCut: boolean
    mDensity: number
    mLength: number
    mpDestinationIntersection: Intersection
    mpSourceIntersection: Intersection
    numSegments: number
    mppRoadSegmentArray: (RoadSegment | null)[]
    mnRoadSegments: (RoadSegment | null)[]
    mnMaxRoadSegments: number
    mNameUID: string
    SetName = (name: string) => { this.mNameUID = name }
    GetNameUID = () => { return this.mNameUID }
    SetSpeed = (speed: number) => { this.mSpeed = speed }
    SetDifficulty = (diff: number) => { this.mDifficulty = diff }
    SetShortCut = (is: boolean) => { this.mIsShortCut = is }
    SetDensity = (density: number) => { this.mDensity = density }
    SetRoadLength = (len: number) => { this.mLength = len }
    SetNumLanes = (count: number) => { this.mnLanes = count}
    SetDestinationIntersection = (pIntersection: Intersection) => {
        this.mpDestinationIntersection = pIntersection }
    SetSourceIntersection = (pIntersection: Intersection) => {
        this.mpSourceIntersection = pIntersection }
    AllocateSegments = (numSegments: number) => {
        assert(this.numSegments > 0, ``)
        assert(null == this.mppRoadSegmentArray[0], ``)
        assert(null == this.mnRoadSegments[0], ``)
        this.mnMaxRoadSegments = numSegments
        this.mppRoadSegmentArray = nArray(this.mnMaxRoadSegments, () => null)//new RoadSegment)
        // for (let i = 0; i < this.mnMaxRoadSegments; i++) {
        //     this.mppRoadSegmentArray[i] = 0
        // }
    }
}
export class RoadSegment extends IEntityDSG {
    mCorners: [vec3, vec3, vec3, vec3]
    mEdgeNormals: [vec3, vec3, vec3, vec3]
    mNormal: vec3
    mRoad: Road | null = null
    mSegmentIndex = 0
    mfLaneWidth = 0
    mfRadius = 0
    mfAngle = 0
    mSphere: rmt.Sphere
    mfSegmentLength: number
    mNameUID: string
    SetName(name: string) { this.mNameUID = name }
    GetNameUID() { return this.mNameUID }
    Init(rsd: RoadSegmentData, hierarchy: mat4, scaleAlongFacing: number) {
        for (let i = 0; i < 4; i++) {
            this.mCorners[i] = rsd.GetCorner(i)
            this.mEdgeNormals[i] = rsd.GetEdgeNormal(i)
        }
        const _tmp = vec3.create()
        vec3.add(_tmp, this.mCorners[0], this.mCorners[3])
        vec3.scale(_tmp, _tmp, 0.5)
        const fWidth = vec3.length(_tmp)
        this.mfLaneWidth = fWidth / rsd.GetNumLanes()
        let fCosTheta = vec3.dot(this.mEdgeNormals[0], this.mEdgeNormals[1])
        if (fCosTheta < 0) fCosTheta *= -1
        if (fCosTheta < 0.001) fCosTheta = 0
        vec3.sub(_tmp, this.mCorners[0], this.mCorners[1])
        const fInteriorEdgeLength = vec3.length(_tmp)
        vec3.sub(_tmp, this.mCorners[2], this.mCorners[3])
        const fExteriorEdgeLength = vec3.length(_tmp)

        if (fCosTheta) {
            const length = (fInteriorEdgeLength < fExteriorEdgeLength)
                ? fInteriorEdgeLength / 2 : fExteriorEdgeLength / 2
            this.mfRadius = length / fCosTheta
            this.mfAngle = (Math.PI / 2) - Math.acos(fCosTheta)
        } else {
            this.mfRadius = 0
            this.mfAngle = 0
        }
        const vector = vec3.create()
        for (let i = 0; i < 4; i++) {
            vec3.copy(vector, rsd.GetCorner(i))
            vector[2] *= scaleAlongFacing
            vec3.transformMat4(vector, vector, hierarchy)
            vec3.copy(this.mCorners[i], vector)
            
            vec3.copy(vector, rsd.GetEdgeNormal(i))
            vec3.transformMat3(vector, vector, mat3.fromMat4(mat3.create(), hierarchy))
            vec3.copy(this.mEdgeNormals[i], vector)
        }
        vec3.copy(vector, rsd.GetSegmentNormal())
        vec3.transformMat3(vector, vector, mat3.fromMat4(mat3.create(), hierarchy))
        vec3.copy(this.mNormal, vector)

        const segStart = vec3.create()
        vec3.add(segStart, this.mCorners[0], this.mCorners[3])
        vec3.scale(segStart, segStart, 0.5)
        const segEnd = vec3.create()
        vec3.add(segEnd, this.mCorners[0], this.mCorners[3])
        vec3.scale(segEnd, segEnd, 0.5)
        this.mfSegmentLength = vec3.dist(segEnd, segStart)

        const box = this.GetBoundingBox()
        const vectorBetween = vec3.create()
        vec3.sub(vectorBetween, box.max, box.min)
        vec3.scale(vectorBetween, vectorBetween, 0.5)
        vec3.add(this.mSphere.centre, box.min, vectorBetween)
        this.mSphere.radius = vec3.length(vectorBetween)
    }
    GetBoundingBox() {
        const box = new rmt.Box3D
        const vertex = vec3.create()
        for (let i = 0; i < 4; i++) {
            vec3.copy(vertex, this.mCorners[i])
            if (i == 0) {
                vec3.copy(box.min, vertex)
                vec3.copy(box.max, vertex)
            } else {
                if (box.min[0] > vertex[0]) box.min[0] = vertex[0]
                if (box.min[1] > vertex[1]) box.min[1] = vertex[1]
                if (box.min[2] > vertex[2]) box.min[2] = vertex[2]
                if (box.max[0] < vertex[0]) box.max[0] = vertex[0]
                if (box.max[1] < vertex[1]) box.max[1] = vertex[1]
                if (box.max[2] < vertex[2]) box.max[2] = vertex[2]
            }
        }
        return new rmt.Box3D()
    }
    GetCorner(index: number) {
        return this.mCorners[index]
    }
    GetRoad() {
        return this.mRoad
    }
}
export class RoadSegmentData {
    mnLanes: number
    mNormal: vec3
    mCorners: [vec3, vec3, vec3, vec3]
    mEdgeNormals: [vec3, vec3, vec3, vec3]
    mNameUID: string
    SetName(name: string) { this.mNameUID = name }
    GetNameUID() { return this.mNameUID }
    GetEdgeNormal(index: number) { return this.mEdgeNormals[index] }
    GetCorner(index: number) { return this.mCorners[index] }
    GetNumLanes() { return this.mnLanes }
    GetSegmentNormal() { return this.mNormal }
}
export class Intersection {
    mLocation: vec3
    mfRadius: number
    mnRoadsIn: number
    mnRoadsOut: number
    mRoadListIn: Road[]
    mRoadListOut: Road[]
    mNameUID: string
    SetName(name: string) { this.mNameUID = name }
    GetNameUID() { return this.mNameUID }
    AddRoadIn(pRoad: Road) {
        this.mRoadListIn[this.mnRoadsIn] = pRoad
        this.mnRoadsIn++
    }
    AddRoadOut(pRoad: Road) {
        this.mRoadListOut[this.mnRoadsOut] = pRoad
        this.mnRoadsOut++
    }
    IsPointInIntersection(point: vec3) {
        return vec3.length(
            vec3.fromValues(point[0] - this.mLocation[0],  0,  point[2] - this.mLocation[2])
        ) <= this.mfRadius
    }
}
export class InstDynaPhysDSG { }
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
