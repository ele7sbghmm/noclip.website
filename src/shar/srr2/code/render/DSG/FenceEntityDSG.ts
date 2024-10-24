import { CollisionEntityDSG } from './collisionentitydsg.js';
import { rmt } from '../../../libs/radmath/radmath/vector.js';

export class FenceEntityDSG extends CollisionEntityDSG {
  public mStartPoint: rmt.Vector;
  public mEndPoint: rmt.Vector;
  public mNormal: rmt.Vector;

  constructor() {
    super();
  }
}

