import { unsigned } from '../type_aliases.js';

/*===========================================================================
    File:: chunksids.hpp

    Chunk codes for Pure3D data types
    
    A complete description of the allocation of ids is at the end of this
    file.

    Copyright (c)2001, 2002 Radical Entertainment, Ltd.
    All rights reserved.
===========================================================================*/

//? #ifndef _CHUNKIDS_HPP
//? #define _CHUNKIDS_HPP

/*===========================================================================
 Project Ranges

  0x00000000 - 0x00ffffff  Pure3D
  0x01000000 - 0x01ffffff  Foundation
  0x02000000 - 0x02ffffff  Hairclub
  0x03000000 - 0x03ffffff  Simpsons
  0x04000000 - 0x04ffffff  M2
  0x05000000 - 0x05ffffff  Squidney
  0x06000000 - 0x06ffffff  Penthouse
  0x07000000 - 0x07ffffff  Simulation
  0x08000000 - 0x08ffffff  SmartProp

  0xff000000 - 0xffffffff  Reserved
===========================================================================*/
export namespace Pure3D {
  // The top level wrapper chunk IDs
  const DATA_FILE: unsigned = 0xFF443350;
  const DATA_FILE_SWAP: unsigned = 0x503344FF;       // P3D wrapper ID on big endian
  const DATA_FILE_COMPRESSED: unsigned = 0x5A443350;
  const DATA_FILE_COMPRESSED_SWAP: unsigned = 0x5033445A;

  // Mesh System 0x00010000 - 0x00010fff
  export namespace Mesh {
    const MESH: unsigned = 0x00010000;
    const SKIN: unsigned = 0x00010001;
    const PRIMGROUP: unsigned = 0x00010002;
    const BOX: unsigned = 0x00010003;
    const SPHERE: unsigned = 0x00010004;
    const POSITIONLIST: unsigned = 0x00010005;
    const NORMALLIST: unsigned = 0x00010006;
    const UVLIST: unsigned = 0x00010007;
    const COLOURLIST: unsigned = 0x00010008;
    const STRIPLIST: unsigned = 0x00010009;
    const INDEXLIST: unsigned = 0x0001000A;
    const MATRIXLIST: unsigned = 0x0001000B;
    const WEIGHTLIST: unsigned = 0x0001000C;
    const MATRIXPALETTE: unsigned = 0x0001000D;
    const OFFSETLIST: unsigned = 0x0001000E;
    const INSTANCEINFO: unsigned = 0x0001000F;
    const PACKEDNORMALLIST: unsigned = 0x00010010;
    const VERTEXSHADER: unsigned = 0x00010011;
    const MEMORYIMAGEVERTEXLIST: unsigned = 0x00010012;
    const MEMORYIMAGEINDEXLIST: unsigned = 0x00010013;
    const MEMORYIMAGEVERTEXDESCRIPTIONLIST: unsigned = 0x00010014;
    const TANGENTLIST: unsigned = 0x00010015;
    const BINORMALLIST: unsigned = 0x00010016;
    const RENDERSTATUS: unsigned = 0x00010017;
    const EXPRESSIONOFFSETS: unsigned = 0x00010018;
    const SHADOWSKIN: unsigned = 0x00010019;
    const SHADOWMESH: unsigned = 0x0001001A;
    const TOPOLOGY: unsigned = 0x0001001B;
    const MULTICOLOURLIST: unsigned = 0x0001001C;
  }
  // End Mesh System 

  // Shader System 0x00011000 - 0x00011fff
  export namespace Shader {
    const SHADER: unsigned = 0x00011000;
    const SHADER_DEFINITION: unsigned = 0x00011001;
    const TEXTURE_PARAM: unsigned = 0x00011002;
    const INT_PARAM: unsigned = 0x00011003;
    const FLOAT_PARAM: unsigned = 0x00011004;
    const COLOUR_PARAM: unsigned = 0x00011005;
    const VECTOR_PARAM: unsigned = 0x00011006;
    const MATRIX_PARAM: unsigned = 0x00011007;
  }

  // GameAddr 0x00012000 - 0x00012fff
  export namespace GameAttr {
    const GAME_ATTR: unsigned = 0x00012000;
    const INT_PARAM: unsigned = 0x00012001;
    const FLOAT_PARAM: unsigned = 0x00012002;
    const COLOUR_PARAM: unsigned = 0x00012003;
    const VECTOR_PARAM: unsigned = 0x00012004;
    const MATRIX_PARAM: unsigned = 0x00012005;
  }

  // Light 0x00013000-0x00013fff
  export namespace Light {
    const LIGHT: unsigned = 0x00013000;
    const DIRECTION: unsigned = 0x00013001;
    const POSITION: unsigned = 0x00013002;
    const CONE_PARAM: unsigned = 0x00013003;
    const SHADOW: unsigned = 0x00013004;
    const PHOTON_MAP: unsigned = 0x00013005;

    // Decay range
    const DECAY_RANGE: unsigned = 0x00013006;
    const DECAY_RANGE_ROTATION_Y: unsigned = 0x00013007;

    const ILLUMINATION_TYPE: unsigned = 0x00013008;
  }
  // End Light System

  // Locator 0x00014000-0x00014fff
  export namespace Locator {
    const LOCATOR: unsigned = 0x00014000;
  }

  // Particle System 0x00015000-0x00015fff
  export namespace ParticleSystem {
    //0x00015000-0x000157ff v14 particle system specific chunks
    //!!! DON'T USE !!!

    //0x00015800-0x000158ff particle system specific chunks
    const SYSTEM_FACTORY: unsigned = 0x00015800;
    const SYSTEM: unsigned = 0x00015801;

    const BASE_PARTICLE_ARRAY: unsigned = 0x00015802;
    const SPRITE_PARTICLE_ARRAY: unsigned = 0x00015803;
    const DRAWABLE_PARTICLE_ARRAY: unsigned = 0x00015804;

    const BASE_EMITTER_FACTORY: unsigned = 0x00015805;
    const SPRITE_EMITTER_FACTORY: unsigned = 0x00015806;
    const DRAWABLE_EMITTER_FACTORY: unsigned = 0x00015807;

    const PARTICLE_ANIMATION: unsigned = 0x00015808;
    const EMITTER_ANIMATION: unsigned = 0x00015809;
    const GENERATOR_ANIMATION: unsigned = 0x0001580a;

    const INSTANCING_INFO: unsigned = 0x0001580b;
  }

  // Optic Effect 0x00016000-0x00016fff
  export namespace OpticEffect {
    const CORONA_V14: unsigned = 0x00016000;
    const LENS_FLARE_PARENT_V14: unsigned = 0x00016001;
    const LENS_FLARE_V14: unsigned = 0x00016002;
    const VECTOR_V14: unsigned = 0x00016f00;

    const LENS_FLARE_GROUP: unsigned = 0x00016006;
    const LENS_FLARE: unsigned = 0x00016007;
  }

  // Billboard 0x00017000-0x00017fff
  export namespace BillboardObject {
    const QUAD_V14: unsigned = 0x00017000;

    const QUAD: unsigned = 0x00017001;
    const QUAD_GROUP: unsigned = 0x00017002;
    const DISPLAY_INFO: unsigned = 0x00017003;
    const PERSPECTIVE_INFO: unsigned = 0x00017004;
  }

  // Scrooby (Front End Subsystem) 0x00018000-0x00018fff
  export namespace Scrooby {
    const PROJECT: unsigned = 0x00018000;
    const SCREEN: unsigned = 0x00018001;
    const PAGE: unsigned = 0x00018002;
    const LAYER: unsigned = 0x00018003;

    //objects
    const GROUP: unsigned = 0x00018004;
    const MOVIE: unsigned = 0x00018005;
    const MULTISPRITE: unsigned = 0x00018006;
    const MULTITEXT: unsigned = 0x00018007;
    const P3DOBJECT: unsigned = 0x00018008;
    const POLYGON: unsigned = 0x00018009;
    const SPRITE: unsigned = 0x0001800A;

    //subobjects
    const STRINGTEXTBIBLE: unsigned = 0x0001800B;
    const STRINGHARDCODED: unsigned = 0x0001800C;

    //text bible objects
    const TEXTBIBLE: unsigned = 0x0001800D;
    const LANGUAGE: unsigned = 0x0001800E;

    //resources
    const RESOURCEIMAGE: unsigned = 0x00018100;
    const RESOURCEPURE3D: unsigned = 0x00018101;
    const OLDRESOURCETEXTSTYLE: unsigned = 0x00018102;
    const OLDRESOURCETEXTBIBLE: unsigned = 0x00018103;
    const RESOURCETEXTSTYLE: unsigned = 0x00018104;
    const RESOURCETEXTBIBLE: unsigned = 0x00018105;
  }

  // Texture 0x00019000-0x00019fff
  export namespace Texture {
    const TEXTURE: unsigned = 0x00019000;
    const IMAGE: unsigned = 0x00019001;
    const IMAGE_DATA: unsigned = 0x00019002;
    const IMAGE_FILENAME: unsigned = 0x00019003;
    const VOLUME_IMAGE: unsigned = 0x00019004;
    const SPRITE: unsigned = 0x00019005;
  }

  // Animated Object 0x00020000-0x00020fff
  export namespace AnimatedObject {
    const FACTORY: unsigned = 0x00020000;
    const OBJECT: unsigned = 0x00020001;
    const ANIMATION: unsigned = 0x00020002;
  }

  // Animated Object 0x00021000-0x00021fff
  export namespace Expression {
    const VERTEX_EXPRESSION: unsigned = 0x00021000;
    const VERTEX_EXPRESSION_GROUP: unsigned = 0x00021001;
    const VERTEX_EXPRESSION_MIXER: unsigned = 0x00021002;
  }

  // Font 0x00022000-0x00022fff
  export namespace Font {
    const TEXTURE_FONT: unsigned = 0x00022000;
    const TEXTURE_GLYPH_LIST: unsigned = 0x00022001;
    const IMAGE_FONT: unsigned = 0x00022002;
    const IMAGE_GLYPH_LIST: unsigned = 0x00022003;
  }

  // next free 0x00023000-0x00023fff

  // SceneGraph 0x00120100-0x001201ff
  export namespace SceneGraph {
    const SCENEGRAPH: unsigned = 0x00120100;
    const ROOT: unsigned = 0x00120101;
    const BRANCH: unsigned = 0x00120102;
    const TRANSFORM: unsigned = 0x00120103;
    const VISIBILITY: unsigned = 0x00120104;
    const ATTACHMENT: unsigned = 0x00120105;
    const ATTACHMENTPOINT: unsigned = 0x00120106;
    const DRAWABLE: unsigned = 0x00120107;
    const CAMERA: unsigned = 0x00120108;
    const LIGHTGROUP: unsigned = 0x00120109;
    const SORTORDER: unsigned = 0x0012010A;
  }

  // Animation 0x000121000-0x000121fff
  export namespace Animation {
    // Animation Data 0x00121000-0x001210ff
    export namespace AnimationData {
      const ANIMATION: unsigned = 0x00121000;
      const GROUP: unsigned = 0x00121001;
      const GROUP_LIST: unsigned = 0x00121002;
      const SIZE: unsigned = 0x00121004;
    }

    // Channel Data 0x000121100-0x0001211ff
    export namespace ChannelData {
      const FLOAT_1: unsigned = 0x00121100;
      const FLOAT_2: unsigned = 0x00121101;
      const VECTOR_1DOF: unsigned = 0x00121102;
      const VECTOR_2DOF: unsigned = 0x00121103;
      const VECTOR_3DOF: unsigned = 0x00121104;
      const QUATERNION: unsigned = 0x00121105;
      const STRING: unsigned = 0x00121106;
      const ENTITY: unsigned = 0x00121107;
      const BOOL: unsigned = 0x00121108;
      const COLOUR: unsigned = 0x00121109;
      const EVENT: unsigned = 0x0012110A;
      const EVENT_OBJECT: unsigned = 0x0012110B;
      const EVENT_OBJECT_DATA: unsigned = 0x0012110C;
      const EVENT_OBJECT_DATA_IMAGE: unsigned = 0x0012110D;
      const INT: unsigned = 0x0012110E;
      const QUATERNION_FORMAT: unsigned = 0x0012110F;
      const INTERPOLATION_MODE: unsigned = 0x00121110;
      const COMPRESSED_QUATERNION: unsigned = 0x00121111;
    }

    // Channel Data 0x000121200-0x0001212ff
    export namespace FrameControllerData {
      const FRAME_CONTROLLER: unsigned = 0x000121200;
    }

    // Chunk id from 0x000121300-0x0001213ff
    export namespace VertexAnim {
      export namespace OffsetList {
        const COLOUR: unsigned = 0x000121300;
        const VECTOR: unsigned = 0x000121301;
        const VECTOR2: unsigned = 0x000121302;
        const INDEX: unsigned = 0x000121303;
      }
      const KEY: unsigned = 0x000121304;

    }
    export namespace VertexSplineAnim {
      export namespace List {
        const VECTOR: unsigned = 0x000121400;
        const VECTOR2: unsigned = 0x000121401;
      }
      const KEY: unsigned = 0x000121402;
    }

  }
}  // Pure3D


// Simulation System 0x07000000 - 0x07ffffff
export namespace Simulation {
  // Collision System 0x07010000 - 0x07010fff
  export namespace Collision {
    const OBJECT: unsigned = 0x07010000;
    const VOLUME: unsigned = 0x07010001;
    const SPHERE: unsigned = 0x07010002;
    const CYLINDER: unsigned = 0x07010003;
    const OBBOX: unsigned = 0x07010004;
    const WALL: unsigned = 0x07010005;
    const BBOX: unsigned = 0x07010006;
    const VECTOR: unsigned = 0x07010007;
    const SELFCOLLISION: unsigned = 0x07010020;
    const OWNER: unsigned = 0x07010021;
    const OWNERNAME: unsigned = 0x07010022;
    const ATTRIBUTE: unsigned = 0x07010023;
  }

  // Physics System 0x07011000 - 0x07011fff
  export namespace Physics {
    const OBJECT: unsigned = 0x07011000;
    const IMAT: unsigned = 0x07011001;
    const VECTOR: unsigned = 0x07011002;

    const JOINT: unsigned = 0x07011020;
    const JOINT_DOF: unsigned = 0x07011021;
  }

  // Flexible System 0x07012000 - 0x07012fff
  export namespace Flexible {
    const OBJECT: unsigned = 0x07012000;
    const OBJECT_PARAMETERS: unsigned = 0x07012001;
    const FIX_PARTICLE: unsigned = 0x07012002;
    const MAP_VL: unsigned = 0x07012003;
    const TRI_MAP: unsigned = 0x07012004;
    const EDGE_MAP: unsigned = 0x07012005;
    const EDGE_LEN: unsigned = 0x07012006;
    const OBJECT_LAMBDA: unsigned = 0x07012007;
    const JOINT: unsigned = 0x07012020;
    const JOINT_PARAMETERS: unsigned = 0x07012021;
    const JOINT_DEFINITION: unsigned = 0x07012022;
    const JOINT_LAMBDA: unsigned = 0x07012023;
  }

  // IK System 0x07013000 - 0x07013fff
  export namespace IK {
  }

  // Link System 0x07014000 - 0x07014fff
  export namespace Link {
    const IK: unsigned = 0x07014000;
    const REACH: unsigned = 0x07014001;
    const TRACKER: unsigned = 0x07014002;
    const TARGET: unsigned = 0x07014003;
    const TARGET_NODE: unsigned = 0x07014004;
    const TARGET_POSE: unsigned = 0x07014005;
  }

  // Param System 0x07015000 - 0x07015fff
  export namespace Parameters {
    const ENVIRONMENT: unsigned = 0x07015000;
    const PHYSICS: unsigned = 0x07015001;
  }
} // Simulation


// SmartProp System 0x08000000 - 0x08ffffff
export namespace SmartProp {
  // Collision System 0x08010000 - 0x08010fff
  const SMARTPROP: unsigned = 0x08010000;
  const SMARTPROPSTATEDATA: unsigned = 0x08010001;
  const SMARTPROPVISIBILITYDATA: unsigned = 0x08010002;
  const SMARTPROPFRAMECONTROLLERDATA: unsigned = 0x08010003;
  const SMARTPROPEVENTDATA: unsigned = 0x08010004;
  const SMARTPROPCALLBACKDATA: unsigned = 0x08010005;
  const SMARTPROPAPPLIEDFORCE: unsigned = 0x08010006;
  const SMARTPROPBREAKABLE: unsigned = 0x08010007;
  const SMARTPROPEXTRAATTRIBUTE: unsigned = 0x08010008;
} // SmartProp
// StateProp System 0x08000000 - 0x08ffffff
export namespace StateProp {
  const STATEPROP: unsigned = 0x08020000;
  const STATEPROPSTATEDATA: unsigned = 0x08020001;
  const STATEPROPVISIBILITYDATA: unsigned = 0x08020002;
  const STATEPROPFRAMECONTROLLERDATA: unsigned = 0x08020003;
  const STATEPROPEVENTDATA: unsigned = 0x08020004;
  const STATEPROPCALLBACKDATA: unsigned = 0x08020005;
} // StateProp


export namespace MemorySection {
  const MEMORYSECTION: unsigned = 0xFFFF0000;
}

//? #endif

/*===========================================================================

 Global allocation
 ~~~~~~~~~~~~~~~~~

 A chunk ID is 32 bits. Each project will be allocated a 24 bit block of
 IDs, giving them roughly one million unique IDs for their project
 specific chunks. The top level chunk ID list is the only piece of
 of information that has to be managed across teams. When a new project
 comes along, they simply request the next block on the list. There is
 room to accomodate 256 "project blocks" using this scheme. The Pure3D
 team will be responsible for maintaining this list. 
 The final block is reserved for file format control information.
 
 Management of Project Blocks
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 
 While it is up to the individual teams to manage their chunk IDs in any
 manner they choose, it is recommended that a controlled, centralised
 scheme is used to manage the ID space. The system should allow
 sub-systems to grow to accomodate new chunk types. Usually, it is
 desirable for related chunks to have contiguous chunk IDs. One approach
 is to use an allocation scheme similar to how IP addresses are
 allocated. When a programmer is designing a new sub-system, they "carve
 off" a section of the chunk space, reserving a block of IDs for that
 system. The designer may also further sub-divide that space into
 additional regions for related sub-systems.

 Example reserve sizes:

 Huge sub-system - 4096 (0x000 - 0xfff)
 Major sub-system - 256 (0x000 - 0x0ff)
 Minor sub-system - 64 (0x000 - 0x03f)

 Example chunk ID file:

 export namespace Pure3D
 {
 //-------- Animation System 0x00100000-0x00100fff

     //-------- Particle Systems 0x00100000-0x001000ff
     const  PARTICLE_SYSTEM                 : unsigned = 0x00100000;
     const  EMITTER                         : unsigned = 0x00100001;
     const  SIMPLE_EMITTER                  : unsigned = 0x00100002;
     const  EMITTER_LIFE_CHANNEL            : unsigned = 0x00100003;
     const  EMITTER_SPEED_CHANNEL           : unsigned = 0x00100004;
     const  EMITTER_WEIGHT_CHANNEL          : unsigned = 0x00100005;
     const  EMITTER_LIFE_VAR_CHANNEL        : unsigned = 0x00100006;
     const  EMITTER_SPEED_VAR_CHANNEL       : unsigned = 0x00100007;
     const  EMITTER_EMISSION_RATE_CHANNEL   : unsigned = 0x00100008;
     const  S_EMITTER_SIZE_CHANNEL          : unsigned = 0x00100009;
     const  S_EMITTER_SPIN_CHANNEL          : unsigned = 0x0010000A;
     const  S_EMITTER_TRANSPARENCY_CHANNEL  : unsigned = 0x0010000B;
     const  S_EMITTER_COLOUR_CHANNEL        : unsigned = 0x0010000C;
     const  S_EMITTER_SIZE_VAR_CHANNEL      : unsigned = 0x0010000D;
     const  S_EMITTER_SPIN_VAR_CHANNEL      : unsigned = 0x0010000E;
 
     // next free 0x00100100
 
 // next free 0x00101000
 };

 In the above example, the animation system has 4096 IDs allocated to it.
 Within this space, the particles module has 256 IDs allocated to it. The
 comments in the file document the size of each reserved block, and the
 location of the next free block. 


 Notes on the Pure3D Block
 ~~~~~~~~~~~~~~~~~~~~~~~~~
 
 0x00000000 - 0x00001fff  unused
 0x00002000 - 0x0000ff04  Pure3D legacy
 0x0000ff05 - 0x0000ffff  reserved

 The first 65536 entires of the Pure3D team block contains the old file
 format chunks, and will not be used in the new system. 

==========================================================================*/
