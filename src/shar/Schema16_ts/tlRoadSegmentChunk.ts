import { tlPoint, tlMatrix } from './util.js';
import { SRR2 } from './srrchunks.js';

//const chunk_id = SRR2.ChunkID.ROAD_SEGMENT;
export type tlRoadSegmentChunk = {
	Name: string;
	RoadSegmentData: string;
	HierarchyMatrix: tlMatrix;
	ScaleMatrix: tlMatrix;
}

