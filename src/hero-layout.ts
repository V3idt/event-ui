type SlotPosition = {
  fx: number
  fy: number
  sizePx: number
  clamp?: 'x' | 'y'
  pad?: number
}

type HeroSlot = SlotPosition & {
  z: number
  minWidth?: number
  small?: SlotPosition | null
  mobile?: SlotPosition
}

export type HeroCardLayout = {
  index: number
  left: number
  top: number
  size: number
  zIndex: number
}

// The reference shuffles its 21 cover/photo pairs once per page load. These
// first five match the captured reference; the remainder stay reproducible.
export const HERO_COVER_ORDER = [11, 18, 12, 7, 20, 19, 2, 15, 3, 13, 10, 8, 9, 1, 4, 14, 5, 16, 17, 6, 21] as const

const slots: readonly HeroSlot[] = [
  { fx: -.09, fy: .95, sizePx: 220, z: 1.2, clamp: 'y', mobile: { fx: -.12, fy: .95, sizePx: 135 } },
  { fx: .55, fy: .72, sizePx: 165, z: .4, clamp: 'x', pad: 8, mobile: { fx: .55, fy: 1.15, sizePx: 150 } },
  { fx: -.5, fy: .6, sizePx: 150, z: -.6, clamp: 'x', pad: 30, mobile: { fx: 1.05, fy: .28, sizePx: 110, clamp: 'x' } },
  { fx: -.82, fy: .28, sizePx: 115, z: -1.4, clamp: 'x', small: { fx: -.7, fy: .28, sizePx: 130, clamp: 'x' }, mobile: { fx: -1.05, fy: .68, sizePx: 125, clamp: 'x' } },
  { fx: -.66, fy: -.16, sizePx: 185, z: .9, clamp: 'x', pad: 14, mobile: { fx: -1.05, fy: -.34, sizePx: 130, clamp: 'x', pad: 12 } },
  { fx: .83, fy: .26, sizePx: 145, z: -1, clamp: 'x', pad: 34, small: { fx: .83, fy: .3, sizePx: 145, clamp: 'x', pad: 44 }, mobile: { fx: 1.05, fy: -.42, sizePx: 125, clamp: 'x', pad: 10 } },
  { fx: .47, fy: -.12, sizePx: 135, z: -1.6, clamp: 'x', pad: 16, small: null, mobile: { fx: 1.08, fy: .6, sizePx: 90, clamp: 'x' } },
  { fx: .68, fy: -.5, sizePx: 160, z: .2, clamp: 'x', pad: 34, small: { fx: .65, fy: -.45, sizePx: 160, clamp: 'x' }, mobile: { fx: .55, fy: -.85, sizePx: 145 } },
  { fx: -.38, fy: -.75, sizePx: 165, z: -.4, clamp: 'y', mobile: { fx: -.3, fy: -.92, sizePx: 130 } },
  { fx: .28, fy: -.95, sizePx: 230, z: 1.4, clamp: 'y', small: { fx: .3, fy: -.98, sizePx: 200 }, mobile: { fx: -1.08, fy: -.75, sizePx: 95, clamp: 'x' } },
  { fx: -.97, fy: -.75, sizePx: 200, z: .6, clamp: 'x', small: { fx: -1.05, fy: -.75, sizePx: 140, clamp: 'x' }, mobile: { fx: -1.12, fy: .1, sizePx: 100, clamp: 'x' } },
  { fx: .23, fy: .88, sizePx: 170, z: .8, clamp: 'y', minWidth: 1600 },
  { fx: -.78, fy: .72, sizePx: 140, z: -1.2, clamp: 'x', minWidth: 1600 },
  { fx: .9, fy: -.15, sizePx: 130, z: .5, clamp: 'x', minWidth: 1600 },
  { fx: -.05, fy: -.98, sizePx: 180, z: -.2, clamp: 'y', minWidth: 1600 },
  { fx: -.62, fy: -.88, sizePx: 140, z: -.9, clamp: 'y', minWidth: 1600 },
]

const stacking = slots
  .map((slot, index) => ({ index, depth: slot.z }))
  .sort((a, b) => a.depth - b.depth)
  .reduce<Record<number, number>>((result, slot, order) => {
    result[slot.index] = order + 5
    return result
  }, {})

function clampMap(value: number, from: number, to: number, low: number, high: number) {
  return low + Math.max(0, Math.min(1, (value - from) / (to - from))) * (high - low)
}

/** Pixel-space equivalent of the reference's perspective-projected cards. */
export function getHeroLayout(width: number, height: number): HeroCardLayout[] {
  if (width <= 0 || height <= 0) return []

  const mobile = width <= 450
  const small = !mobile && width <= 650
  const titleScale = (width <= 450 ? 54 : width <= 650 ? 60 : width <= 820 ? 72 : width <= 1000 ? 80 : width > 1920 ? 118 : 92) / 92
  const scale = mobile ? 1 : clampMap(width, 650, 1440, .8, 1) * clampMap(width, 1440, 2560, 1, 1.3)

  return slots.flatMap((slot, index) => {
    const position = mobile ? slot.mobile : small && slot.small !== undefined ? slot.small : slot
    if (!position || (!mobile && slot.minWidth && width < slot.minWidth)) return []

    const size = position.sizePx * scale
    let x = position.fx * width / 2
    let y = position.fy * height / 2

    // Positive Y in the original scene points upward. Clearance keeps cards
    // outside the headline and CTA, including at shorter viewport heights.
    if ((position.clamp ?? 'y') === 'x') {
      x = Math.sign(x) * Math.max(Math.abs(x), Math.max(260 * titleScale, width > 650 ? 245 : 0) + (position.pad ?? 0) + size / 2)
    } else {
      y = Math.sign(y) * Math.max(Math.abs(y), Math.max(250 * titleScale, 225) + size / 2)
    }

    return [{ index, left: width / 2 + x - size / 2, top: height / 2 - y - size / 2, size, zIndex: stacking[index] }]
  })
}
