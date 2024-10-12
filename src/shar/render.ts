import { Color, colorNewFromRGBA } from "../Color.js";
import { vec3 } from "gl-matrix";

import { DeviceProgram } from "../Program.js";
import * as Viewer from "../viewer.js";
import * as UI from "../ui.js";

// import * as Fence from "./fence.js";

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
  GfxRenderInstManager,
} from "../gfx/render/GfxRenderInstManager.js";
import { CameraController } from "../Camera.js";
import { GfxrAttachmentSlot } from "../gfx/render/GfxRenderGraph.js";

class FenceProgram extends DeviceProgram {
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
layout(location = ${FenceProgram.a_Position}) attribute vec3 a_Position;
layout(location = ${FenceProgram.a_Normal}) attribute vec3 a_Normal;

void mainVS() {
  const float t_ModelScale = 20.0;
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
  float t_LightTint = 0.3 * t_LightIntensity;
  gl_FragColor = u_Color + vec4(t_LightTint, t_LightTint, t_LightTint, 0.0);
}
#endif
`;
}

class Chunk {
  public numVertices: number;
  public posBuffer: GfxBuffer;
  public nrmBuffer: GfxBuffer;
  public vertexBufferDescriptors: GfxVertexBufferDescriptor[];

  constructor(
    device: GfxDevice,
    public vertices: number[],
    public normals: number[],
    private inputLayout: GfxInputLayout
  ) {
    // Run through our data, calculate normals and such.
    const t = vec3.create();

    // let { posData, nrmData } = get_buffers(indices, vertices);

    let posData = new Float32Array(vertices);
    let nrmData = new Float32Array(normals);

    this.posBuffer = makeStaticDataBuffer(device, GfxBufferUsage.Vertex, posData.buffer);
    this.nrmBuffer = makeStaticDataBuffer(device, GfxBufferUsage.Vertex, nrmData.buffer);

    this.vertexBufferDescriptors = [
      { buffer: this.posBuffer, byteOffset: 0 },
      { buffer: this.nrmBuffer, byteOffset: 0 },
    ];

    this.numVertices = vertices.length / 3;
  }

  public prepareToRender(renderInstManager: GfxRenderInstManager): void {
    const renderInst = renderInstManager.newRenderInst();
    renderInst.setVertexInput(this.inputLayout, this.vertexBufferDescriptors, null);
    renderInst.setDrawCount(this.numVertices);
    renderInstManager.submitRenderInst(renderInst);
  }

  public destroy(device: GfxDevice): void {
    device.destroyBuffer(this.posBuffer);
    device.destroyBuffer(this.nrmBuffer);
  }
}

export class IVRenderer {
  public visible: boolean = true;
  public name: string;

  private chunks: Chunk[];

  constructor(
    device: GfxDevice,
    // public iv: IV.IV,
    vertices: number[], normals: number[],
    inputLayout: GfxInputLayout
  ) {
    this.name = "workin'";
    this.chunks = [new Chunk(device, vertices, normals, inputLayout)];
  }

  public setVisible(v: boolean) {
    this.visible = v;
  }

  public prepareToRender(renderInstManager: GfxRenderInstManager): void {
    // if (!this.visible)
    //   return;

    const templateRenderInst = renderInstManager.pushTemplateRenderInst();

    let offs = templateRenderInst.allocateUniformBuffer(FenceProgram.ub_ObjectParams, 4);
    const d = templateRenderInst.mapUniformBufferF32(FenceProgram.ub_ObjectParams);
    offs += fillColor(d, offs, colorNewFromRGBA(255, 0, 0, 255));

    for (let i = 0; i < this.chunks.length; i++)
      this.chunks[i].prepareToRender(renderInstManager);

    renderInstManager.popTemplateRenderInst();
  }

  public destroy(device: GfxDevice): void {
    this.chunks.forEach((chunk) => chunk.destroy(device));
  }
}

const bindingLayouts: GfxBindingLayoutDescriptor[] = [
  { numUniformBuffers: 2, numSamplers: 0 }, // ub_SceneParams
];

export class Scene implements Viewer.SceneGfx {
  private inputLayout: GfxInputLayout;
  private program: GfxProgram;

  private renderHelper: GfxRenderHelper;
  private renderInstListMain = new GfxRenderInstList();

  constructor(device: GfxDevice, private terra: ArrayBufferLike, private zones: ArrayBufferLike[]) {
    this.renderHelper = new GfxRenderHelper(device);
    this.program = this.renderHelper.renderCache.createProgram(new FenceProgram());

    const vertexAttributeDescriptors: GfxVertexAttributeDescriptor[] = [
      { location: FenceProgram.a_Position, bufferIndex: 0, bufferByteOffset: 0, format: GfxFormat.F32_RGB, },
      { location: FenceProgram.a_Normal, bufferIndex: 1, bufferByteOffset: 0, format: GfxFormat.F32_RGB, },
    ];
    const vertexBufferDescriptors: GfxInputLayoutBufferDescriptor[] = [
      { byteStride: 12, frequency: GfxVertexBufferFrequency.PerVertex },
      { byteStride: 12, frequency: GfxVertexBufferFrequency.PerVertex },
    ];
    const indexBufferFormat: GfxFormat | null = null;
    const cache = this.renderHelper.renderCache;
    this.inputLayout = cache.createInputLayout({
      vertexAttributeDescriptors,
      vertexBufferDescriptors,
      indexBufferFormat
    });

    const ivs = [0];

    this.ivRenderers = ivs.map(() => {
      return new IVRenderer(device, vertices, normals, this.inputLayout);
    });
  }

  public adjustCameraController(c: CameraController) {
    c.setSceneMoveSpeedMult(16 / 60);
  }

  private prepareToRender(device: GfxDevice, viewerInput: Viewer.ViewerRenderInput): void {
    const template = this.renderHelper.pushTemplateRenderInst();
    template.setBindingLayouts(bindingLayouts);
    template.setGfxProgram(this.program);
    template.setMegaStateFlags({ cullMode: GfxCullMode.None });

    let offs = template.allocateUniformBuffer(FenceProgram.ub_SceneParams, 32);
    const mapped = template.mapUniformBufferF32(FenceProgram.ub_SceneParams);
    offs += fillMatrix4x4(mapped, offs, viewerInput.camera.projectionMatrix);
    offs += fillMatrix4x4(mapped, offs, viewerInput.camera.viewMatrix);

    this.renderHelper.renderInstManager.setCurrentRenderInstList(this.renderInstListMain);

    for (let i = 0; i < this.ivRenderers.length; i++)
      this.ivRenderers[i].prepareToRender(this.renderHelper.renderInstManager);

    this.renderHelper.renderInstManager.popTemplateRenderInst();
    this.renderHelper.prepareToRender();
  }

  public render(device: GfxDevice, viewerInput: Viewer.ViewerRenderInput) {
    const mainColorDesc = makeBackbufferDescSimple(
      GfxrAttachmentSlot.Color0,
      viewerInput,
      standardFullClearRenderPassDescriptor
    );
    const mainDepthDesc = makeBackbufferDescSimple(
      GfxrAttachmentSlot.DepthStencil,
      viewerInput,
      standardFullClearRenderPassDescriptor
    );

    const builder = this.renderHelper.renderGraph.newGraphBuilder();

    const mainColorTargetID = builder.createRenderTargetID(mainColorDesc, 'Main Color');
    const mainDepthTargetID = builder.createRenderTargetID(mainDepthDesc, 'Main Depth');
    builder.pushPass((pass) => {
      pass.setDebugName('Main');
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
    this.ivRenderers.forEach((r) => r.destroy(device));
    this.renderHelper.destroy();
  }

  public createPanels(): UI.Panel[] {
    const layersPanel = new UI.LayerPanel();
    layersPanel.setLayers(this.ivRenderers);
    return [layersPanel];
  }
}
