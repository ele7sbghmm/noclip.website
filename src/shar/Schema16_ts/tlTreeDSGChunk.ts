import { UBYTE, ULONG, float, tlPoint } from 'util.js';
import SRR2 from 'srrchunks.js';

// const subchunk = [tlContiguousBinNodeChunk];
// const chunk_id = SRR2.ChunkID.TREE_DSG;
type tlTreeDSGChunk = {
   NumNodes: ULONG;
   BoundsMin: tlPoint;
   BoundsMax: tlPoint;
}

// const subchunk = [tlSpatialNodeChunk];
// const chunk_id = SRR2::ChunkID::CONTIGUOUS_BIN_NODE;
type tlContiguousBinNodeChunk = {
   SubTreeSize: ULONG;
   ParentOffset: ULONG;
}

// const chunk_id = SRR2.ChunkID.SPATIAL_NODE;
type tlSpatialNodeChunk = {
   PlaneAxis: UBYTE;
   PlanePosn: float;
   NumSEntities: ULONG;
   NumSPhys: ULONG;
   NumIntersects: ULONG;
   NumDPhys: ULONG;
   NumFences: ULONG;
   NumRoads: ULONG;
   NumPaths: ULONG;
   NumAnims: ULONG;
}

