// import { Pure3D } from '../chunkids.js'
// import { tP3DFileHandler, tChunkFile } from '../file.js'
// import { pddiTextureType, pddiTextureUsageHint } from '../pddi/enums.js'
// import { Reader } from '../reader.js'

// class tTexture {
//     SetPriority(priority: number) {
//         throw new Error('Method not implemented.')
//     }
//     SetName(name: string) {
//         throw new Error('Method not implemented.')
//     }
// }
// class tImageFactory {
//     LoadIntoTexture(fileName: string, texture: tTexture, mipLevel: number) {
//         throw new Error('Method not implemented.')
//     }
//     ParseIntoTexture(file: Reader, texture: tTexture, format: tImageHandler.Format, mipLevel: any) {
//         throw new Error('Method not implemented.')
//     }
//     LoadAsTexture(fileName: string, name: string): tTexture {
//         throw new Error('Method not implemented.')
//     }
//     ParseAsTexture(file: Reader, name: string, size: number, format: tImageHandler.Format): tTexture {
//         throw new Error('Method not implemented.')
//     }
//     SetTextureHints(alphaDepth: any, nmMipMaps: any, textureType: pddiTextureType, usage: pddiTextureUsageHint) {
//         throw new Error('Method not implemented.')
//     }
//     SetDesiredDepth(bpp: number) {
//         throw new Error('Method not implemented.')
//     }
// }
// class tImageConverter { }
// class tTextureLoader {
//     imageFactory = new tImageFactory
//     imageConverter = new tImageConverter
//     LoadObject(f: tChunkFile) {
//         return this.LoadTexture(f)
//     }
//     LoadTexture(f: tChunkFile) {
//         const name = f.realFile.get_nstring()
//         const version = f.GetLong()
//         const width = f.GetLong()
//         const height = f.GetLong()
//         const bpp = f.GetLong()
//         const alphaDepth = f.GetLong()
//         let numMipMaps = f.GetLong()
//         numMipMaps = numMipMaps ? numMipMaps - 1 : numMipMaps
//         const textureType = f.GetLong() as unknown as pddiTextureType
//         const usage = f.GetLong() as unknown as pddiTextureUsageHint
//         const priority = f.GetLong()
//         this.imageFactory.SetDesiredDepth(bpp)
//         this.imageFactory.SetTextureHints(alphaDepth, numMipMaps, textureType, usage)
//         let texture: tTexture | null = null
//         let mipmap = 0
//         let volume = false
//         let image = false
//         while (f.ChunksRemaining()) {
//             switch (f.BeginChunk()) {
//                 case Pure3D.Texture.TEXTURE: {
//                     if (!volume) {
//                         texture = this.LoadImage(f, this.imageFactory, texture!, mipmap)
//                         volume = false
//                         image = true
//                         mipmap++
//                     }
//                 } break
//                 case Pure3D.Texture.VOLUME_IMAGE: {
//                     if (!volume) {
//                         texture = this.LoadVolumeImage(f, this.imageFactory, texture!, mipmap, numMipMaps)
//                         volume = true
//                         image = false
//                         mipmap++
//                     }
//                 } break
//                 default: { } break
//             }
//             f.EndChunk()
//         }
//         if (texture != null) {
//             texture.SetName(name)
//             texture.SetPriority(priority)
//         }
//         return texture
//     }
//     LoadImage(f: tChunkFile, factory: tImageFactory, buildTexture: tTexture, mipLevel: number): any {
//         if (!factory) factory = this.imageFactory
//         const name = f.realFile.get_nstring()
//         const version = f.GetLong()
//         const width = f.GetLong()
//         const height = f.GetLong()
//         const bpp = f.GetLong()
//         const palettized = f.GetLong() == 1
//         const alpha = f.GetLong() == 1
//         const format = f.GetLong() as unknown as tImageHandler.Format
//         let texture = buildTexture
//         while (f.ChunksRemaining()) {
//             switch (f.BeginChunk()) {
//                 case Pure3D.Texture.IMAGE_DATA: {
//                     const size = f.GetLong()
//                     if (texture == null) {
//                         const file = f.BeginInset()
//                         texture = factory.ParseAsTexture(file, name, size, format)
//                         f.EndInset()
//                     } else {
//                         const file = f.BeginInset()
//                         factory.ParseIntoTexture(file, texture, format, mipLevel)
//                         f.EndInset()
//                     }
//                 } break
//                 case Pure3D.Texture.IMAGE_FILENAME: {
//                     const fileName = f.realFile.get_nstring()
//                     if (texture == null) {
//                         texture = factory.LoadAsTexture(fileName, name)
//                     } else {
//                         factory.LoadIntoTexture(fileName, texture, mipLevel)
//                     }
//                 } break
//                 default: { } break
//             }
//             f.EndChunk()
//         }
//         return texture
//     }
//     LoadVolumeImage(
//         f: tChunkFile,
//         factory: tImageFactory,
//         buildTexture: tTexture,
//         mipLevel: number,
//         numMipMaps: number
//     ): any {
//         if (!factory) factory = this.imageFactory
//         const name = f.realFile.get_nstring()
//         const version = f.GetLong()
//         const width = f.GetLong()
//         const height = f.GetLong()
//         const depth = f.GetLong()
//         const bpp = f.GetLong()
//         const palettized = f.GetLong() == 1
//         const alpha = f.GetLong() == 1
//         const format = f.GetLong()

//         let texture = buildTexture
//         while (f.ChunksRemaining()) {
//             switch (f.BeginChunk()) {
//                 case Pure3D.Texture.IMAGE: {
//                     if (texture == null) {
//                         texture = this.LoadImage(f, factory, texture, 0)
//                     }
//                 } break
//                 default: { } break
//             }
//             f.EndChunk()
//         }
//         return texture
//     }
// }
// export namespace tImageHandler {
//     export enum Format {
//         IMG_RAW,
//         IMG_PNG,
//         IMG_TGA,
//         IMG_BMP,
//         IMG_IPU,
//         IMG_DXT,
//         IMG_DXT1,
//         IMG_DXT2,            //not used  
//         IMG_DXT3,
//         IMG_DXT4,            //not used
//         IMG_DXT5,
//         IMG_PS2_4BIT,        // PS2 Memory image formats
//         IMG_PS2_8BIT,
//         IMG_PS2_16BIT,
//         IMG_PS2_32BIT,
//         IMG_GC_4BIT,        // GameCube Memory image formats
//         IMG_GC_8BIT,
//         IMG_GC_16BIT,
//         IMG_GC_32BIT,
//         IMG_GC_DXT1
//     }
// }
