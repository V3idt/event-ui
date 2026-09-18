/** OKLCH palette construction measured from the public event theme renderer. */
type RGB = [number, number, number]
const clamp = (x: number) => Math.max(0, Math.min(1, x))
export const hexRGB = (hex: string): RGB => {
  const value = hex.replace('#', '')
  const full = value.length === 3 ? value.split('').map(c => c + c).join('') : value
  return [0, 2, 4].map(i => parseInt(full.slice(i, i + 2), 16) / 255) as RGB
}
const linear = (v: number) => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4
const srgb = (v: number) => v <= .0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - .055
function rgbLCH(rgb: RGB): RGB {
  const [r, g, b] = rgb.map(linear)
  const l = Math.cbrt(.4122214708 * r + .5363325363 * g + .0514459929 * b)
  const m = Math.cbrt(.2119034982 * r + .6806995451 * g + .1073969566 * b)
  const s = Math.cbrt(.0883024619 * r + .2817188376 * g + .6299787005 * b)
  const a = 1.9779984951 * l - 2.428592205 * m + .4505937099 * s
  const bb = .0259040371 * l + .7827717662 * m - .808675766 * s
  return [.2104542553 * l + .793617785 * m - .0040720468 * s, Math.hypot(a, bb), (Math.atan2(bb, a) * 180 / Math.PI + 360) % 360]
}
export const hexLCH = (hex: string) => rgbLCH(hexRGB(hex))
export function lchRGB(l: number, c: number, h: number): RGB {
  const a = c * Math.cos(h * Math.PI / 180), b = c * Math.sin(h * Math.PI / 180)
  const ll = (l + .3963377774 * a + .2158037573 * b) ** 3
  const mm = (l - .1055613458 * a - .0638541728 * b) ** 3
  const ss = (l - .0894841775 * a - 1.291485548 * b) ** 3
  return [srgb(4.0767416621 * ll - 3.3077115913 * mm + .2309699292 * ss), srgb(-1.2684380046 * ll + 2.6097574011 * mm - .3413193965 * ss), srgb(-.0041960863 * ll - .7034186147 * mm + 1.707614701 * ss)]
}
export const rgbHex = (rgb: RGB) => '#' + rgb.map(c => Math.round(clamp(c) * 255).toString(16).padStart(2, '0')).join('')
export const lchHex = (l: number, c: number, h: number) => rgbHex(lchRGB(l, c, h))
const lightness = { light: [.99,.96,.95,.85,.65,.57,.5,.4,.3,.2,.18], dark: [.97,.95,.85,.65,.6,.5,.4,.3,.25,.2,.18] }
const chroma = { light: [.01,.03,.05,.1,.15,.2,.18,.15,.1,.05,.03], dark: [.015,.025,.06,.18,.2,.17,.14,.1,.05,.03,.01] }
const stops = [5,10,20,30,40,50,60,70,80,90,100]
export function paletteColor(tint: string, appearance: 'dark' | 'light', stop: number, baseLightness?: number, baseChroma?: number) {
  const rgb = hexRGB(tint), [, c, h] = rgbLCH(rgb)
  const max = Math.max(...rgb), min = Math.min(...rgb), middle = (max + min) / 2
  const saturated = max === min ? rgb : rgb.map(channel => middle + (channel - middle) * Math.min(middle, 1 - middle) / ((max - min) / 2)) as RGB
  const maxChroma = rgbLCH(saturated)[1]
  const index = stops.indexOf(stop)
  let l = baseLightness ?? lightness[appearance][index]
  let nextChroma = maxChroma > .01 ? c / maxChroma * (baseChroma ?? chroma[appearance][index]) : 0
  if (h >= 148 && h <= 232 && stop === 50 && appearance === 'light') { const adjustment = Math.abs(h - 190) / 100; l -= .05 * adjustment; nextChroma += .05 * adjustment }
  const clipped = (cc: number) => lchRGB(l, cc, h).some(v => v < 0 || v > 1)
  if (clipped(nextChroma)) { let low = 0, high = nextChroma; for (let i = 0; i < 14; i++) { const mid = (low + high) / 2; if (clipped(mid)) high = mid; else low = mid } nextChroma = low }
  return lchHex(l, nextChroma, h)
}
export function grainPalette(tint: string, dark: boolean) {
  const [, c, h] = hexLCH(tint), grayscale = c < .04
  const background = dark ? lchHex(grayscale ? .15 : .2, grayscale ? 0 : .5 * c, h - 30) : lchHex(.97, grayscale ? 0 : c / 10, h)
  const colors = dark
    ? grayscale ? [.2,.25,.5].map(l => lchHex(l, 0, 0)) : [lchHex(.3,.8*c,h-30),lchHex(.4,c,h),lchHex(.5,.8*c,h+40)]
    : grayscale ? [.96,.92,.85].map(l => lchHex(l,0,0)) : [lchHex(.96,.15*c,h-20),lchHex(.92,.3*c,h),lchHex(.85,.5*c,h+40)]
  return { background, colors, noise: dark ? grayscale ? .1 : .2 : .5 }
}
