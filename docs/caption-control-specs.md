# Spec: Animation Speed + Max Words Per Line

## Problem Statement

Instacap's caption customization panel currently supports highlight color, text color, font, size, and position (top/bottom, left/right). Two controls are missing: **animation speed** and **max words per line**. Both must be added without breaking caption-to-audio synchronization, which is currently driven by Deepgram word-level timestamps.

## Current State (agent to confirm against codebase before starting)

- Transcription: Deepgram provides word-level `start`/`end` timestamps.
- Rendering: Remotion renders captions from transcript data.
- Existing customization: stored per-user/per-project config (confirm schema location) — highlight, text color, font, size, position.
- Agent should locate: (1) where caption chunks/lines are currently generated from words, (2) where the animation/transition logic lives in the Remotion composition, (3) the config schema/table these new fields should extend.

## Requirements

### 1. Animation Speed

- New control: multiplier, range 0.5x–2x, applied to the base transition duration of the selected animation style (pop/fade/slide/etc).
- Scope: **rendering-only**. Must NOT modify word `start`/`end` timestamps from Deepgram.
- Constraint: animation duration must be capped at ~40% of a word's actual display window (`end - start`). If the multiplier would exceed that cap, silently clamp to the cap — do not let the animation bleed into the next word's display window.
- Output: this is a per-word or per-chunk rendering parameter, computed at render time from (base duration × multiplier), then clamped.

### 2. Max Words Per Line

- New control: integer, user-adjustable (define min/max range, e.g. 1–8 words).
- Requires a **pure re-chunking function**, decoupled from Remotion:
  - Signature: `chunkWords(words: Word[], maxWordsPerLine: number) -> Chunk[]`
  - Each `Chunk` = `{ words: Word[], start: number, end: number }` where `start` = first word's start time, `end` = last word's end time.
  - Secondary break condition: force a new chunk boundary if the gap between two consecutive words exceeds a silence threshold (suggest 500ms as default, make configurable), even if `maxWordsPerLine` hasn't been reached. This prevents a chunk from visually spanning a long pause.
- This function must be testable independently of video rendering (unit tests, no Remotion render required).

## Edge Cases to Handle

- Single word longer than the max line width (visually) — decide truncation/wrap behavior.
- Punctuation-triggered line breaks (if any existing logic breaks on punctuation, confirm it composes correctly with maxWordsPerLine).
- Trailing partial line at the end of a transcript (fewer words than max).
- Very short words with very fast animation speed (already covered by the 40% cap).
- Long silence in the middle of what would otherwise be one chunk (covered by the silence threshold).

## Non-Goals

- No change to original video playback speed.
- No change to Deepgram word timestamp data itself.
- No retroactive re-render of existing captioned videos unless explicitly requested later.

## Acceptance Criteria

- [ ] Animation speed control added to customization panel, wired to render pipeline, respects the 40% clamp.
- [ ] Max words per line control added to customization panel.
- [ ] `chunkWords` function implemented as a pure function with unit tests covering the edge cases above.
- [ ] Re-chunked captions remain in sync with audio when previewed/exported (manual QA pass on at least one fast-talking and one slow/pausey sample video).
- [ ] No regression to existing customization options (color, font, size, position).

## Open Questions for Agent to Resolve by Inspecting Codebase

1. Where is the current chunk/line generation logic, if any exists already?
2. What's the current config schema for per-project caption styles, and where do new fields (`animationSpeed`, `maxWordsPerLine`) get added?
3. Is there an existing silence-detection utility (e.g. from earlier filler/silence-removal discussions) that can be reused for the chunk-break threshold?
