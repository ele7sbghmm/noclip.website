import { assert } from '../../util.js';
import { NamedArrayBufferSlice, } from '../../DataFetcher.js'

import { CHUNK } from './chunks.js';
import { BufReader, } from '../reader.js';
import { Pure3D, MemorySection, SmartProp, Simulation } from './chunkids.js';
import { float, int, short, char, char_p, const_char_p, unsigned, unsigned_short, unsigned_char, P3D_U32, } from '../type_aliases.js';

const HEADER_SIZE: int = 12;
const CHUNK_STACK_SIZE: int = 32;

export type Chunk = {
  id: unsigned;
  dataLength: unsigned;
  chunkLength: unsigned;
  startPosition: unsigned;
}

export class tChunkFile {
  protected chunkStack: Chunk[]; // CHUNK_STACK_SIZE
  protected realFile: BufReader;

  constructor(protected file: NamedArrayBufferSlice, protected stackTop: int = -1) {
    this.realFile = new BufReader(file);

    let fileChunk: P3D_U32 = this.realFile.le_u32();

    switch (fileChunk) {
      case Pure3D.DATA_FILE_COMPRESSED_SWAP: {
        console.log('Pure3D.DATA_FILE_COMPRESSED_SWAP');
        // realFile -> SetEndianSwap(!realFile -> GetEndianSwap());
        // fallthrough
      }
      case Pure3D.DATA_FILE_COMPRESSED:
        console.log('Pure3D.DATA_FILE_COMPRESSED');
        // GetData(&fileSize, 1, tFile::DWORD);
        const fileSize: int = this.realFile.le_u32();

        // realFile->SetUncompressedSize(fileSize);
        // realFile->SetCompressed(true);
        // GetData(&fileChunk, 1, tFile::DWORD);
        fileChunk = this.realFile.le_u32();

        break;
      case Pure3D.DATA_FILE:
        console.log('Pure3D.DATA_FILE');
        break;
      case Pure3D.DATA_FILE_SWAP:
        console.log('Pure3D.DATA_FILE_SWAP');
        // realFile->SetEndianSwap(!realFile->GetEndianSwap());
        fileChunk = Pure3D.DATA_FILE;
        break;
      default:
        break;
    }

    this.BeginChunk_overload_for_root_p3d_chunk(fileChunk);
  }

  public ChunksRemaining(): boolean {
    const chunk = this.chunkStack[this.stackTop];
    return (chunk.chunkLength > chunk.dataLength && this.realFile.GetPosition() < chunk.startPosition + chunk.chunkLength)
  }
  public BeginChunk(): unsigned {
    this.stackTop++;
    if (this.stackTop != 0) {
      const start: unsigned = this.chunkStack[this.stackTop - 1].startPosition + this.chunkStack[this.stackTop - 1].dataLength;

      if (this.realFile.GetPosition() < start) {
        this.realFile.Advance(start - this.realFile.GetPosition());
      }
    }

    this.chunkStack[this.stackTop].startPosition = this.realFile.GetPosition();
    this.chunkStack[this.stackTop].id = this.GetUInt();
    this.chunkStack[this.stackTop].dataLength = this.GetUInt();
    this.chunkStack[this.stackTop].chunkLength = this.GetUInt();

    return this.chunkStack[this.stackTop].id;
  }
  public EndChunk() {
    const start: unsigned = this.chunkStack[this.stackTop].startPosition;
    const chLength: unsigned = this.chunkStack[this.stackTop].chunkLength;
    const dataLength: unsigned = this.chunkStack[this.stackTop].dataLength;

    this.realFile.Advance((start + chLength) - this.realFile.GetPosition());
    this.stackTop--;
  }

  public GetCurrentID() { return this.chunkStack[this.stackTop].id; }
  public GetCurrentDataLength() { return this.chunkStack[this.stackTop].dataLength - HEADER_SIZE; }
  public GetCurrentOffset() { return this.realFile.GetPosition() - this.chunkStack[this.stackTop].startPosition - HEADER_SIZE; }

  public GetUInt(): unsigned { return this.realFile.le_u32(); }
  public GetInt(): int { return this.realFile.le_u32(); }
  public GetUShort(): unsigned_short { return this.realFile.le_u16(); }
  public GetShort(): short { return this.realFile.le_u16(); }
  public GetUChar(): unsigned_char { return this.realFile.u8(); }
  public GetChar(): char { return this.realFile.u8(); }
  public GetFloat(): float { return this.realFile.le_f32(); }
  public GetString(): char_p { return this.realFile.read_u8_string(); }

  public GetUWord(): unsigned_short { return this.GetUShort(); }
  public GetWord(): short { return this.GetShort(); }
  public GetLong(): int { return this.GetInt(); }
  public GetPString(str: char_p): char_p { return this.GetString(); }

  protected BeginChunk_overload_for_root_p3d_chunk(chunkID: unsigned): unsigned {
    this.stackTop++;

    this.chunkStack[this.stackTop].startPosition = this.realFile.GetPosition() - 4;
    this.chunkStack[this.stackTop].id = chunkID;
    this.chunkStack[this.stackTop].dataLength = this.GetUInt();
    this.chunkStack[this.stackTop].chunkLength = this.GetUInt();

    return this.chunkStack[this.stackTop].id;
  }

  public ChunkTypeName(id: unsigned): const_char_p {
    switch (id) {
      case Pure3D.Mesh.MESH: return "Mesh.MESH";
      case Pure3D.Mesh.SKIN: return "Mesh.SKIN";
      case Pure3D.Mesh.PRIMGROUP: return "Mesh.PRIMGROUP";
      case Pure3D.Mesh.BOX: return "Mesh.BOX";
      case Pure3D.Mesh.SPHERE: return "Mesh.SPHERE";
      case Pure3D.Mesh.POSITIONLIST: return "Mesh.POSITIONLIST";
      case Pure3D.Mesh.NORMALLIST: return "Mesh.NORMALLIST";
      case Pure3D.Mesh.UVLIST: return "Mesh.UVLIST";
      case Pure3D.Mesh.COLOURLIST: return "Mesh.COLOURLIST";
      case Pure3D.Mesh.STRIPLIST: return "Mesh.STRIPLIST";
      case Pure3D.Mesh.INDEXLIST: return "Mesh.INDEXLIST";
      case Pure3D.Mesh.MATRIXLIST: return "Mesh.MATRIXLIST";
      case Pure3D.Mesh.WEIGHTLIST: return "Mesh.WEIGHTLIST";
      case Pure3D.Mesh.MATRIXPALETTE: return "Mesh.MATRIXPALETTE";
      case Pure3D.Mesh.OFFSETLIST: return "Mesh.OFFSETLIST";
      case Pure3D.Mesh.INSTANCEINFO: return "Mesh.INSTANCEINFO";
      case Pure3D.Mesh.PACKEDNORMALLIST: return "Mesh.PACKEDNORMALLIST";
      case Pure3D.Mesh.VERTEXSHADER: return "Mesh.VERTEXSHADER";
      case Pure3D.Mesh.MEMORYIMAGEVERTEXLIST: return "Mesh.MEMORYIMAGEVERTEXLIST";
      case Pure3D.Mesh.MEMORYIMAGEINDEXLIST: return "Mesh.MEMORYIMAGEINDEXLIST";
      case Pure3D.Mesh.MEMORYIMAGEVERTEXDESCRIPTIONLIST: return "Mesh.MEMORYIMAGEVERTEXDESCRIPTIONLIST";
      case Pure3D.Mesh.TANGENTLIST: return "Mesh.TANGENTLIST";
      case Pure3D.Mesh.BINORMALLIST: return "Mesh.BINORMALLIST";
      case Pure3D.Mesh.RENDERSTATUS: return "Mesh.RENDERSTATUS";
      case Pure3D.Mesh.EXPRESSIONOFFSETS: return "Mesh.EXPRESSIONOFFSETS";
      case Pure3D.Mesh.SHADOWSKIN: return "Mesh.SHADOWSKIN";
      case Pure3D.Mesh.SHADOWMESH: return "Mesh.SHADOWMESH";
      case Pure3D.Mesh.TOPOLOGY: return "Mesh.TOPOLOGY";

      case Pure3D.Shader.SHADER: return "Shader.SHADER";
      case Pure3D.Shader.SHADER_DEFINITION: return "Shader.SHADER_DEFINITION";
      case Pure3D.Shader.TEXTURE_PARAM: return "Shader.TEXTURE_PARAM";
      case Pure3D.Shader.INT_PARAM: return "Shader.INT_PARAM";
      case Pure3D.Shader.FLOAT_PARAM: return "Shader.FLOAT_PARAM";
      case Pure3D.Shader.COLOUR_PARAM: return "Shader.COLOUR_PARAM";
      case Pure3D.Shader.VECTOR_PARAM: return "Shader.VECTOR_PARAM";
      case Pure3D.Shader.MATRIX_PARAM: return "Shader.MATRIX_PARAM";

      case Pure3D.GameAttr.GAME_ATTR: return "GameAttr.GAME_ATTR";
      case Pure3D.GameAttr.INT_PARAM: return "GameAttr.INT_PARAM";
      case Pure3D.GameAttr.FLOAT_PARAM: return "GameAttr.FLOAT_PARAM";
      case Pure3D.GameAttr.COLOUR_PARAM: return "GameAttr.COLOUR_PARAM";
      case Pure3D.GameAttr.VECTOR_PARAM: return "GameAttr.VECTOR_PARAM";
      case Pure3D.GameAttr.MATRIX_PARAM: return "GameAttr.MATRIX_PARAM";

      case Pure3D.Light.LIGHT: return "Light.LIGHT";
      case Pure3D.Light.DIRECTION: return "Light.DIRECTION";
      case Pure3D.Light.POSITION: return "Light.POSITION";
      case Pure3D.Light.CONE_PARAM: return "Light.CONE_PARAM";
      case Pure3D.Light.SHADOW: return "Light.SHADOW";
      case Pure3D.Light.PHOTON_MAP: return "Light.PHOTON_MAP";
      case Pure3D.Light.DECAY_RANGE: return "Light.DECAY_RANGE";

      case Pure3D.Locator.LOCATOR: return "Locator.Locator";

      case Pure3D.ParticleSystem.SYSTEM_FACTORY: return "ParticleSystem.SYSTEM_FACTORY";
      case Pure3D.ParticleSystem.SYSTEM: return "ParticleSystem.SYSTEM";
      case Pure3D.ParticleSystem.BASE_PARTICLE_ARRAY: return "ParticleSystem.BASE_PARTICLE_ARRAY";
      case Pure3D.ParticleSystem.SPRITE_PARTICLE_ARRAY: return "ParticleSystem.SPRITE_PARTICLE_ARRAY";
      case Pure3D.ParticleSystem.DRAWABLE_PARTICLE_ARRAY: return "ParticleSystem.DRAWABLE_PARTICLE_ARRAY";
      case Pure3D.ParticleSystem.BASE_EMITTER_FACTORY: return "ParticleSystem.BASE_EMITTER_FACTORY";
      case Pure3D.ParticleSystem.SPRITE_EMITTER_FACTORY: return "ParticleSystem.SPRITE_EMITTER_FACTORY";
      case Pure3D.ParticleSystem.DRAWABLE_EMITTER_FACTORY: return "ParticleSystem.DRAWABLE_EMITTER_FACTORY";
      case Pure3D.ParticleSystem.PARTICLE_ANIMATION: return "ParticleSystem.PARTICLE_ANIMATION";
      case Pure3D.ParticleSystem.EMITTER_ANIMATION: return "ParticleSystem.EMITTER_ANIMATION";
      case Pure3D.ParticleSystem.GENERATOR_ANIMATION: return "ParticleSystem.GENERATOR_ANIMATION";
      case Pure3D.ParticleSystem.INSTANCING_INFO: return "ParticleSystem.INSTANCING_INFO";

      case Pure3D.OpticEffect.CORONA_V14: return "OpticEffect.CORONA_V14";
      case Pure3D.OpticEffect.LENS_FLARE_PARENT_V14: return "OpticEffect.LENS_FLARE_PARENT_V14";
      case Pure3D.OpticEffect.LENS_FLARE_V14: return "OpticEffect.LENS_FLARE_V14";
      case Pure3D.OpticEffect.VECTOR_V14: return "OpticEffect.VECTOR_V14";
      case Pure3D.OpticEffect.LENS_FLARE_GROUP: return "OpticEffect.LENS_FLARE_GROUP";
      case Pure3D.OpticEffect.LENS_FLARE: return "OpticEffect.LENS_FLARE";

      case Pure3D.BillboardObject.QUAD_V14: return "BillboardObject.QUAD_V14";
      case Pure3D.BillboardObject.QUAD: return "BillboardObject.QUAD";
      case Pure3D.BillboardObject.QUAD_GROUP: return "BillboardObject.QUAD_GROUP";
      case Pure3D.BillboardObject.DISPLAY_INFO: return "BillboardObject.DISPLAY_INFO";
      case Pure3D.BillboardObject.PERSPECTIVE_INFO: return "BillboardObject.PERSPECTIVE_INFO";

      case Pure3D.Scrooby.PROJECT: return "Scrooby.PROJECT";
      case Pure3D.Scrooby.SCREEN: return "Scrooby.SCREEN";
      case Pure3D.Scrooby.PAGE: return "Scrooby.PAGE";
      case Pure3D.Scrooby.LAYER: return "Scrooby.LAYER";
      case Pure3D.Scrooby.GROUP: return "Scrooby.GROUP";
      case Pure3D.Scrooby.MOVIE: return "Scrooby.MOVIE";
      case Pure3D.Scrooby.MULTISPRITE: return "Scrooby.MULTISPRITE";
      case Pure3D.Scrooby.MULTITEXT: return "Scrooby.MULTITEXT";
      case Pure3D.Scrooby.P3DOBJECT: return "Scrooby.P3DOBJECT";
      case Pure3D.Scrooby.POLYGON: return "Scrooby.POLYGON";
      case Pure3D.Scrooby.SPRITE: return "Scrooby.SPRITE";
      case Pure3D.Scrooby.STRINGTEXTBIBLE: return "Scrooby.STRINGTEXTBIBLE";
      case Pure3D.Scrooby.STRINGHARDCODED: return "Scrooby.STRINGHARDCODED";
      case Pure3D.Scrooby.TEXTBIBLE: return "Scrooby.TEXTBIBLE";
      case Pure3D.Scrooby.LANGUAGE: return "Scrooby.LANGUAGE";
      case Pure3D.Scrooby.RESOURCEIMAGE: return "Scrooby.RESOURCEIMAGE";
      case Pure3D.Scrooby.RESOURCEPURE3D: return "Scrooby.RESOURCEPURE3D";
      case Pure3D.Scrooby.OLDRESOURCETEXTSTYLE: return "Scrooby.OLDRESOURCETEXTSTYLE";
      case Pure3D.Scrooby.OLDRESOURCETEXTBIBLE: return "Scrooby.OLDRESOURCETEXTBIBLE";
      case Pure3D.Scrooby.RESOURCETEXTSTYLE: return "Scrooby.RESOURCETEXTSTYLE";
      case Pure3D.Scrooby.RESOURCETEXTBIBLE: return "Scrooby.RESOURCETEXTBIBLE";

      case Pure3D.Texture.TEXTURE: return "Texture.TEXTURE";
      case Pure3D.Texture.IMAGE: return "Texture.IMAGE";
      case Pure3D.Texture.IMAGE_DATA: return "Texture.IMAGE_DATA";
      case Pure3D.Texture.IMAGE_FILENAME: return "Texture.IMAGE_FILENAME";
      case Pure3D.Texture.VOLUME_IMAGE: return "Texture.VOLUME_IMAGE";
      case Pure3D.Texture.SPRITE: return "Texture.SPRITE";

      case Pure3D.AnimatedObject.FACTORY: return "AnimatedObject.FACTORY";
      case Pure3D.AnimatedObject.OBJECT: return "AnimatedObject.OBJECT";
      case Pure3D.AnimatedObject.ANIMATION: return "AnimatedObject.ANIMATION";

      case Pure3D.Expression.VERTEX_EXPRESSION: return "Expression.VERTEX_EXPRESSION";
      case Pure3D.Expression.VERTEX_EXPRESSION_GROUP: return "Expression.VERTEX_EXPRESSION_GROUP";
      case Pure3D.Expression.VERTEX_EXPRESSION_MIXER: return "Expression.VERTEX_EXPRESSION_MIXER";

      case Pure3D.Font.TEXTURE_FONT: return "Font.TEXTURE_FONT";
      case Pure3D.Font.TEXTURE_GLYPH_LIST: return "Font.TEXTURE_GLYPH_LIST";
      case Pure3D.Font.IMAGE_FONT: return "Font.IMAGE_FONT";
      case Pure3D.Font.IMAGE_GLYPH_LIST: return "Font.IMAGE_GLYPH_LIST";

      case Pure3D.SceneGraph.SCENEGRAPH: return "SceneGraph.SCENEGRAPH";
      case Pure3D.SceneGraph.ROOT: return "SceneGraph.ROOT";
      case Pure3D.SceneGraph.BRANCH: return "SceneGraph.BRANCH";
      case Pure3D.SceneGraph.TRANSFORM: return "SceneGraph.TRANSFORM";
      case Pure3D.SceneGraph.VISIBILITY: return "SceneGraph.VISIBILITY";
      case Pure3D.SceneGraph.ATTACHMENT: return "SceneGraph.ATTACHMENT";
      case Pure3D.SceneGraph.ATTACHMENTPOINT: return "SceneGraph.ATTACHMENTPOINT";
      case Pure3D.SceneGraph.DRAWABLE: return "SceneGraph.DRAWABLE";
      case Pure3D.SceneGraph.CAMERA: return "SceneGraph.CAMERA";
      case Pure3D.SceneGraph.LIGHTGROUP: return "SceneGraph.LIGHTGROUP";
      case Pure3D.SceneGraph.SORTORDER: return "SceneGraph.SORTORDER";

      case Pure3D.Animation.AnimationData.ANIMATION: return "Animation.AnimationData.ANIMATION";
      case Pure3D.Animation.AnimationData.GROUP: return "Animation.AnimationData.GROUP";
      case Pure3D.Animation.AnimationData.GROUP_LIST: return "Animation.AnimationData.GROUP_LIST";
      case Pure3D.Animation.AnimationData.SIZE: return "Animation.AnimationData.SIZE";
      case Pure3D.Animation.ChannelData.FLOAT_1: return "Animation.ChannelData.FLOAT_1";
      case Pure3D.Animation.ChannelData.FLOAT_2: return "Animation.ChannelData.FLOAT_2";
      case Pure3D.Animation.ChannelData.VECTOR_1DOF: return "Animation.ChannelData.VECTOR_1DOF";
      case Pure3D.Animation.ChannelData.VECTOR_2DOF: return "Animation.ChannelData.VECTOR_2DOF";
      case Pure3D.Animation.ChannelData.VECTOR_3DOF: return "Animation.ChannelData.VECTOR_3DOF";
      case Pure3D.Animation.ChannelData.QUATERNION: return "Animation.ChannelData.QUATERNION";
      case Pure3D.Animation.ChannelData.STRING: return "Animation.ChannelData.STRING";
      case Pure3D.Animation.ChannelData.ENTITY: return "Animation.ChannelData.ENTITY";
      case Pure3D.Animation.ChannelData.BOOL: return "Animation.ChannelData.BOOL";
      case Pure3D.Animation.ChannelData.COLOUR: return "Animation.ChannelData.COLOUR";
      case Pure3D.Animation.ChannelData.EVENT: return "Animation.ChannelData.EVENT";
      case Pure3D.Animation.ChannelData.EVENT_OBJECT: return "Animation.ChannelData.EVENT_OBJECT";
      case Pure3D.Animation.ChannelData.EVENT_OBJECT_DATA: return "Animation.ChannelData.EVENT_OBJECT_DATA";
      case Pure3D.Animation.ChannelData.EVENT_OBJECT_DATA_IMAGE: return "Animation.ChannelData.EVENT_OBJECT_DATA_IMAGE";
      case Pure3D.Animation.ChannelData.INT: return "Animation.ChannelData.INT";
      case Pure3D.Animation.ChannelData.QUATERNION_FORMAT: return "Animation.ChannelData.QUATERNION_FORMAT";
      case Pure3D.Animation.ChannelData.INTERPOLATION_MODE: return "Animation.ChannelData.INTERPOLATION_MODE";
      case Pure3D.Animation.FrameControllerData.FRAME_CONTROLLER: return "Animation.FrameControllerData.FRAME_CONTROLLER";
      case Pure3D.Animation.VertexAnim.OffsetList.COLOUR: return "Animation.VertexAnim.OffsetList.COLOUR";
      case Pure3D.Animation.VertexAnim.OffsetList.VECTOR: return "Animation.VertexAnim.OffsetList.VECTOR";
      case Pure3D.Animation.VertexAnim.OffsetList.VECTOR2: return "Animation.VertexAnim.OffsetList.VECTOR2";
      case Pure3D.Animation.VertexAnim.OffsetList.INDEX: return "Animation.VertexAnim.OffsetList.INDEX";
      case Pure3D.Animation.VertexAnim.KEY: return "Animation.VertexAnim.KEY";

      case Simulation.Collision.OBJECT: return "Simulation.Collision.OBJECT";
      case Simulation.Collision.VOLUME: return "Simulation.Collision.VOLUME";
      case Simulation.Collision.SPHERE: return "Simulation.Collision.SPHERE";
      case Simulation.Collision.CYLINDER: return "Simulation.Collision.CYLINDER";
      case Simulation.Collision.OBBOX: return "Simulation.Collision.OBBOX";
      case Simulation.Collision.WALL: return "Simulation.Collision.WALL";
      case Simulation.Collision.BBOX: return "Simulation.Collision.BBOX";
      case Simulation.Collision.VECTOR: return "Simulation.Collision.VECTOR";
      case Simulation.Collision.SELFCOLLISION: return "Simulation.Collision.SELFCOLLISION";
      case Simulation.Collision.OWNER: return "Simulation.Collision.OWNER";
      case Simulation.Collision.OWNERNAME: return "Simulation.Collision.OWNERNAME";
      case Simulation.Collision.ATTRIBUTE: return "Simulation.Collision.ATTRIBUTE";

      case Simulation.Physics.OBJECT: return "Simulation.Physics.OBJECT";
      case Simulation.Physics.IMAT: return "Simulation.Physics.IMAT";
      case Simulation.Physics.VECTOR: return "Simulation.Physics.VECTOR";
      case Simulation.Physics.JOINT: return "Simulation.Physics.JOINT";
      case Simulation.Physics.JOINT_DOF: return "Simulation.Physics.JOINT_DOF";

      case Simulation.Flexible.OBJECT: return "Simulation.Flexible.OBJECT";
      case Simulation.Flexible.OBJECT_PARAMETERS: return "Simulation.Flexible.OBJECT_PARAMETERS";
      case Simulation.Flexible.FIX_PARTICLE: return "Simulation.Flexible.FIX_PARTICLE";
      case Simulation.Flexible.MAP_VL: return "Simulation.Flexible.MAP_VL";
      case Simulation.Flexible.TRI_MAP: return "Simulation.Flexible.TRI_MAP";
      case Simulation.Flexible.EDGE_MAP: return "Simulation.Flexible.EDGE_MAP";
      case Simulation.Flexible.EDGE_LEN: return "Simulation.Flexible.EDGE_LEN";
      case Simulation.Flexible.OBJECT_LAMBDA: return "Simulation.Flexible.OBJECT_LAMBDA";
      case Simulation.Flexible.JOINT: return "Simulation.Flexible.JOINT";
      case Simulation.Flexible.JOINT_PARAMETERS: return "Simulation.Flexible.JOINT_PARAMETERS";
      case Simulation.Flexible.JOINT_DEFINITION: return "Simulation.Flexible.JOINT_DEFINITION";
      case Simulation.Flexible.JOINT_LAMBDA: return "Simulation.Flexible.JOINT_LAMBDA";

      case Simulation.Link.IK: return "Simulation.Link.IK";
      case Simulation.Link.REACH: return "Simulation.Link.REACH";
      case Simulation.Link.TRACKER: return "Simulation.Link.TRACKER";
      case Simulation.Link.TARGET: return "Simulation.Link.TARGET";
      case Simulation.Link.TARGET_NODE: return "Simulation.Link.TARGET_NODE";
      case Simulation.Link.TARGET_POSE: return "Simulation.Link.TARGET_POSE";

      case Simulation.Parameters.ENVIRONMENT: return "Simulation.Parameters.ENVIRONMENT";
      case Simulation.Parameters.PHYSICS: return "Simulation.Parameters.PHYSICS";

      case SmartProp.SMARTPROP: return "SmartProp.SMARTPROP";
      case SmartProp.SMARTPROPSTATEDATA: return "SmartProp.SMARTPROPSTATEDATA";
      case SmartProp.SMARTPROPVISIBILITYDATA: return "SmartProp.SMARTPROPVISIBILITYDATA";
      case SmartProp.SMARTPROPFRAMECONTROLLERDATA: return "SmartProp.SMARTPROPFRAMECONTROLLERDATA";
      case SmartProp.SMARTPROPEVENTDATA: return "SmartProp.SMARTPROPEVENTDATA";
      case SmartProp.SMARTPROPCALLBACKDATA: return "SmartProp.SMARTPROPCALLBACKDATA";
      case SmartProp.SMARTPROPAPPLIEDFORCE: return "SmartProp.SMARTPROPAPPLIEDFORCE";
      case SmartProp.SMARTPROPBREAKABLE: return "SmartProp.SMARTPROPBREAKABLE";
      case SmartProp.SMARTPROPEXTRAATTRIBUTE: return "SmartProp.SMARTPROPEXTRAATTRIBUTE";

      case MemorySection.MEMORYSECTION: return "MemorySection.MEMORYSECTION";


      // Olsd style chunk ID's
      case CHUNK.P3D_IMAGE: return "Old style P3D_IMAGE";
      case CHUNK.P3D_IMAGE_DATA: return "Old style P3D_IMAGE_DATA";
      case CHUNK.P3D_IMAGE_FILENAME: return "Old style P3D_IMAGE_FILENAME";

      case CHUNK.P3D_SKELETON: return "Old style P3D_SKELETON";
      case CHUNK.P3D_SKELETON_JOINT: return "Old style P3D_SKELETON_JOINT";
      case CHUNK.P3D_SKELETON_JOINT_PHYSICS: return "Old style P3D_SKELETON_JOINT_PHYSICS";
      case CHUNK.P3D_SKELETON_JOINT_MIRROR_MAP: return "Old style P3D_SKELETON_JOINT_MIRROR_MAP";
      case CHUNK.P3D_SKELETON_JOINT_FIX_FLAG: return "Old style P3D_SKELETON_JOINT_FIX_FLAG";

      case CHUNK.P3D_COMPOSITE_DRAWABLE: return "Old style P3D_COMPOSITE_DRAWABLE";
      case CHUNK.P3D_COMPOSITE_DRAWABLE_SKIN_LIST: return "Old style P3D_COMPOSITE_DRAWABLE_SKIN_LIST";
      case CHUNK.P3D_COMPOSITE_DRAWABLE_PROP_LIST: return "Old style P3D_COMPOSITE_DRAWABLE_PROP_LIST";
      case CHUNK.P3D_COMPOSITE_DRAWABLE_SKIN: return "Old style P3D_COMPOSITE_DRAWABLE_SKIN";
      case CHUNK.P3D_COMPOSITE_DRAWABLE_PROP: return "Old style P3D_COMPOSITE_DRAWABLE_PROP";
      case CHUNK.P3D_COMPOSITE_DRAWABLE_EFFECT_LIST: return "Old style P3D_COMPOSITE_DRAWABLE_EFFECT_LIST";
      case CHUNK.P3D_COMPOSITE_DRAWABLE_EFFECT: return "Old style P3D_COMPOSITE_DRAWABLE_EFFECT";
      case CHUNK.P3D_COMPOSITE_DRAWABLE_SORTORDER: return "Old style P3D_COMPOSITE_DRAWABLE_SORTORDER";

      case CHUNK.P3D_FRAME_CONTROLLER: return "Old style P3D_FRAME_CONTROLLER";

      case CHUNK.P3D_MULTI_CONTROLLER: return "Old style P3D_MULTI_CONTROLLER";
      case CHUNK.P3D_MULTI_CONTROLLER_TRACKS: return "Old style P3D_MULTI_CONTROLLER_TRACKS";
      case CHUNK.P3D_MULTI_CONTROLLER_TRACK: return "Old style P3D_MULTI_CONTROLLER_TRACK";

      case CHUNK.P3D_CAMERA: return "Old style P3D_CAMERA";
      case CHUNK.P3D_LIGHT_GROUP: return "Old style P3D_LIGHT_GROUP";
      case CHUNK.P3D_HISTORY: return "Old style P3D_HISTORY";
      case CHUNK.P3D_ALIGN: return "Old style P3D_ALIGN";

      case CHUNK.P3D_EXPORT_INFO: return "Old style P3D_EXPORT_INFO";
      case CHUNK.P3D_EXPORT_NAMED_STRING: return "Old style P3D_EXPORT_NAMED_STRING";
      case CHUNK.P3D_EXPORT_NAMED_INT: return "Old style P3D_EXPORT_NAMED_INT";

      case CHUNK.P3D_EXPRESSION_PRESET: return "Old style P3D_EXPRESSION_PRESET";
      case CHUNK.P3D_EXPRESSION_GROUP: return "Old style P3D_EXPRESSION_GROUP";
      case CHUNK.P3D_EXPRESSION_ANIM: return "Old style P3D_EXPRESSION_ANIM";
      case CHUNK.P3D_EXPRESSION_ANIM_CHANNEL: return "Old style P3D_EXPRESSION_ANIM_CHANNEL";
      case CHUNK.P3D_EXPRESSION_MIXER: return "Old style P3D_EXPRESSION_MIXER";

      case CHUNK.P3D_VERTEXOFFSET: return "Old style P3D_VERTEXOFFSET";
      case CHUNK.P3D_VERTEXOFFSET_ANIM: return "Old style P3D_VERTEXOFFSET_ANIM";
      case CHUNK.P3D_VERTEX_OFFSET_EXPRESSION: return "Old style P3D_VERTEX_OFFSET_EXPRESSION";

      case CHUNK.P3D_SG_TRANSFORM_ANIM: return "Old style P3D_SG_TRANSFORM_ANIM";

      case CHUNK.P3D_VISIBILITY_ANIM: return "Old style P3D_VISIBILITY_ANIM";
      case CHUNK.P3D_VISIBILITY_ANIM_CHANNEL: return "Old style P3D_VISIBILITY_ANIM_CHANNEL";

      case CHUNK.P3D_TEXTURE_ANIM: return "Old style P3D_TEXTURE_ANIM";
      case CHUNK.P3D_TEXTURE_ANIM_CHANNEL: return "Old style P3D_TEXTURE_ANIM_CHANNEL";

      case CHUNK.P3D_POSE_ANIM: return "Old style P3D_POSE_ANIM";
      case CHUNK.P3D_JOINT_LIST: return "Old style P3D_JOINT_LIST";
      case CHUNK.P3D_ANIM_CHANNEL: return "Old style P3D_ANIM_CHANNEL";
      case CHUNK.P3D_POSE_ANIM_MIRRORED: return "Old style P3D_POSE_ANIM_MIRRORED";

      case CHUNK.P3D_CHANNEL_1DOF: return "Old style P3D_CHANNEL_1DOF";
      case CHUNK.P3D_CHANNEL_3DOF: return "Old style P3D_CHANNEL_3DOF";
      case CHUNK.P3D_CHANNEL_1DOF_ANGLE: return "Old style P3D_CHANNEL_1DOF_ANGLE";
      case CHUNK.P3D_CHANNEL_3DOF_ANGLE: return "Old style P3D_CHANNEL_3DOF_ANGLE";
      case CHUNK.P3D_CHANNEL_STATIC: return "Old style P3D_CHANNEL_STATIC";
      case CHUNK.P3D_CHANNEL_STATIC_ANGLE: return "Old style P3D_CHANNEL_STATIC_ANGLE";
      case CHUNK.P3D_CHANNEL_QUATERNION: return "Old style P3D_CHANNEL_QUATERNION";
      case CHUNK.P3D_CHANNEL_STATIC_QUATERNION: return "Old style P3D_CHANNEL_STATIC_QUATERNION";

      case CHUNK.P3D_CAMERA_ANIM: return "Old style P3D_CAMERA_ANIM";
      case CHUNK.P3D_CAMERA_ANIM_CHANNEL: return "Old style P3D_CAMERA_ANIM_CHANNEL";
      case CHUNK.P3D_CAMERA_ANIM_POS_CHANNEL: return "Old style P3D_CAMERA_ANIM_POS_CHANNEL";
      case CHUNK.P3D_CAMERA_ANIM_LOOK_CHANNEL: return "Old style P3D_CAMERA_ANIM_LOOK_CHANNEL";
      case CHUNK.P3D_CAMERA_ANIM_UP_CHANNEL: return "Old style P3D_CAMERA_ANIM_UP_CHANNEL";
      case CHUNK.P3D_CAMERA_ANIM_FOV_CHANNEL: return "Old style P3D_CAMERA_ANIM_FOV_CHANNEL";

      case CHUNK.P3D_CAMERA_ANIM_NEARCLIP_CHANNEL: return "Old style P3D_CAMERA_ANIM_NEARCLIP_CHANNEL";
      case CHUNK.P3D_CAMERA_ANIM_FARCLIP_CHANNEL: return "Old style P3D_CAMERA_ANIM_FARCLIP_CHANNEL";

      case CHUNK.P3D_LIGHT_ANIM: return "Old style P3D_LIGHT_ANIM";
      case CHUNK.P3D_LIGHT_ANIM_CHANNEL: return "Old style P3D_LIGHT_ANIM_CHANNEL";
      case CHUNK.P3D_LIGHT_ANIM_COLOUR_CHANNEL: return "Old style P3D_LIGHT_ANIM_COLOUR_CHANNEL";
      case CHUNK.P3D_LIGHT_ANIM_PARAM_CHANNEL: return "Old style P3D_LIGHT_ANIM_PARAM_CHANNEL";
      case CHUNK.P3D_LIGHT_ANIM_ENABLE_CHANNEL: return "Old style P3D_LIGHT_ANIM_ENABLE_CHANNEL";

      case CHUNK.P3D_ENTITY_ANIM_CHANNEL: return "Old style P3D_ENTITY_ANIM_CHANNEL";
      case CHUNK.P3D_KEYLIST_COLOUR: return "Old style P3D_KEYLIST_COLOUR";

      case CHUNK.P3D_VERTEX_ANIM: return "Old style P3D_VERTEX_ANIM";
      case CHUNK.P3D_VERTEX_ANIM_CHANNEL: return "Old style P3D_VERTEX_ANIM_CHANNEL";

      default: {
        switch (id & 0xFF000000) {
          case 0x00000000: console.log("Unknown Pure3D Chunk ${id}"); break;
          case 0x01000000: console.log("Unknown Foundation Chunk ${id}"); break;
          case 0x02000000: console.log("Unknown Hairclub Chunk ${id}"); break;
          case 0x03000000: console.log("Unknown Simpsons Chunk ${id}"); break;
          case 0x04000000: console.log("Unknown M2 Chunk ${id}"); break;
          case 0x05000000: console.log("Unknown Squidney Chunk ${id}"); break;
          case 0x06000000: console.log("Unknown Penthouse Chunk ${id}"); break;
          case 0x07000000: console.log("Unknown Simulation Chunk ${id}"); break;
          case 0x08000000: console.log("Unknown SmartProp Chunk ${id}"); break;

          default: console.log("Unknown Reserved Chunk ${id}");
        }
      }
    }
    return "Oh shit!";
  }
}
