import { GetAllWrappers, AllWrappers, TreeDSGLoader, FenceLoader, IntersectLoader, WorldSphereLoader } from './loaders.js'
import { GetRenderManager } from './renderer.js'
import { tP3DFileHandler } from './loaders.js'

export class Win32Platform {
    InitializePure3D() {
        const p3d = new tP3DFileHandler

        // const pGWL = GetAllWrappers().mpLoader(AllWrappers._enum.msGeometry) as GeometryWrappedLoader
        // // pGWL.SetRegdListener(GetRenderManager(), 0)
        // p3d.AddHandler(pGWL)
        // const pSEL = GetAllWrappers().mpLoader(AllWrappers._enum.msStaticEntity) as StaticEntityLoader
        // // pSEL.SetRegdListener(GetRenderManager(), 0)
        // p3d.AddHandler(pSEL)
        // const pSPL = GetAllWrappers().mpLoader(AllWrappers._enum.msStaticPhys) as StaticPhysLoader
        // // pSPL.SetRegdListener(GetRenderManager(), 0)
        // p3d.AddHandler(pSPL)
        // const pTDL = GetAllWrappers().mpLoader(AllWrappers._enum.msTreeDSG) as TreeDSGLoader
        // // pTDL.SetRegdListener(GetRenderManager(), 0)
        // p3d.AddHandler(pTDL)
        // const pFL = GetAllWrappers().mpLoader(AllWrappers._enum.msFenceEntity) as FenceLoader
        // // pFL.SetRegdListener(GetRenderManager(), 0)
        // p3d.AddHandler(pFL)
        // const pIL = GetAllWrappers().mpLoader(AllWrappers._enum.msIntersectDSG) as IntersectLoader
        // // pIL.SetRegdListener(GetRenderManager(), 0)
        // p3d.AddHandler(pIL)
        // const pACL = GetAllWrappers().mpLoader(AllWrappers._enum.msAnimCollEntity) as AnimCollLoader
        // // pACL.SetRegdListener(GetRenderManager(), 0)
        // p3d.AddHandler(pACL)
        // const pAnimDSGLoader = GetAllWrappers().mpLoader(AllWrappers._enum.msAnimEntity) as AnimDSGLoader
        // // pAnimDSGLoader.SetRegdListener(GetRenderManager(), 0)
        // p3d.AddHandler(pAnimDSGLoader)
        // const pDPL = GetAllWrappers().mpLoader(AllWrappers._enum.msDynaPhys) as DynaPhysLoader
        // // pDPL.SetRegdListener(GetRenderManager(), 0)
        // p3d.AddHandler(pDPL)
        // const pISPL = GetAllWrappers().mpLoader(AllWrappers._enum.msInstStatPhys) as InstStatPhysLoader
        // // pISPL.SetRegdListener(GetRenderManager(), 0)
        // p3d.AddHandler(pISPL)
        // const pISEL = GetAllWrappers().mpLoader(AllWrappers._enum.msInstStatEntity) as InstStatEntityLoader
        // // pISEL.SetRegdListener(GetRenderManager(), 0)
        // p3d.AddHandler(pISEL)
        // const pLL = GetAllWrappers().mpLoader(AllWrappers._enum.msLocator) as LocatorLoader
        // // pLL.SetRegdListener(GetRenderManager(), 0)
        // p3d.AddHandler(pLL)
        // const pRL = GetAllWrappers().mpLoader(AllWrappers._enum.msRoadSegment) as RoadLoader
        // // pRL.SetRegdListener(GetRenderManager(), 0)
        // p3d.AddHandler(pRL)
        // const pPL = GetAllWrappers().mpLoader(AllWrappers._enum.msPathSegment) as PathLoader
        // // pPL.SetRegdListener(GetRenderManager(), 0)
        // p3d.AddHandler(pPL)
        // const pWSL = GetAllWrappers().mpLoader(AllWrappers._enum.msWorldSphere) as WorldSphereLoader
        // // pWSL.SetRegdListener(GetRenderManager(), 0)
        // p3d.AddHandler(pWSL)
        // const pLSL = GetAllWrappers().mpLoader(AllWrappers._enum.msLensFlare) as LensFlareLoader
        // // pLSL.SetRegdListener(GetRenderManager(), 0)
        // p3d.AddHandler(pLSL)
        // const pBWL = GetAllWrappers().mpLoader(AllWrappers._enum.msBillboard) as BillboardWrappedLoader
        // // pBWL.SetRegdListener(GetRenderManager(), 0)
        // p3d.AddHandler(pBWL)
        // const pInstParticleSystemLoader = GetAllWrappers().mpLoader(AllWrappers._enum.msInstParticleSystem) as InstParticleSystemLoader
        // // pInstParticleSystemLoader.SetRegdListener(GetRenderManager(), 0)
        // p3d.AddHandler(pInstParticleSystemLoader)
        // const pBreakableObjectLoader = GetAllWrappers().mpLoader(AllWrappers._enum.msBreakableObject) as BreakableObjectLoader
        // // pBreakableObjectLoader.SetRegdListener(GetRenderManager(), 0)
        // p3d.AddHandler(pBreakableObjectLoader)
        // const pAnimDynaPhysLoader = GetAllWrappers().mpLoader(AllWrappers._enum.msAnimDynaPhys) as AnimDynaPhysLoader
        // // pAnimDynaPhysLoader.SetRegdListener(GetRenderManager(), 0)
        // p3d.AddHandler(pAnimDynaPhysLoader)
        // const pAnimWrapperLoader = GetAllWrappers().mpLoader(AllWrappers._enum.msAnimDynaPhysWrapper) as AnimDynaPhysWrapperLoader
        // // pAnimWrapperLoader.SetRegdListener(GetRenderManager(), 0)
        // p3d.AddHandler(pAnimWrapperLoader)
    }
}