import { CollisionEntityDSG } from './collisionentitydsg.js';

export class FenceEntityDSG extends CollisionEntityDSG {
  public mStartPoint: rmt.Vector;
  public mEndPoint: rmt.Vector;
  public mNormal: rmt.Vector;

  constructor() {
    super();
  }
}

