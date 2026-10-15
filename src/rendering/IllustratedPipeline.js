import Phaser from "phaser";

// One inexpensive camera pass, shared by every location. Edit these strengths
// rather than individual paintings. DOM dialogue, inventory and D3 stay crisp.
export const LOOK = {
  saturation: 0.88,
  paletteStrength: 0.17,
  grain: 0.006,
  vignette: 0.065,
};
const KEY = "RatlantisIllustrated";

const fragment = `
precision mediump float;
uniform sampler2D uMainSampler;
uniform vec2 uResolution;
uniform float uSaturation;
uniform float uPalette;
uniform float uGrain;
uniform float uVignette;
varying vec2 outTexCoord;
void main() {
  vec4 source = texture2D(uMainSampler, outTexCoord);
  vec3 color = source.rgb;
  float light = dot(color, vec3(0.2126, 0.7152, 0.0722));
  color = mix(vec3(light), color, uSaturation);
  // Navy shadows / warm paper highlights, preserving the painted local colors.
  vec3 ink = color * vec3(0.91, 0.97, 1.04) + vec3(0.003, 0.005, 0.008);
  vec3 gold = color * vec3(1.035, 1.012, 0.955);
  color = mix(color, mix(ink, gold, smoothstep(0.12, 0.76, light)), uPalette);
  // Static fine grain: no flicker, pulsing glow, blur or moving halo on the rat.
  vec2 pixel = floor(outTexCoord * uResolution);
  float noise = fract(sin(dot(pixel, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
  color += noise * uGrain;
  vec2 edge = outTexCoord * 2.0 - 1.0;
  color *= 1.0 - uVignette * smoothstep(0.35, 1.8, dot(edge, edge));
  gl_FragColor = vec4(clamp(color, 0.0, 1.0), source.a);
}`;

class IllustratedPipeline extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
  constructor(game) {
    super({ game, name: KEY, fragShader: fragment, renderTarget: true });
  }
  onPreRender() {
    this.set2f("uResolution", this.renderer.width, this.renderer.height);
    this.set1f("uSaturation", LOOK.saturation);
    this.set1f("uPalette", LOOK.paletteStrength);
    this.set1f("uGrain", LOOK.grain);
    this.set1f("uVignette", LOOK.vignette);
  }
}

export function installIllustratedLook(scene) {
  const renderer = scene.game.renderer;
  const supported = renderer.type === Phaser.WEBGL;
  if (supported) {
    renderer.pipelines.addPostPipeline(KEY, IllustratedPipeline);
    scene.cameras.main.removePostPipeline(KEY);
    scene.cameras.main.setPostPipeline(KEY);
  }
  // Always enabled when WebGL is available. Canvas keeps the original artwork.
  return { supported, enabled: supported };
}
