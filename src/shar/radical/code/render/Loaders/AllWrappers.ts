import { int } from '../../../../type_aliases.js';
import { IWrappedLoader } from './IWrappedLoader.js';
import { FenceLoader } from './FenceLoader.js';


export class AllWrappers {
  public static spInstance: AllWrappers;
  public mpLoaders: IWrappedLoader[];

  public static CreateInstance() {
    if (AllWrappers.spInstance == null) {
      AllWrappers.spInstance = new AllWrappers();
    }
  }
  public static GetInstance(): AllWrappers { return AllWrappers.spInstance; }
  public static GetAllWrappers(): AllWrappers { return AllWrappers.GetInstance(); }

  public mpLoader(iIndex: int): IWrappedLoader { return this.mpLoaders[iIndex]; }
  public CoupleAllLoaders() {
    let pWL: IWrappedLoader = {};

    for (let i: int = AllWrappers.Enum.msNumWrappers - 1; i > -1; i--) {
      switch (i) {
        case AllWrappers.Enum.msFenceEntity: {
          pWL = new FenceLoader();
          // pWL.AddRef();
          this.mpLoaders[i] = pWL;
          break;
        }
      }
    }
  }
}

export namespace AllWrappers {
  export enum Enum {
    // msGeometry,
    // msStaticEntity,
    // msStaticPhys,
    // msTreeDSG,
    msFenceEntity,
    // msIntersectDSG,
    // msAnimCollEntity,
    // msAnimEntity,
    // msDynaPhys,
    // msInstStatEntity,
    // msInstStatPhys,
    // msLocator,
    // msWorldSphere,
    // msRoadSegment,
    // msPathSegment,
    // msBillboard,
    // msInstParticleSystem,
    // msBreakableObject,
    // msLensFlare,
    // msAnimDynaPhys,
    // msAnimDynaPhysWrapper,
    msNumWrappers
  };
}
