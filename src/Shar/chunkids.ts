type unsigned = number

/*===========================================================================
    File:: chunksids.hpp

    Chunk codes for Pure3D data types
    
    A complete description of the allocation of ids is at the end of this
    file.

    Copyright (c)2001, 2002 Radical Entertainment, Ltd.
    All rights reserved.
===========================================================================*/

// #ifndef _CHUNKIDS_HPP
// #define _CHUNKIDS_HPP

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
    export const DATA_FILE: unsigned = 0xFF443350;
    export const DATA_FILE_SWAP: unsigned = 0x503344FF;       // P3D wrapper ID on big endian
    export const DATA_FILE_COMPRESSED: unsigned = 0x5A443350;
    export const DATA_FILE_COMPRESSED_SWAP: unsigned = 0x5033445A;

    // Mesh System 0x00010000 - 0x00010fff
    export namespace Mesh {
        export const MESH: unsigned = 0x00010000;
        export const SKIN: unsigned = 0x00010001;
        export const PRIMGROUP: unsigned = 0x00010002;
        export const BOX: unsigned = 0x00010003;
        export const SPHERE: unsigned = 0x00010004;
        export const POSITIONLIST: unsigned = 0x00010005;
        export const NORMALLIST: unsigned = 0x00010006;
        export const UVLIST: unsigned = 0x00010007;
        export const COLOURLIST: unsigned = 0x00010008;
        export const STRIPLIST: unsigned = 0x00010009;
        export const INDEXLIST: unsigned = 0x0001000A;
        export const MATRIXLIST: unsigned = 0x0001000B;
        export const WEIGHTLIST: unsigned = 0x0001000C;
        export const MATRIXPALETTE: unsigned = 0x0001000D;
        export const OFFSETLIST: unsigned = 0x0001000E;
        export const INSTANCEINFO: unsigned = 0x0001000F;
        export const PACKEDNORMALLIST: unsigned = 0x00010010;
        export const VERTEXSHADER: unsigned = 0x00010011;
        export const MEMORYIMAGEVERTEXLIST: unsigned = 0x00010012;
        export const MEMORYIMAGEINDEXLIST: unsigned = 0x00010013;
        export const MEMORYIMAGEVERTEXDESCRIPTIONLIST: unsigned = 0x00010014;
        export const TANGENTLIST: unsigned = 0x00010015;
        export const BINORMALLIST: unsigned = 0x00010016;
        export const RENDERSTATUS: unsigned = 0x00010017;
        export const EXPRESSIONOFFSETS: unsigned = 0x00010018;
        export const SHADOWSKIN: unsigned = 0x00010019;
        export const SHADOWMESH: unsigned = 0x0001001A;
        export const TOPOLOGY: unsigned = 0x0001001B;
        export const MULTICOLOURLIST: unsigned = 0x0001001C;
    }
    // End Mesh System 

    // Shader System 0x00011000 - 0x00011fff
    export namespace Shader {
        export const SHADER: unsigned = 0x00011000;
        export const SHADER_DEFINITION: unsigned = 0x00011001;
        export const TEXTURE_PARAM: unsigned = 0x00011002;
        export const INT_PARAM: unsigned = 0x00011003;
        export const FLOAT_PARAM: unsigned = 0x00011004;
        export const COLOUR_PARAM: unsigned = 0x00011005;
        export const VECTOR_PARAM: unsigned = 0x00011006;
        export const MATRIX_PARAM: unsigned = 0x00011007;
    }

    // GameAddr 0x00012000 - 0x00012fff
    export namespace GameAttr {
        export const GAME_ATTR: unsigned = 0x00012000;
        export const INT_PARAM: unsigned = 0x00012001;
        export const FLOAT_PARAM: unsigned = 0x00012002;
        export const COLOUR_PARAM: unsigned = 0x00012003;
        export const VECTOR_PARAM: unsigned = 0x00012004;
        export const MATRIX_PARAM: unsigned = 0x00012005;
    }

    // Light 0x00013000-0x00013fff
    export namespace Light {
        export const LIGHT: unsigned = 0x00013000;
        export const DIRECTION: unsigned = 0x00013001;
        export const POSITION: unsigned = 0x00013002;
        export const CONE_PARAM: unsigned = 0x00013003;
        export const SHADOW: unsigned = 0x00013004;
        export const PHOTON_MAP: unsigned = 0x00013005;

        // Decay range
        export const DECAY_RANGE: unsigned = 0x00013006;
        export const DECAY_RANGE_ROTATION_Y: unsigned = 0x00013007;

        export const ILLUMINATION_TYPE: unsigned = 0x00013008;
    }
    // End Light System

    // Locator 0x00014000-0x00014fff
    export namespace Locator {
        export const LOCATOR: unsigned = 0x00014000;
    }

    // Particle System 0x00015000-0x00015fff
    export namespace ParticleSystem {
        //0x00015000-0x000157ff v14 particle system specific chunks
        //!!! DON'T USE !!!

        //0x00015800-0x000158ff particle system specific chunks
        export const SYSTEM_FACTORY: unsigned = 0x00015800;
        export const SYSTEM: unsigned = 0x00015801;

        export const BASE_PARTICLE_ARRAY: unsigned = 0x00015802;
        export const SPRITE_PARTICLE_ARRAY: unsigned = 0x00015803;
        export const DRAWABLE_PARTICLE_ARRAY: unsigned = 0x00015804;

        export const BASE_EMITTER_FACTORY: unsigned = 0x00015805;
        export const SPRITE_EMITTER_FACTORY: unsigned = 0x00015806;
        export const DRAWABLE_EMITTER_FACTORY: unsigned = 0x00015807;

        export const PARTICLE_ANIMATION: unsigned = 0x00015808;
        export const EMITTER_ANIMATION: unsigned = 0x00015809;
        export const GENERATOR_ANIMATION: unsigned = 0x0001580a;

        export const INSTANCING_INFO: unsigned = 0x0001580b;
    }

    // Optic Effect 0x00016000-0x00016fff
    export namespace OpticEffect {
        export const CORONA_V14: unsigned = 0x00016000;
        export const LENS_FLARE_PARENT_V14: unsigned = 0x00016001;
        export const LENS_FLARE_V14: unsigned = 0x00016002;
        export const VECTOR_V14: unsigned = 0x00016f00;

        export const LENS_FLARE_GROUP: unsigned = 0x00016006;
        export const LENS_FLARE: unsigned = 0x00016007;
    }

    // Billboard 0x00017000-0x00017fff
    export namespace BillboardObject {
        export const QUAD_V14: unsigned = 0x00017000;

        export const QUAD: unsigned = 0x00017001;
        export const QUAD_GROUP: unsigned = 0x00017002;
        export const DISPLAY_INFO: unsigned = 0x00017003;
        export const PERSPECTIVE_INFO: unsigned = 0x00017004;
    }

    // Scrooby (Front End Subsystem) 0x00018000-0x00018fff
    export namespace Scrooby {
        export const PROJECT: unsigned = 0x00018000;
        export const SCREEN: unsigned = 0x00018001;
        export const PAGE: unsigned = 0x00018002;
        export const LAYER: unsigned = 0x00018003;

        //objects
        export const GROUP: unsigned = 0x00018004;
        export const MOVIE: unsigned = 0x00018005;
        export const MULTISPRITE: unsigned = 0x00018006;
        export const MULTITEXT: unsigned = 0x00018007;
        export const P3DOBJECT: unsigned = 0x00018008;
        export const POLYGON: unsigned = 0x00018009;
        export const SPRITE: unsigned = 0x0001800A;

        //subobjects
        export const STRINGTEXTBIBLE: unsigned = 0x0001800B;
        export const STRINGHARDCODED: unsigned = 0x0001800C;

        //text bible objects
        export const TEXTBIBLE: unsigned = 0x0001800D;
        export const LANGUAGE: unsigned = 0x0001800E;

        //resources
        export const RESOURCEIMAGE: unsigned = 0x00018100;
        export const RESOURCEPURE3D: unsigned = 0x00018101;
        export const OLDRESOURCETEXTSTYLE: unsigned = 0x00018102;
        export const OLDRESOURCETEXTBIBLE: unsigned = 0x00018103;
        export const RESOURCETEXTSTYLE: unsigned = 0x00018104;
        export const RESOURCETEXTBIBLE: unsigned = 0x00018105;
    }

    // Texture 0x00019000-0x00019fff
    export namespace Texture {
        export const TEXTURE: unsigned = 0x00019000;
        export const IMAGE: unsigned = 0x00019001;
        export const IMAGE_DATA: unsigned = 0x00019002;
        export const IMAGE_FILENAME: unsigned = 0x00019003;
        export const VOLUME_IMAGE: unsigned = 0x00019004;
        export const SPRITE: unsigned = 0x00019005;
    }

    // Animated Object 0x00020000-0x00020fff
    export namespace AnimatedObject {
        export const FACTORY: unsigned = 0x00020000;
        export const OBJECT: unsigned = 0x00020001;
        export const ANIMATION: unsigned = 0x00020002;
    }

    // Animated Object 0x00021000-0x00021fff
    export namespace Expression {
        export const VERTEX_EXPRESSION: unsigned = 0x00021000;
        export const VERTEX_EXPRESSION_GROUP: unsigned = 0x00021001;
        export const VERTEX_EXPRESSION_MIXER: unsigned = 0x00021002;
    }

    // Font 0x00022000-0x00022fff
    export namespace Font {
        export const TEXTURE_FONT: unsigned = 0x00022000;
        export const TEXTURE_GLYPH_LIST: unsigned = 0x00022001;
        export const IMAGE_FONT: unsigned = 0x00022002;
        export const IMAGE_GLYPH_LIST: unsigned = 0x00022003;
    }

    // next free 0x00023000-0x00023fff

    // SceneGraph 0x00120100-0x001201ff
    export namespace SceneGraph {
        export const SCENEGRAPH: unsigned = 0x00120100;
        export const ROOT: unsigned = 0x00120101;
        export const BRANCH: unsigned = 0x00120102;
        export const TRANSFORM: unsigned = 0x00120103;
        export const VISIBILITY: unsigned = 0x00120104;
        export const ATTACHMENT: unsigned = 0x00120105;
        export const ATTACHMENTPOINT: unsigned = 0x00120106;
        export const DRAWABLE: unsigned = 0x00120107;
        export const CAMERA: unsigned = 0x00120108;
        export const LIGHTGROUP: unsigned = 0x00120109;
        export const SORTORDER: unsigned = 0x0012010A;
    }

    // Animation 0x000121000-0x000121fff
    export namespace Animation {
        // Animation Data 0x00121000-0x001210ff
        export namespace AnimationData {
            export const ANIMATION: unsigned = 0x00121000;
            export const GROUP: unsigned = 0x00121001;
            export const GROUP_LIST: unsigned = 0x00121002;
            export const SIZE: unsigned = 0x00121004;
        }

        // Channel Data 0x000121100-0x0001211ff
        export namespace ChannelData {
            export const FLOAT_1: unsigned = 0x00121100;
            export const FLOAT_2: unsigned = 0x00121101;
            export const VECTOR_1DOF: unsigned = 0x00121102;
            export const VECTOR_2DOF: unsigned = 0x00121103;
            export const VECTOR_3DOF: unsigned = 0x00121104;
            export const QUATERNION: unsigned = 0x00121105;
            export const STRING: unsigned = 0x00121106;
            export const ENTITY: unsigned = 0x00121107;
            export const BOOL: unsigned = 0x00121108;
            export const COLOUR: unsigned = 0x00121109;
            export const EVENT: unsigned = 0x0012110A;
            export const EVENT_OBJECT: unsigned = 0x0012110B;
            export const EVENT_OBJECT_DATA: unsigned = 0x0012110C;
            export const EVENT_OBJECT_DATA_IMAGE: unsigned = 0x0012110D;
            export const INT: unsigned = 0x0012110E;
            export const QUATERNION_FORMAT: unsigned = 0x0012110F;
            export const INTERPOLATION_MODE: unsigned = 0x00121110;
            export const COMPRESSED_QUATERNION: unsigned = 0x00121111;
        }

        // Channel Data 0x000121200-0x0001212ff
        export namespace FrameControllerData {
            export const FRAME_CONTROLLER: unsigned = 0x000121200;
        }

        // Chunk id from 0x000121300-0x0001213ff
        export namespace VertexAnim {
            export namespace OffsetList {
                export const COLOUR: unsigned = 0x000121300;
                export const VECTOR: unsigned = 0x000121301;
                export const VECTOR2: unsigned = 0x000121302;
                export const INDEX: unsigned = 0x000121303;
            }
            export const KEY: unsigned = 0x000121304;

        }
        export namespace VertexSplineAnim {
            export namespace List {
                export const VECTOR: unsigned = 0x000121400;
                export const VECTOR2: unsigned = 0x000121401;
            }
            export const KEY: unsigned = 0x000121402;
        }

    }
}  // Pure3D


// Simulation System 0x07000000 - 0x07ffffff
export namespace Simulation {
    // Collision System 0x07010000 - 0x07010fff
    export namespace Collision {
        export const OBJECT: unsigned = 0x07010000;
        export const VOLUME: unsigned = 0x07010001;
        export const SPHERE: unsigned = 0x07010002;
        export const CYLINDER: unsigned = 0x07010003;
        export const OBBOX: unsigned = 0x07010004;
        export const WALL: unsigned = 0x07010005;
        export const BBOX: unsigned = 0x07010006;
        export const VECTOR: unsigned = 0x07010007;
        export const SELFCOLLISION: unsigned = 0x07010020;
        export const OWNER: unsigned = 0x07010021;
        export const OWNERNAME: unsigned = 0x07010022;
        export const ATTRIBUTE: unsigned = 0x07010023;
    }

    // Physics System 0x07011000 - 0x07011fff
    export namespace Physics {
        export const OBJECT: unsigned = 0x07011000;
        export const IMAT: unsigned = 0x07011001;
        export const VECTOR: unsigned = 0x07011002;

        export const JOINT: unsigned = 0x07011020;
        export const JOINT_DOF: unsigned = 0x07011021;
    }

    // Flexible System 0x07012000 - 0x07012fff
    export namespace Flexible {
        export const OBJECT: unsigned = 0x07012000;
        export const OBJECT_PARAMETERS: unsigned = 0x07012001;
        export const FIX_PARTICLE: unsigned = 0x07012002;
        export const MAP_VL: unsigned = 0x07012003;
        export const TRI_MAP: unsigned = 0x07012004;
        export const EDGE_MAP: unsigned = 0x07012005;
        export const EDGE_LEN: unsigned = 0x07012006;
        export const OBJECT_LAMBDA: unsigned = 0x07012007;
        export const JOINT: unsigned = 0x07012020;
        export const JOINT_PARAMETERS: unsigned = 0x07012021;
        export const JOINT_DEFINITION: unsigned = 0x07012022;
        export const JOINT_LAMBDA: unsigned = 0x07012023;
    }

    // IK System 0x07013000 - 0x07013fff
    export namespace IK {
    }

    // Link System 0x07014000 - 0x07014fff
    export namespace Link {
        export const IK: unsigned = 0x07014000;
        export const REACH: unsigned = 0x07014001;
        export const TRACKER: unsigned = 0x07014002;
        export const TARGET: unsigned = 0x07014003;
        export const TARGET_NODE: unsigned = 0x07014004;
        export const TARGET_POSE: unsigned = 0x07014005;
    }

    // Param System 0x07015000 - 0x07015fff
    export namespace Parameters {
        export const ENVIRONMENT: unsigned = 0x07015000;
        export const PHYSICS: unsigned = 0x07015001;
    }
} // Simulation


// SmartProp System 0x08000000 - 0x08ffffff
export namespace SmartProp {
    // Collision System 0x08010000 - 0x08010fff
    export const SMARTPROP: unsigned = 0x08010000;
    export const SMARTPROPSTATEDATA: unsigned = 0x08010001;
    export const SMARTPROPVISIBILITYDATA: unsigned = 0x08010002;
    export const SMARTPROPFRAMECONTROLLERDATA: unsigned = 0x08010003;
    export const SMARTPROPEVENTDATA: unsigned = 0x08010004;
    export const SMARTPROPCALLBACKDATA: unsigned = 0x08010005;
    export const SMARTPROPAPPLIEDFORCE: unsigned = 0x08010006;
    export const SMARTPROPBREAKABLE: unsigned = 0x08010007;
    export const SMARTPROPEXTRAATTRIBUTE: unsigned = 0x08010008;
} // SmartProp
// StateProp System 0x08000000 - 0x08ffffff
export namespace StateProp {
    export const STATEPROP: unsigned = 0x08020000;
    export const STATEPROPSTATEDATA: unsigned = 0x08020001;
    export const STATEPROPVISIBILITYDATA: unsigned = 0x08020002;
    export const STATEPROPFRAMECONTROLLERDATA: unsigned = 0x08020003;
    export const STATEPROPEVENTDATA: unsigned = 0x08020004;
    export const STATEPROPCALLBACKDATA: unsigned = 0x08020005;
} // StateProp


export namespace MemorySection {
    export const MEMORYSECTION: unsigned = 0xFFFF0000;
}

// #endif

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
     export const PARTICLE_SYSTEM: unsigned = 0x00100000;
     export const EMITTER: unsigned = 0x00100001;
     export const SIMPLE_EMITTER: unsigned = 0x00100002;
     export const EMITTER_LIFE_CHANNEL: unsigned = 0x00100003;
     export const EMITTER_SPEED_CHANNEL: unsigned = 0x00100004;
     export const EMITTER_WEIGHT_CHANNEL: unsigned = 0x00100005;
     export const EMITTER_LIFE_VAR_CHANNEL: unsigned = 0x00100006;
     export const EMITTER_SPEED_VAR_CHANNEL: unsigned = 0x00100007;
     export const EMITTER_EMISSION_RATE_CHANNEL: unsigned = 0x00100008;
     export const S_EMITTER_SIZE_CHANNEL: unsigned = 0x00100009;
     export const S_EMITTER_SPIN_CHANNEL: unsigned = 0x0010000A;
     export const S_EMITTER_TRANSPARENCY_CHANNEL: unsigned = 0x0010000B;
     export const S_EMITTER_COLOUR_CHANNEL: unsigned = 0x0010000C;
     export const S_EMITTER_SIZE_VAR_CHANNEL: unsigned = 0x0010000D;
     export const S_EMITTER_SPIN_VAR_CHANNEL: unsigned = 0x0010000E;
 
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
