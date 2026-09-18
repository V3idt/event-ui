export interface BackgroundRenderer {
  resize(width: number, height: number, dpr: number): void
  render(time: number, delta: number): void
  dispose(): void
}
export function randomSequence(seed: number) {
  return () => { seed |= 0; seed = seed + 0x6d2b79f5 | 0; let n = Math.imul(seed ^ seed >>> 15, 1 | seed); n ^= n + Math.imul(n ^ n >>> 7, 61 | n); return ((n ^ n >>> 14) >>> 0) / 4294967296 }
}
export function createProgram(gl: WebGLRenderingContext, vertex: string, fragment: string) {
  const shaders = [gl.VERTEX_SHADER, gl.FRAGMENT_SHADER].map((type, index) => {
    const shader = gl.createShader(type)!
    gl.shaderSource(shader, index === 0 ? vertex : fragment)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { const message = gl.getShaderInfoLog(shader); gl.deleteShader(shader); throw new Error(message || 'Background shader failed') }
    return shader
  })
  const program = gl.createProgram()!
  for (const shader of shaders) gl.attachShader(program, shader)
  gl.linkProgram(program)
  for (const shader of shaders) gl.deleteShader(shader)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { const message = gl.getProgramInfoLog(program); gl.deleteProgram(program); throw new Error(message || 'Background program failed') }
  return program
}
export const quadVertex = 'attribute vec2 position; varying vec2 vUv; void main(){vUv=position*.5+.5;gl_Position=vec4(position,0.,1.);}'
export function bindQuad(gl: WebGLRenderingContext, program: WebGLProgram, buffer: WebGLBuffer) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  const location = gl.getAttribLocation(program, 'position')
  gl.enableVertexAttribArray(location); gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0)
}
export function createQuad(gl: WebGLRenderingContext) { const buffer = gl.createBuffer()!; gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW); return buffer }
