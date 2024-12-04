import { assert } from "../util.js"
import { mat4, vec3 } from "gl-matrix"
import { BBoxVolume, CollisionObject, CollisionVolume, CollisionVolumeOwner, CylinderVolume, EventLocator, FenceEntityDSG, IEntityDSG, IntersectDSG, Intersection, Locator, LocatorEvent, LocatorType, OBBoxVolume, PathManager, PathSegment, RectTriggerVolume, RoadManager, RoadSegment, SimState, SphereTriggerVolume, SphereVolume, StaticPhysDSG, TriggerLocator, TriggerVolume, WallVolume, ZoneEventLocator } from "./dsg.js"
import { tChunkFile } from "./file.js"
import { SRR2 } from "./srrchunks.js"
import { read_mat4, read_matrix, read_vec3 } from "./reader.js"
import { Pure3D, Simulation } from "./chunkids.js"
import { Instance } from "./scenes.js"
import { Bounds3f } from "./rad_util.js"
import { SpatialTree } from "./spatial.js"
import { rmt } from "./math.js"

class tSimpleChunkHandler {
    constructor(public id: number) { }
    LoadObject(level_instance: Instance, f: tChunkFile): IEntityDSG | null { return null }
    Load(level_instance: Instance, file: tChunkFile) { this.LoadObject(level_instance, file) }
}
const epsilon = (x: number, n: number, e: number = 0.000001) => {
    return (x >= -e+n) && (x <= e+n)
}
function LoadVectorFromCollisionVectorChunk(file: tChunkFile): vec3 {
    file.BeginChunk()
    const v = vec3.fromValues(file.realFile.f32(),
        file.realFile.f32(),
        file.realFile.f32())
    file.EndChunk()
    return v
}
export class IWrappedLoader { }
// export class AnimCollisionEntity_loader extends tSimpleChunkHandler implements IWrappedLoader{
//     constructor() {
//         super(Simulation.Collision.OBJECT)
//     }
//     override LoadObject(level_instance: Instance, f: tChunkFile): null { return null }
// }
// export class AnimEntity_loader extends tSimpleChunkHandler implements IWrappedLoader{
//     constructor() {
//         super(Simulation.Collision.OBJECT)
//     }
//     override LoadObject(level_instance: Instance, f: tChunkFile): null { return null }
// }
export class CollisionObjectLoader extends tSimpleChunkHandler implements IWrappedLoader{
    constructor() {
        super(Simulation.Collision.OBJECT)
    }
    override LoadObject(level_instance: Instance, f: tChunkFile): IEntityDSG {
        const newCollisionObject = new CollisionObject
        newCollisionObject.mCollisionVolumeOwner = new CollisionVolumeOwner

        newCollisionObject.name = f.realFile.get_nstring()
        const version = f.realFile.i32()

        newCollisionObject.nStringData = f.realFile.get_nstring()
        newCollisionObject.mNumJoint = f.realFile.i32()
        let currentOwner = 0
        const numOwner = f.realFile.i32()
        newCollisionObject.mCollisionVolumeOwner.SetNumOwnerList(numOwner)

        while (f.ChunksRemaining()) {
            f.BeginChunk()
            switch (f.GetCurrentID()) {
                case Simulation.Collision.OWNER: {
                    const numNames = f.realFile.i32()
                    if (numNames > 0) {
                        newCollisionObject.mCollisionVolumeOwner.mOwnerList//[currentOwner]
                            = Array.from({ length: numNames }, () => '')
                        while (f.ChunksRemaining()) {
                            f.BeginChunk();
                            switch (f.GetCurrentID()) {
                                case Simulation.Collision.OWNERNAME: {
                                    const newName = f.realFile.get_nstring()
                                    newCollisionObject.mCollisionVolumeOwner.mOwnerList[currentOwner]
                                        // .push(tEntity.MakeUID(newName))
                                        // .push(newName)
                                        = newName
                                    break
                                }
                            }
                            f.EndChunk()
                        }
                    }
                    currentOwner++
                    break
                }
                case Simulation.Collision.SELFCOLLISION: {
                    const index1 = f.realFile.i32()
                    const index2 = f.realFile.i32()
                    const self1 = f.realFile.u16() == 0 ? false : true
                    const self2 = f.realFile.u16() == 0 ? false : true
                    newCollisionObject.AddSelfCollision(index1, index2, self1, self2)
                    break
                }
                case Simulation.Collision.VOLUME: {
                    const collisionVolume: CollisionVolume = this.LoadCollisionVolume(f)
                    // assert(collisionVolume, 'oops')
                    newCollisionObject.SetCollisionVolume(collisionVolume)
                    break
                }
                case Simulation.Collision.ATTRIBUTE: {
                    newCollisionObject.mIsStatic = f.realFile.u16() == 0 ? false : true
                    newCollisionObject.mDefaultArea = f.realFile.i32()
                    const canRoll = f.realFile.u16() == 0 ? false : true
                    const canSlide = f.realFile.u16() == 0 ? false : true
                    const canSpin = f.realFile.u16() == 0 ? false : true
                    const canBounce = f.realFile.u16() == 0 ? false : true
                    const extraAttribute1 = f.realFile.i32()
                    const extraAttribute2 = f.realFile.i32()
                    const extraAttribute3 = f.realFile.i32()

                    // CollisionAnalyserPossibleEvent possibleEvent = cCollisionAnalyserPossibleEventAll
                    // if (canRoll)   possibleEvent -= cCollisionAnalyserPossibleEventRolling
                    // if (canSlide)  possibleEvent -= cCollisionAnalyserPossibleEventSliding
                    // if (canSpin)   possibleEvent -= cCollisionAnalyserPossibleEventSpinning
                    // if (canBounce) possibleEvent -= cCollisionAnalyserPossibleEventBouncing

                    // newCollisionObject.SetPossibleCollisionEvents(possibleEvent)
                    break
                }
            }
            f.EndChunk()
        }
        // PhysicsProperties* tmpprop = PhysicsProperties.FindPhysicsProperty(stringData, store);
        // PhysicsProperties* tmpprop = NULL
        // if (tmpprop) {
        //     if (nbSubObject == 0) { tmpprop = PhysicsProperties.DefaultPhysicsProperties(store) }
        //                      else { tmpprop = PhysicsProperties.DefaultArtPhysicsProperties(store) }
        // }
        // newCollisionObject.SetPhysicsProperties(tmpprop)

        // this.mpListenerCB..mRenderManager.OnChunkLoaded(newCollisionObject)
        return newCollisionObject
    }
    LoadCollisionVolume(file: tChunkFile): CollisionVolume {
        const objrefIndex = file.realFile.i32();
        const ownerIndex = file.realFile.i32();
        const numSubVolume = file.realFile.i32();

        let newCollisionVolume: CollisionVolume | null = null

        file.BeginChunk()
        switch (file.GetCurrentID()) {
            case Simulation.Collision.SPHERE: {
                const radius = file.realFile.i32()
                const p: vec3 = LoadVectorFromCollisionVectorChunk(file)
                newCollisionVolume = new SphereVolume(p, radius) as CollisionVolume
                break
            }
            case Simulation.Collision.CYLINDER: {
                const radius = file.realFile.f32()
                const length = file.realFile.f32()
                const flatEnd = file.realFile.u16() == 0 ? false : true
                const p: vec3 = LoadVectorFromCollisionVectorChunk(file)
                const o: vec3 = LoadVectorFromCollisionVectorChunk(file)
                newCollisionVolume = new CylinderVolume(p, o, length, radius, flatEnd) as CollisionVolume
                break
            }
            case Simulation.Collision.OBBOX: {
                const l0 = file.realFile.f32()
                const l1 = file.realFile.f32()
                const l2 = file.realFile.f32()
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
                const dum = file.realFile.i32()
                break
            }
        }
        file.EndChunk()

        // newCollisionVolume.SetObjRefIndex(objrefIndex)
        // newCollisionVolume.SetOwnerIndex(ownerIndex)
        newCollisionVolume!.mSubVolumeList = Array.from({ length: numSubVolume }, () => null)
        for (let i = 0; i < numSubVolume; i++) {
            file.BeginChunk()
            const newSubCollisionVolume = this.LoadCollisionVolume(file)
            file.EndChunk()
            newCollisionVolume!.AddSubVolume(newSubCollisionVolume)
        }
        // assert(newCollisionVolume)

        // if (numSubVolume) { assert(newCollisionVolume.SubVolumeList().GetSize() == numSubVolume) }
        return newCollisionVolume!
    }
}
// export class DynaPhys_loader extends tSimpleChunkHandler implements IWrappedLoader{ LoadObject(f: tChunkFile): null { return null }}
export class FenceLoader extends tSimpleChunkHandler implements IWrappedLoader{
    constructor() {
        super(SRR2.ChunkID.FENCE_DSG)
    }
    override LoadObject(level_instance: Instance, f: tChunkFile): IEntityDSG {
        f.BeginChunk()
        const fence = new FenceEntityDSG
        switch (f.GetCurrentID()) {
            case SRR2.ChunkID.WALL: {
                fence.start = read_vec3(f.realFile)
                fence.end = read_vec3(f.realFile)
                fence.normal = read_vec3(f.realFile)
            }
        }
        f.EndChunk()
        level_instance.GetRenderManager().OnChunkLoaded(fence, 0, SRR2.ChunkID.FENCE_DSG)
        return fence
    }
}
export class IntersectLoader extends tSimpleChunkHandler implements IWrappedLoader{
    constructor() {
        super(SRR2.ChunkID.INTERSECT_DSG)
    }
    override LoadObject(level_instance: Instance, f: tChunkFile): null {
        const pIDSG = new IntersectDSG

        let size = f.realFile.i32()
        for (let i = 0; i < size; i++) {
            pIDSG.mTriIndices.push(f.realFile.i32())
        }
        size = f.realFile.i32()
        for (let i = 0; i < size; i++) {
            pIDSG.mTriPts.push(read_vec3(f.realFile))
        }
        size = f.realFile.i32()
        for (let i = 0; i < size; i++) {
            pIDSG.mTriNorms.push(read_vec3(f.realFile))
        }
        while (f.ChunksRemaining()) {
            f.BeginChunk()
            switch (f.GetCurrentID()) {
                case Pure3D.Mesh.BOX: {
                    const minx = f.realFile.f32()
                    const miny = f.realFile.f32()
                    const minz = f.realFile.f32()
                    const maxx = f.realFile.f32()
                    const maxy = f.realFile.f32()
                    const maxz = f.realFile.f32()

                    // pIDSG.SetBoundingBox(minx, miny, minz, maxx, maxy, maxz)
                    break
                }
                case Pure3D.Mesh.SPHERE: {
                    const cx = f.realFile.f32()
                    const cy = f.realFile.f32()
                    const cz = f.realFile.f32()
                    const r = f.realFile.f32()

                    // pIDSG.SetBoundingSphere(cx, cy, cz, r)
                    break
                }
                case SRR2.ChunkID.TERRAIN_TYPE: {
                    const version = f.realFile.i32()
                    size = f.realFile.i32()
                    for (let i = 0; i < size; i++) {
                        pIDSG.mTerrainType.push(f.realFile.u8())
                    }
                    break
                }
                default:
                    break
            } // switch
            f.EndChunk()
        }
        // mpListenerCB..mRenderManager.OnChunkLoaded( pIDSG, mUserData, _id )
        level_instance.GetRenderManager().OnChunkLoaded(pIDSG, 0, SRR2.ChunkID.INTERSECT_DSG)
        return null
    }
}
export class LocatorLoader extends tSimpleChunkHandler implements IWrappedLoader{
    static msZoneNameCount: number = 0
    constructor() {
        super(SRR2.ChunkID.LOCATOR)
    }
    override LoadObject(level_instance: Instance, f: tChunkFile): IEntityDSG | null {
        const name = f.realFile.get_nstring()
        const ttype: LocatorType.Type = f.realFile.u32()
        const numElements = f.realFile.u32()
        const elements = f.realFile.get_slice(numElements * 4)
        const pos: vec3 = vec3.fromValues(f.realFile.f32(), f.realFile.f32(), f.realFile.f32())
        let locator: Locator | null = null
        const numTriggers = f.realFile.u32()
        const hasSubChunks = true

        switch (ttype) {
            case LocatorType.Type.GENERIC: { break }
            case LocatorType.Type.EVENT: {
                const _i32array = new Int32Array(elements)
                
                const eventloc = new EventLocator
                // eventloc.SetEventType(elements[0] as LocatorEvent.Event)
                eventloc.mEventType = _i32array[0] as LocatorEvent.Event
                // if (eventloc.GetEventType() == LocatoerEvent.Event.CAMERA_CUT) { }
                // if (numElements == 2) { eventloc.SetData(elements[1]) }
                if (numElements == 2) { eventloc.mData = _i32array[1] }
                locator = eventloc
                break
            }
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
                while (f.ChunksRemaining()) {
                    f.BeginChunk()
                    switch (f.GetCurrentID()) {
                        case SRR2.ChunkID.TRIGGER_VOLUME: {
                            let b = this.LoadTriggerVolume(f, locator as TriggerLocator)
                            if (b == false) return null
                            break
                        }
                        case SRR2.ChunkID.SPLINE: { break }
                        case SRR2.ChunkID.EXTRA_MATRIX: { break }
                    }
                    f.EndChunk()
                }
            }
            locator.name = name
            locator.mLocation = pos
        }

        if (ttype == LocatorType.Type.DYNAMIC_ZONE) {
            if (name.substring(0, 4) == `load`) {
                LocatorLoader.msZoneNameCount++
                locator!.name = `mfa${LocatorLoader.msZoneNameCount}${name}`
            }
        }
        return locator
    }
    LoadTriggerVolume(f: tChunkFile, locator: TriggerLocator, addToTracker: boolean = true) {
        let good = true
        if (f.GetCurrentID() == SRR2.ChunkID.TRIGGER_VOLUME) {
            let vol: TriggerVolume = new TriggerVolume
            const volname = f.realFile.get_nstring()
            const voltype = f.realFile.u32()
            const scale = vec3.fromValues(f.realFile.f32(), f.realFile.f32(), f.realFile.f32())
            const mat = mat4.fromValues(f.realFile.f32(), f.realFile.f32(), f.realFile.f32(), f.realFile.f32(),
                                        f.realFile.f32(), f.realFile.f32(), f.realFile.f32(), f.realFile.f32(),
                                        f.realFile.f32(), f.realFile.f32(), f.realFile.f32(), f.realFile.f32(),
                                        f.realFile.f32(), f.realFile.f32(), f.realFile.f32(), f.realFile.f32())
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
                // GetTriggerVolumeTracker().AddTrigger(vol)
            }
            good = true
        } else { good = false }
        return good
    }
}
export class PathLoader extends tSimpleChunkHandler implements IWrappedLoader{
    static sNumPathSegmentsLoaded: number = 0
    constructor() {
        super(SRR2.ChunkID.PED_PATH)
    }
    override LoadObject(level_instance: Instance, f: tChunkFile): null { return null }
    override Load(level_instance: Instance, f: tChunkFile) {//: tLoadStatus {
        const nPoints = f.GetUInt()
        const nSegments = nPoints - 1

        const pm = new PathManager//.GetInstance()
        const path = pm.GetFreePath()
        path.AllocateSegments(nSegments)
        let ps: PathSegment | null = null
        
        const start = vec3.fromValues(f.GetFloat(), f.GetFloat(), f.GetFloat())
        const first = vec3.clone(start) // unused
        const end = vec3.create()
        
        const myEpsilon = 0.001
        for (let i = 0; i < nSegments; i++) {
            vec3.set(end, f.GetFloat(), f.GetFloat(), f.GetFloat())
            ps = path.GetPathSegmentByIndex(i)
            ps.Initialize(path, i, start, end)

            level_instance.GetRenderManager().OnChunkLoaded(ps, 0, SRR2.ChunkID.PED_PATH_SEGMENT)
            vec3.copy(start, end)
            PathLoader.sNumPathSegmentsLoaded++
        }
        if (epsilon(first[0], end[0], myEpsilon)
         && epsilon(first[1], end[1], myEpsilon)
         && epsilon(first[2], end[2], myEpsilon)) {
            path.SetIsClosed(true)
        }
        PathLoader.sNumPathSegmentsLoaded++
        // return tLoadStatus.LOAD_OK
    }
}
export class StaticEntityLoader extends tSimpleChunkHandler implements IWrappedLoader{
    constructor() {
        super(SRR2.ChunkID.ENTITY_DSG)
    }
    override LoadObject(level_instance: Instance, f: tChunkFile): IEntityDSG | null { return null}}
    /*    const pStaticEntityDSG = new StaticEntityDSG
        pStaticEntityDSG.name = f.realFile.get_nstring()
        const version = f.GetLong()
        const HasAlpha = f.GetLong()
        if (HasAlpha) pStaticEntityDSG.mTranslucent = true

        while (f.ChunksRemaining()) {
            f.BeginChunk()
            switch (f.GetCurrentID()) {
                case Pure3D.Mesh.MESH: {
                    const pGeo = new tGeometry().LoadObject(wrl, f) // wrapper
                    pStaticEntityDSG.mpDrawstuff = pGeo // ->ProcessShaders... ->SetInternalState()
                }
            }
            f.EndChunk()
        }
        this.mpListenerCB..mRenderManager.OnChunkLoaded(pStaticEntityDSG)
        return pStaticEntityDSG
    }
}*/
export class StaticPhysLoader extends tSimpleChunkHandler implements IWrappedLoader{
    mpCollObjLoader = new CollisionObjectLoader

    constructor() {
        super(SRR2.ChunkID.STATIC_PHYS_DSG)
    }
    override LoadObject(level_instance: Instance, f: tChunkFile): IEntityDSG {
        const name = f.realFile.get_nstring()
        const version = f.realFile.i32()

        const pStaticPhysDSG = new StaticPhysDSG
        pStaticPhysDSG.name = name
        // const pCollAttr: CollisionAttributes | null = null

        while (f.ChunksRemaining()) {
            f.BeginChunk()
            switch (f.GetCurrentID()) {
                case Simulation.Collision.OBJECT: {
                    const pCollObj: CollisionObject = this.mpCollObjLoader.LoadObject(level_instance, f) as CollisionObject
                    pStaticPhysDSG.SetSimState(SimState.CreateStaticSimState(pCollObj))
                    break
                }
                case SRR2.ChunkID.OBJECT_ATTRIBUTES: {
                    const classType = f.realFile.i32()
                    const physPropID = f.realFile.i32()
                    const tempsound = f.realFile.get_nstring()

                    // pCollAttr = GetATCManager().CreateCollisionAttributes(classType, physPropID, 0.0f);
                    // pCollAttr->SetSound(tempsound);
                    // pStaticPhysDSG.SetCollisionAttributes(pCollAttr)
                    break
                }
            }
            f.EndChunk()
        }

        level_instance.GetRenderManager().OnChunkLoaded(pStaticPhysDSG, 0, SRR2.ChunkID.STATIC_PHYS_DSG)
        return pStaticPhysDSG
    }
}
export class TreeDSGLoader extends tSimpleChunkHandler implements IWrappedLoader {
    constructor() {
        super(SRR2.ChunkID.TREE_DSG)
    }
    override LoadObject(level_instance: Instance, f: tChunkFile): IEntityDSG | null {
        const ipSpatialTree = new SpatialTree
        const nNodes = f.realFile.i32()
        const bounds: Bounds3f = new Bounds3f
        bounds.mMin = read_vec3(f.realFile)
        bounds.mMax = read_vec3(f.realFile)
        ipSpatialTree.SetTo(nNodes, bounds)

        assert(ipSpatialTree.mTreeNodes.mpData != null, ``)
        for(let i = 0; f.ChunksRemaining(); i++) {
            
            f.BeginChunk()
            switch (f.GetCurrentID()) {
                case SRR2.ChunkID.CONTIGUOUS_BIN_NODE: {
                    ipSpatialTree.mTreeNodes.mpData[i].SetSubTreeSize(f.GetLong())
                    ipSpatialTree.mTreeNodes.mpData[i].LinkParent(f.GetLong())
                    f.BeginChunk()
                    switch (f.GetCurrentID()) {
                        case SRR2.ChunkID.SPATIAL_NODE: {
                            ipSpatialTree.mTreeNodes.mpData[i].mData.mSubDivPlane.mAxis = f.GetChar()
                            ipSpatialTree.mTreeNodes.mpData[i].mData.mSubDivPlane.mPosn = f.GetFloat()
                            ipSpatialTree.mTreeNodes.mpData[i].mData.mSEntityElems.mUseSize     = f.GetLong()
                            ipSpatialTree.mTreeNodes.mpData[i].mData.mSPhysElems.mUseSize       = f.GetLong()
                            ipSpatialTree.mTreeNodes.mpData[i].mData.mIntersectElems.mUseSize   = f.GetLong()
                            ipSpatialTree.mTreeNodes.mpData[i].mData.mDPhysElems.mUseSize       = f.GetLong()
                            ipSpatialTree.mTreeNodes.mpData[i].mData.mFenceElems.mUseSize       = f.GetLong()
                            ipSpatialTree.mTreeNodes.mpData[i].mData.mRoadSegmentElems.mUseSize = f.GetLong()
                            ipSpatialTree.mTreeNodes.mpData[i].mData.mPathSegmentElems.mUseSize = f.GetLong()
                            ipSpatialTree.mTreeNodes.mpData[i].mData.mAnimElems.mUseSize        = f.GetLong() + 1
                            ipSpatialTree.mTreeNodes.mpData[i].mData.mAnimCollElems.mUseSize    = 1
                            f.EndChunk()
                            if (ipSpatialTree.mTreeNodes.mpData[i].IsRoot()) {
                                //////////////////////////////////////////////////////////////////////////
                                // WET PAINT Do not Touch!! Talk to Devin first.
                                // Violation leads to the Tree of Woe
                                //////////////////////////////////////////////////////////////////////////
                                    ipSpatialTree.mTreeNodes.mpData[i].mData.mSEntityElems.mUseSize  += 100;
                                    ipSpatialTree.mTreeNodes.mpData[i].mData.mDPhysElems.mUseSize    += 10;
                                    ipSpatialTree.mTreeNodes.mpData[i].mData.mAnimCollElems.mUseSize += 50;
                                    ipSpatialTree.mTreeNodes.mpData[i].mData.mAnimElems.mUseSize     += 60;
                                }
                            break
                        }
                        default:
                            break
                    }
                }
            }
            f.EndChunk()
        }
        level_instance.GetRenderManager().OnChunkLoaded(ipSpatialTree, /*iUserData*/0, SRR2.ChunkID.TREE_DSG)
        return null
    }
}
export class WorldSphereLoader extends tSimpleChunkHandler implements IWrappedLoader{
    constructor() {
        super(SRR2.ChunkID.WORLD_SPHERE_DSG)
    }
    override LoadObject(level_instance: Instance, f: tChunkFile): IEntityDSG | null { return null }
}
// <DynaPhysDSG><AnimCollisionEntityDSG><AnimEntityDSG>
type RoadList = RoadSegment[]
export class RoadLoader extends tSimpleChunkHandler implements IWrappedLoader {
    sNumRoadSegmentsLoaded: number
    mNumIntersectionsUsed: number
    mIntersections: Intersection[]
    constructor() { super(SRR2.ChunkID.ROAD) }
    override Load(level_instance: Instance, f: tChunkFile) {
        const name = f.realFile.get_nstring()
        const type = f.GetUInt()
        const rm = level_instance.roadManager_instance
        const start = f.realFile.get_nstring()
        const startIntersection = rm.FindIntersection_str(start)
        const end = f.realFile.get_nstring()
        const endIntersection = rm.FindIntersection_str(end)
        const density = f.GetUInt()
        const speed = f.GetUInt()
        let segments: RoadList = []

        let firstSeg = true
        let numLanes = 0
        if (!f.ChunksRemaining()) { assert(false, `The Road: ${name} has no segments!\n`) }

        let segCount = 0
        while (f.ChunksRemaining()) {
            f.BeginChunk()

            let tmpNumLanes = 0
            segments = this.LoadRoadSegment(level_instance, f, tmpNumLanes)

            if (firstSeg) { numLanes = tmpNumLanes }
            else { assert(numLanes == tmpNumLanes, ``) }
            // segments.push_back(segment)
            segments.push(segments)
            ++segCount

            f.EndChunk()
        }

        const road = rm.GetFreeRoadMemory()
        assert(road != null, ``)

        road.SetName(name)
        rm.AddRoad(road)
        road.SetDestinationIntersection(endIntersection!)
        road.SetSourceIntersection(startIntersection!)
        road.SetNumLanes(numLanes)

        const SPEED_MASK  = 0x0000_00FF
        const DIFFIC_MASK = 0x0000_FF00
        const SC_MASK     = 0x0001_0000

        road.SetSpeed(speed & SPEED_MASK)
        road.SetDifficulty((speed & DIFFIC_MASK) >> 8)
        road.SetShortCut((speed & SC_MASK) ? true : false)
        road.SetDensity(density)

        startIntersection!.AddRoadOut(road)
        endIntersection!.AddRoadIn(road)
        road.AllocateSegments(segments.length)//segments.size())

        // RoadList::iterator i;
        let dist = 10000000000
        let closest: RoadSegment | null = null
        const startPoint = startIntersection!.mLocation

        // for (let i = segments.begin(); i != segments.end(); i++) {
        for (const segment of segments) {
            const origin = vec3.create()
            segment.GetCorner(0, origin)
            vec3.sub(origin, origin, startPoint)
            const segToInt = Math.pow(vec3.length(origin), 2)
            if (segToInt < dist) {
                closest = segment
                dist = segToInt
            }
        }
        let numAllocated = 0
        const allocatedSegments: RoadList = []

        allocatedSegments.push_back(closest)
        ++numAllocated

        let current = closest
        while (allocatedSegments.size() < segments.size()) {
            let found = false
            for (let i = segments.begin(); i != segments.end(); i++) {
                const seg = i
                const currentTrailingLeft = vec3.create()
                const segOrigin = vec3.create()

                current.GetCornter(1, currentTrailingLeft)
                seg.GetCorner(0, segOrigin)

                if (rmt.Epsilon(currentTrailingLeft[0], segOrigin[0], 0.5)
                 && rmt.Epsilon(currentTrailingLeft[0], segOrigin[0], 0.5)
                 && rmt.Epsilon(currentTrailingLeft[0], segOrigin[0], 0.5)) {
                        current = seg
                        allocatedSegments.push_back(seg)
                        ++numAllocated

                        found = true
                        break
                    }
            }
        }
    }
    LoadRoadSegment(level_instance: Instance, f: tChunkFile, numLanes: number) { 
        assert(f.GetCurrentID() == SRR2.ChunkID.ROAD_SEGMENT, ``)
        const name = f.realFile.get_nstring()
        const segDataName = f.realFile.get_nstring()

        const hierarchy = read_matrix(f.realFile)
        const scale = read_mat4(f.realFile)
        const z = vec3.fromValues(0, 0, 1)
        vec3.transformMat4(z, z, scale)
        const scaleAlongFacing = z[2]

        const rm = level_instance.roadManager_instance
        const rsd = rm.FindRoadSegmentData(segDataName)
        const rs = rm.GetFreeRoadSegmentMemory()
        rs.SetName(name)
        rs.Init(rsd, hierarchy, scaleAlongFacing)

        rs.AddRoadSegment(rs)
        numLanes = rsd.GetNumLanes()
        level_instance.GetRenderManager().OnChunkLoaded(rs, 0/*mUserData*/, SRR2.ChunkID.ROAD_SEGMENT)
        this.sNumRoadSegmentsLoaded++

        return rs
    }
}
/*export class tGeometryLoader extends tSimpleChunkHandler implements IWrappedLoader {
    mEnableFaceNormals = false
    mOptimize = true
    mVertexMask = 0xffff_ffff
    constructor() { super(Pure3D.Mesh.MESH) }
    override LoadObject(level_instance: Instance, f: tChunkFile): IEntityDSG {
        const name = f.realFile.get_nstring()
        const version = f.GetLong()
        // bool bOptimized = ( version != GEOMETRY_NONOPTIMIZE_VERSION );
        const nPrimGroup = f.GetLong()
        const Allocate = (nPrimGroup: number) => new tGeometry(nPrimGroup)
        const geo = Allocate(nPrimGroup)
        geo.name = name
        
        let primGroupCount = 0

        while (f.ChunksRemaining()) {
            f.BeginChunk()
            switch (f.GetCurrentID()) {
                case Pure3D.Mesh.PRIMGROUP: {
                    const pgLoader = new tPrimGroupLoader
                    pgLoader.SetVertexFormatMask(this.mVertexMask)
                    const pg: tPrimGroup = pgLoader.Load(f, null, this.mOptimize && bOptimized, false)
                    geo.SetPrimGroup(primGroupCount, pg)
                    ++primGroupCount
                    break
                }
                case Pure3D.Mesh.BOX: {
                    const minx = f.GetFloat()
                    const miny = f.GetFloat()
                    const minz = f.GetFloat()
                    const maxx = f.GetFloat()
                    const maxy = f.GetFloat()
                    const maxz = f.GetFloat()

                    geo.SetBoundingBox(minx, miny, minz, maxx, maxy, maxz)
                    break
                }
                case Pure3D.Mesh.SPHERE: {
                    const cx = f.GetFloat()
                    const cy = f.GetFloat()
                    const cz = f.GetFloat()
                    const  r = f.GetFloat()
                    geo.SetBoundingSphere(cx, cy, cz, r)
                    break
                }
                case Pure3D.Mesh.RENDERSTATUS: {
                    geo.SetCastsShadow(!(f.GetLong() as unknown as boolean))
                }
                default:
                    break
            }
            f.EndChunk()
        }

        return geo
    }
}*/