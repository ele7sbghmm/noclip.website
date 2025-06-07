import ArrayBufferSlice from '../../../ArrayBufferSlice.js'
import { GfxRenderInstManager } from '../../../gfx/render/GfxRenderInstManager.js'
import { GfxRenderCache } from '../../../gfx/render/GfxRenderCache.js'
import {
  GfxDevice,
  GfxBuffer,
  GfxVertexBufferDescriptor,
  GfxIndexBufferDescriptor,
  GfxInputLayout,
  GfxFormat,
  GfxMegaStateDescriptor
} from '../../../gfx/platform/GfxPlatform.js'

import { Entity } from '../../chunk/loaders/util.js'

export abstract class EntityRenderer {
  vertexBufferDescriptors: GfxVertexBufferDescriptor[]
  indexBufferDescriptor: GfxIndexBufferDescriptor | null
  inputLayout: GfxInputLayout
  drawCount: number
  megaStateFlags: Partial<GfxMegaStateDescriptor> = {}

  vertexDataBuffer: GfxBuffer
  normalDataBuffer: GfxBuffer | null
  colorDataBuffer: GfxBuffer | null
  uvDataBuffer: GfxBuffer | null
  indexDataBuffer: GfxBuffer | null
}

