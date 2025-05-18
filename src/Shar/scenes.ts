import * as Viewer from '../viewer.js'
import ArrayBufferSlice from '../ArrayBufferSlice.js'
import { SceneContext } from '../SceneBase.js'
import { GfxDevice } from '../gfx/platform/GfxPlatform.js'

import { Scene } from './render.js'

export type Thing = { name: string, staticEntityBuffer: ArrayBufferSlice, intersectBuffer: ArrayBufferSlice }
const levelId = `shar/l1eggs`
async function fetchBuffers(context: SceneContext) {
    return [{
        name: 'z1',
        staticEntityBuffer: await context.dataFetcher.fetchData(`${levelId}/staticentity/z1`),
        intersectBuffer: await context.dataFetcher.fetchData(`${levelId}/intersect/z1`)
    }, {
        name: 'r1',
        staticEntityBuffer: await context.dataFetcher.fetchData(`${levelId}/staticentity/r1`),
        intersectBuffer: await context.dataFetcher.fetchData(`${levelId}/intersect/r1`)
    }, {
        name: 'z2',
        staticEntityBuffer: await context.dataFetcher.fetchData(`${levelId}/staticentity/z2`),
        intersectBuffer: await context.dataFetcher.fetchData(`${levelId}/intersect/z2`)
    }, {
        name: 'r2',
        staticEntityBuffer: await context.dataFetcher.fetchData(`${levelId}/staticentity/r2`),
        intersectBuffer: await context.dataFetcher.fetchData(`${levelId}/intersect/r2`)
    }, {
        name: 'z3',
        staticEntityBuffer: await context.dataFetcher.fetchData(`${levelId}/staticentity/z3`),
        intersectBuffer: await context.dataFetcher.fetchData(`${levelId}/intersect/z3`)
    }, {
        name: 'r3',
        staticEntityBuffer: await context.dataFetcher.fetchData(`${levelId}/staticentity/r3`),
        intersectBuffer: await context.dataFetcher.fetchData(`${levelId}/intersect/r3`)
    }, {
        name: 'z4',
        staticEntityBuffer: await context.dataFetcher.fetchData(`${levelId}/staticentity/z4`),
        intersectBuffer: await context.dataFetcher.fetchData(`${levelId}/intersect/z4`)
    }, {
        name: 'r4a',
        staticEntityBuffer: await context.dataFetcher.fetchData(`${levelId}/staticentity/r4a`),
        intersectBuffer: await context.dataFetcher.fetchData(`${levelId}/intersect/r4a`)
    }, {
        name: 'r4b',
        staticEntityBuffer: await context.dataFetcher.fetchData(`${levelId}/staticentity/r4b`),
        intersectBuffer: await context.dataFetcher.fetchData(`${levelId}/intersect/r4b`)
    }, {
        name: 'z6',
        staticEntityBuffer: await context.dataFetcher.fetchData(`${levelId}/staticentity/z6`),
        intersectBuffer: await context.dataFetcher.fetchData(`${levelId}/intersect/z6`)
    }, {
        name: 'r6',
        staticEntityBuffer: await context.dataFetcher.fetchData(`${levelId}/staticentity/r6`),
        intersectBuffer: await context.dataFetcher.fetchData(`${levelId}/intersect/r6`)
    }, {
        name: 'z7',
        staticEntityBuffer: await context.dataFetcher.fetchData(`${levelId}/staticentity/z7`),
        intersectBuffer: await context.dataFetcher.fetchData(`${levelId}/intersect/z7`)
    }, {
        name: 'r7',
        staticEntityBuffer: await context.dataFetcher.fetchData(`${levelId}/staticentity/r7`),
        intersectBuffer: await context.dataFetcher.fetchData(`${levelId}/intersect/r7`)
    }]
}

class SceneDesc implements Viewer.SceneDesc {
    constructor(public id: string, public name: string) { }
    async createScene(device: GfxDevice, context: SceneContext) {
        const fenceBuffer = await context.dataFetcher.fetchData('shar/l1eggs/fences')
        const buffers: Thing[] = await fetchBuffers(context)
        return new Scene(device, fenceBuffer, buffers)
    }
}

const sceneDescs = [
    new SceneDesc('Level 1', 'Suburbs Day / Homer')
]

const id = 'Shar'
const name = "The Simpsons Hit & Run"

export const sceneGroup = { id, name, sceneDescs }

