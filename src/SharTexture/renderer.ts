import { vec3, mat4 } from 'gl-matrix'
import * as UI from '../ui.js'
import * as Viewer from '../viewer.js'
import { SceneContext } from '../SceneBase.js'
import ArrayBufferSlice from '../ArrayBufferSlice.js'
import { Color, colorNewFromRGBA } from '../Color.js'
import { DeviceProgram } from '../Program.js'
import {
  GfxDevice,
  GfxProgram,
  GfxCullMode,
  GfxFormat,
  GfxTexture,
  GfxSampler,
  GfxWrapMode,
  GfxTexFilterMode,
  GfxMipFilterMode,
  makeTextureDescriptor2D,
} from '../gfx/platform/GfxPlatform.js'
import { GfxRenderHelper } from '../gfx/render/GfxRenderHelper.js'
import { GfxRenderInstList, GfxRenderInstManager } from '../gfx/render/GfxRenderInstManager.js'
import { GfxRenderCache } from '../gfx/render/GfxRenderCache.js'
import { GfxShaderLibrary } from '../gfx/helpers/GfxShaderLibrary.js'
import { makeBackbufferDescSimple, makeAttachmentClearDescriptor, standardFullClearRenderPassDescriptor } from '../gfx/helpers/RenderGraphHelpers.js'
import { fillMatrix4x4, fillMatrix4x3 } from '../gfx/helpers/UniformBufferHelpers.js'
import { GfxrAttachmentSlot } from '../gfx/render/GfxRenderGraph.js'

import { ShaderList } from './chunks/shaderLoader.js'
import { StaticEntityLoader } from './chunks/staticEntityLoader.js'
import { StaticEntity } from './dsg/staticEntity.js'
import { InstStatEntityLoader } from './chunks/instStatEntityLoader.js'
import { InstStatEntityDSG } from './dsg/instStatEntityDSG.js'
import { DynaPhysLoader } from './chunks/dynaPhysEntityLoader.js'
import { DynaPhysDSG } from './dsg/dynaPhysEntity.js'
import { WorldSphereLoader } from './chunks/worldSphereLoader.js'
import { WorldSphereDSG } from './dsg/worldSphere.js'
import { IEntityDSG } from './chunkHandler.js'
import { fetchPNG } from './scenes.js'

export class Program extends DeviceProgram {
  static a_Position = 0
  static a_Normal = 1
  static a_Color = 2
  static a_TexCoord = 3

  static ub_SceneParams = 0
  static ub_ModelParams = 1
  override both = `
precision mediump float;

${GfxShaderLibrary.MatrixLibrary}

layout(std140) uniform ub_SceneParams {
  Mat4x4 u_Projection;
  Mat3x4 u_View;
};
layout(std140) uniform ub_ModelParams {
  Mat4x4 u_TransformationMatrix;
  float u_TextureValid;
  float u_AlphaTest;
};

uniform sampler2D u_Texture;

varying vec4 v_Color;
varying vec2 v_TexCoord;

#ifdef VERT
layout(location = ${Program.a_Position}) attribute vec3 a_Position;
layout(location = ${Program.a_Normal}) attribute vec3 a_Normal;
layout(location = ${Program.a_Color}) attribute uvec4 a_Color;
layout(location = ${Program.a_TexCoord}) attribute vec2 a_TexCoord;

void main() {
  float t_Scale = 100.;
  vec4 t_Position = UnpackMatrix(u_TransformationMatrix) * vec4(a_Position, 1.);
  t_Position.x *= -1.;
  vec3 t_PositionWorld = UnpackMatrix(u_View) * (t_Position * t_Scale);
  gl_Position = UnpackMatrix(u_Projection) * vec4(t_PositionWorld, 1.);
  v_Color = vec4(a_Color) / 255.;
  v_TexCoord = vec2(a_TexCoord.x, 1. - a_TexCoord.y);
}
#endif

#ifdef FRAG
void main() {
  vec4 t_Color = vec4(1., 1., 1., 1.);
#ifdef USE_TEXTURE
  if (u_TextureValid == 1.) {
    t_Color = texture(SAMPLER_2D(u_Texture), v_TexCoord);
    if (u_AlphaTest == 1. && t_Color.a < .5) { discard; }
  }
#endif
#ifdef USE_VERTEX_COLOR
  t_Color.rgb *= v_Color.rgb;
  t_Color.a *= v_Color.a;
#endif
  gl_FragColor = t_Color;
}
#endif
`
}

export class Sector {
  static drawStaticEntities = true
  static drawInstStatEntities = true
  static drawDynaPhysEntities = false
  static sortOpaque = false
  static sortTranslucent = false

  staticEntities: StaticEntity[] = []
  staticEntityLoaders: StaticEntityLoader[] = []
  dynaPhysEntities: DynaPhysDSG[] = []
  dynaPhysLoaders: DynaPhysLoader[] = []
  instStatEntities: InstStatEntityDSG[] = []
  instStatEntityLoaders: InstStatEntityLoader[] = []

  constructor(public name: string, public visible: boolean = false) { }
  setVisible(b: boolean) { this.visible = b }

  doAfter(
    device: GfxDevice,
    renderCache: GfxRenderCache,
    sampler: GfxSampler,
    shaderList: ShaderList,
    textureList: Record<string, GfxTexture>
  ) {
    this.staticEntityLoaders.forEach(l => l.staticEntities.forEach(inst => {
      this.staticEntities.push(new StaticEntity(device, renderCache, sampler, textureList, shaderList, inst))
    }))
    this.instStatEntityLoaders.forEach(l => l.instances.forEach(inst => {
      this.instStatEntities.push(new InstStatEntityDSG(device, renderCache, sampler, textureList, shaderList, inst))
    }))
    this.dynaPhysLoaders.forEach(l => l.instDynaPhys.forEach(inst => {
      this.dynaPhysEntities.push(new DynaPhysDSG(device, renderCache, sampler, textureList, shaderList, inst))
    }))
  }
  destroy(device: GfxDevice) {
    this.staticEntities.forEach(entity => entity.destroy(device))
    this.dynaPhysEntities.forEach(entity => entity.destroy(device))
  }
  prepareToRender(viewerInput: Viewer.ViewerRenderInput, renderInstManager: GfxRenderInstManager) {
    if (!this.visible)
      return

    const entitiesOpaque: StaticEntity[] = []
    const entitiesTranslucent: StaticEntity[] = []
    let _ = [
      ...(Sector.drawStaticEntities ? this.staticEntities : []),
      ...(Sector.drawDynaPhysEntities ? this.dynaPhysEntities : []),
      ...(Sector.drawInstStatEntities ? this.instStatEntities : [])
    ].forEach(entity => {
      switch (entity.translucent || entity.castsShadow) {
        case false: entitiesOpaque.push(entity)
        case true: entitiesTranslucent.push(entity)
      }
    })
    if (Sector.sortOpaque) {
      const p = mat4.getTranslation(vec3.create(), viewerInput.camera.worldMatrix)
      entitiesOpaque.sort((a, b) => {
        return vec3.length(vec3.sub(vec3.create(), p, b.boundingSphere.c))
          - vec3.length(vec3.sub(vec3.create(), p, a.boundingSphere.c))
      }).forEach(thing => thing.prepareToRender(renderInstManager))
    } else {
      entitiesOpaque.forEach(entity => entity.prepareToRender(renderInstManager))
    }
    if (Sector.sortTranslucent) {
      const p = mat4.getTranslation(vec3.create(), viewerInput.camera.worldMatrix)
      entitiesTranslucent.sort((a, b) => {
        return vec3.length(vec3.sub(vec3.create(), p, b.boundingSphere.c))
          - vec3.length(vec3.sub(vec3.create(), p, a.boundingSphere.c))
      }).forEach(thing => thing.prepareToRender(renderInstManager))
    } else {
      entitiesTranslucent.forEach(entity => entity.prepareToRender(renderInstManager))
    }
  }
}
export class Scene implements Viewer.SceneGfx {
  static sortWorldSpheres = false

  sectors: Sector[] = []
  voidColor: Color = colorNewFromRGBA(0x9a / 0xff, 0xc2 / 0xff, 0xde / 0xff, 0xff / 0xff)
  worldSphereDSGs: WorldSphereDSG[] = []
  worldSphereLoaders: WorldSphereLoader[] = []

  shaderList: ShaderList = {}
  texturesSlice: Record<string, ArrayBufferSlice> = {}
  texturesImageData: Record<string, ImageData> = {}
  textureList: Record<string, GfxTexture> = {}

  renderHelper: GfxRenderHelper
  program: Program
  gfxProgram: GfxProgram | null
  renderInstListMain = new GfxRenderInstList
  sampler: GfxSampler

  useTexture: boolean = true
  useVertexColor: boolean = true

  constructor(device: GfxDevice, context: SceneContext) {
    this.createProgram()
    this.renderHelper = new GfxRenderHelper(device)

    this.sampler = this.renderHelper.renderCache.createSampler({
      wrapS: GfxWrapMode.Repeat,
      wrapT: GfxWrapMode.Repeat,
      minFilter: GfxTexFilterMode.Bilinear,
      magFilter: GfxTexFilterMode.Bilinear,
      mipFilter: GfxMipFilterMode.Nearest,
      minLOD: 0.,
      maxLOD: 0.
    })
  }
  arrayBs(bufferLike: ArrayBufferLike) {
    if (bufferLike instanceof ArrayBuffer)
      return bufferLike
    const arrayBuffer = new ArrayBuffer(bufferLike.byteLength)
    const srcView = new Uint8Array(bufferLike)
    const dstView = new Uint8Array(arrayBuffer)
    dstView.set(srcView)
    return arrayBuffer
  }
  async doTextureStuff() {
    this.texturesImageData = Object.fromEntries(await Promise.all(
      Object.entries(this.texturesSlice).map(async ([path, slc]) => {
        const data = await fetchPNG(this.arrayBs(slc.arrayBuffer))
        return [path, data]
      })
    ))
  }
  doAfter(device: GfxDevice) {
    for (const name in this.texturesImageData) {
      const imageData = this.texturesImageData[name]
      const texture = device.createTexture(
        makeTextureDescriptor2D(GfxFormat.U8_RGBA_NORM, imageData.width, imageData.height, 1)
      )
      device.setResourceName(texture, name)
      device.uploadTextureData(texture, 0, [new Uint8Array(imageData.data.buffer)])

      this.textureList[name.slice(0, -4)] = texture
    }

    this.worldSphereLoaders.forEach(l => l.worldSpheres.forEach(inst => {
      const se = new WorldSphereDSG(device, this.renderHelper.renderCache, this.sampler, this.textureList, this.shaderList, inst)
      this.worldSphereDSGs.push(se)
    }))
    this.sectors.forEach(
      sector => sector.doAfter(device, this.renderHelper.renderCache, this.sampler, this.shaderList, this.textureList)
    )
  }
  createProgram() {
    this.program = new Program
    if (this.useTexture)
      this.program.defines.set('USE_TEXTURE', '1')
    if (this.useVertexColor)
      this.program.defines.set('USE_VERTEX_COLOR', '1')

    this.gfxProgram = null
  }
  destroy(device: GfxDevice) {
    this.worldSphereDSGs.forEach(inst => inst.destroy(device))
    this.sectors.forEach(sector => sector.destroy(device))
    this.renderHelper.destroy()
  }
  prepareToRender(device: GfxDevice, viewerInput: Viewer.ViewerRenderInput) {
    const template = this.renderHelper.pushTemplateRenderInst()

    if (this.gfxProgram === null) {
      this.gfxProgram = this.renderHelper.renderInstManager.gfxRenderCache.createProgram(this.program)
    }
    template.setBindingLayouts([{ numUniformBuffers: 2, numSamplers: 1 }])
    template.setGfxProgram(this.gfxProgram)
    template.setMegaStateFlags({ cullMode: GfxCullMode.None })

    let offs = template.allocateUniformBuffer(Program.ub_SceneParams, 32)
    const mapped = template.mapUniformBufferF32(Program.ub_SceneParams)

    offs += fillMatrix4x4(mapped, offs, viewerInput.camera.projectionMatrix)
    offs += fillMatrix4x3(mapped, offs, viewerInput.camera.viewMatrix)

    this.renderHelper.renderInstManager.setCurrentList(this.renderInstListMain)

    if (Scene.sortWorldSpheres) {
      const p = mat4.getTranslation(vec3.create(), viewerInput.camera.worldMatrix)
      this.worldSphereDSGs.sort((a, b) => {
        return vec3.length(vec3.sub(vec3.create(), p, b.boundingSphere.c))
          - vec3.length(vec3.sub(vec3.create(), p, a.boundingSphere.c))
      }).forEach(thing => thing.prepareToRender(this.renderHelper.renderInstManager))
    } else {
      this.worldSphereDSGs.forEach(thing => thing.prepareToRender(this.renderHelper.renderInstManager))
    }
    this.sectors.forEach(sector => sector.prepareToRender(viewerInput, this.renderHelper.renderInstManager))

    this.renderHelper.renderInstManager.popTemplate()
    this.renderHelper.prepareToRender()
  }

  render(device: GfxDevice, viewerInput: Viewer.ViewerRenderInput) {
    const builder = this.renderHelper.renderGraph.newGraphBuilder()
    const mainColorDesc = makeBackbufferDescSimple(
      GfxrAttachmentSlot.Color0,
      viewerInput,
      makeAttachmentClearDescriptor(this.voidColor)
    )
    const mainDepthDesc = makeBackbufferDescSimple(
      GfxrAttachmentSlot.DepthStencil,
      viewerInput,
      standardFullClearRenderPassDescriptor
    )

    const mainColorTargetID = builder.createRenderTargetID(mainColorDesc, 'Main Color')
    const mainDepthTargetID = builder.createRenderTargetID(mainDepthDesc, 'Main Depth')

    builder.pushPass(pass => {
      pass.setDebugName('Main')
      pass.attachRenderTargetID(GfxrAttachmentSlot.Color0, mainColorTargetID)
      pass.attachRenderTargetID(GfxrAttachmentSlot.DepthStencil, mainDepthTargetID)
      pass.exec(passRenderer => {
        this.renderInstListMain.drawOnPassRenderer(this.renderHelper.renderCache, passRenderer)
      })
    })

    this.renderHelper.antialiasingSupport.pushPasses(builder, viewerInput, mainColorTargetID)
    builder.resolveRenderTargetToExternalTexture(mainColorTargetID, viewerInput.onscreenTexture)

    this.prepareToRender(device, viewerInput)
    this.renderHelper.renderGraph.execute(builder)
    this.renderInstListMain.reset()
  }
  createPanels() {
    const addCheckbox = (panel: UI.Panel, name: string, active: boolean, setMethod: (b: boolean) => void) => {
      const box = new UI.Checkbox(name, active)
      box.onchanged = () => setMethod(box.checked)
      panel.contents.appendChild(box.elem)
    }

    const debugPanel = new UI.Panel
    debugPanel.customHeaderBackgroundColor = UI.COOL_BLUE_COLOR;
    debugPanel.setTitle(UI.RENDER_HACKS_ICON, 'Debug');

    addCheckbox(debugPanel, 'use textures', this.useTexture, b => { this.useTexture = b; this.createProgram() })
    addCheckbox(debugPanel, 'use vertex color', this.useVertexColor, b => { this.useVertexColor = b; this.createProgram() })
    addCheckbox(debugPanel, 'draw static entities', Sector.drawStaticEntities, b => Sector.drawStaticEntities = b)
    addCheckbox(debugPanel, 'draw dyna phys entities', Sector.drawDynaPhysEntities, b => Sector.drawDynaPhysEntities = b)
    addCheckbox(debugPanel, 'draw inst stat entities', Sector.drawInstStatEntities, b => Sector.drawInstStatEntities = b)
    addCheckbox(debugPanel, 'sort opaque', Sector.sortOpaque, b => Sector.sortOpaque = b)
    addCheckbox(debugPanel, 'sort translucent', Sector.sortTranslucent, b => Sector.sortTranslucent = b)
    addCheckbox(debugPanel, 'sort world spheres', Scene.sortWorldSpheres, b => Scene.sortWorldSpheres = b)

    const layerPanel = new UI.LayerPanel([new Dumb, ...this.sectors])//.slice(1))
    layerPanel.setTitle(UI.LAYER_ICON, 'Sectors')
    return [debugPanel, layerPanel]
  }
}
class Dumb {
  visible: boolean = false
  name: string = 'dummy'
  setVisible = (b: boolean) => {}
}
