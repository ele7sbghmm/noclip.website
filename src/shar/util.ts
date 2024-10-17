import { float } from "./types.js";

export type tUID = string;

export type rmt_Box3D = {};
export type rmt_Sphere = {};
export type rmt_SimState = {};
export type tDrawable = {};
export type tEntity = {};
export type tPose = {};

export class pddi_Colour {
  constructor(
    public r: float,
    public g: float,
    public b: float,
    public a: float,
  ) { }
}
