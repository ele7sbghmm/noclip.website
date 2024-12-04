import { assert, nArray } from "../../util"
import { mat4, vec3 } from "gl-matrix"
import { Pure3D } from "../chunkids"
import { tChunkFile } from "../file"
import { pddiPrimType, PddiNumColourSets, pddiVertexMask, pddiCullMode } from "./enums"
import { Color } from "../../Color"
import { rmt } from "../math"
import { pddiVector, pddiVector2 } from "../rad_util"
/*
type bool = boolean
type float = number
type int = number
type unsigned = number
type unsigned_int = number
type char_p = string
type unsigned_char_p = number
type const_char_p = string
type pddiColour = vec3//Color
const NULL = null
const PDDIASSERT = assert

export class tShader { }
export class tPrimGroup {
    mShader: tShader
    mPrimType: pddiPrimType
    mVertexFormat: unsigned_int
    mVertexCount: unsigned_int
    instanceCount: unsigned
    instanceSize: unsigned
    SetVertices() { }
}
class tPrimGroupOptimised extends tPrimGroup {
    constructor(i: number) { super() }
    SetShader = (i: any) => { }
    SetPrimType = (i: any) => { }
    SetVertexFormat = (i: number) => { }
    SetBuffer() { }
}
class tPrimGroupSkinnedOptimised extends tPrimGroup {
    constructor(i: number) { super() }
    SetShader = (i: any) => { }
    SetPrimType = (i: any) => { }
    SetVertexFormat = (i: number) => { }
    SetBuffer() { }
}
class pddiVertexComponentWidth { }
abstract class pddiPrimBufferStream {
    Coord(x: float, y: float, z: float) { this.Position(x, y, z) }
    abstract Position(x: float, y: float, z: float): void
    abstract Normal(x: float, y: float, z: float): void
    Binormal(x: float, y: float, z: float) { }
    Tangent(x: float, y: float, z: float) { }
    abstract Colour(colour: pddiColour, channel?: int): void
    UV(u: float, v: float, channel?: int) { this.TexCoord2(u, v, channel) }
    abstract TexCoord1(s: float, channel?: int): void
    abstract TexCoord2(s: float, t: float, channel?: int): void
    abstract TexCoord3(s: float, t: float, u: float, channel?: int): void
    abstract TexCoord4(s: float, t: float, u: float, v: float, channel?: int): void

    abstract Specular(colour: pddiColour): void
    abstract SkinIndices(_a: unsigned, _b?: unsigned, _c?: unsigned, _d?: unsigned): void
    abstract SkinWeights(_a: float, _b?: float, _c?: float): void

    abstract Vertex_V_C(v: rmt.Vector, c:  pddiColour): void
    abstract Vertex_V_N(v: rmt.Vector, n:  rmt.Vector): void
    abstract Vertex_V_UV(v: rmt.Vector, uv: rmt.Vector2): void
    abstract Vertex_V_C_UV(v: rmt.Vector, c:  pddiColour, uv: rmt.Vector2): void
    abstract Vertex_V_N_UV(v: rmt.Vector, n:  rmt.Vector, uv: rmt.Vector2): void

    abstract Next(): void
};
class d3dVertexProgram { }
class d3dPrimBufferStream extends pddiPrimBufferStream {
    d3dPrimBufferStream() { }
    Lock()   { /*PDDIASSERT(!locked);/ this.locked = true }
    Unlock() { /*PDDIASSERT(locked);/ this.locked = false }

    SetBasePtr(basePtr: void, vs: d3dVertexProgram, bufferCount: int, offset: int) { }

    override Position(x: float, y: float, z: float) { }
    Normal(x: float, y: float, z: float) { }
    Colour(colour: pddiColour, channel: int = 0) { }
    TexCoord1(u: float, channel: int = 0) { }
    TexCoord2(u: float, v: float, channel: int = 0) { }
    TexCoord3(u: float, v: float, s: float, channel: int = 0) {}
    TexCoord4(u: float, v: float, s: float, t: float, channel: int = 0) {}
    Specular(colour: pddiColour) { }

    SkinIndices(_a: unsigned, _b: unsigned = 0, _c: unsigned = 0, _d: unsigned = 0) { }
    SkinWeights(_a: float, _b: float = 0, _c: float = 0) { }

    Vertex_V_C(v: pddiVector, c: pddiColour) {
        this.coord = v
        this.colour = c
        this.NextVertex()
    }
    Vertex_V_N(v: pddiVector, n: pddiVector) {
        this.coord = v
        this.Normal(n[0], n[1], n[2])
        this.NextVertex()
    }
    Vertex_V_UV(v: pddiVector, t: pddiVector2) {
        this.coord = v
        this.uv = t
        this.NextVertex()
    }
    Vertex_V_C_UV(v: pddiVector, c: pddiColour, t: pddiVector2) {
        this.coord = v
        this.colour = c
        this.uv = t
        this.NextVertex()
    }
    Vertex_V_N_UV(v: pddiVector, n: pddiVector, t: pddiVector2 ) {
        this.coord = v
        this.Normal(n[0], n[1], n[2])
        this.uv = t
        this.NextVertex()
    }

    Next() { this.NextVertex() }
 
    locked: bool
    vertexProgram: d3dVertexProgram

    basePtr: void
    nVertex: int
    maxVertex: int
    stride: int
    nColourSets: int
    nUV: int
    coord: pddiVector
    normal: float
    compressedNormal: unsigned
    colour: pddiColour
    specular: pddiColour
    uv: pddiVector2
    skinIndices: unsigned_char_p
    skinWeights: pddiVector

    NextVertex() { }
}
export class pddiPrimBufferDesc {
    primType: pddiPrimType
    vertexFormat: number
    componentWidth: pddiVertexComponentWidth
    nVertex: number
    nIndex: number
    memoryImaged: boolean
    deformed: boolean
    vertexProgram: string | null
    matrixCount: number
    constructor(
        type: pddiPrimType,
        format: unsigned,
        vertexCount: unsigned,
        indexCount: unsigned = 0
    ) {
        this.primType = type;
        this.vertexFormat = format;
        this.nVertex = vertexCount;
        this.nIndex = indexCount;
        this.memoryImaged = false;
        this.deformed = false;
        this.vertexProgram = NULL;
        this.matrixCount = 0;
    }
    SetPrimType(type: pddiPrimType)   { this.primType = type; }
    SetVertexFormat(format: unsigned) { this.vertexFormat = format; }
    SetVertexCount(count: unsigned)   { this.nVertex = count; }
    SetIndexCount(count: unsigned)    { this.nIndex = count; }
    SetDeformed(d: bool)              { this.deformed = d; }
    SetMemoryImaged(mi: bool)         { this.memoryImaged = mi; }
    SetVertexProgram(program: char_p) { this.vertexProgram = program; }
    SetMatrixCount(count: unsigned)   { this.matrixCount = count; }
    

    GetPrimType(): pddiPrimType       { return this.primType }
    GetVertexFormat(): unsigned       { return this.vertexFormat }
    GetVertexCount(): unsigned        { return this.nVertex }
    GetIndexCount(): unsigned         { return this.nIndex }
    GetDeformed(): bool               { return this.deformed }
    GetMemoryImaged(): bool           { return this.memoryImaged }
    GetVertexProgram(): const_char_p  { return this.vertexProgram! }
    GetMatrixCount(): unsigned        { return this.matrixCount }
}
export class tPrimGroupLoader {
    mVertexFormat: number
    mVertexFormatMask: number
    mVertexCount: number
    mIndexCount: number
    mMatrixCount: number
    mShader: any
    mPrimType: any
    ParseHeader(f: tChunkFile): bool {
        if (f.GetCurrentID() != Pure3D.Mesh.PRIMGROUP) return false
        const version = f.GetLong()
        const ShaderName = f.realFile.get_nstring()
        // this.mShader = p3d.find<tShader>(store)
        this.mShader = null
        if (this.mShader) { }
        else { /*this.mShader = new tShader(`error`)/ }
        this.mPrimType     = f.GetLong() as unknown as pddiPrimType
        this.mVertexFormat = f.GetLong() & this.mVertexFormatMask
        this.mVertexCount  = f.GetLong()
        this.mIndexCount   = f.GetLong()
        this.mMatrixCount  = f.GetLong()
        this.mVertexCount |= pddiVertexMask.PDDI_V_POSITION
        return true
    }
    Load(f: tChunkFile, bones: mat4 | null, optimize: boolean, deform: boolean): tPrimGroup | null {
        // pddiExtHardwareSkinning* hwSkin = p3d::context->GetHardwareSkinning();
        // if (!ParseHeader) return null
        // if (bones && !hwSkin) { ... }
        // else if (!optimise) { ... }
        const tmpPositions = vec3.create()
        // if deform { ... }
        const version = undefined
        const param = undefined
        const bufferSize = undefined
        let primGroup: tPrimGroupOptimised | tPrimGroupSkinnedOptimised
        if (bones) { primGroup = new tPrimGroupSkinnedOptimised(this.mVertexCount)}
        else { primGroup = new tPrimGroupOptimised(this.mVertexCount) }
        // let primBuffer: pddiPrimBuffer
        let primBufferInitialized = false
        primGroup.SetShader(this.mShader)
        primGroup.SetPrimType(this.mPrimType)
        primGroup.SetVertexFormat(this.mVertexFormatMask)

        const nColourChannels = PddiNumColourSets(this.mVertexFormat)
        const nUVChannel = this.mVertexFormat & 0xf
        let stream: pddiPrimBufferStream | null = null
        let memoryImaged = false

        while (f.ChunksRemaining()) {
            f.BeginChunk()
            switch (f.GetCurrentID()) {
                case Pure3D.Mesh.MEMORYIMAGEVERTEXLIST: {
                    memoryImaged = true
                    primBufferInitialized = true
                    const desc = new pddiPrimBufferDesc(this.mPrimType, this.mVertexFormat, this.mVertexCount, this.mIndexCount)
                    desc.SetMemoryImaged(true)
                    desc.SetMatrixCount(this.mMatrixCount)
                    const primBuffer = p3d.device.NewPrimBuffer(desc)
                    primGroup.SetBuffer(primBuffer)
                    break
                }
                case Pure3D.Mesh.POSITIONLIST:
                case Pure3D.Mesh.NORMALLIST:
                case Pure3D.Mesh.PACKEDNORMALLIST:
                case Pure3D.Mesh.COLOURLIST:
                case Pure3D.Mesh.UVLIST: {
                    if (!primBufferInitialized) {
                        primBufferInitialized = true
                        const decs = new pddiPrimBufferDesc(this.mPrimType, this.mVertexFormat, this.mVertexCount, this.mIndexCount)
                        decs.SetMatrixCount(this.mMatrixCount)
                        const primBuffer = p3d.device.NewPrimBuffer(desc)
                        primGroup.SetBuffer(primBuffer)
                        break
                    }
                }
                default:
                    break
            }
            if (primBufferInitialized) { 
                assert(false, `stream = primBuffer.Lock() :(`)
                stream = primBuffer.Lock()
            }
            switch (f.GetCurrentID()) {
                case Pure3D.Mesh.POSITIONLIST: {
                    const count = f.GetLong()
                    for (let a = 0; a < count; a++) {
                        const v = vec3.fromValues(f.GetFloat(), f.GetFloat(), f.GetFloat())
                        stream!.Coord(v[0], v[1], v[2])
                        if (tmpPositoins) { tmpPositions[a] = v}
                    }
                    break
                }
                case Pure3D.Mesh.NORMALLIST: {
                    if (!(this.mVertexFormat & pddiVertexMask.PDDI_V_NORMAL)) break
                    const count = f.GetLong()
                    for (let a = 0; a < count; a++) {
                        const v = vec3.fromValues(f.GetFloat(), f.GetFloat(), f.GetFloat())
                        stream!.Normal(v[0], v[1], v[2])
                        stream!.Next()
                    }
                    break
                }
                case Pure3D.Mesh.COLOURLIST: {
                    if (!(this.mVertexCount & pddiVertexMask.PDDI_V_COLOUR)) break
                    const count = f.GetLong()
                    for (let a = 0; a < count; a++) {
                        const v = vec3.fromValues(f.GetFloat(), f.GetFloat(), f.GetFloat())
                        stream!.Colour(v[0], v[1], v[2])
                        stream!.Next()
                    }
                    break
                }
                case Pure3D.Mesh.MULTICOLOURLIST: {
                    if (!(this.mVertexFormat & pddiVertexMask.PDDI_V_COLOUR2)) break
                    const count = f.GetLong()
                    const channel = f.GetLong()
                    if (channel >= nColourChannels) break
                    assert(count == this.mVertexCount)
                    for (let a = 0; a < count; a++) {
                        const c = f.GetFloat()
                        stream!.Colour(c, channel)
                        stream!.Next()
                    }
                    break
                }
                case Pure3D.Mesh.UVLIST: {
                    const count = f.GetLong()
                    const channel = f.GetLong()
                    if (channel >= nUVChannel) break
                    assert(count == this.mVertexCount)
                    for (let a = 0; a < count; a++) { 
                        const u = f.GetFloat()
                        const v = f.GetFloat()
                        stream!.UV(u, v, channel)
                        stream!.Next()
                    }
                    break
                }
                case Pure3D.Mesh.INDEXLIST: {
                    const count = f.GetLong()
                    const tempIndexList = nArray(count, () => 0)
                    for (let a = 0; a < count; a++) {
                        tempIndexList[a] = f.GetLong()
                    }
                    primBuffer.SetIndices(tempIndexList, count)
                    p3d.FreeTemp(tempIndexList)
                    break
                }
                case Pure3D.Mesh.WEIGHTLIST: {
                    const count = f.GetLong()
                    // let weight: number[] = []
                    for (let a = 0; a < count; a++) {
                        const weight = vec3.fromValues(f.GetFloat(), f.GetFloat(), f.GetFloat())
                        stream!.SkinWeights(weight[0], weight[1], weight[2])
                        stream!.Next()
                    }
                    break
                }
                case Pure3D.Mesh.MATRIXLIST: {
                    const count = f.GetLong()
                    for (let a = 0; a < count; a++) {
                        const index = [f.realFile.i8(), f.realFile.i8(), f.realFile.i8(), f.realFile.i8()]
                        stream!.SkinIndices(index[3], index[2], index[1], index[0])
                        stream!.Next()
                    }
                    break
                }
                case Pure3D.Mesh.MATRIXPALETTE: {
                    const count = f.GetLong()
                    const skin = primGroup as tPrimGroupSkinnedOptimised
                    skin.nMatrices = count
                    skin.matrixPalette = nArray(count, () => mat4.create())
                    for (let a = 0; a < count; a++) {
                        const index = f.GetLong()
                        skin.matrixPalette[a] = bones[index]
                    }
                    break
                }
                case Pure3D.Mesh.INSTANCEINFO: {
                    primGroup.instanceCount = f.GetLong()
                    const vCount = f.GetLong()
                    const iCount = f.GetLong()
                    primGroup.instanceSize = (this.mIndexCount > 0) ? iCount : vCount
                    break
                }
                case Pure3D.Mesh.MEMORYIMAGEVERTEXLIST: {
                    assert(false, `Pure3D.Mesh.MEMORYIMAGEVERTEXLIST :(`)
                    memoryImage = true
                    const version = f.GetLong()
                    const param = f.GetLong()
                    const bufferSize = f.GetLong()
                    primBufferInitialized.SetMemImageParam(f.GetCurrentID(), param)
                    let ptr = primBuffer.LockMemImage(bufferSize)
                    ptr = nArray(bufferSize, () => f.realFile.i8())
                    primBufferInitialized.UnlockMemImage()
                    break
                }
                case Pure3D.Mesh.MEMORYIMAGEVERTEXDESCRIPTIONLIST: {
                    assert(false, `Pure3D.Mesh.MEMORYIMAGEVERTEXDESCRIPTIONLIST :(`)
                    memoryImaged = true
                    const version = f.GetLong()
                    const param = f.GetLong()
                    const bufferSize = f.GetLong()
                    primBuffer.SetMemImageParam(f.GetCurrentID(), param)
                    let prt = primBuffer.LockMemImage(bufferSize);
                    ptr = nArray(bufferSize, () => f.realFile.i8())
                    primBufferInitialized.UnlockMemImage()
                    break
                }
                case Pure3D.Mesh.MEMORYIMAGEINDEXLIST: {
                    assert(false, `Pure3D.Mesh.MEMORYIMAGEINDEXLIST :(`)
                    memoryImage = true
                    const version = f.GetLong()
                    const param = f.GetLong()
                    const bufferSize = f.GetLong()
                    primBuffer.SetMemImageParam(f.GetCurrentID(), param)
                    let index = primBuffer.LockIndexBuffer(bufferSize);
                    index = nArray(bufferSize, () => f.realFile.i8())
                    primBufferInitialized.UnlockIndexBuffer()
                    break
                }
                default:
                    break
            }
            if (stream) {
                primBufferInitialized.Unlock(stream)
                stream = null
            }
            f.EndChunk()
        }
        if (primGroup && tmpPositions)
            primGroup.tempPositions = tmpPositions
        primBufferInitialized.Finalize()

        return primGroup
    }
    SetVertexFormatMask(m: number) { this.mVertexFormatMask = m }
}
*/