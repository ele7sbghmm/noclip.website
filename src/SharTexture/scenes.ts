import * as Viewer from '../viewer.js'
import { SceneContext } from '../SceneBase.js'
import { GfxDevice } from '../gfx/platform/GfxPlatform.js'
import { DataFetcher } from '../DataFetcher.js'

import { Scene } from './renderer.js'

class SceneDesc implements Viewer.SceneDesc {
	constructor(public id: string, public name: string) { }
	async createScene(device: GfxDevice, context: SceneContext) {
		// const buffer = await context.dataFetcher.fetchData('sharTexture/staticEntityData/staticEntity.l7z1')
		const buffer = await context.dataFetcher.fetchData(`sharTexture/staticEntityData/staticEntity_uv.L4_l1_gens_69Shape_016`)
		const imageData = await fetchPNG(context.dataFetcher, `sharTexture/Simpson_house_roof.bmp.png`)
		return new Scene(device, buffer.arrayBuffer, imageData)
	}
}

const id = "shar texture"
const name = "shar texture"
const sceneDescs = [
	new SceneDesc('l7z1', 'Suburbs Halloween | Homer 2')
]

export const sceneGroup = { id, name, sceneDescs }

function fetchPNG(dataFetcher: DataFetcher, path: string): Promise<ImageData> {
	path = dataFetcher.getDataURLForPath(path);
	const img = document.createElement('img');
	img.crossOrigin = 'anonymous';
	img.src = path;
	const p = new Promise<ImageData>((resolve) => {
		img.onload = () => {
			const canvas = document.createElement('canvas');
			canvas.width = img.width;
			canvas.height = img.height;
			const ctx = canvas.getContext('2d')!;
			ctx.drawImage(img, 0, 0);
			resolve(ctx.getImageData(0, 0, img.width, img.height));
		};
	});
	return p;
}

