import type { CSSProperties } from 'react'
import './event-fonts.css'

/** Event choices override a theme's default font. Null means the system Inter face. */
export const eventTitleFonts: Record<string, { family: string; bold: number; medium: number }> = {
  'roc-grotesk': { family: '"Roc Grotesk", Inter, sans-serif', bold: 525, medium: 475 },
  'geist-mono': { family: '"geist-mono", monospace', bold: 600, medium: 500 },
  'ivy-presto': { family: '"ivypresto-headline", Georgia, serif', bold: 600, medium: 500 },
  'new-spirit': { family: '"new-spirit", Georgia, serif', bold: 600, medium: 500 },
  google: { family: '"Google Sans Flex", Inter, sans-serif', bold: 575, medium: 475 },
}
export function eventTitleStyle(font: string | null | undefined): CSSProperties {
  const config = font ? eventTitleFonts[font] : undefined
  return { fontFamily: config?.family ?? 'Inter, sans-serif', fontWeight: config?.bold ?? 600 }
}
