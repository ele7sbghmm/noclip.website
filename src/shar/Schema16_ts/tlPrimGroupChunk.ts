import { UBYTE, ULONG, COLOUR, float, tlPoint, tlColour, tlUV } from './util.js';

type tlVtxOffset = { // struct
  Index: ULONG;
  OffsetX: float;
  OffsetY: float;
  OffsetZ: float;
}

//const subchunk: [
//  tlVertexShaderChunk,
//  tlPositionListChunk,
//  tlNormalListChunk,
//  tlPackedNormalListChunk,
//  tlUVListChunk,
//  tlColourListChunk,
//  tlMultiColourListChunk,
//  tlStripListChunk,
//  tlIndexListChunk,
//  tlMatrixListChunk,
//  tlWeightListChunk,
//  tlMatrixPaletteChunk,
//  tlInstanceInfoChunk,
//  tlPrimGroupMemoryImageVertexChunk,
//  tlPrimGroupMemoryImageIndexChunk,
//  tlPrimGroupMemoryImageVertexDescriptionChunk,
//  tlTangentListChunk,
//  tlBinormalListChunk,
//  tlOffsetListChunk,
//];
//const chunk_id = Pure3D.Mesh.PRIMGROUP;
export type tlPrimGroupChunk = {
  Version: ULONG;
  Shader: string;
  PrimitiveType: ULONG;
  VertexType: ULONG;
  NumVertices: ULONG;
  NumIndices: ULONG;
  NumMatrices: ULONG;
}

// const chunk_id = Pure3D.Mesh.VERTEXSHADER;
type tlVertexShaderChunk = {
  VertexShaderName: string;
}

// const chunk_id = Pure3D.Mesh.POSITIONLIST;
type tlPositionListChunk = {
  NumPositions: ULONG;
  Positions: [tlPoint]; // NumPositions
}

// const chunk_id = Pure3D.Mesh.NORMALLIST;
type tlNormalListChunk = {
  NumNormals: ULONG;
  Normals: [tlPoint]; // NumNormals
}

// const chunk_id = Pure3D.Mesh.TANGENTLIST;
type tlTangentListChunk = {
  NumTangents: ULONG;
  Tangents: [tlPoint]; // NumTangents
}

// const chunk_id = Pure3D.Mesh.BINORMALLIST;
type tlBinormalListChunk = {
  NumBinormals: ULONG;
  Binormals: [tlPoint]; // NumBinormals
}

// const chunk_id = Pure3D.Mesh.PACKEDNORMALLIST;
type tlPackedNormalListChunk = {
  NumNormals: ULONG;
  Normals: [UBYTE]; // NumNormals
}

// const chunk_id = Pure3D.Mesh.UVLIST;
type tlUVListChunk = {
  NumUVs: ULONG;
  Channel: ULONG;
  UVs: [tlUV]; // NumUVs
}

// const chunk_id = Pure3D.Mesh.COLOURLIST;
type tlColourListChunk = {
  NumColours: ULONG;
  Colours: [tlColour]; // NumColours
}

// const chunk_id = Pure3D.Mesh.MULTICOLOURLIST;
type tlMultiColourListChunk = {
  NumColours: ULONG;
  Channel: ULONG;
  Colours: [tlColour]; // NumColours
}

// const chunk_id = Pure3D.Mesh.STRIPLIST;
type tlStripListChunk = {
  NumStrips: ULONG;
  Strips: [ULONG]; // NumStrips
}

// const chunk_id = Pure3D.Mesh.INDEXLIST;
type tlIndexListChunk = {
  NumIndices: ULONG;
  Indices: [ULONG]; // NumIndices
}

//const subchunk: [tlOffsetListChunk];
//const chunk_id = Pure3D.Mesh.EXPRESSIONOFFSETS;
type tlExpressionOffsetsChunk = {
  NumPrimGroups: ULONG;
  NumOffsetLists: ULONG;
  PrimGroupIndices: [ULONG]; // NumPrimGroups
}

// const chunk_id = Pure3D.Mesh.OFFSETLIST;
type tlOffsetListChunk = {
  NumOffsets: ULONG;
  KeyIndex: ULONG;
  Offsets: [tlVtxOffset]; // NumOffsets
  PrimGroupIndex: ULONG;
}

// const chunk_id = Pure3D.Mesh.MATRIXLIST;
type tlMatrixListChunk = {
  NumMatrices: ULONG;
  Matrices: [COLOUR]; // NumMatrices
}

// const chunk_id = Pure3D.Mesh.WEIGHTLIST;
type tlWeightListChunk = {
  NumWeights: ULONG;
  Weights: [tlPoint]; // NumWeights
}

// const chunk_id = Pure3D.Mesh.MATRIXPALETTE;
type tlMatrixPaletteChunk = {
  NumMatrices: ULONG;
  Matrices: [ULONG]; // NumMatrices
}

// const chunk_id = Pure3D.Mesh.INSTANCEINFO;
type tlInstanceInfoChunk = {
  NumInstances: ULONG;
  VertexCount: ULONG;
  IndexCount: ULONG;
}

// const chunk_id = Pure3D.Mesh.MEMORYIMAGEVERTEXDESCRIPTIONLIST;
type tlPrimGroupMemoryImageVertexDescriptionChunk = {
  Version: ULONG;
  Param: ULONG;
  MemoryImageVertexDescriptionSize: ULONG;
  MemoryImageVertexDescription: [UBYTE]; // MemoryImageVertexDescriptionSize
}

// const chunk_id = Pure3D.Mesh.MEMORYIMAGEVERTEXLIST;
type tlPrimGroupMemoryImageVertexChunk = {
  Version: ULONG;
  Param: ULONG;
  MemoryImageVertexSize: ULONG;
  MemoryImageVertex: [UBYTE]; // MemoryImageVertexSize
}

// const chunk_id = Pure3D.Mesh.MEMORYIMAGEINDEXLIST;
type tlPrimGroupMemoryImageIndexChunk = {
  Version: ULONG;
  Param: ULONG;
  MemoryImageIndexSize: ULONG;
  MemoryImageIndex: [UBYTE]; // MemoryImageIndexSize
}

