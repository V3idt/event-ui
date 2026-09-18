import { grainPalette, hexRGB } from './color'
import { grainVertex, grainFragment } from './grain-shaders'
import { bindQuad, createProgram, createQuad, type BackgroundRenderer } from './renderer'

export function createGrain(canvas: HTMLCanvasElement, tint: string, dark: boolean): BackgroundRenderer | null {
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false })
  if (!gl || !gl.getExtension('OES_standard_derivatives')) return null
  const program = createProgram(gl, grainVertex, grainFragment), quad = createQuad(gl)
  const palette = grainPalette(tint, dark)
  let disposed = false, width = 1, height = 1, ratio = 1
  gl.useProgram(program); bindQuad(gl, program, quad)
  const loc = (name: string) => gl.getUniformLocation(program, name)
  const number = (name: string, value: number) => gl.uniform1f(loc(name), value)
  for (const [name, value] of Object.entries({ uFit: 1, uOffsetX: 0, uOffsetY: 0, uOriginX: .5, uOriginY: .5, uRotation: 1, uScale: 1.8, uWorldWidth: 0, uWorldHeight: 0, uColorsCount: 3, uColorCountMinusOne: 2, uBackgroundGrainStrength: dark ? .65 : 1, uIntensityScale: dark ? 0 : .2 / 3, uNoiseScale: 10 * palette.noise / 3, uShapeBias: .5 / 3, uSoftness: .7 })) number(name, value)
  gl.uniform4fv(loc('uColorBack'), [...hexRGB(palette.background), 1])
  gl.uniform4fv(loc('uColors[0]'), [...palette.colors.flatMap(color => [...hexRGB(color), 1]),0,0,0,0])
  gl.uniform3fv(loc('uGrainOverlayColor'), dark ? [1,1,1] : [0,0,0])
  const noise = gl.createTexture()!
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, noise)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([127,127,127,255]))
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT)
  gl.uniform1i(loc('uNoiseTexture'), 0)
  const image = new Image()
  image.onload = () => { if (!disposed) { gl.bindTexture(gl.TEXTURE_2D, noise); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image); canvas.dispatchEvent(new Event('background-ready')) } }
  image.src = '/assets/backgrounds/grain-noise.png'
  return {
    resize(w, h, dpr) { ratio = dpr; width = Math.round(w * ratio); height = Math.round(h * ratio); canvas.width = width; canvas.height = height },
    render(time) {
      gl.useProgram(program); bindQuad(gl, program, quad); gl.viewport(0, 0, width, height)
      gl.uniform2f(loc('uResolution'), width, height); number('uPixelRatio', ratio)
      const phase = .1 * (time * .002 + 7)
      number('uTimePhase', phase); number('uCacheTime', time * .002); number('uWaveAmplitude', .75 + .25 * Math.cos(6 * phase))
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    },
    dispose() { disposed = true; image.onload = null; gl.deleteProgram(program); gl.deleteBuffer(quad); gl.deleteTexture(noise); gl.getExtension('WEBGL_lose_context')?.loseContext() },
  }
}
