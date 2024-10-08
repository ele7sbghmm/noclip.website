import { vec3 } from "gl-matrix";
import { Color } from "../Color.js";
import { DeviceProgram } from "../Program.js";
import * as Viewer from "../viewer.js";
import * as UI from "../ui.js";

import {
  GfxDevice,
  GfxBufferUsage,
  GfxBuffer,
  GfxFormat,
  GfxInputLayout,
  GfxProgram,
  GfxBindingLayoutDescriptor,
  GfxVertexBufferFrequency,
  GfxVertexAttributeDescriptor,
  GfxInputLayoutBufferDescriptor,
  GfxCullMode,
  GfxVertexBufferDescriptor,
  GfxIndexBufferDescriptor,
} from "../gfx/platform/GfxPlatform.js";
import {
  fillColor,
  fillMatrix4x4,
} from "../gfx/helpers/UniformBufferHelpers.js";
import {
  makeBackbufferDescSimple,
  standardFullClearRenderPassDescriptor,
} from "../gfx/helpers/RenderGraphHelpers.js";
import { makeStaticDataBuffer } from "../gfx/helpers/BufferHelpers.js";
import { GfxRenderHelper } from "../gfx/render/GfxRenderHelper.js";
import {
  GfxRenderInstList,
  // GfxRenderInstManager,
} from "../gfx/render/GfxRenderInstManager.js";
import { CameraController } from "../Camera.js";
import { GfxrAttachmentSlot, GfxrRenderTargetDescription } from "../gfx/render/GfxRenderGraph.js";

class IVProgram extends DeviceProgram {
  public static a_Position = 0;
  public static a_Normal = 1;

  public static ub_SceneParams = 0;
  public static ub_ObjectParams = 1;

  public override both = `
precision mediump float;

layout(std140) uniform ub_SceneParams {
  Mat4x4 u_Projection;
  Mat4x4 u_ModelView;
};

layout(std140) uniform ub_ObjectParams {
  vec4 u_Color;
};

varying vec2 v_LightIntensity;

#ifdef VERT
layout(location = ${IVProgram.a_Position}) attribute vec3 a_Position;
layout(location = ${IVProgram.a_Normal}) attribute vec3 a_Normal;

void mainVS() {
  const float t_ModelScale = 15.0;
  gl_Position = Mul(u_Projection, Mul(u_ModelView, vec4(a_Position * t_ModelScale, 1.0)));
  vec3 t_LightDirection = normalize(vec3(.2, -1, .5));
  float t_LightIntensityF = dot(-a_Normal, t_LightDirection);
  float t_LightIntensityB = dot( a_Normal, t_LightDirection);
  v_LightIntensity = vec2(t_LightIntensityF, t_LightIntensityB);
}
#endif

#ifdef FRAG
void mainPS() {
  float t_LightIntensity = gl_FrontFacing ? v_LightIntensity.x : v_LightIntensity.y;
  float t_LightTint = .4 * t_LightIntensity;
  gl_FragColor = u_Color + vec4(t_LightTint, t_LightTint, t_LightTint, 0.);
}
#endif
`;
}

export function get_buffers(indexData: number[], positionData: number[]) {
  const posData = new Float32Array(indexData.length * 3);
  const nrmData = new Float32Array(indexData.length * 3);

  const t = vec3.create();
  for (let i = 0; i < indexData.length; i += 3) {
    const i0 = indexData[i + 0];
    const i1 = indexData[i + 1];
    const i2 = indexData[i + 2];

    const t0x = positionData[i0 * 3 + 0];
    const t0y = positionData[i0 * 3 + 1];
    const t0z = positionData[i0 * 3 + 2];
    const t1x = positionData[i1 * 3 + 0];
    const t1y = positionData[i1 * 3 + 1];
    const t1z = positionData[i1 * 3 + 2];
    const t2x = positionData[i2 * 3 + 0];
    const t2y = positionData[i2 * 3 + 1];
    const t2z = positionData[i2 * 3 + 2];

    vec3.cross(
      t,
      [t0x - t1x, t0y - t1y, t0z - t1z],
      [t0x - t2x, t0y - t2y, t0z - t2z],
    );
    vec3.normalize(t, t);

    posData[(i + 0) * 3 + 0] = t0x;
    posData[(i + 0) * 3 + 1] = t0y;
    posData[(i + 0) * 3 + 2] = t0z;
    posData[(i + 1) * 3 + 0] = t1x;
    posData[(i + 1) * 3 + 1] = t1y;
    posData[(i + 1) * 3 + 2] = t1z;
    posData[(i + 2) * 3 + 0] = t2x;
    posData[(i + 2) * 3 + 1] = t2y;
    posData[(i + 2) * 3 + 2] = t2z;

    nrmData[(i + 0) * 3 + 0] = t[0];
    nrmData[(i + 0) * 3 + 1] = t[1];
    nrmData[(i + 0) * 3 + 2] = t[2];
    nrmData[(i + 1) * 3 + 0] = t[0];
    nrmData[(i + 1) * 3 + 1] = t[1];
    nrmData[(i + 1) * 3 + 2] = t[2];
    nrmData[(i + 2) * 3 + 0] = t[0];
    nrmData[(i + 2) * 3 + 1] = t[1];
    nrmData[(i + 2) * 3 + 2] = t[2];
  }
  return { posData, nrmData };
}

const bindingLayouts: GfxBindingLayoutDescriptor[] = [
  { numUniformBuffers: 2, numSamplers: 0 }, // ub_SceneParams
];

export class Scene implements Viewer.SceneGfx {
  private inputLayout: GfxInputLayout;
  private program: GfxProgram;
  private renderHelper: GfxRenderHelper;
  private renderInstListMain = new GfxRenderInstList();

  private vertexBuffers: GfxVertexBufferDescriptor[] | null[];
  private indexBuffer: GfxIndexBufferDescriptor | null;
  private numVertices: number;
  private posBuffer: GfxBuffer;
  private nrmBuffer: GfxBuffer;
  private color: Color;

  constructor(device: GfxDevice, indices: number[], vertices: number[], normals: number[], color: Color) {
    this.color = color;
    this.renderHelper = new GfxRenderHelper(device);
    this.program = this.renderHelper.renderCache.createProgram(new IVProgram());

    const cache = this.renderHelper.renderCache;
    this.inputLayout = cache.createInputLayout({
      vertexAttributeDescriptors: [
        { location: IVProgram.a_Position, bufferIndex: 0, bufferByteOffset: 0, format: GfxFormat.F32_RGB },
        { location: IVProgram.a_Normal, bufferIndex: 1, bufferByteOffset: 0, format: GfxFormat.F32_RGB },
      ],
      vertexBufferDescriptors: [
        { byteStride: 12, frequency: GfxVertexBufferFrequency.PerVertex },
        { byteStride: 12, frequency: GfxVertexBufferFrequency.PerVertex },
      ],
      // indexBufferFormat: GfxFormat.U32_R,
      indexBufferFormat: null
    });

    ////////////////// ivrenderer constructor
    let idxData = new Uint32Array(indices);
    // let posData = new Float32Array(vertices);
    // let nrmData = new Float32Array(normals);

    let { posData, nrmData } = get_buffers(indices, vertices);

    this.numVertices = indices.length;

    this.vertexBuffers = [
      { buffer: makeStaticDataBuffer(device, GfxBufferUsage.Vertex, posData.buffer), byteOffset: 0 },
      { buffer: makeStaticDataBuffer(device, GfxBufferUsage.Vertex, nrmData.buffer), byteOffset: 0 },
    ];
    this.indexBuffer = { buffer: makeStaticDataBuffer(device, GfxBufferUsage.Index, idxData.buffer), byteOffset: 0 };
  }

  private prepareToRender(device: GfxDevice, viewerInput: Viewer.ViewerRenderInput): void {
    const template = this.renderHelper.pushTemplateRenderInst();
    template.setBindingLayouts(bindingLayouts);
    template.setGfxProgram(this.program);
    template.setMegaStateFlags({ cullMode: GfxCullMode.None });

    let offs = template.allocateUniformBuffer(IVProgram.ub_SceneParams, 32);
    const mapped = template.mapUniformBufferF32(IVProgram.ub_SceneParams);
    offs += fillMatrix4x4(mapped, offs, viewerInput.camera.projectionMatrix);
    offs += fillMatrix4x4(mapped, offs, viewerInput.camera.viewMatrix);

    this
      .renderHelper
      .renderInstManager
      .setCurrentRenderInstList(this.renderInstListMain);

    //////////////////// ivrenderer preparetorender
    const templateRenderInst = this.renderHelper.renderInstManager.pushTemplateRenderInst();

    offs = templateRenderInst.allocateUniformBuffer(IVProgram.ub_ObjectParams, 4);
    const d = templateRenderInst.mapUniformBufferF32(IVProgram.ub_ObjectParams);
    //offs += fillColor(d, offs, this.color);
    fillColor(d, offs, this.color);

    ///////////////////// chunk preparetorender
    const renderInst = this.renderHelper.renderInstManager.newRenderInst();
    renderInst.setVertexInput(
      this.inputLayout,
      this.vertexBuffers,
      // this.indexBuffer,
      null,
    );
    renderInst.setDrawCount(this.numVertices);
    this.renderHelper.renderInstManager.submitRenderInst(renderInst);
    /////////////////////

    // this.renderHelper.renderInstManager.popTemplateRenderInst();
    /////////////////////

    this.renderHelper.renderInstManager.popTemplateRenderInst();
    this.renderHelper.prepareToRender();
  }

  public render(device: GfxDevice, viewerInput: Viewer.ViewerRenderInput) {
    const mainColorDesc: GfxrRenderTargetDescription = makeBackbufferDescSimple(
      GfxrAttachmentSlot.Color0,
      viewerInput,
      standardFullClearRenderPassDescriptor,
    );
    const mainDepthDesc: GfxrRenderTargetDescription = makeBackbufferDescSimple(
      GfxrAttachmentSlot.DepthStencil,
      viewerInput,
      standardFullClearRenderPassDescriptor,
    );

    const builder = this.renderHelper.renderGraph.newGraphBuilder();
    const mainColorTargetID = builder.createRenderTargetID(mainColorDesc, "Main Color");
    const mainDepthTargetID = builder.createRenderTargetID(mainDepthDesc, "Main Depth");
    builder.pushPass((pass) => {
      pass.setDebugName("Main");
      pass.attachRenderTargetID(GfxrAttachmentSlot.Color0, mainColorTargetID);
      pass.attachRenderTargetID(GfxrAttachmentSlot.DepthStencil, mainDepthTargetID);
      pass.exec((passRenderer) => {
        this.renderInstListMain.drawOnPassRenderer(this.renderHelper.renderCache, passRenderer);
      });
    });
    this.renderHelper.antialiasingSupport.pushPasses(builder, viewerInput, mainColorTargetID);
    builder.resolveRenderTargetToExternalTexture(mainColorTargetID, viewerInput.onscreenTexture);

    this.prepareToRender(device, viewerInput);
    this.renderHelper.renderGraph.execute(builder);
    this.renderInstListMain.reset();
  }

  public destroy(device: GfxDevice): void {
    // device.destroyBuffer(this.posBuffer);
    // device.destroyBuffer(this.nrmBuffer);
    this.renderHelper.destroy();
  }

  public createPanels(): UI.Panel[] {
    const layersPanel = new UI.LayerPanel();
    // layersPanel.setLayers(this.ivRenderers);
    return [layersPanel];
  }
}
