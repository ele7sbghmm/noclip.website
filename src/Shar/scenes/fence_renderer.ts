import { vec3 } from "gl-matrix"

import * as Viewer from '../../viewer.js'
import { GfxAttachmentState, GfxBindingLayoutDescriptor, GfxBlendFactor, GfxBlendMode, GfxBuffer, GfxBufferUsage, GfxChannelWriteMask, GfxCullMode, GfxDevice, GfxFormat, GfxInputLayout, GfxInputLayoutBufferDescriptor, GfxProgram, GfxVertexAttributeDescriptor, GfxVertexBufferDescriptor, GfxVertexBufferFrequency } from "../../gfx/platform/GfxPlatform.js"
import { DeviceProgram } from "../../Program.js"
import { FenceEntityDSG } from "../dsg.js"
import { GfxRenderInstList, GfxRenderInstManager } from "../../gfx/render/GfxRenderInstManager.js"
import { makeStaticDataBuffer } from "../../gfx/helpers/BufferHelpers.js"
import { colorNewFromRGBA } from "../../Color.js"
import { fillColor, fillMatrix4x4 } from "../../gfx/helpers/UniformBufferHelpers.js"
import { GfxRenderHelper } from "../../gfx/render/GfxRenderHelper.js"
import { makeBackbufferDescSimple, standardFullClearRenderPassDescriptor } from "../../gfx/helpers/RenderGraphHelpers.js"
import { GfxrAttachmentSlot } from "../../gfx/render/GfxRenderGraph.js"

class FenceProgram extends DeviceProgram {
    public static a_Position = 0
    public static a_Normal = 1
    public static ub_SceneParams = 0
    public static ub_ObjectParams = 1
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
    // vec3 t_LightDirection = normalize(vec3(0., 1.., 0.));
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
`
}
class FencePieces {
    constructor(public rm_mFenceElems: FenceEntityDSG[]) { }
    make_squares = (y: number, iy: number): { vertices: Float32Array, normals: Float32Array} => {
        const vertices = new Float32Array(this.rm_mFenceElems.length * 18)
        const normals = new Float32Array(this.rm_mFenceElems.length * 18)
        
        this.rm_mFenceElems.forEach((fence, index) => {
            const [sx, sy, sz] = [fence.mStartPoint[0], fence.mStartPoint[1], fence.mStartPoint[2]]
            const [ex, ey, ez] = [fence.mEndPoint[0], fence.mEndPoint[1], fence.mEndPoint[2]]
            const [nx, ny, nz] = [fence.mNormal[0], fence.mNormal[1], fence.mNormal[2]]
            vertices[index * 18 + 0]  = sx
            vertices[index * 18 + 1]  = iy
            vertices[index * 18 + 2]  = sz
            vertices[index * 18 + 3]  = ex
            vertices[index * 18 + 4]  = iy
            vertices[index * 18 + 5]  = ez
            vertices[index * 18 + 6]  = ex
            vertices[index * 18 + 7]  =  y
            vertices[index * 18 + 8]  = ez
            vertices[index * 18 + 9]  = ex  
            vertices[index * 18 + 10] =  y
            vertices[index * 18 + 11] = ez
            vertices[index * 18 + 12] = sx
            vertices[index * 18 + 13] =  y
            vertices[index * 18 + 14] = sz
            vertices[index * 18 + 15] = sx
            vertices[index * 18 + 16] = iy
            vertices[index * 18 + 17] = sz
            normals[index * 18 + 0]   = nx
            normals[index * 18 + 1]   = ny
            normals[index * 18 + 2]   = nz
            normals[index * 18 + 3]   = nx
            normals[index * 18 + 4]   = ny
            normals[index * 18 + 5]   = nz
            normals[index * 18 + 6]   = nx
            normals[index * 18 + 7]   = ny
            normals[index * 18 + 8]   = nz
            normals[index * 18 + 9]   = nx
            normals[index * 18 + 10]  = ny
            normals[index * 18 + 11]  = nz
            normals[index * 18 + 12]  = nx
            normals[index * 18 + 13]  = ny
            normals[index * 18 + 14]  = nz
            normals[index * 18 + 15]  = nx
            normals[index * 18 + 16]  = ny
            normals[index * 18 + 17]  = nz
        })

        return { vertices, normals }
    }
}
export const attachmentStatesTranslucent: GfxAttachmentState[] = [
    { alphaBlendState: { blendMode: GfxBlendMode.Add, 
                         blendDstFactor: GfxBlendFactor.Zero, 
                         blendSrcFactor: GfxBlendFactor.One },
      channelWriteMask: GfxChannelWriteMask.AllChannels,
      rgbBlendState: { blendMode: GfxBlendMode.Add, 
                       blendDstFactor: GfxBlendFactor.OneMinusSrcAlpha, 
                       blendSrcFactor: GfxBlendFactor.SrcAlpha }}
];
export class FenceRenderer {
    inputLayout: GfxInputLayout
    program: GfxProgram
    renderHelper: GfxRenderHelper
    renderInstListMain = new GfxRenderInstList()

    visible = true
    vertex_buffer_descriptors: GfxVertexBufferDescriptor[]
    fence_pieces: FencePieces
    vertex_buffer: GfxBuffer
    normal_buffer: GfxBuffer
    count: number
    thing: { vertices: Float32Array, normals: Float32Array }
    constructor(public device: GfxDevice, mFenceElems: FenceEntityDSG[]) {
        // this.count = mFenceElems.length * 6
        this.renderHelper = new GfxRenderHelper(device)
        this.program = this.renderHelper.renderCache.createProgram(new FenceProgram)
        const vertexAttributeDescriptors: GfxVertexAttributeDescriptor[] = [
            { location: FenceProgram.a_Position, bufferIndex: 0, bufferByteOffset: 0, format: GfxFormat.F32_RGB},
            { location: FenceProgram.a_Normal,   bufferIndex: 1, bufferByteOffset: 0, format: GfxFormat.F32_RGB}
        ]
        const vertexBufferDescriptors: GfxInputLayoutBufferDescriptor[] = [
            { byteStride: 12, frequency: GfxVertexBufferFrequency.PerVertex },
            { byteStride: 12, frequency: GfxVertexBufferFrequency.PerVertex }
        ]
        const indexBufferFormat = null
        const cache = this.renderHelper.renderCache
        this.inputLayout = cache.createInputLayout(
            { vertexAttributeDescriptors, vertexBufferDescriptors, indexBufferFormat }
        )
        this.fence_pieces = new FencePieces(mFenceElems)
        this.thing = this.fence_pieces.make_squares(10, -10)
        this.vertex_buffer = makeStaticDataBuffer(device, GfxBufferUsage.Vertex, this.thing.vertices.buffer)
        this.normal_buffer = makeStaticDataBuffer(device, GfxBufferUsage.Vertex, this.thing.normals.buffer)
        // this.count = this.thing.vertices.buffer.byteLength / 3
        this.count = mFenceElems.length * 6
        this.vertex_buffer_descriptors = [
            { buffer: this.vertex_buffer, byteOffset: 0 },
            { buffer: this.normal_buffer, byteOffset: 0 }
        ]
    }
    prepareToRender = (device: GfxDevice, viewerInput: Viewer.ViewerRenderInput) => {
        if (!this.visible) return
        const template = this.renderHelper.pushTemplateRenderInst()
        template.setBindingLayouts(bindingLayouts)
        template.setGfxProgram(this.program)
        template.setMegaStateFlags({ attachmentsState: attachmentStatesTranslucent, cullMode: GfxCullMode.None })
        // template.setMegaStateFlags({ cullMode: GfxCullMode.Back })
        let offs = 0
        offs += template.allocateUniformBuffer(FenceProgram.ub_SceneParams, 32)
        const mapped = template.mapUniformBufferF32(FenceProgram.ub_SceneParams)
        offs += fillMatrix4x4(mapped, offs, viewerInput.camera.projectionMatrix)
        offs += fillMatrix4x4(mapped, offs, viewerInput.camera.viewMatrix)
        this.renderHelper.renderInstManager.setCurrentList(this.renderInstListMain)
        offs = 0
        const templateRenderInst = this.renderHelper.renderInstManager.pushTemplate()
        offs += templateRenderInst.allocateUniformBuffer(FenceProgram.ub_ObjectParams, 4)
        const d = templateRenderInst.mapUniformBufferF32(FenceProgram.ub_ObjectParams)
        offs += fillColor(d, offs, colorNewFromRGBA(1, 0, 0, .5))

        const renderInst = this.renderHelper.renderInstManager.newRenderInst()
        renderInst.setVertexInput(this.inputLayout, this.vertex_buffer_descriptors, null)
        renderInst.setDrawCount(this.count)
        this.renderHelper.renderInstManager.submitRenderInst(renderInst)

        this.renderHelper.renderInstManager.popTemplate()
        this.renderHelper.renderInstManager.popTemplate()
        this.renderHelper.prepareToRender()
    }
    destroy = (device: GfxDevice) => {
        device.destroyBuffer(this.vertex_buffer)
        device.destroyBuffer(this.normal_buffer)
        this.renderHelper.destroy()
    }
    setVisible = (v: boolean) => { this.visible = v }
    render = (device: GfxDevice, viewerInput: Viewer.ViewerRenderInput) => {
        const mainColorDesc = makeBackbufferDescSimple(GfxrAttachmentSlot.Color0, viewerInput, standardFullClearRenderPassDescriptor)
        const mainDepthDesc = makeBackbufferDescSimple(GfxrAttachmentSlot.DepthStencil, viewerInput, standardFullClearRenderPassDescriptor)

        const builder = this.renderHelper.renderGraph.newGraphBuilder()

        const mainColorTargetID = builder.createRenderTargetID(mainColorDesc, `Main Color`)
        const mainDepthTargetID = builder.createRenderTargetID(mainDepthDesc, `Main Depth`)
        builder.pushPass(pass => {
            pass.setDebugName(`Main`)
            pass.attachRenderTargetID(GfxrAttachmentSlot.Color0, mainColorTargetID)
            pass.attachRenderTargetID(GfxrAttachmentSlot.DepthStencil, mainDepthTargetID)
            pass.exec(passRender => {
                this.renderInstListMain.drawOnPassRenderer(this.renderHelper.renderCache, passRender)
            })
        })
        this.renderHelper.antialiasingSupport.pushPasses(builder, viewerInput, mainColorTargetID)
        builder.resolveRenderTargetToExternalTexture(mainColorTargetID, viewerInput.onscreenTexture)
        this.prepareToRender(device, viewerInput)
        this.renderHelper.renderGraph.execute(builder)
        this.renderInstListMain.reset()
    }
}
const bindingLayouts: GfxBindingLayoutDescriptor[] = [
    { numUniformBuffers: 2, numSamplers: 0 },
]

