import { assert } from '../util.js'
import {
  GfxMegaStateDescriptor,
  GfxChannelBlendState,
  GfxChannelWriteMask,
  GfxCompareMode,
  GfxCullMode,
  GfxBlendFactor,
  GfxBlendMode,
  GfxFrontFaceMode,
  GfxStencilOp
} from '../gfx/platform/GfxPlatform.js'

import { ShaderParams } from './chunks/shaderLoader.js'

export function getTextureNameFromShaderParams(params: Partial<ShaderParams>) {
  const value = params['TEX']
  assert(typeof value === "string", `TEX no good, found ${value}`)
  return value
}

export function reverseDepthForCompareMode(compareMode: GfxCompareMode): GfxCompareMode {
  switch (compareMode) {
    case GfxCompareMode.Less: return GfxCompareMode.Greater;
    case GfxCompareMode.LessEqual: return GfxCompareMode.GreaterEqual;
    case GfxCompareMode.GreaterEqual: return GfxCompareMode.LessEqual;
    case GfxCompareMode.Greater: return GfxCompareMode.Less;
    default: return compareMode;
  }
}

export const defaultBlendState: GfxChannelBlendState = {
  blendMode: GfxBlendMode.Add,
  blendSrcFactor: GfxBlendFactor.One,
  blendDstFactor: GfxBlendFactor.Zero,
}

export const defaultMegaState: GfxMegaStateDescriptor = {
  attachmentsState: [{
    channelWriteMask: GfxChannelWriteMask.RGB,
    rgbBlendState: defaultBlendState,
    alphaBlendState: defaultBlendState,
  }],
  depthCompare: reverseDepthForCompareMode(GfxCompareMode.LessEqual),
  depthWrite: true,
  stencilCompare: GfxCompareMode.Always,
  stencilWrite: false,
  stencilPassOp: GfxStencilOp.Keep,
  cullMode: GfxCullMode.None,
  frontFace: GfxFrontFaceMode.CCW,
  polygonOffset: false,
  wireframe: false,
}

export function shaderToMegaStateFlags(shader: ShaderParams) {
  const out = defaultMegaState
}

