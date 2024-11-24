import { tEntity, Fence, Tree, Intersect, StaticPhysDSG, TriggerVolume } from './dsg.js'

export class WorldScene {
    tree: Tree = new Tree
    fences: Fence[] = []
    intersects: Intersect[] = []
    static_phys: StaticPhysDSG[] = []
    tvt: TriggerVolumeTracker = new TriggerVolumeTracker
    set_tree(tree: Tree) { this.tree = tree }
    place(entity: tEntity) {
        switch (entity.constructor.name) {
            case 'Fence':         this.fences.push(entity as Fence); break
            case 'Intersect':     this.intersects.push(entity as Intersect); break
            case 'StaticPhysDSG': this.static_phys.push(entity as StaticPhysDSG); break
            default: break;
        }
    }
    public GetTriggerVolumeTracker() { return this.tvt }
}
class TriggerVolumeTracker {//extends EventListener
    static MAX_VOLUMES: number = 500
    static spInstance: TriggerVolumeTracker = new TriggerVolumeTracker
    mTriggerCount: number = 0
    mTriggerVolumes: TriggerVolume[] = Array.from(
        { length: TriggerVolumeTracker.MAX_VOLUMES }, () => new TriggerVolume
    )
    AddTrigger(triggerVolume: TriggerVolume) {
        for (let index = 0; index < this.mTriggerCount; index++) {
            if (this.mTriggerVolumes[index] == triggerVolume) { return }
        }
        this.mTriggerVolumes[this.mTriggerCount] = triggerVolume
        this.mTriggerCount++
    }
}
export function CreateSingletons() {
    new TriggerVolumeTracker
}
