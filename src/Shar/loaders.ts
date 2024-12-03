import { mat4, vec3 } from "gl-matrix"
import { BBoxVolume, CollisionObject, CollisionVolume, CollisionVolumeOwner, CylinderVolume, EventLocator, FenceEntityDSG, IEntityDSG, IntersectDSG, Locator, LocatorEvent, LocatorType, OBBoxVolume, PathManager, PathSegment, RectTriggerVolume, SimState, SpatialTree, SphereTriggerVolume, SphereVolume, StaticPhysDSG, TriggerLocator, TriggerVolume, WallVolume, ZoneEventLocator } from "./dsg.js"
import { tChunkFile } from "./file.js"
import { SRR2 } from "./srrchunks.js"
import { read_vec3 } from "./reader.js"
import { Pure3D, Simulation } from "./chunkids.js"
import { Instance } from "./scenes.js"

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
        const nPoints = f.GetUint()
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
        pStaticEntityDSG.name = f.real_file.get_nstring()
        const version = f.real_file.i32()
        const HasAlpha = f.real_file.i32()
        if (HasAlpha) pStaticEntityDSG.mTranslucent = true

        while (f.chunks_remaining()) {
            f.begin_chunk()
            switch (f.get_current_id()) {
                case Pure3D.Mesh.MESH: {
                    const pGeo = new tGeometry().LoadObject(wrl, f) // wrapper
                    pStaticEntityDSG.mpDrawstuff = pGeo // ->ProcessShaders... ->SetInternalState()
                }
            }
            f.end_chunk()
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
        ipSpatialTree.n_nodes = f.realFile.i32()
        ipSpatialTree.bounds_min = read_vec3(f.realFile)
        ipSpatialTree.bounds_max = read_vec3(f.realFile)

        while (f.ChunksRemaining()) {
            f.BeginChunk()
            switch (f.GetCurrentID()) {
                case SRR2.ChunkID.CONTIGUOUS_BIN_NODE: {
                    const sub_tree_size = f.realFile.i32()
                    const parent_offset = f.realFile.i32()

                    f.BeginChunk()
                    switch (f.GetCurrentID()) {
                        case SRR2.ChunkID.SPATIAL_NODE: {
                            const axis = f.realFile.i8()
                            const pos = f.realFile.f32()
                            const sentity_elems = f.realFile.i32()
                            const sphys_elems = f.realFile.i32()
                            const intersect_elems = f.realFile.i32()
                            const dphys_elems = f.realFile.i32()
                            const fence_elems = f.realFile.i32()
                            const roadsegment_elems = f.realFile.i32()
                            const pathsegment_elems = f.realFile.i32()
                            const anim_elems = f.realFile.i32()
                            ipSpatialTree.nodes.push({ axis, pos })
                            f.EndChunk()
                            break
                        }
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
