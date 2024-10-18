import { assert } from '../../util.js';
import { int, NULL } from '../type_aliases.js';

import { FenceLoader } from './fence.js';
import { IWrappedLoader } from './iwrappedloader.js';

static const NUM_GLOBAL_ENTITIES: int = 32;

type IWrappedLoader = {};
export class AllWrappers {
  const mpLoaders: IWrappedLoader[] = [] // [msNumWrappers];

  CoupleAllLoaders() {
    let pWL: IWrappedLoader = new IWrappedLoader();

    for (let i: int = AllWrappers.Enum.msNumWrappers - 1; i > -1; i--) {
      // assert(mpLoaders[i] == NULL);

      switch (i) {
        // case AllWrappers.Enum.msGeometry:
        //   {
        //     pWL = new GeometryWrappedLoader();
        //     ((GeometryWrappedLoader *)pWL) -> AddRef();
        //     mpLoaders[i] = pWL;
        //   }
        //   break;
        //
        // case AllWrappers.Enum.msStaticPhys:
        //   {
        //
        //     pWL = new StaticPhysLoader();
        //     ((StaticPhysLoader *)pWL) -> AddRef();
        //     mpLoaders[i] = pWL;
        //   }
        //   break;
        //
        // case AllWrappers.Enum.msStaticEntity:
        //   {
        //     pWL = new StaticEntityLoader();
        //     ((StaticEntityLoader *)pWL) -> AddRef();
        //     mpLoaders[i] = pWL;
        //   }
        //   break;
        //
        // case AllWrappers.Enum.msTreeDSG:
        //   {
        //     pWL = new TreeDSGLoader();
        //     ((TreeDSGLoader *)pWL) -> AddRef();
        //     mpLoaders[i] = pWL;
        //   }
        //   break;
        //
        case AllWrappers.Enum.msFenceEntity:
          {
            pWL = new FenceLoader();
            // ((FenceLoader *)pWL) -> AddRef();
            this.mpLoaders[i] = pWL;
          }
          break;

        // case AllWrappers.Enum.msIntersectDSG:
        //   {
        //     pWL = new IntersectLoader();
        //     ((IntersectLoader *)pWL) -> AddRef();
        //     mpLoaders[i] = pWL;
        //   }
        //   break;
        //
        // case AllWrappers.Enum.msAnimCollEntity:
        //   {
        //     pWL = new AnimCollLoader();
        //     ((AnimCollLoader *)pWL) -> AddRef();
        //     mpLoaders[i] = pWL;
        //   }
        //   break;
        //
        // case AllWrappers.Enum.msDynaPhys:
        //   {
        //     pWL = new DynaPhysLoader();
        //     ((DynaPhysLoader *)pWL) -> AddRef();
        //     mpLoaders[i] = pWL;
        //   }
        //   break;
        //
        // case AllWrappers.Enum.msInstStatEntity:
        //   {
        //     pWL = new InstStatEntityLoader();
        //     ((InstStatEntityLoader *)pWL) -> AddRef();
        //     mpLoaders[i] = pWL;
        //   }
        //   break;
        //
        // case AllWrappers.Enum.msInstStatPhys:
        //   {
        //     pWL = new InstStatPhysLoader();
        //     ((InstStatPhysLoader *)pWL) -> AddRef();
        //     mpLoaders[i] = pWL;
        //   }
        //   break;
        //
        // case AllWrappers.Enum.msLocator:
        //   {
        //     pWL = new LocatorLoader();
        //     ((LocatorLoader *)pWL) -> AddRef();
        //     mpLoaders[i] = pWL;
        //   }
        //   break;
        //
        // case AllWrappers.Enum.msWorldSphere:
        //   {
        //     pWL = new WorldSphereLoader();
        //     ((WorldSphereLoader *)pWL) -> AddRef();
        //     mpLoaders[i] = pWL;
        //   }
        //   break;
        //
        // case AllWrappers.Enum.msRoadSegment:
        //   {
        //     pWL = new RoadLoader();
        //     ((RoadLoader *)pWL) -> AddRef();
        //     mpLoaders[i] = pWL;
        //   }
        //   break;
        //
        // case AllWrappers.Enum.msPathSegment:
        //   {
        //     pWL = new PathLoader();
        //     ((PathLoader *)pWL) -> AddRef();
        //     mpLoaders[i] = pWL;
        //   }
        //   break;
        //
        // case AllWrappers.Enum.msBillboard:
        //   {
        //     pWL = new BillboardWrappedLoader();
        //     ((BillboardWrappedLoader *)pWL) -> AddRef();
        //     mpLoaders[i] = pWL;
        //   }
        //   break;
        // case AllWrappers.Enum.msInstParticleSystem:
        //   {
        //     pWL = new InstParticleSystemLoader();
        //     ((InstParticleSystemLoader *)pWL) -> AddRef();
        //     mpLoaders[i] = pWL;
        //   }
        //   break;
        // case AllWrappers.Enum.msBreakableObject:
        //   {
        //     pWL = new BreakableObjectLoader();
        //     ((BreakableObjectLoader *)pWL) -> AddRef();
        //     mpLoaders[i] = pWL;
        //   }
        //   break;
        // case AllWrappers.Enum.msAnimEntity:
        //   {
        //     pWL = new AnimDSGLoader();
        //     ((AnimDSGLoader *)pWL) -> AddRef();
        //     mpLoaders[i] = pWL;
        //   }
        //   break;
        // case AllWrappers.Enum.msLensFlare:
        //   {
        //     pWL = new LensFlareLoader();
        //     ((LensFlareLoader *)pWL) -> AddRef();
        //     mpLoaders[i] = pWL;
        //   }
        //   break;
        // case AllWrappers.Enum.msAnimDynaPhys:
        //   {
        //     pWL = new AnimDynaPhysLoader();
        //     ((AnimDynaPhysLoader *)pWL) -> AddRef();
        //     mpLoaders[i] = pWL;
        //   }
        //   break;
        // case AllWrappers.Enum.msAnimDynaPhysWrapper:
        //   {
        //     pWL = new AnimDynaPhysWrapperLoader();
        //     ((AnimDynaPhysWrapperLoader *)pWL) -> AddRef();
        //     mpLoaders[i] = pWL;
        //   }
        //   break;
        default:
          // assert(false);
          break;
      }
    }
  }

  AddGlobalEntity(Entity: tDrawable) {
    if (!Entity) { return; }

    assert(this.mNumGlobalEntities < NUM_GLOBAL_ENTITIES);
    assert(GetGlobalEntity(Entity.GetUID()) == 0);
    this.mpGlobalEntities[this.mNumGlobalEntities] = Entity;
    this.mpGlobalEntities[this.mNumGlobalEntities].AddRef();
    ++this.mNumGlobalEntities;
  }
  GetGlobalEntity(EntityID: tUID): tDrawable {
    for (let i: int = 0; i < this.mNumGlobalEntities; ++i) {
      if (mpGlobalEntities[i] -> GetUID() == EntityID) {
        return mpGlobalEntities[i];
      }
    }
    return 0;
  }
  ClearGlobalEntities() {
    for (let i: int = 0; i < this.mNumGlobalEntities; ++i) {
      // tRefCounted.Release(mpGlobalEntities[i]);
    }
    this.mNumGlobalEntities = 0;
  }
  constructor() {
    for (let i: int = this.msNumWrappers - 1; i > -1; i--) {
      this.mpLoaders[i] = NULL;
    }
    this.CoupleAllLoaders();

    // mpGlobalEntities = new tDrawable * [NUM_GLOBAL_ENTITIES];
    // assert(mpGlobalEntities);
    // mNumGlobalEntities = 0;
  }
  mLoader(iIndex: int): IWrappedLoader {
    // assert( iIndex < msNumWrappers);

    return mpLoaders[iIndex];
  }
}

namespace AllWrappers {
  export enum Enum {
    msGeometry,
    msStaticEntity,
    msStaticPhys,
    msTreeDSG,
    msFenceEntity,
    msIntersectDSG,
    msAnimCollEntity,
    msAnimEntity,
    msDynaPhys,
    msInstStatEntity,
    msInstStatPhys,
    msLocator,
    msWorldSphere,
    msRoadSegment,
    msPathSegment,
    msBillboard,
    msInstParticleSystem,
    msBreakableObject,
    msLensFlare,
    msAnimDynaPhys,
    msAnimDynaPhysWrapper,
    msNumWrappers
  };
}
