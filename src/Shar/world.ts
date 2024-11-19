import { tEntity, Fence } from './dsg'
export class WorldScene {
    fences: Fence[]
    place(entity: tEntity) {
        switch (entity.constructor.name) {
            case 'Fence': this.fences.push(entity as Fence); break
            default: break;
        }

    }
}
