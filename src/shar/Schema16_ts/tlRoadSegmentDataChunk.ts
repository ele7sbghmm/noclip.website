import { ULONG, tlPoint } from 'util.js';
import SRR2 from 'srrchunks.js';

//const chunk_id = SRR2.ChunkID.ROAD_SEGMENT_DATA;
type tlRoadSegmentDataChunk = {
  Name: string;
  Type: ULONG;
  NumLanes: ULONG;
  HasShoulder: ULONG;
  Direction: tlPoint;
  Top: tlPoint;
  Bottom: tlPoint;
}

