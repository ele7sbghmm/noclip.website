import { Vector } from './math.js'
import { tEntity } from './rad_util.js'

export class Drawable extends tEntity { }
export class IEntityDSG extends Drawable { }
export class CollisionEntityDSG extends IEntityDSG { }
export class FenceEntityDSG extends CollisionEntityDSG {
    mStartPoint: Vector
    mEndPoint: Vector
    mNormal: Vector
}
export class IntersectDSG extends IEntityDSG { }

