import { AllWrappers } from './allwrappers.js';
import { tP3DFileHandler } from './loadmanager.js';

export class Win32Platform {
  InitializePure3D() {

    const p3d: tP3DFileHandler = new tP3DFileHandler;
    //    p3d::loadManager.AddHandler(p3d, "p3d");
    //? p3d.context.GetLoadManager().AddHandler(p3d, "p3d");
    //? p3d.context.GetLoadManager().AddHandler(new tPNGHandler, "png");

    // if (CommandLineOptions.Get(CLO_FE_UNJOINED)) {
    //   p3d.context.GetLoadManager().AddHandler(new tBMPHandler, "bmp");
    //   p3d.context.GetLoadManager().AddHandler(new tTargaHandler, "tga");
    // }
    // else {
    //? p3d.context.GetLoadManager().AddHandler(new tBMPHandler, "p3d");
    //? p3d.context.GetLoadManager().AddHandler(new tPNGHandler, "p3d");
    //? p3d.context.GetLoadManager().AddHandler(new tTargaHandler, "p3d");
    // }

    //    p3d.AddHandler(new tGeometryLoader);
    //    GeometryWrappedLoader* pGWL = new GeometryWrappedLoader;
    // const pGWL: GeometryWrappedLoader = GetAllWrappers().mpLoader(AllWrappers.Enum.msGeometry);
    // //? pGWL.SetRegdListener(GetRenderManager(), 0);
    // p3d.AddHandler(pGWL);
    //
    // const StaticEntityLoader pSEL = (StaticEntityLoader *)GetAllWrappers().mpLoader(AllWrappers.msStaticEntity);
    // //? pSEL.SetRegdListener(GetRenderManager(), 0);
    // p3d.AddHandler(pSEL);
    //
    // const pSPL: StaticPhysLoader = (StaticPhysLoader *)GetAllWrappers().mpLoader(AllWrappers.msStaticPhys);
    // //? pSPL.SetRegdListener(GetRenderManager(), 0);
    // p3d.AddHandler(pSPL);
    //
    // const pTDL: TreeDSGLoader = (TreeDSGLoader *)GetAllWrappers().mpLoader(AllWrappers.msTreeDSG);
    // //? pTDL.SetRegdListener(GetRenderManager(), 0);
    // p3d.AddHandler(pTDL);
    //
    const pFL: FenceLoader = GetAllWrappers().mpLoader(AllWrappers.msFenceEntity);
    // //? pFL.SetRegdListener(GetRenderManager(), 0);
    p3d.AddHandler(pFL);
    //
    // const pIL: IntersectLoader = (IntersectLoader *)GetAllWrappers().mpLoader(AllWrappers.msIntersectDSG);
    // //? pIL.SetRegdListener(GetRenderManager(), 0);
    // p3d.AddHandler(pIL);
    //
    // const pACL: AnimCollLoader = (AnimCollLoader *)GetAllWrappers().mpLoader(AllWrappers.msAnimCollEntity);
    // //? pACL.SetRegdListener(GetRenderManager(), 0);
    // p3d.AddHandler(pACL);
    //
    // const pAnimDSGLoader: AnimDSGLoader = (AnimDSGLoader *)GetAllWrappers().mpLoader(AllWrappers.msAnimEntity);
    // //? pAnimDSGLoader.SetRegdListener(GetRenderManager(), 0);
    // p3d.AddHandler(pAnimDSGLoader);
    //
    // const pDPL: DynaPhysLoader = (DynaPhysLoader *)GetAllWrappers().mpLoader(AllWrappers.msDynaPhys);
    // //? pDPL.SetRegdListener(GetRenderManager(), 0);
    // p3d.AddHandler(pDPL);
    //
    // const pISPL: InstStatPhysLoader = (InstStatPhysLoader *)GetAllWrappers().mpLoader(AllWrappers.msInstStatPhys);
    // //? pISPL.SetRegdListener(GetRenderManager(), 0);
    // p3d.AddHandler(pISPL);
    //
    // const pISEL: InstStatEntityLoader = (InstStatEntityLoader *)GetAllWrappers().mpLoader(AllWrappers.msInstStatEntity);
    // //? pISEL.SetRegdListener(GetRenderManager(), 0);
    // p3d.AddHandler(pISEL);
    //
    // const pLL: LocatorLoader = (LocatorLoader *)GetAllWrappers().mpLoader(AllWrappers.msLocator);
    // //? pLL.SetRegdListener(GetRenderManager(), 0);
    // p3d.AddHandler(pLL);
    //
    // const pRL: RoadLoader = (RoadLoader *)GetAllWrappers().mpLoader(AllWrappers.msRoadSegment);
    // //? pRL.SetRegdListener(GetRenderManager(), 0);
    // p3d.AddHandler(pRL);
    //
    // const pPL: PathLoader = (PathLoader *)GetAllWrappers().mpLoader(AllWrappers.msPathSegment);
    // //? pPL.SetRegdListener(GetRenderManager(), 0);
    // p3d.AddHandler(pPL);
    //
    // const pWSL: WorldSphereLoader = (WorldSphereLoader *)GetAllWrappers().mpLoader(AllWrappers.msWorldSphere);
    // //? pWSL.SetRegdListener(GetRenderManager(), 0);
    // p3d.AddHandler(pWSL);
    //
    // const pLSL: LensFlareLoader = (LensFlareLoader *)GetAllWrappers().mpLoader(AllWrappers.msLensFlare);
    // //? pLSL.SetRegdListener(GetRenderManager(), 0);
    // p3d.AddHandler(pLSL);
    //
    // const pBWL: BillboardWrappedLoader = (BillboardWrappedLoader *)GetAllWrappers().mpLoader(AllWrappers.msBillboard);
    // //? pBWL.SetRegdListener(GetRenderManager(), 0);
    // p3d.AddHandler(pBWL);
    //
    // const pInstParticleSystemLoader: InstParticleSystemLoader = (InstParticleSystemLoader *) GetAllWrappers().mpLoader(AllWrappers.msInstParticleSystem);
    // //? pInstParticleSystemLoader.SetRegdListener(GetRenderManager(), 0);
    // p3d.AddHandler(pInstParticleSystemLoader);
    //
    // const pBreakableObjectLoader: BreakableObjectLoader = (BreakableObjectLoader *) GetAllWrappers().mpLoader(AllWrappers.msBreakableObject);
    // //? pBreakableObjectLoader.SetRegdListener(GetRenderManager(), 0);
    // p3d.AddHandler(pBreakableObjectLoader);
    //
    // const pAnimDynaPhysLoader: AnimDynaPhysLoader = (AnimDynaPhysLoader *) GetAllWrappers().mpLoader(AllWrappers.msAnimDynaPhys);
    // //? pAnimDynaPhysLoader.SetRegdListener(GetRenderManager(), 0);
    // p3d.AddHandler(pAnimDynaPhysLoader);
    //
    // const pAnimWrapperLoader: AnimDynaPhysWrapperLoader = (AnimDynaPhysWrapperLoader *) GetAllWrappers().mpLoader(AllWrappers.msAnimDynaPhysWrapper);
    // //? pAnimWrapperLoader.SetRegdListener(GetRenderManager(), 0);
    // p3d.AddHandler(pAnimWrapperLoader);

    //? p3d.AddHandler(new tTextureLoader);
    //? p3d.AddHandler(new tSetLoader);
    //? p3d.AddHandler(new tShaderLoader);
    //? p3d.AddHandler(new tCameraLoader);
    //? p3d.AddHandler(new tGameAttrLoader);
    //? p3d.AddHandler(new tLightLoader);

    //? p3d.AddHandler(new tLocatorLoader);
    //? p3d.AddHandler(new tLightGroupLoader);
    //? p3d.AddHandler(new tImageLoader);
    //? p3d.AddHandler(new tTextureFontLoader);
    //? p3d.AddHandler(new tImageFontLoader);
    //? p3d.AddHandler(new tSpriteLoader);
    //p3d.AddHandler(new tBillboardQuadGroupLoader);
    //? p3d.AddHandler(new tSkeletonLoader);
    //? p3d.AddHandler(new tPolySkinLoader);
    //? p3d.AddHandler(new tCompositeDrawableLoader);
    //? p3d.AddHandler(new tVertexAnimKeyLoader);
    //? p3d.AddHandler(new tAnimationLoader);
    //? p3d.AddHandler(new tFrameControllerLoader);
    //? p3d.AddHandler(new tMultiControllerLoader);
    //? p3d.AddHandler(new tAnimatedObjectFactoryLoader);
    //? p3d.AddHandler(new tAnimatedObjectLoader);
    //? p3d.AddHandler(new tParticleSystemFactoryLoader);
    //? p3d.AddHandler(new tParticleSystemLoader);
    //? p3d.AddHandler(new tLensFlareGroupLoader);
    //? p3d.AddHandler(new sg.Loader);

    //? p3d.AddHandler(new tExpressionGroupLoader);
    //? p3d.AddHandler(new tExpressionMixerLoader);
    //? p3d.AddHandler(new tExpressionLoader);

    //? p3d.AddHandler(new ATCLoader);

    //? p3d.AddHandler(new p3d::tIgnoreLoader);

    //? sequencerFileHandler: tSEQFileHandler = new tSEQFileHandler();
    //? p3d.loadManager.AddHandler(sequencerFileHandler, "seq");

    //? sim.InstallSimLoaders();

    //? p3d.AddHandler(new CameraDataLoader, SRR2.ChunkID:: FOLLOWCAM);
    //? p3d.AddHandler(new CameraDataLoader, SRR2.ChunkID:: WALKERCAM);
    //? p3d.AddHandler(new IntersectionLoader);
    //? p3d.AddHandler(new RoadDataSegmentLoader);
    //? p3d.AddHandler(new CStatePropDataLoader);
  }
}
