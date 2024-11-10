import { rmt } from './math.js'
import { tEntity } from './rad_util.js'

export class Drawable extends tEntity { }
export class IEntityDSG extends Drawable { }
export class CollisionEntityDSG extends IEntityDSG { }
export class FenceEntityDSG extends CollisionEntityDSG {
    mStartPoint: rmt.Vector
    mEndPoint: rmt.Vector
    mNormal: rmt.Vector
}
export class IntersectDSG extends IEntityDSG { }

