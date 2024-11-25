import { tEntity, Fence, Tree, Intersect, StaticPhysDSG, TriggerVolume } from './dsg.js'

export type Sc = { scene: WorldScene }
export class Sector {
    intersects: Intersect[] = []
    static_phys: StaticPhysDSG[] = []
    triggers: TriggerVolume[] = []
    constructor(public name: string, public active = false) { }
    place_intersect(intersect: Intersect) { this.intersects.push(intersect) }
    place_static_phys(sp: StaticPhysDSG) { this.static_phys.push(sp) }
    place_trigger(trigger: TriggerVolume) { this.triggers.push(trigger) }
}
export class WorldScene {
    sectors: (Sector | null)[] = Array.from({ length: 20 }, () => null)
    tree: Tree = new Tree
    fences: Fence[] = []
    load_zones: TriggerVolume[] = []
    set_tree(tree: Tree) { this.tree = tree }
    place_fence(fence: Fence) { this.fences.push(fence) }
    place_loadzone(load_zone: TriggerVolume) { this.load_zones.push(load_zone) }
}
