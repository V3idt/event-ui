/** Shader equations captured from the public Grain theme; WebGL adapter is local. */
export const grainVertex = `
attribute vec3 position;
precision highp float;
#define GLSLIFY 1

uniform vec2 uResolution;
uniform float uPixelRatio;
uniform float uOriginX;
uniform float uOriginY;
uniform float uWorldWidth;
uniform float uWorldHeight;
uniform float uFit;
uniform float uScale;
uniform float uRotation;
uniform float uOffsetX;
uniform float uOffsetY;

varying vec2 vShapeUV;
varying vec2 vGrainUV;

vec3 getBoxSize(float boxRatio, vec2 givenBoxSize) {
  vec2 box = vec2(0.0);
  box.x = boxRatio * min(givenBoxSize.x / boxRatio, givenBoxSize.y);
  float noFitBoxWidth = box.x;

  if (uFit == 1.0) {
    box.x = boxRatio * min(uResolution.x / boxRatio, uResolution.y);
  } else if (uFit == 2.0) {
    box.x = boxRatio * max(uResolution.x / boxRatio, uResolution.y);
  }

  box.y = box.x / boxRatio;
  return vec3(box, noFitBoxWidth);
}

void main() {
  gl_Position = vec4(position.xy, 0.0, 1.0);

  vec2 uv = position.xy * 0.5;
  vec2 boxOrigin = vec2(0.5 - uOriginX, uOriginY - 0.5);
  vec2 givenBoxSize = max(vec2(uWorldWidth, uWorldHeight), vec2(1.0)) * uPixelRatio;

  float r = radians(uRotation);
  float cr = cos(r);
  float sr = sin(r);
  mat2 graphicRotation = mat2(cr, sr, -sr, cr);
  mat2 inverseGraphicRotation = mat2(cr, -sr, sr, cr);
  vec2 graphicOffset = vec2(-uOffsetX, uOffsetY);

  vec2 patternBoxGivenSize = vec2(
    (uWorldWidth == 0.0) ? uResolution.x : givenBoxSize.x,
    (uWorldHeight == 0.0) ? uResolution.y : givenBoxSize.y
  );
  float patternBoxRatio = patternBoxGivenSize.x / patternBoxGivenSize.y;
  vec3 boxSizeData = getBoxSize(patternBoxRatio, patternBoxGivenSize);
  vec2 patternBoxSize = boxSizeData.xy;
  float patternBoxNoFitBoxWidth = boxSizeData.z;
  vec2 patternBoxScale = uResolution.xy / patternBoxSize;

  vec2 patternUV = uv;
  patternUV += graphicOffset / patternBoxScale;
  patternUV += boxOrigin;
  patternUV -= boxOrigin / patternBoxScale;
  patternUV *= uResolution.xy;
  patternUV /= uPixelRatio;
  if (uFit > 0.0) {
    patternUV *= (patternBoxNoFitBoxWidth / patternBoxSize.x);
  }
  patternUV /= uScale;
  patternUV = graphicRotation * patternUV;
  patternUV += boxOrigin / patternBoxScale;
  patternUV -= boxOrigin;
  patternUV *= 0.01;

  vShapeUV = 0.5 * patternUV;

  vec2 grainUV = 100.0 * patternUV;
  grainUV = inverseGraphicRotation * grainUV;
  grainUV *= uScale;
  if (uFit > 0.0) {
    grainUV /= (patternBoxNoFitBoxWidth / patternBoxSize.x);
  }
  grainUV -= graphicOffset / patternBoxScale;
  vGrainUV = 1.6 * grainUV;
}
`

export const grainFragment = `
#extension GL_OES_standard_derivatives : enable
precision highp float;
#define GLSLIFY 1

uniform sampler2D uNoiseTexture;
uniform float uCacheTime;

varying vec2 vGrainUV;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v) {
  const vec4 C = vec4(
    0.211324865405187,
    0.366025403784439,
    -0.577350269189626,
    0.024390243902439
  );

  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);

  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;

  i = mod(i, 289.0);
  vec3 p = permute(
    permute(i.y + vec3(0.0, i1.y, 1.0)) +
    i.x + vec3(0.0, i1.x, 1.0)
  );

  vec3 m = max(
    0.5 - vec3(
      dot(x0, x0),
      dot(x12.xy, x12.xy),
      dot(x12.zw, x12.zw)
    ),
    0.0
  );

  m = m * m;
  m = m * m;

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;

  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);

  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;

  return 130.0 * dot(m, g);
}

float randomR(vec2 p) {
  vec2 uv = floor(p) / 100.0 + 0.5;
  return texture2D(uNoiseTexture, fract(uv)).r;
}

float valueNoiseR(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);

  float a = randomR(i);
  float b = randomR(i + vec2(1.0, 0.0));
  float c = randomR(i + vec2(0.0, 1.0));
  float d = randomR(i + vec2(1.0, 1.0));

  vec2 u = f * f * (3.0 - 2.0 * f);
  float x1 = mix(a, b, u.x);
  float x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);
}

const mat2 ROT03 = mat2(
  0.95533649, 0.29552021,
  -0.29552021, 0.95533649
);

const mat2 ROT2 = mat2(
  -0.41614684, 0.90929743,
  -0.90929743, -0.41614684
);

vec4 fbmRFast(vec2 n0, vec2 n1, vec2 n2, vec2 n3) {
  vec4 total = vec4(0.0);

  n0 = ROT03 * n0;
  n1 = ROT03 * n1;
  n2 = ROT03 * n2;
  n3 = ROT03 * n3;
  total.x += valueNoiseR(n0) * 0.2;
  total.y += valueNoiseR(n1) * 0.2;
  total.z += valueNoiseR(n2) * 0.2;
  total.w += valueNoiseR(n3) * 0.2;
  n0 *= 1.99;
  n1 *= 1.99;
  n2 *= 1.99;
  n3 *= 1.99;

  n0 = ROT03 * n0;
  n1 = ROT03 * n1;
  n2 = ROT03 * n2;
  n3 = ROT03 * n3;
  total.x += valueNoiseR(n0) * 0.12;
  total.y += valueNoiseR(n1) * 0.12;
  total.z += valueNoiseR(n2) * 0.12;
  total.w += valueNoiseR(n3) * 0.12;
  n0 *= 1.99;
  n1 *= 1.99;
  n2 *= 1.99;
  n3 *= 1.99;

  n0 = ROT03 * n0;
  n1 = ROT03 * n1;
  n2 = ROT03 * n2;
  n3 = ROT03 * n3;
  total.x += valueNoiseR(n0) * 0.072;
  total.y += valueNoiseR(n1) * 0.072;
  total.z += valueNoiseR(n2) * 0.072;
  total.w += valueNoiseR(n3) * 0.072;

  return total;
}

vec2 computeGrain() {
  vec2 uv = vGrainUV + uCacheTime * 0.5;
  float baseNoise = snoise(uv * 0.5);
  vec4 fbmVals = fbmRFast(
    0.002 * uv + 10.0,
    0.003 * uv,
    0.001 * uv,
    ROT2 * (0.4 * uv)
  );

  float grainDist = baseNoise * snoise(uv * 0.2) - fbmVals.x - fbmVals.y;
  float rawNoise = 0.75 * baseNoise - fbmVals.w - fbmVals.z;
  float noise = clamp(rawNoise, 0.0, 1.0);

  return vec2(grainDist, noise);
}

precision highp float;
#define GLSLIFY 1

#define MAX_COLOR_COUNT 4
#define FOREGROUND_GRAIN_STRENGTH 1.3

uniform vec2 uResolution;

uniform vec4 uColorBack;
uniform vec4 uColors[MAX_COLOR_COUNT];
uniform float uColorsCount;
uniform float uSoftness;
uniform float uIntensityScale;
uniform float uNoiseScale;
uniform float uBackgroundGrainStrength;
uniform float uShapeBias;
uniform float uColorCountMinusOne;
uniform float uTimePhase;
uniform float uWaveAmplitude;
uniform vec3 uGrainOverlayColor;

varying vec2 vShapeUV;

float resolveShapeCoverage(float shape) {
  float aa = fwidth(shape);

  shape = clamp(shape - uShapeBias, 0.0, 1.0);
  return smoothstep(
    0.0,
    uSoftness + 2.0 * aa,
    clamp(shape * uColorsCount, 0.0, 1.0)
  );
}

vec4 resolveGradient(float shape) {
  float aa = fwidth(shape);

  float totalShape = resolveShapeCoverage(shape);
  shape = clamp(shape - uShapeBias, 0.0, 1.0);
  float mixer = shape * uColorCountMinusOne;

  int cntStop = int(uColorsCount) - 1;
  float blendWidth = mix(0.85, 1.3, uSoftness) + aa * uColorCountMinusOne;
  vec4 gradient = vec4(0.0);
  float totalWeight = 0.0;

  for (int i = 0; i < MAX_COLOR_COUNT; i++) {
    if (i > cntStop) {
      break;
    }

    float distanceToStop = abs(mixer - float(i));
    float weight = 1.0 - smoothstep(0.0, blendWidth, distanceToStop);
    gradient += uColors[i] * weight;
    totalWeight += weight;
  }

  gradient /= max(totalWeight, 0.00001);

  vec3 color = gradient.rgb * totalShape;
  float opacity = gradient.a * totalShape;

  color = color + uColorBack.rgb * (1.0 - opacity);
  opacity = opacity + uColorBack.a * (1.0 - opacity);

  return vec4(color, opacity);
}

void main() {
  vec2 grain = computeGrain();

  vec2 flow = vShapeUV;
  flow += vec2(
    0.5 * sin(0.35 * vShapeUV.y + 1.4 * uTimePhase),
    0.35 * cos(0.25 * vShapeUV.x - 1.1 * uTimePhase)
  );

  float wave = (
    0.7 * sin(0.6 * flow.x + 0.35 * flow.y - 3.2 * uTimePhase) +
    0.5 * cos(-0.3 * flow.x + 0.8 * flow.y + 2.1 * uTimePhase) +
    0.35 * grain.r
  ) * uWaveAmplitude;
  float shape = 1.0 - smoothstep(-2.0, 2.0, flow.y + wave);

  shape += uIntensityScale * (grain.r + 0.5);

  float noiseVal = uNoiseScale * grain.g;
  // These are mutually exclusive color modes; avoid shading both per pixel.
  if (dot(uGrainOverlayColor, uGrainOverlayColor) < 0.001) {
    gl_FragColor = resolveGradient(shape + noiseVal);
    return;
  }
  float shapeCoverage = resolveShapeCoverage(shape);
  float grainStrength = mix(
    uBackgroundGrainStrength,
    FOREGROUND_GRAIN_STRENGTH,
    shapeCoverage
  );

  vec4 base = resolveGradient(shape);
  gl_FragColor = vec4(
    base.rgb + uGrainOverlayColor * noiseVal * grainStrength,
    base.a
  );

}
`
