// import { vec3 } from "gl-matrix"
// import { P3D_COMPOSITE_DRAWABLE } from "./chunks"
// import { tSimpleChunkHandler, tChunkFile } from "./file"
// import { rmt } from "./math"
// import { tEntity } from "./rad_util"
// import { Instance } from "./scenes/scenes"
// import { tPrimGroup } from "./pddi/prim"
// import { Pure3D } from "./chunkids"

// export class tCompositeDrawableLoader extends tSimpleChunkHandler {
//     constructor() { super(P3D_COMPOSITE_DRAWABLE) }
//     LoadObject(level_instance: Instance, f: tChunkFile): null { throw `` }
// }
// export class tDrawable extends tEntity {

// }
// type tPtrArray<T> = Array<T>
// export class tGeometry extends tDrawable {
//     box: rmt.Box3D
//     sphere: rmt.Sphere
//     primGroup: tPtrArray<tPrimGroup>
//     constructor(nPG: number) {
//         super()
//         this.primGroup = Array.from({ length: nPG }, () => new tPrimGroup)
//     }
//     GetBoundingBox(): any {
//         throw new Error('Method not implemented.')
//     }
//     GetBoundingSphere(): any {
//         throw new Error('Method not implemented.')
//     }
//     GetNumPrimGroup(): any {
//         throw new Error('Method not implemented.')
//     }
//     GetPrimGroup(i: number) {
//         throw new Error('Method not implemented.')
//     }
//     GetPrimGoup(i: number): tPrimGroupStreamed {
//         throw new Error('Method not implemented.')
//     }
//     SetPrimGroup(primGroupCount: number, pg: tPrimGroup) {
//         throw new Error("Method not implemented.")
//     }
//     SetCastsShadow(arg0: boolean) {
//         throw new Error("Method not implemented.")
//     }
//     SetBoundingSphere(centerx: number, centery: number, centerz: number, radius: number) {
//         this.sphere.centre = vec3.fromValues(centerx, centery, centerz)
//         this.sphere.radius = radius
//     }
//     SetBoundingBox(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, ) {
//         this.box.min  = vec3.fromValues(x1, y1, z1)
//         this.box.max = vec3.fromValues(x2, y2, z2)
//     }
// }

// export class tGeometryLoader extends tSimpleChunkHandler {
//     mEnableFaceNormals = false
//     mOptimize = true
//     mVertexMask = 0xffff_ffff
//     constructor() { super(Pure3D.Mesh.MESH) }
//     override LoadObject(level_instance: Instance, f: tChunkFile): IEntityDSG {
//         const name = f.realFile.get_nstring()
//         const version = f.GetLong()
//         const bOptimized = ( version != GEOMETRY_NONOPTIMIZE_VERSION );
//         const nPrimGroup = f.GetLong()
//         const Allocate = (nPrimGroup: number) => new tGeometry(nPrimGroup)
//         const geo = Allocate(nPrimGroup)
//         geo.name = name
        
//         let primGroupCount = 0

//         while (f.ChunksRemaining()) {
//             f.BeginChunk()
//             switch (f.GetCurrentID()) {
//                 case Pure3D.Mesh.PRIMGROUP: {
//                     const pgLoader = new tPrimGroupLoader
//                     pgLoader.SetVertexFormatMask(this.mVertexMask)
//                     const pg: tPrimGroup = pgLoader.Load(f, null, this.mOptimize && bOptimized, false)
//                     geo.SetPrimGroup(primGroupCount, pg)
//                     ++primGroupCount
//                     break
//                 }
//                 case Pure3D.Mesh.BOX: {
//                     const minx = f.GetFloat()
//                     const miny = f.GetFloat()
//                     const minz = f.GetFloat()
//                     const maxx = f.GetFloat()
//                     const maxy = f.GetFloat()
//                     const maxz = f.GetFloat()

//                     geo.SetBoundingBox(minx, miny, minz, maxx, maxy, maxz)
//                     break
//                 }
//                 case Pure3D.Mesh.SPHERE: {
//                     const cx = f.GetFloat()
//                     const cy = f.GetFloat()
//                     const cz = f.GetFloat()
//                     const  r = f.GetFloat()
//                     geo.SetBoundingSphere(cx, cy, cz, r)
//                     break
//                 }
//                 case Pure3D.Mesh.RENDERSTATUS: {
//                     geo.SetCastsShadow(!(f.GetLong() as unknown as boolean))
//                 }
//                 default:
//                     break
//             }
//             f.EndChunk()
//         }
//         return geo
//     }
// }
// export class GeometryWrappedLoader extends tGeometryLoader {
//     override LoadObject(level_instance: Instance, f: tChunkFile): tEntity { return new tEntity }
// }
