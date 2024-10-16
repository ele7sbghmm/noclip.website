import { ULONG, tlPoint, tlSphere, tlColour, tlUV } from './util.js';
import { Pure3D } from './srrchunks.js';

import { tlPrimGroupChunk } from './tlPrimGroupChunk.js';
import { tlBBoxChunk } from './tlBBoxChunk.js';
import { tlBSphereChunk } from './tlBSphereChunk.js';

//const subchunk: [
//  tlPrimGroupChunk,
//  tlBBoxChunk,
//  tlBSphereChunk,
//  tlRenderStatusChunk,
//  tlExpressionOffsetsChunk
//];
//const chunk_id = Pure3D.Mesh.MESH;
export type tlMeshChunk = {
  Name: string;
  Version: ULONG;
  NumPrimGroups: ULONG;
}

//const chunk_id = Pure3D.Mesh.RENDERSTATUS;
export type tlRenderStatusChunk = {
  CastShadow: ULONG;
}

