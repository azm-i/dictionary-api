precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform float uPageIndexPrev;
uniform float uPageIndexNext;
uniform float uProgressTransition;

uniform float pSpeed;
uniform vec3 pColor;

varying vec2 vUv;

#pragma glslify: adjustRatio = require(./utils/fitCover.glsl)

const float antiAliasing = 0.003;

float makeShape(float d, float threshold) {
  return smoothstep(threshold, threshold - antiAliasing, d);
}

float dfCircle(vec2 p) {
  return length(p);
}

float dfSquare(vec2 p) {
  return max(abs(p.x), abs(p.y));
}

float dfDiamond(vec2 p) {
  return abs(p.x) + abs(p.y);
}

float detectShape(vec2 p, float index) {
  return index == 1.
    ? dfSquare(p)
    : dfCircle(p);
}

const float thresholdMin = 0.5;
const float thresholdMax = 0.8;

void main() {
  vec2 uv = vUv;
  uv = adjustRatio(uv, vec2(1.), uResolution);
  vec2 position = uv * 2. - 1.;

  vec3 color = mix(vec3(0.7), vec3(1.), pColor);

  float colorPrev = detectShape(position, uPageIndexPrev);
  float colorNext = detectShape(position, uPageIndexNext);

  float progress = uProgressTransition;
  // float progress = -cos(uTime) * 0.5 + 0.5; // debug
  float d = mix(colorPrev, colorNext, progress);

  float threshold = mix(thresholdMin, thresholdMax, -cos(uTime * pSpeed) * 0.5 + 0.5) * 0.5;
  float alpha = makeShape(d, threshold);

  gl_FragColor = vec4(color, alpha);
  // gl_FragColor = vec4(vec3(gl_FragCoord.st / uResolution, 0.), 1.); // debug
  // gl_FragColor = vec4(color, mix(0.3, 1., alpha)); // debug
  // gl_FragColor = vec4(vec3(colorNext), 1.); // debug
  // gl_FragColor = vec4(color, 1.); // debug
  // gl_FragColor = vec4(vec3(alpha), 1.); // debug
  // gl_FragColor = vec4(vec3(uv, 0.), 1.); // debug
  // gl_FragColor = vec4(vec3(0.5), 1.); // debug
}
