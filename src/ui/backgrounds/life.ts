import { paletteColor } from './color'
import { randomSequence, type BackgroundRenderer } from './renderer'

// Gliders, spaceships, methuselahs and oscillators used by the observed theme.
const patterns = [ [[0,1],[1,2],[2,0],[2,1],[2,2]], [[0,1],[0,4],[1,0],[2,0],[2,4],[3,0],[3,1],[3,2],[3,3]], [[0,1],[0,2],[1,0],[1,1],[2,1]], [[0,1],[1,3],[2,0],[2,1],[2,4],[2,5],[2,6]], [[0,6],[1,0],[1,1],[2,1],[2,5],[2,6],[2,7]], [[0,0],[0,1],[0,2],[1,0],[1,2],[2,0],[2,2]], [[0,0],[0,1],[0,2],[2,1],[3,1]], [[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7],[0,8],[0,9]], [[0,0],[1,0],[1,2],[2,0],[2,1],[3,0]], [[0,0],[0,2],[0,3],[1,0],[1,1],[1,2],[2,1]], [[0,2],[0,3],[1,1],[1,4],[2,0],[2,5],[3,0],[3,5],[4,1],[4,4],[5,2],[5,3]], [[0,1],[0,2],[1,0],[1,3],[2,1],[2,3],[3,2]], [[0,0],[0,1],[1,0],[2,3],[3,2],[3,3]], [[0,1],[1,2],[1,3],[2,0],[2,1],[3,2]] ]
export function createLife(canvas: HTMLCanvasElement, tint: string, dark: boolean, seed: number): BackgroundRenderer {
  const ctx = canvas.getContext('2d')!
  const random = randomSequence(seed)
  const appearance = dark ? 'dark' : 'light'
  const base = paletteColor(tint, appearance, 50), alive = paletteColor(tint, appearance, 40), bright = paletteColor(tint, appearance, 30)
  let rows = 0, cols = 0, width = 0, height = 0, dpr = 1, generation = 0, elapsed = 0
  let cells = new Int16Array(), next = new Int16Array()
  function seedPatterns(count: number) { for (let i = 0; i < count; i++) { const pattern = patterns[Math.floor(random() * patterns.length)], row = Math.floor(random() * rows), col = Math.floor(random() * cols); for (const [dy, dx] of pattern) cells[((row + dy) % rows) * cols + ((col + dx) % cols)] = 1 } }
  function step() {
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      let neighbors = 0
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && cells[((y + dy + rows) % rows) * cols + ((x + dx + cols) % cols)] > 0) neighbors++
      const index = y * cols + x, cell = cells[index]
      next[index] = cell > 0 ? (neighbors === 2 || neighbors === 3 ? Math.min(cell + 1, 32767) : -6) : neighbors === 3 ? 1 : Math.min(cell + 1, 0)
    }
    ;[cells, next] = [next, cells]
    if (++generation % 60 === 0) seedPatterns(Math.max(2, Math.floor(rows * cols / 3000)))
  }
  return {
    resize(w, h, ratio) { width = w; height = h; dpr = ratio; canvas.width = Math.round(w * ratio); canvas.height = Math.round(h * ratio); rows = Math.ceil(h / 10) + 1; cols = Math.ceil(w / 10) + 1; cells = new Int16Array(rows * cols); next = new Int16Array(rows * cols); seedPatterns(Math.max(12, Math.floor(rows * cols / 400))); for (let i = 0; i < cells.length; i++) if (cells[i] === 0 && random() < .03) cells[i] = 1; generation = 0; elapsed = 0 },
    render(_time, delta) {
      elapsed += delta
      if (elapsed >= 160) { step(); elapsed %= 160 }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, width, height)
      const offsetX = width % 10 / 2, offsetY = height % 10 / 2
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        const cell = cells[y * cols + x], young = cell > 0 && cell <= 3
        let radius = 1.2
        if (cell > 0) { ctx.fillStyle = young ? bright : alive; ctx.globalAlpha = young ? dark ? .75 : .9 : dark ? .55 : .7; radius += young ? .6 : .2 }
        else if (cell < 0) { ctx.fillStyle = base; ctx.globalAlpha = .4 * -cell / 6; radius *= .8 + .2 * -cell / 6 }
        else { ctx.fillStyle = base; ctx.globalAlpha = dark ? .12 : .1 }
        ctx.beginPath(); ctx.arc(offsetX + x * 10 + 5, offsetY + y * 10 + 5, radius, 0, Math.PI * 2); ctx.fill()
      }
      ctx.globalAlpha = 1
    },
    dispose() { cells = new Int16Array(); next = new Int16Array() },
  }
}
