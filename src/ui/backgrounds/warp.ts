import { hexRGB, paletteColor } from './color'
import { bindQuad, createProgram, createQuad, quadVertex, randomSequence, type BackgroundRenderer } from './renderer'

const vertex = `
attribute vec3 position;
attribute vec2 uv;
attribute vec4 randomVertex;
attribute vec4 randomScale;
uniform float time;
uniform float aspect;
varying vec2 vUv;
varying float vTrail;
varying float vLife;
void main() {
  vec3 local = position * vec3(mix(.01,.07,randomScale.x),mix(.01,.07,randomScale.x),mix(3.7,22.83,randomScale.z));
  float progress = fract(time * .1 * (randomVertex.w + .5) + randomVertex.z);
  float life = progress < .5 ? 2. * progress * progress : 1. - pow(-2. * progress + 2., 2.) / 2.;
  vec3 p = vec3(randomVertex.xy * 30., mix(-80.,20.,life)) + local;
  p.z += 2.;
  float depth = 15. - p.z;
  float focal = 1.19175359259421;
  gl_Position = vec4(p.x * focal / aspect, p.y * focal, 1.000002 * depth - .002000002, depth);
  vUv = uv; vTrail = position.z + .5; vLife = life;
}`
const fragment = `
precision highp float;
uniform vec3 color;
varying vec2 vUv;
varying float vTrail;
varying float vLife;
void main() {
  float trail = vTrail * vTrail;
  float glow = smoothstep(0.,.01,min(vUv.x,vUv.y)) * smoothstep(0.,.01,min(1.-vUv.x,1.-vUv.y));
  gl_FragColor = vec4(color * 6. + glow * 4. * trail, clamp(vLife / .2, 0., 1.) * trail * .05);
}`
const postFragment = `
precision highp float;
varying vec2 vUv;
uniform sampler2D scene;
uniform float time;
float sat(float t){return clamp(t,0.,1.);}
vec3 spectrum(float t) {
  float lo = step(t,.5), hi = 1.-lo;
  float w = sat(1.-abs(2.*sat((t-1./6.)/(4./6.))-1.));
  return pow(vec3(lo,1.,hi)*vec3(1.-w,w,1.-w), vec3(1./2.2));
}
vec3 sampleChroma(vec2 uv) {
  return vec3(texture2D(scene,uv+vec2(.001)).r,texture2D(scene,uv).g,texture2D(scene,uv-vec2(.001)).b);
}
vec3 srgb(vec3 value) {
  return mix(value*12.92,1.055*pow(max(value,vec3(0.)),vec3(1./2.4))-.055,step(vec3(.0031308),value));
}
void main() {
  vec3 total = vec3(0.), weights = vec3(0.);
  for(int i=0;i<16;i++) {
    float t=float(i)/16.; vec3 weight=spectrum(t);
    vec2 uv=vUv+(vUv-.5)*(3.*t)*-.05;
    total += weight * sampleChroma(uv); weights += weight;
  }
  vec2 grainUv=vUv*1.5;
  float grainX=(grainUv.x+4.)*(grainUv.y+4.)*(1000.+time*.00006);
  float grain=(mod((mod(grainX,13.)+1.)*(mod(grainX,123.)+1.),.01)-.005)*.8;
  gl_FragColor=vec4(srgb(total/weights+grain),1.);
}`

export function createWarp(canvas: HTMLCanvasElement, tint: string, seed: number): BackgroundRenderer | null {
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false })
  if (!gl) return null
  const stars = createProgram(gl, vertex, fragment), post = createProgram(gl, quadVertex, postFragment), quad = createQuad(gl)
  const buffer = gl.createBuffer()!, scene = gl.createTexture()!, target = gl.createFramebuffer()!
  // HDR preserves the source's 4x glow before alpha blending. An 8-bit target
  // clips each prism first and makes the starfield visibly gray and too faint.
  const halfFloat = gl.getExtension('OES_texture_half_float')
  const halfLinear = gl.getExtension('OES_texture_half_float_linear')
  const halfRenderable = gl.getExtension('EXT_color_buffer_half_float')
  let textureType = halfFloat && halfLinear && halfRenderable ? halfFloat.HALF_FLOAT_OES : gl.UNSIGNED_BYTE
  const random = randomSequence(seed), vertices: number[] = []
  // Six faces per prism. Each particle has independent depth, size and speed.
  const faces = [ [[1,-1,-1],[1,1,-1],[1,1,1],[1,-1,1]], [[-1,-1,1],[-1,1,1],[-1,1,-1],[-1,-1,-1]], [[-1,1,-1],[-1,1,1],[1,1,1],[1,1,-1]], [[-1,-1,1],[-1,-1,-1],[1,-1,-1],[1,-1,1]], [[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]], [[1,-1,-1],[-1,-1,-1],[-1,1,-1],[1,1,-1]] ]
  const coords = [[0,0],[1,0],[1,1],[0,1]]
  for (let particle = 0; particle < 848; particle++) {
    const rv = [random()*2-1,random()*2-1,random()*2-1,random()], scale = [random(),random(),random(),random()]
    for (const face of faces) for (const index of [0,1,2,0,2,3]) vertices.push(...face[index].map(v => v * .5),...coords[index],...rv,...scale)
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
  gl.bindTexture(gl.TEXTURE_2D, scene)
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE)
  gl.bindFramebuffer(gl.FRAMEBUFFER,target); gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,scene,0); gl.bindFramebuffer(gl.FRAMEBUFFER,null)
  const toLinear = (c: number) => c <= .04045 ? c / 12.92 : ((c+.055)/1.055)**2.4
  const tintRGB = hexRGB(paletteColor(tint,'light',40)).map(toLinear)
  const baseRGB = hexRGB('#141516').map(toLinear)
  let width = 1, height = 1, sceneTime = 0, speedTime = 0
  const attribute = (name: string, size: number, offset: number) => { const location = gl.getAttribLocation(stars,name); gl.enableVertexAttribArray(location); gl.vertexAttribPointer(location,size,gl.FLOAT,false,52,offset*4) }
  return {
    resize(w,h,dpr) {
      width=Math.round(w*dpr);height=Math.round(h*dpr);canvas.width=width;canvas.height=height
      gl.bindTexture(gl.TEXTURE_2D,scene);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,width,height,0,gl.RGBA,textureType,null)
      gl.bindFramebuffer(gl.FRAMEBUFFER,target)
      if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE) { textureType=gl.UNSIGNED_BYTE;gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,width,height,0,gl.RGBA,textureType,null) }
      canvas.dataset.precision=textureType===gl.UNSIGNED_BYTE?'8-bit':'half-float'
      gl.bindFramebuffer(gl.FRAMEBUFFER,null)
    },
    render(time,delta) {
      // Source clocks advance .005 and .036 per 60Hz frame, respectively.
      const sourceDelta = Math.min(delta, 1000 / 60)
      speedTime += sourceDelta * .0003
      sceneTime += sourceDelta * .00216 * (.5 + Math.exp(Math.sin(speedTime)) - .36787944)
      gl.bindFramebuffer(gl.FRAMEBUFFER,target);gl.viewport(0,0,width,height)
      gl.clearColor(baseRGB[0],baseRGB[1],baseRGB[2],1);gl.clear(gl.COLOR_BUFFER_BIT)
      gl.useProgram(stars);gl.bindBuffer(gl.ARRAY_BUFFER,buffer)
      attribute('position',3,0);attribute('uv',2,3);attribute('randomVertex',4,5);attribute('randomScale',4,9)
      gl.uniform1f(gl.getUniformLocation(stars,'time'),sceneTime);gl.uniform1f(gl.getUniformLocation(stars,'aspect'),width/height);gl.uniform3fv(gl.getUniformLocation(stars,'color'),tintRGB)
      gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK)
      gl.drawArrays(gl.TRIANGLES,0,848*36)
      gl.disable(gl.BLEND);gl.disable(gl.CULL_FACE)
      for(let index=0;index<4;index++) gl.disableVertexAttribArray(index)
      gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.useProgram(post);bindQuad(gl,post,quad)
      gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,scene);gl.uniform1i(gl.getUniformLocation(post,'scene'),0);gl.uniform1f(gl.getUniformLocation(post,'time'),time)
      gl.drawArrays(gl.TRIANGLES,0,6)
    },
    dispose() { gl.deleteBuffer(buffer);gl.deleteBuffer(quad);gl.deleteTexture(scene);gl.deleteFramebuffer(target);gl.deleteProgram(stars);gl.deleteProgram(post);gl.getExtension('WEBGL_lose_context')?.loseContext() },
  }
}
