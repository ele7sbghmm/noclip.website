import ArrayBufferSlice from '../ArrayBufferSlice.js'
import { NamedArrayBufferSlice } from '../DataFetcher.js'
import * as Viewer from '../viewer.js'
import { SceneContext } from '../SceneBase.js'
import { GfxDevice } from '../gfx/platform/GfxPlatform.js'

import { Scene } from './render.js'

const base = `shar/`
const l1 = `${base}l1_oneEntity_/`
class SceneDesc implements Viewer.SceneDesc {
    constructor(public id: string, public name: string) { }
    async createScene(device: GfxDevice, context: SceneContext) {
        const fenceBuffer = await context.dataFetcher.fetchData('shar/l1_fences___.hexf')
        const intersectBuffer = await context.dataFetcher.fetchData('shar/l1_intersects___.hexf')
        const staticEntityBuffers: { name: string, buffer: ArrayBufferSlice }[] = [
            { name: 'z1', buffer: await context.dataFetcher.fetchData(`${l1}staticEntity.z1`) },
            { name: 'r1', buffer: await context.dataFetcher.fetchData(`${l1}staticEntity.r1`) },
            { name: 'z2', buffer: await context.dataFetcher.fetchData(`${l1}staticEntity.z2`) },
            { name: 'r2', buffer: await context.dataFetcher.fetchData(`${l1}staticEntity.r2`) },
            { name: 'z3', buffer: await context.dataFetcher.fetchData(`${l1}staticEntity.z3`) },
            { name: 'r3', buffer: await context.dataFetcher.fetchData(`${l1}staticEntity.r3`) },
            { name: 'z4', buffer: await context.dataFetcher.fetchData(`${l1}staticEntity.z4`) },
            { name: 'r4a', buffer: await context.dataFetcher.fetchData(`${l1}staticEntity.r4a`) },
            { name: 'r4b', buffer: await context.dataFetcher.fetchData(`${l1}staticEntity.r4b`) },
            { name: 'z6', buffer: await context.dataFetcher.fetchData(`${l1}staticEntity.z6`) },
            { name: 'r6', buffer: await context.dataFetcher.fetchData(`${l1}staticEntity.r6`) },
            { name: 'z7', buffer: await context.dataFetcher.fetchData(`${l1}staticEntity.z7`) },
            { name: 'r7', buffer: await context.dataFetcher.fetchData(`${l1}staticEntity.r7`) },
        ]

        return new Scene(device, fenceBuffer.arrayBuffer, staticEntityBuffers)
    }
}

const sceneDescs = [
    new SceneDesc('Level 1', 'Suburbs Day / Homer')
]

const id = 'Shar'
const name = "The Simpson's Hit & Run"

export const sceneGroup = { id, name, sceneDescs }

