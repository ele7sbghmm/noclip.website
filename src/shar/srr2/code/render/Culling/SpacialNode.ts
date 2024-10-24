import { BoxPts } from './BoxPts.js';
import { FenceEntityDSG } from '../DSG/FenceEntityDSG.js';

type SwapArray<T> = Array<T>;
type NodeSwapArray<T> = Array<T>;

export class SpatialNode {
  public mFenceElems: SwapArray<FenceEntityDSG>;

  public mBBox: BoxPts;
}

