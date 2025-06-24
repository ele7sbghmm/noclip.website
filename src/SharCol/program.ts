import { DeviceProgram } from '../Program.js'
import { GfxShaderLibrary } from '../gfx/helpers/GfxShaderLibrary.js'

export class Program extends DeviceProgram {
  static ub_SceneParams = 0
  static ub_ModelParams = 1

  static a_Position = 0
  static a_Normal = 1
  static a_Color = 2

  override both = `
precision mediump float;

${GfxShaderLibrary.MatrixLibrary}

layout(std140) uniform ub_SceneParams {
  Mat4x4 u_ProjectionMatrix;
  Mat3x4 u_ViewMatrix;
};
layout(std140) uniform ub_ModelParams {
  Mat4x4 u_TransformationMatrix;
};

varying float v_LightIntensity;
varying vec4 v_Color;

#ifdef VERT
layout(location = ${Program.a_Position}) attribute vec3 a_Position;
layout(location = ${Program.a_Normal}) attribute vec3 a_Normal;
layout(location = ${Program.a_Color}) attribute uvec4 a_Color;

void mainVS() {
  float t_Scale = 100.;
   // srr2/code/roads/geometry.cpp:811 Get90DegreeLeftTurn(...)
  vec3 t_Position = vec3(a_Position.z, a_Position.y, a_Position.x);
  vec3 t_PositionWorld = UnpackMatrix(u_ViewMatrix) * vec4(t_Position * t_Scale, 1.);
  gl_Position = UnpackMatrix(u_ProjectionMatrix) * vec4(t_PositionWorld, 1.);
  
  vec3 t_LightDir = normalize(vec3(.2, -1., .5));
  v_LightIntensity = -dot(a_Normal, t_LightDir);
  v_Color = vec4(a_Color) / 255.;
#ifdef USE_NORMAL_MAP_COLORS
  v_Color = vec4(abs(a_Normal.x) * .5 + .5, abs(a_Normal.z) * .5 + .5, abs(a_Normal.y) * .5 + .5, 1.);
#endif
}
#endif

#ifdef FRAG
void mainPS() {
  float t_LightTint = v_LightIntensity * .3;

  gl_FragColor = vec4(v_Color.rgb + t_LightTint, v_Color.a);
#ifdef USE_NORMAL_MAP_COLORS
  gl_FragColor = v_Color;
#endif
}
#endif
`
}
