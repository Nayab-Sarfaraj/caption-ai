# Caption Styles — implemented + research backlog

Living doc for Instacap's caption styles: what's shipped, what's researched but
not built, and the exact steps to add a new one. Caption styles are real
Remotion compositions (not config-driven presets) — that's the product's
differentiator, keep it that way.

Last updated: 2026-07-22.

---

## Market context (why this matters)

- **85% of social video is watched muted** — captions are a must-have, and the
  *style* measurably affects watch time.
- **Top-converting mechanics are already shipped** (word-by-word, Hormozi,
  karaoke, box-highlight, single-word). Everything in the backlog below is
  long-tail variety + niche audiences (meme, news, aesthetic/lifestyle), not
  conversion-critical. Prioritize accordingly.
- Best-performing baseline per research: word-by-word / short-phrase, high
  contrast (white+black outline or yellow+black outline), lower-middle third.

---

## Implemented (21)

| Style | id | Mechanic | Category |
|---|---|---|---|
| Single Word | `SingleWord` | one giant word, punch-scaled | Trending |
| Neon Glow | `NeonGlow` | active word lights up, no box | Trending |
| Gradient | `Gradient` | gradient-fill text, animated sweep | Trending |
| Word by Word | `WordByWord` | active word scales up | Highlight |
| Karaoke | `Karaoke` | words shift color as spoken | Highlight |
| Spring | `Spring` | words spring in from below | Highlight |
| Box Highlight | `BoxHighlight` | keyword in a colored box (Captions.ai) | Highlight |
| Highlighter | `Highlighter` | marker swipe behind active word | Highlight |
| Underline | `Underline` | underline sweeps under active word | Highlight |
| Glide | `Glide` | words slide in from the side | Highlight |
| Hype | `Hype` | MrBeast bounce + glow (Bangers) | Hype |
| Hormozi | `Hormozi` | yellow-stroke pop-in (Anton) | Hype |
| Comic | `Comic` | cartoon font, keyword color swap (Fredoka) | Hype |
| Minimal | `Minimal` | restrained single-color | Clean |
| Pill | `Pill` | per-word dark pill badge | Clean |
| Caption Bar | `CaptionBar` | solid rounded bar behind whole line (podcast) | Clean |
| Outline | `Outline` | hollow text, active word fills solid | Clean |
| Fade | `Fade` | line fades per segment | Clean |
| Typewriter | `Typewriter` | chars type in with blinking cursor | Editorial |
| Script | `Script` | gold italic script accent word | Editorial |
| Meme | `Meme` | white Impact all-caps, defaults top of frame | Editorial |

---

## Backlog — researched, not built

Ranked within each tier by impact ÷ effort. "Echoes" = which tool/creator uses it.

### Flagship (needs a product decision)

- **Emoji Pop** — keyword gets an emoji above/beside it. Echoes Submagic's whole
  "Emoji" category; the single biggest engagement driver in short-form and the
  strongest differentiator gap.
  - **Blocked on:** (1) emoji source — curated keyword→emoji map (no dep, ships
    now) vs. LLM/Deepgram tagging pass (best quality, needs a call) vs. manual in
    the editor. (2) **Noto Color Emoji must be installed on the render VM** or
    headless Chromium renders tofu boxes (known Remotion gotcha).

### ~~Recommended 6-pack~~ — SHIPPED 2026-07-22

Gradient, Highlighter, Underline, Glide, Outline, Meme are now implemented (see
the table above). Took the set to 21 styles.

### Phase-after (exhaustive coverage)

| Style | What it is | Echoes | Effort |
|---|---|---|---|
| **Pulse** | active word pulses (rhythmic scale) | VEED "Pulse" | Low |
| **Glitch** | RGB-split / jitter on active word | tech/edgy | Med |
| **Wave** | letters bob in a wave | playful | Med (per-letter) |
| **Sticker** | word on a rotated colored tape/label | scrapbook/fun | Med |
| **News Bar** | broadcast lower-third bar | commentary/news | Med |
| **Handwritten** | Caveat marker annotation | VEED "Handwritten" | Med (differs from Script) |

### Considered and skipped

- **Audio-reactive text** (waveform-driven) — needs an audio-analysis pipeline we
  don't have; revisit only if a music/podcast use case is prioritized.
- **Break-apart / shatter** — high effort (per-letter physics), low payoff.
- **Netflix/classic subtitle** — effectively covered by Minimal + Caption Bar.

---

## How to add a style (validated checklist)

Every touchpoint a new style must hit. Adding to `STYLES` auto-updates the Zod
validator (`compositionIdSchema` derives from `COMPOSITION_IDS`), but the two
hardcoded unions and the `Record<CompositionId, …>` maps must be edited by hand —
`tsc --noEmit` will catch any you miss.

1. **`remotion/compositions/<Name>.tsx`** — the composition. Props: `transcript,
   videoSrc, activeColor?, textColor?, fontFamily?, fontSizeMultiplier?, posX?,
   posY?`. Render `<OffthreadVideo>` (guarded by `videoSrc`) + a caption
   `<AbsoluteFill>` whose style spreads
   `captionAnchorStyle(paddingBottom, posX, posY)` (from `remotion/lib/caption-layout.ts`)
   so caption-position control works for free. Copy `WordByWord.tsx` as the base.
2. **`remotion/compositions/CaptionRoot.tsx`** — import it, add the id to the
   `CompositionId` union, add a dispatch branch (passes `{...shared}` which
   already carries colors/font/size/posX/posY).
3. **`remotion/Root.tsx`** — import + a `<Composition>` entry (Remotion Studio only;
   the app renders via the `CaptionRoot` dispatcher, so this is for dev preview).
4. **`src/types/job.types.ts`** — add the id to `RenderJobPayload.compositionId`
   (duplicate hardcoded union — must stay in sync with `CompositionId`).
5. **`src/helpers/style-options.ts`** — add a `STYLES` entry `{ id, label, desc,
   category }`. New categories go in `CATEGORY_ORDER`.
6. **`components/preview-player.tsx`** — add an `INITIAL_SETTINGS[<id>]` entry
   (`SettingsMap` is `Record<CompositionId, StyleSettings>` — required or tsc fails).
7. **`components/caption-style-preview.tsx`** — add a `STYLE_PREVIEW_META[<id>]`
   entry and, if the look needs it, a new `Mechanic` + render branch (drives the
   picker thumbnails on the editor + landing).
8. **`app/page.tsx`** — add a `STYLE_LABELS[<id>]` entry (landing style chips).
9. **Verify:** `npx tsc --noEmit` + `npm run build`, then render a still through
   the real pipeline — copy `scripts/verify-position.mts` (uses `getBundle` →
   `selectComposition({ id: 'CaptionRoot', inputProps })` → `renderStill`). Renders
   locally on macOS via the native `@remotion/compositor-darwin-arm64`.

**Deploy:** the worker bundles these compositions, so shipping a style needs
`npm run build` **and** `pm2 restart all` on the VM (restart clears the cached
Remotion bundle) — not just a Next rebuild. No new deps unless the style pulls a
new font.

---

## Sources

- Submagic themes/categories — https://care.submagic.co/en/article/what-are-themes-and-themes-categories-1pv8wvz/
- OpusClip caption presets — https://www.opus.pro/blog/best-caption-presets-styles-boost-retention
- OpusClip text-animation packs — https://www.opus.pro/blog/best-text-animation-packs-captions-titles
- CapCut caption types — https://www.capcut.com/resource/types-of-captions
- VEED dynamic subtitles — https://www.veed.io/tools/auto-subtitle-generator-online/dynamic-subtitles
- Filmora kinetic typography — https://filmora.wondershare.com/video-editing-tips/kinetic-typography.html
- Vexub subtitle styles — https://vexub.com/blog/best-subtitle-styles-social-media
- Blitzcut TikTok caption styles 2026 — https://blitzcutai.com/blog/best-caption-style-tiktok
- VFX AI trending caption styles 2026 — https://www.vfxai.com/blog/trending-caption-styles-for-2026
