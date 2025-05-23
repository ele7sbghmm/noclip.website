
import * as UI from "../ui.js";
import * as Viewer from "../viewer.js";
import * as rw from "librw";
import { TextureMapping, TextureBase } from "../TextureHolder.js";
import { GfxDevice, GfxFormat, GfxBufferUsage, GfxBuffer, GfxVertexAttributeDescriptor, GfxVertexBufferFrequency, GfxInputLayout, GfxProgram, GfxTexFilterMode, GfxMipFilterMode, GfxWrapMode, GfxTextureDimension, GfxRenderPass, GfxMegaStateDescriptor, GfxBlendMode, GfxBlendFactor, GfxBindingLayoutDescriptor, GfxCullMode, GfxVertexBufferDescriptor, GfxIndexBufferDescriptor, GfxInputLayoutBufferDescriptor, GfxInputLayoutDescriptor, GfxTextureUsage, GfxSamplerFormatKind } from "../gfx/platform/GfxPlatform.js";
import { makeStaticDataBuffer } from "../gfx/helpers/BufferHelpers.js";
import { DeviceProgram } from "../Program.js";
import { convertToTriangleIndexBuffer, filterDegenerateTriangleIndexBuffer, GfxTopology } from "../gfx/helpers/TopologyHelpers.js";
import { fillMatrix4x3, fillMatrix4x4, fillColor } from "../gfx/helpers/UniformBufferHelpers.js";
import { mat4, quat, vec3, vec2 } from "gl-matrix";
import { CameraController, computeViewSpaceDepthFromWorldSpaceAABB } from "../Camera.js";
import { GfxRenderHelper } from "../gfx/render/GfxRenderHelper.js";
import { align, assert } from "../util.js";
import { makeBackbufferDescSimple, standardFullClearRenderPassDescriptor } from "../gfx/helpers/RenderGraphHelpers.js";
import { GfxRenderInstManager, GfxRendererLayer, makeSortKey, setSortKeyDepth, GfxRenderInst, GfxRenderInstList } from "../gfx/render/GfxRenderInstManager.js";
import { ItemInstance, ObjectDefinition } from "./item.js";
import { colorNewFromRGBA, White, colorNewCopy, Color, colorCopy } from "../Color.js";
import { ColorSet, emptyColorSet, lerpColorSet } from "./time.js";
import { AABB } from "../Geometry.js";
import { GfxRenderCache } from "../gfx/render/GfxRenderCache.js";
import { setAttachmentStateSimple } from "../gfx/helpers/GfxMegaStateDescriptorHelpers.js";
import { GraphObjBase } from "../SceneBase.js";
import { GfxrAttachmentSlot } from "../gfx/render/GfxRenderGraph.js";
import { GfxShaderLibrary } from "../gfx/helpers/GfxShaderLibrary.js";

const TIME_FACTOR = 2500; // one day cycle per minute

export interface Texture extends TextureBase {
    levels: Uint8Array[];
    pixelFormat: GfxFormat;
    transparent: boolean;
}

function convertFormat(format: number) {
    switch(format) {
        case rw.Raster.Format.D3DFMT_DXT1:
            return GfxFormat.BC1;
        case rw.Raster.Format.D3DFMT_DXT2:
        case rw.Raster.Format.D3DFMT_DXT3:
            return GfxFormat.BC2;
        case rw.Raster.Format.D3DFMT_DXT4:
        case rw.Raster.Format.D3DFMT_DXT5:
            return GfxFormat.BC3;
        default:
            throw new Error('Unrecognised texture format');
    }
}

export function rwTexture(texture: rw.Texture, txdName: string, useDXT = true): Texture {
    const name = txdName + '/' + texture.name.toLowerCase();

    if (useDXT && (texture.raster.platform === rw.Platform.PLATFORM_D3D8 ||
                   texture.raster.platform === rw.Platform.PLATFORM_D3D9)) {
        const r = texture.raster.toD3dRaster();
        if (r.customFormat) {
            const pixelFormat = convertFormat(r.format);
            const transparent = r.hasAlpha;
            assert(r.texture.length > 0);
            const { width, height } = r.texture.level(0);
            const levels = [];
            for (let i = 0; i < r.texture.length; i++)
                levels.push(r.texture.level(i).data!.slice());
            return { name, width, height, levels, pixelFormat, transparent };
        }
    }

    const image = texture.raster.toImage();
    image.unindex();
    const { width, height } = image;
    const levels: Uint8Array[] = [];
    if (image.depth === 24) {
        const in24 = image.pixels!;
        const out = new Uint8Array(width * height * 4);
        for (let i = 0; i < width * height; i++) {
            out[i*4+0] = in24[i*3+0];
            out[i*4+1] = in24[i*3+1];
            out[i*4+2] = in24[i*3+2];
            out[i*4+3] = 0xFF;
        }
        levels.push(out);
    } else if (image.depth === 32) {
        levels.push(image.pixels!.slice());
    }
    const pixelFormat = GfxFormat.U8_RGBA_NORM;
    const transparent = image.hasAlpha();
    image.delete();
    return { name, width, height, levels, pixelFormat, transparent };
}

function halve(pixels: Uint8Array, width: number, height: number, bpp: number): Uint8Array<ArrayBuffer> {
    const w = Math.max((width / 2) | 0, 1);
    const h = Math.max((height / 2) | 0, 1);
    const UNPACK_ALIGNMENT = 4;
    const rowSize = align(bpp * width, UNPACK_ALIGNMENT);
    const halvedRowSize = align(bpp * w, UNPACK_ALIGNMENT);
    const halved = new Uint8Array(halvedRowSize * h);
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            for (let i = 0; i < bpp; i++) {
                halved[bpp * x + halvedRowSize * y + i] =
                    ( pixels[bpp * (2*x+0) + rowSize * (2*y+0) + i]
                    + pixels[bpp * (2*x+1) + rowSize * (2*y+0) + i]
                    + pixels[bpp * (2*x+0) + rowSize * (2*y+1) + i]
                    + pixels[bpp * (2*x+1) + rowSize * (2*y+1) + i] ) / 4;
            }
        }
    }
    return halved;
}

export class TextureArray extends TextureMapping {
    public subimages = new Map<string, number>();
    public transparent: boolean;

    constructor(cache: GfxRenderCache, textures: Texture[]) {
        super();
        assert(textures.length > 0);
        const { width, height, pixelFormat, transparent } = textures[0];
        const levels = textures[0].levels.length;
        const size = textures[0].levels.map(l => l.byteLength);
        for (let i = 0; i < textures.length; i++) {
            const texture = textures[i];
            assert(texture.width === width && texture.height === height && texture.levels.length === levels && texture.pixelFormat === pixelFormat);
            this.subimages.set(texture.name, i);
        }

        let bpp = 0;
        if (pixelFormat === GfxFormat.U8_RGBA_NORM) {
            bpp = 4;
        } else if (pixelFormat === GfxFormat.U8_RGB_NORM) {
            bpp = 3;
        }

        const mipmaps = [];
        for (let i = 0; i < levels; i++) {
            const pixels = new Uint8Array(size[i] * textures.length);
            for (let j = 0; j < textures.length; j++)
                pixels.set(textures[j].levels[i], j * size[i]);
            mipmaps.push(pixels);
        }

        if (mipmaps.length === 1 && bpp > 0) {
            let mip = mipmaps[0];
            let w = width;
            let h = height;
            while (w > 1 && h > 1) {
                mip = halve(mip, w, h * textures.length, bpp);
                mipmaps.push(mip);
                w = Math.max((w / 2) | 0, 1);
                h = Math.max((h / 2) | 0, 1);
            }
        }

        const device = cache.device;
        const gfxTexture = device.createTexture({
            dimension: GfxTextureDimension.n2DArray, pixelFormat,
            width, height, depthOrArrayLayers: textures.length, numLevels: mipmaps.length, usage: GfxTextureUsage.Sampled,
        });

        device.uploadTextureData(gfxTexture, 0, mipmaps);

        this.gfxTexture = gfxTexture;
        this.width = width;
        this.height = height;
        this.flipY = false;
        this.transparent = transparent;

        this.gfxSampler = cache.createSampler({
            magFilter: GfxTexFilterMode.Bilinear,
            minFilter: GfxTexFilterMode.Bilinear,
            mipFilter: (mipmaps.length > 1) ? GfxMipFilterMode.Linear : GfxMipFilterMode.Nearest,
            minLOD: 0,
            maxLOD: 1000,
            wrapS: GfxWrapMode.Repeat,
            wrapT: GfxWrapMode.Repeat,
        });
    }

    public destroy(device: GfxDevice): void {
        if (this.gfxTexture !== null)
            device.destroyTexture(this.gfxTexture);
    }
}

interface GTA3ProgramDef {
    ALPHA_TEST?: string;
    SKY?: string;
    WATER?: string;
}

class GTA3Program extends DeviceProgram {
    public static a_Position = 0;
    public static a_Color = 1;
    public static a_TexCoord = 2;
    public static a_TexScroll = 3;

    public static ub_SceneParams = 0;

    public override both = `
precision mediump float;
precision lowp sampler2DArray;

${GfxShaderLibrary.MatrixLibrary}

layout(std140) uniform ub_SceneParams {
    Mat4x4 u_Projection;
    Mat3x4 u_ViewMatrix;
    Mat3x4 u_WorldMatrix;
    vec4 u_Frustum;
    vec4 u_AmbientColor;
    vec4 u_SkyTopColor;
    vec4 u_SkyBotColor;
    vec4 u_WaterColor;
    vec4 u_WaterOrigin;
    float u_Time;
};

uniform sampler2DArray u_Texture;

#ifdef SKY
varying vec3 v_Position;
#else
varying vec4 v_Color;
varying vec3 v_TexCoord;
varying vec3 v_TexScroll;
#endif

#ifdef VERT
layout(location = 0) in vec3 a_Position;
#ifdef SKY
void main() {
    gl_Position = vec4(a_Position, 1.0);
    v_Position = a_Position;
}
#else
layout(location = 1) in vec4 a_Color;
layout(location = 2) in vec3 a_TexCoord;
layout(location = 3) in vec3 a_TexScroll;

void main() {
    vec3 t_PositionView = UnpackMatrix(u_ViewMatrix) * vec4(a_Position, 1.0);
    gl_Position = UnpackMatrix(u_Projection) * vec4(t_PositionView, 1.0);
    v_Color = a_Color;
    v_TexCoord = a_TexCoord;
    v_TexScroll = a_TexScroll;
}
#endif
#endif

#ifdef FRAG
#ifdef SKY
void main() {
    gl_FragColor = mix(u_SkyBotColor, u_SkyTopColor, v_Position.y);

    // TODO: get this working again
    vec3 nearPlane = v_Position * u_Frustum.xyz;
    vec3 cameraRay = UnpackMatrix(u_WorldMatrix) * vec4(nearPlane, 0.0);
    vec3 cameraPos = UnpackMatrix(u_WorldMatrix) * vec4(vec3(0.0), 1.0);
    float elevation = atan(cameraRay.y, length(cameraRay.zx));
    gl_FragColor = mix(u_SkyBotColor, u_SkyTopColor, clamp(abs(elevation / radians(45.0)), 0.0, 1.0));
    gl_FragDepth = 0.0;

    float t = (u_WaterOrigin.y - cameraPos.y) / cameraRay.y;
    vec3 oceanPlane = cameraPos + t * cameraRay;

    vec2 uv = (oceanPlane.zx - u_WaterOrigin.zx) / 32.0;
    vec4 oceanSample = texture(SAMPLER_2DArray(u_Texture), vec3(uv, 0));

    if (t > 0.0 && (abs(oceanPlane.z - u_WaterOrigin.z) >= u_WaterOrigin.w - 32.0 ||
                    abs(oceanPlane.x - u_WaterOrigin.x) >= u_WaterOrigin.w - 32.0)) {
        vec4 t_Color = u_WaterColor;
        t_Color *= oceanSample;
        gl_FragColor = mix(gl_FragColor, t_Color, t_Color.a);

        // slightly overlap water tiles to avoid seam
        vec3 clipOffset = 0.01 * vec3(0, 0, 1);
        vec3 viewSpacePos = (UnpackMatrix(u_ViewMatrix) * vec4(oceanPlane, 1.0)) + clipOffset;
        vec4 clipSpacePos = UnpackMatrix(u_Projection) * vec4(viewSpacePos, 1.0);
        float depthNDC = clipSpacePos.z / clipSpacePos.w;
        gl_FragDepth = 0.5 + 0.5 * depthNDC;
    }
}
#else
void main() {
#ifdef WATER
    vec4 t_Color = u_WaterColor;
#else
    vec4 t_Color = v_Color;
    t_Color.rgb += u_AmbientColor.rgb;
#endif

    vec3 uv = v_TexCoord;
    if (v_TexScroll.z > 0.0)
        uv.xy += v_TexScroll.xy * fract(u_Time / v_TexScroll.z);
    // Work around naga bug https://github.com/gfx-rs/wgpu/issues/6596
    uv.z = round(uv.z);
    vec4 tex = texture(SAMPLER_2DArray(u_Texture), uv);
    if (v_TexCoord.z >= 0.0)
        t_Color *= tex;

#ifdef ALPHA_TEST
    if (t_Color.a ALPHA_TEST) discard;
#endif
    gl_FragColor = t_Color;
}
#endif
#endif
    
`;

    constructor(def: GTA3ProgramDef = {}) {
        super();
        if (def.ALPHA_TEST !== undefined)
            this.defines.set('ALPHA_TEST', def.ALPHA_TEST);
        if (def.SKY !== undefined)
            this.defines.set('SKY', def.SKY);
        if (def.WATER !== undefined)
            this.defines.set('WATER', def.WATER);
    }
}

const opaqueProgram = new GTA3Program();
const dualPassCoreProgram = new GTA3Program({ ALPHA_TEST: '< 0.9' });
const dualPassEdgeProgram = new GTA3Program({ ALPHA_TEST: '>= 0.9' });
const waterProgram = new GTA3Program({ WATER: '1' });
const skyProgram = new GTA3Program({ SKY: '1' });

class BaseRenderer {
    protected vertexBuffer: GfxBuffer;
    protected indexBuffer: GfxBuffer;
    protected inputLayout: GfxInputLayout;
    protected vertexBufferDescriptors: GfxVertexBufferDescriptor[];
    protected indexBufferDescriptor: GfxIndexBufferDescriptor;
    protected megaStateFlags: Partial<GfxMegaStateDescriptor> = {};
    protected gfxProgram?: GfxProgram;

    protected indices: number;

    constructor(protected program: DeviceProgram, protected atlas?: TextureArray) {}

    protected prepare(device: GfxDevice, renderInstManager: GfxRenderInstManager): GfxRenderInst {
        const renderInst = renderInstManager.newRenderInst();
        renderInst.setVertexInput(this.inputLayout, this.vertexBufferDescriptors, this.indexBufferDescriptor);
        renderInst.setDrawCount(this.indices);

        if (this.gfxProgram === undefined)
            this.gfxProgram = renderInstManager.gfxRenderCache.createProgram(this.program);

        renderInst.setGfxProgram(this.gfxProgram);
        renderInst.setMegaStateFlags(this.megaStateFlags);
        if (this.atlas !== undefined)
            renderInst.setSamplerBindingsFromTextureMappings([this.atlas]);
        return renderInst;
    }

    public destroy(device: GfxDevice): void {
        device.destroyBuffer(this.indexBuffer);
        device.destroyBuffer(this.vertexBuffer);
    }
}

export class SkyRenderer extends BaseRenderer {
    constructor(device: GfxDevice, cache: GfxRenderCache, atlas: TextureArray) {
        super(skyProgram, atlas);
        // fullscreen quad
        const vbuf = new Float32Array([
            -1, -1, -1,
            -1,  1, -1,
             1,  1, -1,
             1, -1, -1,
        ]);
        const ibuf = new Uint32Array([0,1,2,0,2,3]);
        this.vertexBuffer = makeStaticDataBuffer(device, GfxBufferUsage.Vertex, vbuf.buffer);
        this.indexBuffer  = makeStaticDataBuffer(device, GfxBufferUsage.Index,  ibuf.buffer);
        this.indices = ibuf.length;
        const vertexAttributeDescriptors: GfxVertexAttributeDescriptor[] = [
            { location: GTA3Program.a_Position, bufferIndex: 0, format: GfxFormat.F32_RGB, bufferByteOffset: 0 },
        ];
        const vertexBufferDescriptors: GfxInputLayoutBufferDescriptor[] = [
            { byteStride: 3 * 0x04, frequency: GfxVertexBufferFrequency.PerVertex, },
        ];
        this.inputLayout = cache.createInputLayout({ indexBufferFormat: GfxFormat.U32_R, vertexAttributeDescriptors, vertexBufferDescriptors });
        this.vertexBufferDescriptors = [{ buffer: this.vertexBuffer, byteOffset: 0 }];
        this.indexBufferDescriptor = { buffer: this.indexBuffer, byteOffset: 0 };
    }

    public prepareToRender(device: GfxDevice, renderInstManager: GfxRenderInstManager, viewerInput: Viewer.ViewerRenderInput) {
        if (viewerInput.camera.isOrthographic)
            return;
        const renderInst = super.prepare(device, renderInstManager);
        renderInst.sortKey = makeSortKey(GfxRendererLayer.BACKGROUND);
        renderInstManager.submitRenderInst(renderInst);
    }
}

export interface MeshFragData {
    indices: Uint16Array;
    vertices: number;
    texName?: string;
    texScroll?: vec3;
    fillPosition(dst: vec3, vertex: number): void;
    fillColor(dst: Color, vertex: number): void;
    fillTexCoord(dst: vec2, vertex: number): void;
}

class RWMeshFragData implements MeshFragData {
    public indices: Uint16Array;
    public texName?: string;
    public texScroll?: vec3;

    private baseColor = colorNewCopy(White);
    private indexMap: number[];

    constructor(mesh: rw.Mesh, tristrip: boolean, txdName: string,
                private positions: Float32Array, private texCoords: Float32Array | null, private colors: Uint8Array | null) {
        const { texture, color, uvAnim } = mesh.material;
        if (texture)
            this.texName = txdName + '/' + texture.name.toLowerCase();
        if (color)
            this.baseColor = colorNewFromRGBA(color[0] / 0xFF, color[1] / 0xFF, color[2] / 0xFF, color[3] / 0xFF);
        for (let i = 0; i < 8; i++) {
            const ip = uvAnim.interp(i);
            if (ip === null) continue;
            const anim = ip.currentAnim;
            console.log('... on', anim.uv.name);
            assert(anim.uv.channels![0] === 0);
            const uv = anim.frame(anim.numFrames - anim.numNodes).uv!;
            this.texScroll = vec3.fromValues(uv[4], uv[5], anim.duration);
        }

        this.indexMap = Array.from(new Set(mesh.indices)).sort();

        this.indices = filterDegenerateTriangleIndexBuffer(convertToTriangleIndexBuffer(
            tristrip ? GfxTopology.TriStrips : GfxTopology.Triangles,
            mesh.indices!.map(index => this.indexMap.indexOf(index))));
    }

    public get vertices() {
        return this.indexMap.length;
    }

    public fillPosition(dst: vec3, index: number): void {
        const i = this.indexMap[index];
        dst[0] = this.positions[3*i+0];
        dst[1] = this.positions[3*i+1];
        dst[2] = this.positions[3*i+2];
    }

    public fillColor(dst: Color, index: number): void {
        const i = this.indexMap[index];
        colorCopy(dst, this.baseColor);
        if (this.colors !== null) {
            const r = this.colors[4*i+0]/0xFF;
            const g = this.colors[4*i+1]/0xFF;
            const b = this.colors[4*i+2]/0xFF;
            const a = this.colors[4*i+3]/0xFF;
            dst.r *= r;
            dst.g *= g;
            dst.b *= b;
            dst.a *= a;
        }
    }

    public fillTexCoord(dst: vec2, index: number): void {
        const i = this.indexMap[index];
        if (this.texCoords !== null) {
            dst[0] = this.texCoords[2*i+0];
            dst[1] = this.texCoords[2*i+1];
        }
    }
}

export class ModelCache {
    public meshData = new Map<string, MeshFragData[]>();

    private addAtomic(atomic: rw.Atomic, obj: ObjectDefinition) {
        const geom = atomic.geometry;
        const positions = geom.morphTarget(0).vertices!.slice();
        const texCoords = (geom.numTexCoordSets > 0) ? geom.texCoords(0)!.slice() : null;
        const colors = (geom.colors !== null) ? geom.colors.slice() : null;
        const h = geom.meshHeader;
        const frags: MeshFragData[] = [];
        for (let i = 0; i < h.numMeshes; i++) {
            const frag = new RWMeshFragData(h.mesh(i), h.tristrip, obj.txdName, positions, texCoords, colors);
            frags.push(frag);
        }
        this.meshData.set(obj.modelName, frags);
    }

    public addModel(model: rw.Clump, obj: ObjectDefinition) {
        let node: rw.Atomic | null = null;
        for (let lnk = model.atomics.begin; !lnk.is(model.atomics.end); lnk = lnk.next) {
            const atomic = rw.Atomic.fromClump(lnk);
            const atomicName = atomic.frame.name.toLowerCase();
            if (node === null || atomicName.endsWith('_l0') || atomicName === obj.modelName) {
                // only use the unbroken variant of breakable objects
                node = atomic;
            }
        }
        if (node !== null)
            this.addAtomic(node, obj);
    }
}

export class MeshInstance {
    public modelMatrix = mat4.create();

    constructor(public frags: MeshFragData[], public item: ItemInstance) {
        mat4.fromRotationTranslationScale(this.modelMatrix, this.item.rotation, this.item.translation, this.item.scale);
        // convert Z-up to Y-up
        mat4.multiply(this.modelMatrix, mat4.fromQuat(mat4.create(), quat.fromValues(0.5, 0.5, 0.5, -0.5)), this.modelMatrix);
    }
}

export class DrawParams {
    public renderLayer = GfxRendererLayer.OPAQUE;
    public timeOn?: number;
    public timeOff?: number;
    public water = false;
    public additive = false;
    public backface = false;

    private static internMap = new Map<string, DrawParams>();

    public intern(): DrawParams {
        const str = JSON.stringify(this);
        if (DrawParams.internMap.has(str)) {
            return DrawParams.internMap.get(str)!;
        } else {
            DrawParams.internMap.set(str, this);
            return this;
        }
    }

    public clone(): DrawParams {
        return Object.assign(new DrawParams(), this);
    }
}

const scratchVec2 = vec2.create();
const scratchVec3 = vec3.create();
const scratchColor = colorNewCopy(White);
export class SceneRenderer extends BaseRenderer {
    public bbox = new AABB(Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity);
    private sortKey: number;
    private visible = true;

    private static programFor(params: DrawParams, dual: boolean) {
        if (params.water) return waterProgram;

        // PS2 alpha test emulation, see http://skygfx.rockstarvision.com/skygfx.html
        if (dual) return dualPassEdgeProgram;
        if (!!(params.renderLayer & GfxRendererLayer.TRANSLUCENT)) return dualPassCoreProgram;

        return opaqueProgram;
    }

    private static keepFrag(frag: MeshFragData, atlas?: TextureArray) {
        if (frag.texName !== undefined && atlas !== undefined) {
            return atlas.subimages.has(frag.texName);
        } else { // only draw untextured objects once (i.e. only when no atlas provided)
            return (frag.texName === undefined && atlas === undefined);
        }
    }

    public static applicable(meshes: MeshInstance[], atlas?: TextureArray) {
        for (const inst of meshes) {
            for (const frag of inst.frags) {
                if (SceneRenderer.keepFrag(frag, atlas)) return true;
            }
        }
        return false;
    }

    constructor(device: GfxDevice, cache: GfxRenderCache, public params: DrawParams, private meshes: MeshInstance[], sealevel: number, atlas?: TextureArray, dual = false) {
        super(SceneRenderer.programFor(params, dual), atlas);

        let vertices = 0;
        this.indices = 0;
        for (const inst of meshes) {
            for (const frag of inst.frags) {
                if (!SceneRenderer.keepFrag(frag, atlas)) continue;
                vertices += frag.vertices;
                this.indices += frag.indices.length;
            }
        }
        assert(this.indices > 0);

        const attrLen = 13;
        const vbuf = new Float32Array(vertices * attrLen);
        const ibuf = new Uint32Array(this.indices);
        let voffs = 0;
        let ioffs = 0;
        let lastIndex = 0;
        for (const inst of meshes) {
            for (const frag of inst.frags) {
                if (!SceneRenderer.keepFrag(frag, atlas)) continue;
                const n = frag.vertices;
                const texLayer = (frag.texName === undefined || atlas === undefined) ? undefined : atlas.subimages.get(frag.texName);
                for (let i = 0; i < n; i++) {
                    frag.fillPosition(scratchVec3, i);
                    vec3.transformMat4(scratchVec3, scratchVec3, inst.modelMatrix);
                    vbuf[voffs++] = scratchVec3[0];
                    vbuf[voffs++] = scratchVec3[1];
                    vbuf[voffs++] = scratchVec3[2];
                    this.bbox.unionPoint(scratchVec3);
                    frag.fillColor(scratchColor, i);
                    voffs += fillColor(vbuf, voffs, scratchColor);
                    frag.fillTexCoord(scratchVec2, i);
                    vbuf[voffs++] = scratchVec2[0];
                    vbuf[voffs++] = scratchVec2[1];
                    if (texLayer === undefined) {
                        vbuf[voffs++] = -1;
                    } else {
                        vbuf[voffs++] = texLayer;
                    }
                    const texScroll = frag.texScroll;
                    if (texScroll !== undefined) {
                        vbuf[voffs++] = texScroll[0];
                        vbuf[voffs++] = texScroll[1];
                        vbuf[voffs++] = texScroll[2];
                    } else {
                        voffs += 3;
                    }
                }
                for (let i = 0; i < frag.indices.length; i++) {
                    const index = frag.indices[i];
                    assert(index + lastIndex < vertices);
                    ibuf[ioffs++] = index + lastIndex;
                }
                lastIndex += n;
            }
        }

        this.vertexBuffer = makeStaticDataBuffer(device, GfxBufferUsage.Vertex, vbuf.buffer);
        this.indexBuffer  = makeStaticDataBuffer(device, GfxBufferUsage.Index,  ibuf.buffer);

        const vertexAttributeDescriptors: GfxVertexAttributeDescriptor[] = [
            { location: GTA3Program.a_Position,    bufferIndex: 0, format: GfxFormat.F32_RGB,  bufferByteOffset:  0 * 0x04 },
            { location: GTA3Program.a_Color,       bufferIndex: 0, format: GfxFormat.F32_RGBA, bufferByteOffset:  3 * 0x04 },
            { location: GTA3Program.a_TexCoord,    bufferIndex: 0, format: GfxFormat.F32_RGB,  bufferByteOffset:  7 * 0x04 },
            { location: GTA3Program.a_TexScroll,   bufferIndex: 0, format: GfxFormat.F32_RGB,  bufferByteOffset: 10 * 0x04 },
        ];
        const vertexBufferDescriptors: GfxInputLayoutBufferDescriptor[] = [
            { byteStride: attrLen * 0x04, frequency: GfxVertexBufferFrequency.PerVertex, },
        ];
        this.inputLayout = cache.createInputLayout({ indexBufferFormat: GfxFormat.U32_R, vertexAttributeDescriptors, vertexBufferDescriptors });
        this.vertexBufferDescriptors = [{ buffer: this.vertexBuffer, byteOffset: 0 }];
        this.indexBufferDescriptor = { buffer: this.indexBuffer, byteOffset: 0 };
        this.megaStateFlags = {
            depthWrite: !dual,
            cullMode: this.params.backface ? GfxCullMode.None : GfxCullMode.Back,
        };
        setAttachmentStateSimple(this.megaStateFlags, {
            blendMode: GfxBlendMode.Add,
            blendDstFactor: this.params.additive ? GfxBlendFactor.One : GfxBlendFactor.OneMinusSrcAlpha,
            blendSrcFactor: GfxBlendFactor.SrcAlpha,
        });

        let renderLayer = this.params.renderLayer;
        if (this.atlas !== undefined && this.atlas.transparent)
            renderLayer = GfxRendererLayer.TRANSLUCENT;
        if (this.params.water) {
            this.sortKey = makeSortKey(GfxRendererLayer.TRANSLUCENT + 1);
        } else if (renderLayer === GfxRendererLayer.TRANSLUCENT && this.bbox.min[1] >= sealevel) {
            this.sortKey = makeSortKey(GfxRendererLayer.TRANSLUCENT + 2);
        } else {
            this.sortKey = makeSortKey(renderLayer);
        }
    }

    public prepareToRender(device: GfxDevice, renderInstManager: GfxRenderInstManager, viewerInput: Viewer.ViewerRenderInput) {
        if (!this.visible)
            return;

        if (!viewerInput.camera.frustum.contains(this.bbox))
            return;

        const hour = (viewerInput.time / TIME_FACTOR) % 24;
        const { timeOn, timeOff } = this.params;
        if (timeOn !== undefined && timeOff !== undefined) {
            if (timeOn < timeOff && (hour < timeOn || timeOff < hour)) return;
            if (timeOff < timeOn && (hour < timeOn && timeOff < hour)) return;
        }

        const depth = computeViewSpaceDepthFromWorldSpaceAABB(viewerInput.camera.viewMatrix, this.bbox);
        const renderInst = super.prepare(device, renderInstManager);
        renderInst.sortKey = setSortKeyDepth(this.sortKey, depth);
        renderInstManager.submitRenderInst(renderInst);
    }
}

export class AreaRenderer {
    private renderers: SceneRenderer[] = [];
    private bbox = new AABB(Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity);
    private visible = true;

    public push(renderer: SceneRenderer) {
        this.renderers.push(renderer);
        this.bbox.union(this.bbox, renderer.bbox);
    }

    public prepareToRender(device: GfxDevice, renderInstManager: GfxRenderInstManager, viewerInput: Viewer.ViewerRenderInput) {
        if (!this.visible)
            return;

        if (!viewerInput.camera.frustum.contains(this.bbox))
            return;

        for (let i = 0; i < this.renderers.length; i++)
            this.renderers[i].prepareToRender(device, renderInstManager, viewerInput);
    }

    public destroy(device: GfxDevice): void {
        for (let i = 0; i < this.renderers.length; i++)
            this.renderers[i].destroy(device);
    }
}

const bindingLayouts: GfxBindingLayoutDescriptor[] = [
    { numUniformBuffers: 1, numSamplers: 1, samplerEntries: [
        { formatKind: GfxSamplerFormatKind.Float, dimension: GfxTextureDimension.n2DArray, },
    ] },
];

export class GTA3Renderer implements Viewer.SceneGfx {
    public renderers: GraphObjBase[] = [];
    public textureArrays: TextureArray[] = [];
    public onstatechanged!: () => void;

    private clearRenderPassDescriptor = standardFullClearRenderPassDescriptor;
    private currentColors = emptyColorSet();
    public renderHelper: GfxRenderHelper;
    private renderInstListMain = new GfxRenderInstList();
    private weather = 0;
    private scenarioSelect: UI.SingleSelect;

    constructor(device: GfxDevice, private colorSets: ColorSet[], private weatherTypes: string[], private weatherPeriods: number, private waterOrigin: number[]) {
        this.renderHelper = new GfxRenderHelper(device);
    }

    public adjustCameraController(c: CameraController) {
        c.setSceneMoveSpeedMult(0.01);
    }

    public prepareToRender(device: GfxDevice, viewerInput: Viewer.ViewerRenderInput): void {
        const t = viewerInput.time / TIME_FACTOR * this.weatherPeriods / 24;
        const cs1 = this.colorSets[Math.floor(t)   % this.weatherPeriods + this.weatherPeriods * this.weather];
        const cs2 = this.colorSets[Math.floor(t+1) % this.weatherPeriods + this.weatherPeriods * this.weather];
        lerpColorSet(this.currentColors, cs1, cs2, t % 1);

        viewerInput.camera.setClipPlanes(1);
        const template = this.renderHelper.pushTemplateRenderInst();
        template.setBindingLayouts(bindingLayouts);

        let offs = template.allocateUniformBuffer(GTA3Program.ub_SceneParams, 16 + 2 * 12 + 6 * 4 + 4);
        const mapped = template.mapUniformBufferF32(GTA3Program.ub_SceneParams);
        offs += fillMatrix4x4(mapped, offs, viewerInput.camera.projectionMatrix);
        offs += fillMatrix4x3(mapped, offs, viewerInput.camera.viewMatrix);
        offs += fillMatrix4x3(mapped, offs, viewerInput.camera.worldMatrix);
        mapped[offs++] = viewerInput.camera.right;
        mapped[offs++] = viewerInput.camera.top;
        mapped[offs++] = viewerInput.camera.near;
        mapped[offs++] = viewerInput.camera.far;
        offs += fillColor(mapped, offs, this.currentColors.amb);
        offs += fillColor(mapped, offs, this.currentColors.skyTop);
        offs += fillColor(mapped, offs, this.currentColors.skyBot);
        offs += fillColor(mapped, offs, this.currentColors.water);
        // rotate axes from Z-up to Y-up
        mapped[offs++] = this.waterOrigin[1];
        mapped[offs++] = this.waterOrigin[2];
        mapped[offs++] = this.waterOrigin[0];
        mapped[offs++] = this.waterOrigin[3];
        mapped[offs++] = viewerInput.time / 1e3;

        this.renderHelper.renderInstManager.setCurrentList(this.renderInstListMain);
        for (let i = 0; i < this.renderers.length; i++)
            this.renderers[i].prepareToRender(device, this.renderHelper.renderInstManager, viewerInput);

        this.renderHelper.renderInstManager.popTemplate();
        this.renderHelper.prepareToRender();
    }

    public render(device: GfxDevice, viewerInput: Viewer.ViewerRenderInput) {
        const renderInstManager = this.renderHelper.renderInstManager;
        const builder = this.renderHelper.renderGraph.newGraphBuilder();

        const mainColorDesc = makeBackbufferDescSimple(GfxrAttachmentSlot.Color0, viewerInput, this.clearRenderPassDescriptor);
        const mainDepthDesc = makeBackbufferDescSimple(GfxrAttachmentSlot.DepthStencil, viewerInput, this.clearRenderPassDescriptor);

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

    public createPanels(): UI.Panel[] {
        const scenarioPanel = new UI.Panel();
        scenarioPanel.customHeaderBackgroundColor = UI.COOL_BLUE_COLOR;
        scenarioPanel.setTitle(UI.TIME_OF_DAY_ICON, 'Weather');

        const scenarioNames = this.weatherTypes;

        this.scenarioSelect = new UI.SingleSelect();
        this.scenarioSelect.setStrings(scenarioNames);
        this.scenarioSelect.onselectionchange = (index: number) => {
            if (this.weather === index) return;
            this.weather = index;
            this.onstatechanged();
            this.scenarioSelect.selectItem(index);
        };
        this.scenarioSelect.selectItem(0);
        scenarioPanel.contents.appendChild(this.scenarioSelect.elem);

        scenarioPanel.setVisible(scenarioNames.length > 0);

        return [scenarioPanel];
    }

    public destroy(device: GfxDevice): void {
        this.renderHelper.destroy();
        for (let i = 0; i < this.textureArrays.length; i++)
            this.textureArrays[i].destroy(device);
        for (let i = 0; i < this.renderers.length; i++)
            this.renderers[i].destroy(device);
    }
}
