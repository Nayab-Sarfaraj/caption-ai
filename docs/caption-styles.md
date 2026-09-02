# Caption Styles — implemented + research backlog

Living doc for Instacap's caption styles: what's shipped, what's researched but
not built, and the exact steps to add a new one. Caption styles are real
Remotion compositions (not config-driven presets) — that's the product's
differentiator, keep it that way.

Last updated: 2026-09-01.

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

## Implemented (33)

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
| Pulse | `Pulse` | active word pulses rhythmically | Highlight |
| Sticker | `Sticker` | active word pops on a rotated label | Trending |
| Glitch | `Glitch` | RGB split / jitter on active word | Hype |
| Wave | `Wave` | letters bob in a wave | Trending |
| Handwritten | `Handwritten` | Caveat marker annotation on active word | Editorial |
| News Bar | `NewsBar` | broadcast lower-third with editable headline | Editorial |
| Word Highlight | `WordHighlight` | calm outlined phrase with active-word fill | Highlight |
| Karaoke Fill | `KaraokeFill` | active glyph fills across its spoken duration | Highlight |
| Focus Card | `FocusCard` | adaptive phrase-level card | Clean |
| Comic Strip | `ComicStrip` | outlined comic-print lettering with sticker shadow | Hype |
| Soft Candy | `SoftCandy` | pastel editorial caption strips | Editorial |
| Retro Script | `RetroScript` | layered retro script treatment | Editorial |

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
the table above). The subsequent visual packs took the set to 33 styles.

### News Bar headline flow

Users can type a category and headline directly in the editor. The optional
"Suggest with AI" button sends the completed transcript to Groq from a
server-side route, returns a factual JSON suggestion, and is rate-limited to
three requests per job. The user can always edit or replace the suggestion.

---

## Visual research report — Retro Script, Comic Strip, Soft Candy, Word Highlight

**Status:** implemented as original Instacap treatments on 2026-09-02. The four names appear to be preset labels rather than stable,
industry-standard categories. The specifications below therefore separate
what is visibly observable from the proposed Instacap implementation. They are
original interpretations, not a request to pixel-copy a competitor's work.

### Shared production rules

- All four styles need word-level timestamps for their best result. With an
  SRT/VTT upload, retain the existing block-level fallback: animate the whole
  block rather than pretending every word is timed.
- Keep the caption inside the mobile safe zone: avoid the bottom 14% of a
  portrait frame (TikTok/Reels controls) and leave 5% horizontal padding.
- Use `captionAnchorStyle()` plus `posX` / `posY` so the editor's caption
  position controls continue to work. Style defaults below are starting points,
  not fixed coordinates.
- Preserve a dark outline or shadow whenever the text is light. Brand-color
  customisation may alter the accent, but should not remove the contrast layer.
- Build each style as a new composition and give it a matching picker preview,
  Studio composition, landing-page label, `INITIAL_SETTINGS` entry and style
  catalogue entry. Follow the checklist below rather than adding a CSS-only
  preset.
- Test every one at 720x1280 and 1280x720, over light and dark video, with short
  words, long words, punctuation, Hindi/Devanagari fallback, and SRT input.

### Comparison and priority

| Proposed Instacap id | Reference treatment | Distinct from existing styles? | Suggested priority | Main reason |
|---|---|---|---|---|
| `WordHighlight` | crisp outlined active-word emphasis | Partly overlaps WordByWord/Hormozi/Highlighter, but can be calmer and more readable | 1 | familiar short-form default; broadest appeal |
| `SoftCandy` | pastel paper-strip captions | Distinct from Pill and Caption Bar | 2 | strongest new editorial/aesthetic look |
| `RetroScript` | bold retro connected script | Variant of Script, but materially bolder | 3 | low implementation risk; lifestyle niche |
| `ComicStrip` | stacked comic-label captions | Related to Comic, Hype and Sticker | 4 | visually strong but needs careful readability work |

### 1. Retro Script

**Observed treatment**

- Portrait, lower-middle caption placement with a short three-line phrase.
- Connected, thick display script in a warm orange/peach fill.
- A pale cream/yellow inner highlight plus a deep pink/magenta offset shadow
  gives the letters a retro sign-painting or candy-shop feel.
- The caption is the visual focal point; the video stays unobscured and there
  is no box behind the text.
- The treatment fits morning routines, lifestyle, beauty, fashion, food and
  sentimental/vlog clips. It is a poor default for dense tutorials, legal,
  finance, or fast technical speech.

**Original Instacap spec**

| Property | Proposed default |
|---|---|
| id / label | `RetroScript` / Retro Script |
| Caption unit | 2-4 words, maximum 2 lines on landscape and 3 lines on portrait |
| Default position | `posY: 72`, centre aligned |
| Font | Load a bold connected Google display script such as Lobster; retain Caveat as a fallback only, because it is too light for this treatment |
| Main fill | `#FF9A3E` |
| Highlight / inner edge | `#FFE08A` |
| Offset shadow | `#B51D62`, 3-5 px at 720 px frame width, down-right |
| Readability stroke | thin dark cocoa stroke `#3A1720` or a soft dark shadow |
| Size | roughly `width / 11` on portrait; clamp long phrases before they become smaller than the app's normal caption size |
| Motion | segment fades in over 5-7 frames; active word gets a restrained 0.96 -> 1.04 spring; no large bounce |

**Implementation notes**

- Do not reuse `Script` unchanged. Existing Script is an accent-word treatment;
  Retro Script needs every displayed word in the same thick retro face and
  layered shadow treatment.
- Use one absolutely positioned text layer for the shadow, then a foreground
  text layer. Avoid CSS `filter: drop-shadow()` for the coloured offset because
  it cannot produce the intentional two-colour print effect as cleanly.
- Restrict the phrase length before rendering. Connected script becomes hard to
  read when it wraps into narrow columns.
- Add a font-loading test to the Lambda site deployment. A new Google font is
  bundled with the Remotion site and requires a site redeploy, not a Lambda
  function redeploy.

**Acceptance criteria**

- Orange fill, cream highlight and magenta offset remain visibly separate over
  dark and light footage.
- No line exceeds 85% of the safe-frame width.
- At least a 3:1 visual contrast against common backgrounds after the dark
  outline/shadow is applied.

### 2. Comic Strip

**Observed treatment**

- Short stacked uppercase phrase near the lower third.
- Cream/white heavy comic lettering with a thick black outline and a hard,
  sticker-like shadow.
- One important word uses a hot pink/red fill while the rest stays light.
- The layers resemble a comic caption box or printed sticker more than a speech
  balloon. Small decorative sparkle shapes may appear, but are optional.
- Best for reactions, comedy, gaming, pop culture and punchline-based clips;
  too visually loud for calm education or premium corporate material.

**Original Instacap spec**

| Property | Proposed default |
|---|---|
| id / label | `ComicStrip` / Comic Strip |
| Caption unit | 2-5 words, deliberately broken into 1-3 stacked lines |
| Default position | `posY: 70`, centre aligned |
| Font | Bangers for the most comic energy; Anton is the readable fallback. Both are already used by the app. |
| Base fill | `#FFF4C7` |
| Active-word fill | `#F05268` |
| Outline | `#111111`, 3-4 px at 720 px frame width, `paintOrder: 'stroke fill'` |
| Sticker shadow | `#111111`, 4-6 px down-right; optional off-white outer keyline |
| Size | around `width / 12` portrait; uppercase only |
| Motion | whole phrase springs from 0.85 to 1 over 7-9 frames; active word receives a short 1.0 -> 1.08 -> 1.0 pop |

**Implementation notes**

- Existing `Comic` uses Fredoka and a keyword colour swap. Comic Strip should
  use a more print-like condensed display face, fixed black outline and stacked
  phrase layout so users can see why both presets exist.
- Keep decorative stars/sparkles deterministic from the frame number; do not
  use random values during render, or the preview and Lambda output can differ.
- Add a maximum of two small decorations. More will compete with the caption
  and increase visual noise on mobile.
- Do not create actual speech balloons unless the design is intentionally
  changed. The reference is closer to a caption sticker than dialogue assigned
  to the on-screen speaker.

**Acceptance criteria**

- The active word is unmistakable even when the viewer sees only one frame.
- Heavy outline remains sharp at 720x1280 and does not close the counters in
  letters such as A, O, P, R and B.
- Three-line phrases remain inside the lower-third safe area.

### 3. Soft Candy

**Observed treatment**

- Several very short caption fragments are displayed as separate soft paper
  strips, rather than one large caption block.
- The strips alternate warm cream, pale yellow and blush/pink backgrounds.
- Text is small, dark and editorial; selected words receive pink/red emphasis.
- The result is gentle, minimal and slightly scrapbook-like. It relies on space,
  not a heavy outline or bounce, for its character.
- It suits interview clips, thoughtful explainers, fashion, beauty, wellness and
  "quiet luxury"/editorial content. It should not be used for rapid-fire comedy
  or high-energy gaming where the text becomes too small to track.

**Original Instacap spec**

| Property | Proposed default |
|---|---|
| id / label | `SoftCandy` / Soft Candy |
| Caption unit | 4-7 words grouped into 2-4 strips; 1-3 words per strip |
| Default position | `posY: 66`, centre aligned |
| Font | A medium-weight serif or humanist sans; use a bundled Google font chosen during implementation, with `Montserrat` as the safe fallback |
| Strip palette | cream `#FFF8DD`, pale yellow `#FFF0A8`, blush `#FFE3E8` |
| Ink | `#34231F` |
| Active-word colour | `#D63D61` |
| Secondary accent | muted gold `#C89C2C` |
| Shape | square or 2-4 px corners; 3-5% horizontal padding per strip |
| Motion | strips fade and slide up 6-8 px in 4-6 frames, staggered 1-2 frames; active word only changes colour, no scale pop |

**Implementation notes**

- This is not a recoloured `CaptionBar`. Each short phrase needs its own
  background strip, with measured text width and intentional, slightly uneven
  vertical spacing.
- Break at linguistic boundaries where possible. A simple first version may
  chunk sequential words; a later refinement can prefer punctuation and short
  clauses.
- Use `display: inline-flex` strips in a column with `align-items: center`.
  Measure each strip naturally rather than forcing full-frame width.
- Enforce a readable minimum font size. If a long phrase would create tiny
  strips, reduce the number of words in that group instead of shrinking text.
- Keep strip backgrounds opaque enough for readability; transparent pastel
  overlays become illegible on busy footage.

**Acceptance criteria**

- Each strip is readable independently, including on a bright background.
- No group contains more than four strips or occupies more than 28% of the
  portrait frame height.
- Motion remains calm: no spring overshoot, rotation or glow.

### 4. Word Highlight

**Observed treatment**

- Large white uppercase phrase in the lower third.
- Thick dark/black outline and shadow make the words readable over any video.
- The currently spoken word receives a yellow/cream accent; the remaining words
  stay white.
- The layout is usually one or two lines, with a crisp, direct presentation and
  little decorative movement.
- It is the most universal of the four: podcasts, tutorials, talking heads,
  product videos and motivational content all fit it.

**Original Instacap spec**

| Property | Proposed default |
|---|---|
| id / label | `WordHighlight` / Word Highlight |
| Caption unit | 3-6 words, maximum 2 lines |
| Default position | `posY: 76`, centre aligned |
| Font | Anton, already bundled and proven for outlined captions |
| Base fill | `#FFFFFF` |
| Active-word fill | `#FFD329` |
| Outline | `#080808`, 3-4 px at 720 px frame width, `paintOrder: 'stroke fill'` |
| Shadow | black, 2-3 px down-right, low blur |
| Size | around `width / 11.5` portrait; uppercase |
| Motion | whole group receives a 2-4 frame opacity reveal; active word makes a subtle 1.0 -> 1.05 -> 1.0 scale pulse |

**Implementation notes**

- Keep this intentionally quieter than `Hormozi`: no yellow stroke, large
  spring-in or glow. Its selling point is instant readability.
- Keep this distinct from `Highlighter`: no marker bar behind the word. The
  accent is a fill-colour change inside the outlined glyphs.
- Keep this distinct from `WordByWord`: show a short readable phrase, rather
  than moving a five-word chunk aggressively every word.
- Reuse the established active-word timing helper and `withScriptFallback()`.
  The latter preserves Hindi/Devanagari glyph coverage, even though Anton itself
  is Latin-centric.

**Acceptance criteria**

- Active-word change is visible at normal mobile playback speed without a large
  bounce.
- White and yellow fills remain readable because the black outline is never
  optional in the default preset.
- Long words do not overflow; reduce font size per group only within a safe
  minimum, then re-chunk if needed.

### Product decisions before implementation

1. **Ship names:** use the proposed labels or choose clearly original product
   names. Do not present the screenshot labels as copied branded presets.
2. **Font choice:** approve the one new Retro Script face and the Soft Candy
   editorial face before code work. Word Highlight and Comic Strip can reuse
   existing loaded display fonts.
3. **Customisation level:** expose only active/text/accent colours, font size
   and position in v1. Keep outline widths, strip spacing, motion duration and
   safe-zone logic locked to preserve the intended look.
4. **Style selection:** add these only after the upload-to-editor selected-style
   persistence issue is fixed, so a choice made at upload is not silently reset.
5. **Release process:** a composition change requires a Vercel deployment and
   `npx remotion lambda sites create remotion/Root.tsx --site-name=caption-ai`.
   Rebuild/restart the EC2 worker only when `worker/` or its dependencies change.

### Considered and skipped

- **Audio-reactive text** (waveform-driven) — needs an audio-analysis pipeline we
  don't have; revisit only if a music/podcast use case is prioritized.
- **Break-apart / shatter** — high effort (per-letter physics), low payoff.
- **Netflix/classic subtitle** — effectively covered by Minimal + Caption Bar.

---

## Research report — additional editor-common caption treatments

**Status:** researched on 2026-09-01. Karaoke Fill and Focus Card were implemented
on 2026-09-02; the remaining items below are product-capability work.
This is a product-gap report, not a claim that a visual effect automatically
increases engagement. Editor vendors commonly offer word-level emphasis,
dynamic themes and bilingual treatments, but their retention figures are
marketing claims. The practical goal is to give creators a readable style that
fits the content, then measure completion rate, average watch time and shares
against another style for the same kind of video.

### What the current catalog already covers

The current catalog already has the obvious social-caption variants: active-word
highlight (`WordByWord`, `Karaoke`, `Highlighter`, `BoxHighlight`, `Pill`),
motion (`Spring`, `Pulse`, `Glide`, `Wave`, `Glitch`), decorative treatments
(`NeonGlow`, `Gradient`, `Script`, `Handwritten`, `Comic`, `Sticker`) and
low-distraction styles (`Minimal`, `Fade`, `CaptionBar`, `Outline`). Do **not**
add a second generic Glow, Bounce, Handwritten, Pulse, Glide or plain
Word-Highlight preset. `Emoji Pop` remains a known separate backlog item, not a
new recommendation here.

| Treatment | Recommendation | Why it is materially different | Effort | Dependency |
|---|---|---|---:|---|
| Karaoke Fill | build as a new style | animated fill travels through the active glyph, rather than switching the whole word's colour | M | existing word timestamps |
| Focus Card | build as a new style | one adaptive card follows a *phrase*, unlike per-word boxes/pills or the full Caption Bar | M | existing segment data |
| Bilingual Stack | build as a product capability + style | two synchronised languages with hierarchy | L | translation pipeline and persisted translated segments |
| Speaker Card | build as a product capability + style | labels the active speaker for interview/podcast footage | L | diarization or manual speaker assignment |
| Semantic Emphasis | build as an opt-in layer, not a style | only selected important words receive emphasis, regardless of base style | L | stable word references + editor override |
| Impact Keyword | build after Semantic Emphasis | one editorially selected word becomes substantially larger while the phrase remains stable | M after emphasis layer | semantic/manual word selection |
| Speaker Follow | future advanced treatment | a speech bubble is positioned near and follows the active visible speaker | XL | diarization, active-speaker detection, face tracking and collision-safe placement |
| Progressive Reveal | **do not add separately** | current `Typewriter` already reveals complete words as each word starts | S | design/rename decision only |
| Whisper / quiet subtitle | **do not add now** | overlaps `Minimal` + `Fade`; make it a saved preset later if users request it | S | no new data |

### 1. Karaoke Fill

**Purpose:** a music, lyric and high-energy talking-head treatment where the
currently spoken word fills from left to right over its actual spoken duration.
It is familiar to editors because it resembles sing-along karaoke, but should
be offered as an original Instacap preset rather than presented as another
product's preset.

**Difference from existing `Karaoke`:** the current implementation displays a
dark rounded group, changes the entire active word to `activeColor`, and dims
past words. Karaoke Fill retains the phrase but animates a second, clipped text
layer from 0% to 100% across the active word. That travelling fill is the new
visual behaviour; merely changing the active colour is not enough.

| Property | Proposed default |
|---|---|
| id / label | `KaraokeFill` / Karaoke Fill |
| Caption unit | current segment, 2-6 words; re-chunk long segments before rendering |
| Position | lower-centre, `posY: 76`; allow existing position controls |
| Text | white or user `textColor`, heavy sans, 800-900 weight, 2-3 px black outline/shadow |
| Active fill | user `activeColor`, default warm yellow `#FFD60A` or brand accent |
| Inactive/past words | white at 100% opacity; do not dim past words by default because lyric readability matters |
| Motion | active word fill `0% -> 100%` from `word.start` to `word.end`; no scale bounce in v1 |
| Best footage | lyric, music, energetic tutorials, short hooks |
| Avoid for | dense legal/educational material or very fast dialogue where the sweep becomes visually noisy |

**Render design**

1. Render the base active word in normal text colour.
2. Overlay the same word in `activeColor` with `backgroundClip: 'text'` / a
   clipped gradient, whose stop is calculated from the word's actual duration.
3. Clamp bad timing safely: if `end <= start`, use a 1-frame fill; if a word is
   extremely short, complete the fill in at least 3 frames rather than flashing.
4. Keep the rest of the segment stable. Reflowing the line every word makes the
   effect harder to read and increases layout jitter.

**Technical scope**

- New Remotion composition only; the existing `TranscriptWord.start` / `.end`
  fields are sufficient for AI-generated transcripts.
- Uploaded SRT/VTT captions may have one timing per whole cue rather than true
  per-word timings. For those jobs, either use an even per-word split with an
  editor warning, or fall back to the existing Karaoke style. Do not claim
  frame-accurate sweeps when word timestamps do not exist.
- No audio analysis, Lambda change, database migration or new dependency is
  required.

**Acceptance criteria**

- The fill starts and finishes within the active word's timing window.
- At 720x1280 the active word remains readable over bright footage.
- A 10-second, 24 fps render has no NaN styles, clipped glyphs or line jumps.

### 2. Focus Card

**Purpose:** a clean creator/editor treatment for explanations, product demos
and talking heads. A compact rounded card contains the active short phrase;
the phrase changes by segment and the active word receives a small colour
change. It creates a deliberate focal area without the visual noise of a box
behind every word.

**Difference from current styles:** `Pill` and `BoxHighlight` put a shape behind
an active **word**; `CaptionBar` provides a persistent bar for the full caption
line. Focus Card has one adaptive **phrase-level** card, a soft shadow and a
restrained enter/exit transition. It should never look like a recoloured
Caption Bar.

| Property | Proposed default |
|---|---|
| id / label | `FocusCard` / Focus Card |
| Caption unit | 2-5 word segment, maximum 2 lines |
| Position | lower-centre, `posY: 72`; preserve safe space above platform controls |
| Card | `rgba(10, 14, 22, 0.82)`, 18-24 px radius, 0.35-0.55 em horizontal padding |
| Text | white, semibold/bold sans, 1.15-1.25 line height |
| Active word | `activeColor` fill only; optional 1.03 scale, never a spring bounce |
| Motion | card fades/raises 8-12 px over 5-7 frames on segment start; fade out on end |
| Best footage | education, SaaS demos, interviews, business content |
| Avoid for | music videos, aggressive meme edits, clips where lower-third graphics already occupy the same space |

**Implementation notes**

- Use `currentSegment`, not the flat word list, as the card's identity. This
  prevents its width from changing on every spoken word.
- Constrain text with the existing caption safe-zone helper; resize only to a
  defined minimum, then re-chunk the segment. Never let the card cover the
  speaker's mouth just to preserve a large font.
- Use opacity and transform only. Avoid expensive blur filters in the
  composition; they increase render cost without adding meaningful readability.
- This is a style-only feature: existing transcript data and settings are
  enough.

**Acceptance criteria**

- Card width changes only at a segment boundary.
- Card and text stay inside portrait and landscape safe margins at every
  supported `posX` / `posY` setting.
- The active word remains understandable with colour blindness: contrast and
  weight must communicate activity even if `activeColor` is not distinguishable.

### 3. Bilingual Stack

**Purpose:** serve creators who speak one language but publish to an audience
that reads another. The spoken-language line remains primary; a shorter,
translated line appears directly below it. This is valuable for multilingual
short-form content, but it is an end-to-end data feature, **not** a one-file
caption composition.

| Property | Proposed default |
|---|---|
| id / label | `BilingualStack` / Bilingual |
| Primary line | source-language segment, 100% size and normal `textColor` |
| Secondary line | translated segment, 62-70% of primary size, 80-90% opacity |
| Position | lower-centre, `posY: 70`; needs more vertical safe space than normal captions |
| Background | off by default; optional subtle dark wash behind the complete two-line group |
| Active emphasis | source line follows word timing; translation stays stable for the segment in v1 |
| Motion | group crossfades between segments; no per-word animation on the translation in v1 |
| Best footage | Hinglish/English education, travel, global creator content, interviews |
| Avoid for | tiny portrait source video, extremely fast speech, translations that are substantially longer than source text |

**Required data and workflow**

1. Preserve the source transcript as the authoritative timed transcript.
2. Translate at the **segment** level, retaining `segmentIndex`, source language,
   target language and translated text. Do not try to invent target-language
   word timings in v1.
3. Persist a translation version/provider so a later re-render uses exactly the
   reviewed text rather than silently generating a different translation.
4. Give the user an editable translation before render. Machine translation can
   change names, slang, numbers and intent.
5. If translation fails, render the requested source-only style or stop before
   charging a render; never show mismatched/empty secondary lines.

**Current gap and implementation impact**

- `Transcript`, `TranscriptSegment` and `TranscriptWord` currently have no
  translation fields. Add an optional, versioned translation structure rather
  than overloading `word.word` or doing a runtime text match.
- The current user-uploaded SRT/VTT flow is still compatible because it already
  has segment timing, but its imported cues may contain only one word object.
- This needs an explicit translation provider, rate limits/cost handling,
  database validation, editor controls, preview support, worker payload support
  and a clear privacy disclosure. It is a separate project from adding a style.

**Acceptance criteria**

- Source and translation always advance together at the same segment boundary.
- A long translation reflows within its own two-line limit; it never forces the
  source line into unreadably small type.
- User-edited translations survive refresh, retry and Lambda render.

### 4. Speaker Card

**Purpose:** identify who is speaking in a podcast, interview, panel or
reaction video. The label gives viewers conversational context that colour or
animation alone cannot provide.

| Property | Proposed default |
|---|---|
| id / label | `SpeakerCard` / Speaker Card |
| Label | small uppercase pill, e.g. `HOST`, `GUEST`, `SPEAKER 1` |
| Caption | 2-5 word segment below the label; white semibold text with active-word emphasis optional |
| Position | lower-left or lower-centre; respect `posX` / `posY` and avoid lower-thirds |
| Speaker colour | one accessible accent colour per speaker, with text label as the non-colour cue |
| Motion | label crossfades when the active speaker changes; no bounce |
| Best footage | podcasts, remote interviews, debates, founder/customer clips |
| Avoid for | a single speaker, voice-over B-roll, music/lyrics |

**Required data and workflow**

- The current Deepgram request explicitly sets `diarize: false`, and current
  transcript word/segment types have no `speaker` property. Enable diarization
  for an opt-in mode and map the returned speaker identifier onto every stored
  word and segment.
- Treat `Speaker 0`/`Speaker 1` as placeholders. Let users rename and merge
  speakers in the editor before render; diarization can split the same person
  into multiple IDs.
- For uploaded SRT/VTT, speaker labels are unavailable unless the user adds
  them manually. The UI must make this clear.
- Handle overlapping speech deliberately: choose the dominant speaker or show
  two labels only after a design pass. Do not stack two full caption blocks by
  default.

**Acceptance criteria**

- The card shows a label only when a validated speaker ID exists.
- Speaker colours stay consistent across a job and never become the sole means
  of speaker identification.
- A transcript created without diarization cannot accidentally render fake
  speaker labels.

### 5. Semantic Emphasis — capability layer, not a separate preset

**Purpose:** highlight only meaning-bearing words—such as a price, number,
name, contrast word or key promise—while leaving the rest of a phrase calm. It
can make existing styles feel editorially intentional, but it should be an
opt-in overlay over a base caption style, not another gallery thumbnail.

| Property | Proposed default |
|---|---|
| UI | toggle: `Emphasise key words`; editable selected-word chips in the transcript editor |
| Default effect | apply `accentColor` and weight to selected words; do not add scale/motion by default |
| Base-style support | start with Minimal, Focus Card, CaptionBar and Word Highlight; expand only after visual QA |
| Selection source | deterministic rules or an LLM suggestion, always followed by user review |
| Safe choices | amounts, percentages, dates, proper names, deliberate contrast words |
| Never infer without review | medical, legal, financial claims; emotionally loaded words; facts absent from the transcript |

**Data design**

- Do not identify an emphasized word by matching its text: repeated words make
  that ambiguous. Persist a stable reference such as segment index + word index
  (or introduce durable word IDs) with an optional emphasis colour/type.
- Preserve emphasis data during transcript edits, job retry, preview and worker
  render. If a word is deleted, discard its stale reference safely.
- Suggestions must be bounded: for example, 0-2 emphasized words per segment,
  with no more than one active visual treatment at a time.

**Acceptance criteria**

- The preview and final Lambda render emphasize exactly the same words.
- Manual user edits always override suggestions.
- A job with no emphasis metadata renders exactly as the base style does today.

### 6. Impact Keyword — supersized semantic word

**Purpose:** keep a short phrase readable while making one genuinely important
word dramatically larger. Typical candidates are a number, price, result,
warning, name or punchline. Popular short-form editors expose this as
"Supersize" or per-word sizing because it creates hierarchy without making
every spoken word bounce.

**Evidence classification:** this is strongly established as an editor feature,
and independent eye-tracking/learning research supports the narrower principle
that visually enhanced keywords attract attention. It is **not** independently
proven that supersizing a word increases Reel/TikTok watch time. That outcome
must be A/B tested on Instacap videos.

**Difference from current styles:** `Hype`, `Hormozi`, `Spring` and `Pulse`
animate whichever word is currently spoken. Impact Keyword enlarges only an
editorially selected semantic word and keeps that hierarchy visible for the
whole caption segment. It therefore depends on the Semantic Emphasis capability
described above; implementing it as another active-word scale animation would
be a duplicate.

| Property | Proposed default |
|---|---|
| id / label | `ImpactKeyword` / Impact Keyword |
| Caption unit | 2-5 words; maximum one supersized word per segment |
| Layout | selected word on its own line when space requires it; surrounding words remain 55-70% of its size |
| Text | heavy sans, 850-900 weight, uppercase optional rather than forced |
| Key word | `activeColor` or `accentColor`, 1.35-1.65x base size, strong outline/shadow |
| Supporting words | `textColor`, stable size and position |
| Motion | selected word scales 0.92 -> 1.0 over 4-6 frames when first revealed; no repeated pulsing |
| Position | centre or lower-centre depending on footage; preserve platform safe zones |
| Best footage | finance figures, fitness results, listicles, product claims, punchlines and strong hooks |
| Avoid for | every sentence, long technical terms, sensitive claims not reviewed by the user |

**Selection rules**

- Default to zero or one candidate per segment and no more than 1-2 strong
  supersize moments in a short video. If everything is large, the hierarchy
  disappears.
- Prefer concrete transcript tokens: amounts, percentages, dates, quantities,
  named entities and explicit contrast words.
- An LLM may suggest candidates, but the user must be able to add/remove the
  effect. Never let the model invent replacement wording.
- Keep selection references by durable word ID or segment index + word index;
  never match on raw word text because repeated words are ambiguous.

**Layout algorithm**

1. Measure the complete phrase at the base size.
2. Measure the selected word at the proposed multiplier.
3. Use inline layout only when the complete group remains inside the safe width;
   otherwise put the selected word on a dedicated line.
4. Reduce the multiplier down to 1.25 before reducing the normal caption font.
   If it still overflows, re-chunk the segment.
5. Lock the selected layout for the complete segment so words do not jump when
   the active-word timing advances.

**Acceptance criteria**

- The preview and Lambda output choose the same line break and key-word size.
- A selected 15-character word cannot escape the caption safe area.
- Segments without emphasis metadata render with the ordinary base style.
- Colour, scale and outline together provide sufficient contrast over both
  bright and dark footage.

### 7. Speaker Follow — tracked speech bubble

**Purpose:** place the caption in a compact bubble near the person currently
speaking and move it only when the speaker or shot changes. This reduces the
distance between the text and the relevant face, which is useful for interviews,
podcasts, reaction videos and dialogue-heavy Shorts.

**Evidence classification:** unlike most vendor claims about "viral" styles,
speaker-following subtitles have controlled usability and eye-tracking research
behind them. Studies reported more attention on relevant image regions and
shorter eye movements than fixed bottom subtitles. Those studies support visual
attention and reduced eye strain; they do not prove higher social-media watch
time or conversion.

**Difference from Speaker Card:** Speaker Card adds a `HOST`/`GUEST` label to a
mostly fixed caption position. Speaker Follow spatially associates the text with
the visible speaker and therefore needs video analysis, safe placement and
tracking. It should be a premium/experimental capability rather than bundled
into the first Speaker Card implementation.

| Property | Proposed default |
|---|---|
| id / label | `SpeakerFollow` / Speaker Follow |
| Caption unit | short phrase, 2-5 words, maximum 2 lines |
| Bubble | dark translucent rounded rectangle with a small pointer; no comic balloon cloud |
| Text | white, bold sans, high contrast, optional active-word colour |
| Placement | beside or below the active face, never over eyes or mouth; clamp to video safe area |
| Movement | hold position within a shot; ease to a new anchor over 6-10 frames only on speaker/shot change |
| Fallback | fixed lower-centre Focus Card when tracking confidence is low or the speaker is off-screen |
| Best footage | two-person podcasts, interviews, debates and reaction clips |
| Avoid for | rapid montage, voice-over B-roll, crowded group scenes or videos with no visible speaker |

**Required pipeline**

1. Enable speaker diarization so every caption segment has a speaker identity.
2. Detect faces and shots, then track face boxes through each shot.
3. Determine the active visible speaker by correlating diarized audio with mouth
   movement/active-speaker detection. A face detector alone cannot identify who
   is talking.
4. Store time-ranged normalized anchors (`x`, `y`, confidence, speaker ID) so
   browser preview and Lambda render consume identical tracking output.
5. Run a placement solver that avoids faces, platform UI zones, existing
   graphics and frame edges.
6. Use the fixed-position fallback whenever identity or placement confidence
   drops below an agreed threshold.

**Performance and product risks**

- This requires a separate computer-vision preprocessing job and materially
  increases processing time and infrastructure cost. Do not run it for every
  upload by default.
- Fast cuts, profile faces, masks, off-screen speech and overlapping speakers
  can produce unstable anchors. Smoothing alone cannot correct wrong identity.
- Constantly moving text can increase distraction. Position should remain
  stable inside a shot and change only when necessary.
- User preview needs an override to drag a bubble or choose the fixed fallback.

**Acceptance criteria**

- A bubble never covers the active speaker's eyes or mouth.
- Tracking does not cross-assign a caption when two visible speakers exchange
  turns.
- Low-confidence and off-screen speech always fall back deterministically.
- The bubble remains stable inside a shot with no single-frame jumps.
- Tracking metadata is reusable on retry and does not need to be recomputed for
  every style-only render.

### 8. Progressive Reveal and Whisper — explicit non-additions

**Progressive Reveal:** do not build a new composition. Current `Typewriter`
already reveals whole words when each word starts and keeps the revealed phrase
on-screen. If the cursor makes it feel too typewriter-like, rename the existing
variant in the product or offer a cursor-off setting. Building another preset
with the same mechanics would create catalog clutter.

**Whisper / quiet subtitle:** do not add this as a style yet. The intended
quiet, low-motion, small-type result is already achievable with `Minimal` or
`Fade` plus a saved configuration. Ship it only if actual users repeatedly ask
for an opinionated "documentary" preset; otherwise it is a label, not a new
rendering treatment.

### Recommended delivery order

1. **Karaoke Fill** — self-contained, uses existing word timestamps and offers
   a visibly new mechanic.
2. **Focus Card** — self-contained, useful for business/education content and
   low rendering risk.
3. **Semantic Emphasis** — high product value, but needs data/editor work;
   implement after an edit model exists for word-level metadata.
4. **Impact Keyword** — ship as the first opinionated preset powered by
   Semantic Emphasis, with manual selection available before AI suggestions.
5. **Bilingual Stack** — build as a planned translation feature with user
   review, not as a quick preset.
6. **Speaker Card** — build alongside an explicit diarization/editor project.
7. **Speaker Follow** — keep experimental/premium until tracking accuracy,
   processing cost and fixed-position fallback have been validated.

### Market evidence, independent evidence and rejected additions

No major editor publishes audited counts showing which individual caption
template editors select most often, and no independent study found in this
research directly compares commercial Reel/TikTok presets by watch time. Claims
such as "highest-impact," "viral" or "boosts watch time" on product pages are
vendor guidance, not proof of causation.

What can be stated safely:

- Captions documents 75+ platform-oriented templates and recommends bold,
  high-contrast, short-phrase/word-highlight treatments for TikTok and readable
  highlighted treatments for Shorts. This establishes product adoption and
  workflow convention, not measured performance.
- Captions and VEED both expose semantic/manual per-word emphasis; Captions also
  exposes Supersize. This is evidence that editors expect these controls in a
  serious short-form workflow.
- Submagic groups themes around speakers, trends and emoji, supporting Speaker
  Card and the already-deferred Emoji Pop as recognizable creator use cases.
- Controlled eye-tracking studies show that visual/textual cues direct attention
  and that enhanced keywords can receive more fixation. The strongest safe
  product inference is to emphasize a small number of meaningful words, not to
  animate every element continuously.
- Speaker-following subtitle studies support reduced eye travel and stronger
  association with the relevant speaker. They do not establish social-media
  retention gains.

| Market-common mechanic reviewed | Decision | Reason |
|---|---|---|
| AI emoji next to keywords | keep in existing Emoji Pop backlog | recognizable creator feature, but font/render support and distraction need separate work |
| Per-word GIF, stock image or B-roll | do not call it a caption style | this is a media-overlay/editor feature with asset licensing and moderation concerns |
| Sound effect attached to a keyword | do not call it a caption style | belongs to the audio timeline and needs volume/licensing controls |
| Random caption rotation/movement | do not add globally | `Sticker` already provides controlled rotation; randomness harms consistency and readability |
| Another bold active-word preset | reject | already covered by WordByWord, Hype, Hormozi, Spring and Pulse |
| Platform-specific font recolours | offer saved presets later | configuration packaging, not a new Remotion mechanic |
| Fully kinetic typography scene | out of caption scope | changes the complete edit, pacing and scene layout rather than styling subtitles |

### Measurement and release guardrails

- Do not market any new style as guaranteed to improve engagement. Track style
  selection and, where analytics exist, compare retention/completion/shares
  within comparable video types and durations.
- Test all style changes at 720x1280 and 1280x720, at 24 and 30 fps, with a
  short word, a long word, CJK/Devanagari text, high-contrast footage and a
  user-uploaded SRT/VTT file.
- A composition-only style requires the standard style checklist below, a
  Vercel deployment, and Remotion site redeployment. Bilingual, Speaker Card
  and Semantic Emphasis additionally need model/API/worker tests before they
  can be released.

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

**Obsolete note — do not follow:** the worker bundles these compositions, so shipping a style needs
`npm run build` **and** `pm2 restart all` on the VM (restart clears the cached
Remotion bundle) — not just a Next rebuild. No new deps unless the style pulls a
new font.

**Current deployment:** a style change usually touches both the web picker and
the Remotion bundle. Deploy the web app to Vercel, then redeploy the Remotion
site so Lambda receives the new compositions:

```powershell
npx remotion lambda sites create remotion/Root.tsx --site-name=caption-ai
```

Also rebuild and restart the EC2 worker when a change touches `worker/` or its
dependencies. See `docs/deployment.md` for the complete release sequence.

---

## Sources

### Research report sources

#### Additional editor-treatment research

- Animation modes (including progressive and fill): https://zvid.io/features/subtitles
- Bilingual captions and separate language styling: https://www.capcut.com/resource/caption-style
- Word-specific emphasis guidance: https://support.veed.io/en/articles/12000003-how-to-use-dynamic-subtitles
- Short-form platform style guidance and template catalog: https://captions.ai/help/guides/engagement/caption-styles-by-platform
- Supersize, manual emphasis and AI emoji workflow: https://captions.ai/help/guides/engagement/highlight-keywords
- Captions per-word effects reference: https://help.captions.ai/docs/captions/word-effects
- Captions style controls and transition options: https://help.captions.ai/docs/captions/styles
- Submagic speaker/trend/emoji theme categories: https://care.submagic.co/en/article/what-are-themes-and-themes-categories-1pv8wvz/
- Timestamps, utterances and diarization overview: https://deepgram.com/learn/working-with-timestamps-utterances-and-speaker-diarization-in-deepgram
- Speaker-identification convention: https://cf-public.rev.com/styleguide/caption/Rev%20Captioning%20Style%20Guide%203.2.pdf
- Eye-tracking study of textual/visual cues in short instructional video: https://www.sciencedirect.com/science/article/pii/S0747563220300352
- Eye-tracking research on enhanced captions and highlighted target words: https://benjamins.com/catalog/lllt.61.03fin
- Eye-tracking evaluation of speaker-following subtitles: https://herohuyongtao.github.io/research/publications/eye-tracking-evaluation/paper.pdf
- Speaker-following subtitle usability research: https://arxiv.org/abs/1407.5145

- Word-highlight / karaoke mechanics: https://keyweaver.io/blog/karaoke-captions-after-effects
- Remotion word-highlight implementation overview: https://www.remotionvideo.com/blog/remotion-captions-animated
- Caption animation and customisation patterns: https://zvid.io/features/subtitles
- Retro display-script reference: https://madegooddesigns.com/free-fonts-like-candy-sweets-logos/

- Submagic themes/categories — https://care.submagic.co/en/article/what-are-themes-and-themes-categories-1pv8wvz/
- OpusClip caption presets — https://www.opus.pro/blog/best-caption-presets-styles-boost-retention
- OpusClip text-animation packs — https://www.opus.pro/blog/best-text-animation-packs-captions-titles
- CapCut caption types — https://www.capcut.com/resource/types-of-captions
- VEED dynamic subtitles — https://www.veed.io/tools/auto-subtitle-generator-online/dynamic-subtitles
- Filmora kinetic typography — https://filmora.wondershare.com/video-editing-tips/kinetic-typography.html
- Vexub subtitle styles — https://vexub.com/blog/best-subtitle-styles-social-media
- Blitzcut TikTok caption styles 2026 — https://blitzcutai.com/blog/best-caption-style-tiktok
- VFX AI trending caption styles 2026 — https://www.vfxai.com/blog/trending-caption-styles-for-2026
