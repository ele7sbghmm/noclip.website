import { DeviceProgram } from '../Program.js'
import { GfxShaderLibrary } from '../gfx/helpers/GfxShaderLibrary.js'

export class Program extends DeviceProgram {
  static a_Position = 0
  static a_Normal = 1
  static a_Color = 2

  static ub_SceneParams = 0
  override both = `
precision mediump float;

${GfxShaderLibrary.MatrixLibrary}

layout(std140) uniform ub_SceneParams {
  Mat4x4 u_Projection;
  Mat3x4 u_View;
};

varying float v_LightIntensity;
varying vec4 v_Color;

#ifdef VERT
layout(location = ${Program.a_Position}) attribute vec3 a_Position;
layout(location = ${Program.a_Normal}) attribute vec3 a_Normal;
layout(location = ${Program.a_Color}) attribute uvec4 a_Color;

void mainVS() {
  vec3 t_PositionXZY = vec3(a_Position.x, a_Position.z, -a_Position.y);
  vec3 t_WorldPosition = UnpackMatrix(u_View) * vec4(t_PositionXZY, 1.);
  gl_Position = UnpackMatrix(u_Projection) * vec4(t_WorldPosition, 1.);

  vec3 t_LightDir = normalize(vec3(.2, .6, -1.));
  v_LightIntensity = -dot(a_Normal, t_LightDir);

  v_Color = vec4(a_Color) / 255.;
}
#endif

#ifdef FRAG
void mainPS() {
  float t_LightTint = v_LightIntensity * .5;
  gl_FragColor = vec4(v_Color.rgb + t_LightTint, v_Color.a);
}
#endif
`
}

