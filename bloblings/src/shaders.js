// SDF blend-shell: vertices of ordinary merged primitive meshes get snapped onto the
// smooth-min SDF iso-surface of ALL primitives combined, in the vertex shader.
// Normals = SDF gradient, albedo = SDF-proximity blend. Per-vertex cost, mobile-safe.

export const MAX_SHAPES = 24;

const SDF_COMMON = /* glsl */ `
uniform vec4 uShapeA[${MAX_SHAPES}];   // xyz = end A, w = radius A
uniform vec4 uShapeB[${MAX_SHAPES}];   // xyz = end B, w = radius B
uniform vec4 uShapeC[${MAX_SHAPES}];   // rgb = color, w = blend radius k
uniform int  uCount;

// iq's round cone: a capsule with two different end radii (sphere when A==B)
float sdShape(vec3 p, vec3 a, vec3 b, float r1, float r2) {
  vec3 ba = b - a;
  float l2 = dot(ba, ba);
  if (l2 < 1e-9) return length(p - a) - r1;
  float rr = r1 - r2;
  float a2 = l2 - rr * rr;
  float il2 = 1.0 / l2;
  vec3 pa = p - a;
  float y = dot(pa, ba);
  float z = y - l2;
  vec3 xv = pa * l2 - ba * y;
  float x2 = dot(xv, xv);
  float y2 = y * y * l2;
  float z2 = z * z * l2;
  float k = sign(rr) * rr * rr * x2;
  if (sign(z) * a2 * z2 > k) return sqrt(x2 + z2) * il2 - r2;
  if (sign(y) * a2 * y2 < k) return sqrt(x2 + y2) * il2 - r1;
  return (sqrt(x2 * a2 * il2) + y * rr) * il2 - r1;
}

// polynomial smooth min; k comes per-shape so thin parts (antennae) cap their
// blend radius and don't dissolve into the body
float smin(float d1, float d2, float k) {
  float h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0);
  return mix(d2, d1, h) - k * h * (1.0 - h);
}

float mapd(vec3 p) {
  float d = 1e6;
  for (int i = 0; i < ${MAX_SHAPES}; i++) {
    if (i < uCount) {
      float di = sdShape(p, uShapeA[i].xyz, uShapeB[i].xyz, uShapeA[i].w, uShapeB[i].w);
      d = smin(d, di, max(uShapeC[i].w, 1e-4));
    }
  }
  return d;
}
`;

export const blendShellVertex = /* glsl */ `
attribute float aShape;
uniform mat4  uBones[${MAX_SHAPES}];
uniform float uIso;      // 0 for the body pass, +width for the outline shell
uniform float uUnit;     // character scale, keeps epsilons proportional
varying vec3 vColor;
varying vec3 vNormal;    // view space
varying vec3 vViewPos;
${SDF_COMMON}

void main() {
  int si = int(aShape + 0.5);
  vec3 p = (uBones[si] * vec4(position, 1.0)).xyz;

  float e = 0.018 * uUnit;
  vec3 g = vec3(0.0, 1.0, 0.0);
  float phi0 = 0.0;

  // Newton-project onto the blended iso-surface. Tetrahedron sampling gives the
  // gradient AND the value (offsets sum to zero) in 4 taps per step.
  for (int it = 0; it < 3; it++) {
    float s1 = mapd(p + vec3( e, -e, -e));
    float s2 = mapd(p + vec3(-e, -e,  e));
    float s3 = mapd(p + vec3(-e,  e, -e));
    float s4 = mapd(p + vec3( e,  e,  e));
    float val = 0.25 * (s1 + s2 + s3 + s4);
    g = vec3(s1 - s2 - s3 + s4, -s1 - s2 + s3 + s4, -s1 + s2 - s3 + s4);
    if (it == 0) phi0 = val;

    // geometry buried deep inside other shapes tucks itself under the skin
    // (targets a slightly negative iso) so hidden caps never z-fight the surface
    // or poke their outline shell through it
    float notBuried = smoothstep(-0.10 * uUnit, -0.035 * uUnit, phi0);
    float target = mix(-0.03 * uUnit, uIso, notBuried);

    float gl = length(g);
    vec3 n = gl > 1e-6 ? g / gl : vec3(0.0, 1.0, 0.0);
    float step = clamp(val - target, -0.4 * uUnit, 0.4 * uUnit);
    p -= n * step;
  }

  // albedo: blend every shape's color by SDF proximity -> free soft gradients at joins
  vec3 csum = vec3(0.0);
  float wsum = 0.0;
  for (int i = 0; i < ${MAX_SHAPES}; i++) {
    if (i < uCount) {
      float di = sdShape(p, uShapeA[i].xyz, uShapeB[i].xyz, uShapeA[i].w, uShapeB[i].w);
      float w = exp(-2.8 * max(di, 0.0) / (uShapeC[i].w + 0.025 * uUnit));
      csum += uShapeC[i].rgb * w;
      wsum += w;
    }
  }
  vColor = csum / max(wsum, 1e-5);

  vNormal = normalize(normalMatrix * normalize(g));
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vViewPos = mv.xyz;
  gl_Position = projectionMatrix * mv;
}
`;

export const blendShellFragment = /* glsl */ `
precision highp float;
varying vec3 vColor;
varying vec3 vNormal;
varying vec3 vViewPos;
uniform vec3 uLightDir;   // view space, toward light
uniform vec3 uUpDir;      // world up in view space
uniform vec3 uFogColor;
uniform vec2 uFogRange;

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(-vViewPos);
  float ndl = dot(N, uLightDir) * 0.5 + 0.5;

  // two banded steps -> three toon tones, smoothstepped for AA
  float band = smoothstep(0.30, 0.37, ndl) * 0.5 + smoothstep(0.60, 0.67, ndl) * 0.5;
  float up = dot(N, uUpDir) * 0.5 + 0.5;
  vec3 amb = mix(vec3(0.46, 0.44, 0.60), vec3(0.60, 0.66, 0.78), up);   // cool bounce
  vec3 col = vColor * (amb + vec3(1.00, 0.94, 0.82) * band * 0.75);     // warm key

  vec3 H = normalize(uLightDir + V);
  float spec = smoothstep(0.60, 0.68, pow(max(dot(N, H), 0.0), 48.0));
  col += spec * 0.22;

  float rim = pow(1.0 - max(dot(N, V), 0.0), 3.5) * smoothstep(0.75, 0.30, ndl);
  col += rim * vec3(0.45, 0.60, 0.95) * 0.55;

  float fog = smoothstep(uFogRange.x, uFogRange.y, length(vViewPos));
  gl_FragColor = vec4(mix(col, uFogColor, fog), 1.0);
}
`;

// Outline: same projection but onto the +uIso OFFSET surface of the SDF (not a
// normal-inflated hull), rendered back-face — so concave joints stay artifact-free.
export const outlineFragment = /* glsl */ `
precision highp float;
varying vec3 vColor;
varying vec3 vNormal;
varying vec3 vViewPos;
uniform vec3 uOutlineColor;
uniform vec3 uFogColor;
uniform vec2 uFogRange;

void main() {
  float fog = smoothstep(uFogRange.x, uFogRange.y, length(vViewPos));
  gl_FragColor = vec4(mix(uOutlineColor, uFogColor, fog), 1.0);
}
`;
