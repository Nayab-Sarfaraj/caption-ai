import type { CSSProperties } from 'react'

// Shared caption-placement logic for all 11 compositions. Each composition's
// caption sits in a full-frame flex layer (an <AbsoluteFill>); this returns the
// justify/align/transform for that layer given an optional user position.
//
// Position is expressed as percentages of the frame (posX/posY 0–100), so the
// live preview and the final render land identically regardless of resolution
// ("what you preview is what renders"). The caption block's CENTER is anchored
// at (posX%, posY%): because the layer is full-frame, translate() percentages
// resolve against the frame, moving the centered block from (50,50) to (x,y).
//
// When neither is set (old jobs, programmatic renders), it falls back to each
// composition's original bottom-centered look via its own paddingBottom — so
// nothing shifts unless the user actually moves the caption.
export function captionAnchorStyle(
  defaultPaddingBottom: number,
  posX?: number,
  posY?: number,
): CSSProperties {
  if (posX == null && posY == null) {
    return { justifyContent: 'flex-end', alignItems: 'center', paddingBottom: defaultPaddingBottom }
  }
  const x = posX ?? 50
  const y = posY ?? 82
  return {
    justifyContent: 'center',
    alignItems: 'center',
    transform: `translate(${x - 50}%, ${y - 50}%)`,
  }
}
