import { DeviceProgram } from '../Program.js'
import { GfxShaderLibrary } from '../gfx/helpers/GfxShaderLibrary.js'

export class Program extends DeviceProgram {
  static a_Position = 0
  static a_Normal = 1
  static ub_SceneParams = 0
  override both =
    `
precision mediump float;

${GfxShaderLibrary.MatrixLibrary}

layout(std140) uniform ub_SceneParams {
  Mat4x4 u_Projection;
  Mat3x4 u_View;
};

varying float v_LightIntensity;

#ifdef VERT
layout(location = ${Program.a_Position}) attribute vec3 a_Position;
layout(location = ${Program.a_Normal}) attribute vec3 a_Normal;

void mainVS() {
  vec3 t_Position = UnpackMatrix(u_View) * vec4(a_Position, 1.);
  gl_Position = UnpackMatrix(u_Projection) * vec4(t_Position, 1.);

  vec3 t_LightDir = normalize(vec3(.2, -1., .5));
  v_LightIntensity = dot(a_Normal, t_LightDir);
}
#endif

#ifdef FRAG
void mainPS() {
  float t_LightTint = v_LightIntensity * .3;
  gl_FragColor = vec4(t_LightTint, t_LightTint, t_LightTint, 0.);
  // gl_FragColor = vec4(1., 1., 1., 1.);
}
#endif
`
}

