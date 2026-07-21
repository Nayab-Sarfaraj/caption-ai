# Instacap UI Redesign — Implementation Plan

Reference mockup: `mockup/instacap-redesign.html`
Direction: move from "minimal cream editorial" → **dark cinematic caption studio**. Captions are the product; the UI should feel like the captions.

---

## Problem (why)

- Current UI reads as **dev-tool / newspaper**: cream `#faf9f6` + rust `#c1361f`, tiny 11–15px text, sharp corners, `// comment` eyebrows. Wrong register for a consumer creator tool (competitors veed / captions.ai / opus / submagic are bold, energetic, proof-heavy).
- **Two design systems coexist:** hand-rolled hardcoded-hex cream/rust on every screen **+** orphaned shadcn oklch `components/ui/*` that nothing imports.
- **Radius inconsistency:** sharp containers holding rounded children (`JobCard`, style tiles, progress bars rounded; panels/dropzone/buttons/modal sharp).
- Palette duplicated as literals in every file — no shared tokens (only `--font-cc` is shared).
- Zero social proof, no animated hero — biggest asset (`CaptionStylePreview` = real animated renders) buried in a static grid.

---

## Open decisions (confirm before Phase 1)

1. **Theme strategy** — recommend **A**:
   - **A. Dark-committed marketing + refreshed dashboard.** Landing/marketing = dark cinematic (matches forced-`dark` root). Dashboard kept usable (long work sessions), refreshed to tokens. Tokenized so a light marketing variant is still possible later.
   - B. Dark everywhere (boldest, but dashboard long-session legibility risk).
   - C. Keep light dashboard cream, only redo landing.
2. **Hero caption demo** — recommend **A**:
   - **A. Lightweight CSS/JS caption player** (like the mockup) — cheap, no Remotion bundle on landing, fast LCP.
   - B. Real `@remotion/player` looping a canned demo — pixel-true but heavy (Remotion on landing, ssr:false, slower first paint).
3. **Scope now** — landing only, or landing + full dashboard? Recommend land Phase 1–2 first, review, then Phase 3.

---

## Design foundation (Phase 0)

Single tokenized system in `app/globals.css`. Replace the orphaned oklch block + kill hardcoded hex.

**Palette tokens** (dark ground):
```
--stage #0b0b0a  --panel #141311  --panel-2 #1c1a17  --hair #2a2723
--ink #f7f5f0  --ink-dim #cbc5ba  --muted #948d80  --faint #6a655c
--brand #e0431f  --brand-ink #fff  --brand-soft #e0431f1f
caption pops (from real styles): --pop-yellow #FACC15  --pop-green #34D058
  --pop-cyan #38BDF8  --pop-violet #7C3AED  --pop-lime #A3E635
semantic: --ok #34D058  --warn #F7C204  --err #e0431f  (separate from brand)
```
**Radius scale:** `--r-sm 8 / --r-md 14 / --r-lg 22 / --r-xl 30`. One scale, no more sharp/round mix.
**Type:** Geist (already loaded) as UI/body; **Anton** (already loaded) for display headline accents; Geist Mono for micro-labels/timecodes (keep as the one editorial DNA nod). No new font installs.
**Themes:** define tokens on `:root`, re-map under `@media (prefers-color-scheme)` + `[data-theme]`. Marketing "stage" sections stay dark in both (it's a screen).

Tasks:
- [ ] Rewrite `app/globals.css` token block (palette + radius + semantic), delete unused oklch vars.
- [ ] Add heavy-weight Geist + Anton usage; wire `--font-anton` for display.
- [ ] Decide theme strategy (decision 1) and set root accordingly.

---

## Phase 1 — Landing rebuild (`app/page.tsx`)

Port the mockup to React, section by section. Keep real content + `PRICING_TIERS`.

- [ ] **Nav** — sticky, blur, rounded pill CTA.
- [ ] **Hero** — dark stage, big Anton/Geist-800 H1, rust CTA + ghost CTA, micro-trust line.
- [ ] **Caption player** (decision 2) — new `components/hero-caption-demo.tsx`. Cycle 5 real styles (Hormozi/Hype/Box/Minimal/Karaoke) with word-by-word pop, device frame + REC chrome + timecode + seek. Reuse `STYLE_PREVIEW_META` from `caption-style-preview.tsx` so it stays truthful.
- [ ] **Style marquee** — animated chip row from the 11 styles.
- [ ] **Stat band** — honest product truths (11 styles / 0 credits / 1:1 preview / 7-day delete).
- [ ] **Style gallery** — reuse `CaptionStylePreview`, wrap in rounded tokenized cards, animate on hover.
- [ ] **Why/Bento** — them-vs-Instacap compare widget.
- [ ] **How it works** — 4 steps.
- [ ] **Proof strip** — testimonials (mark placeholder; wire real quotes/ratings at launch — do NOT ship fabricated logos/user counts).
- [ ] **Pricing** — 4 cards from `PRICING_TIERS`, Monthly featured, rounded.
- [ ] **Final CTA + footer.**
- [ ] Keep JSON-LD, `ScrollToHash`, `SupportTrigger`.

DoD: landing matches mockup, LCP < 2.5s, no CLS from the animated hero, reduced-motion honored.

---

## Phase 2 — Shared primitives

Make the tokenized system real so the dashboard can adopt it.

- [ ] `components/ui/button.tsx` — retire oklch, use brand tokens, rounded `--r-md`/pill variants. Adopt on landing + swap raw `<button>`s.
- [ ] `components/ui/card.tsx` — tokenized, `--r-lg`, panel bg.
- [ ] `components/ui/badge.tsx` — status pill (ok/warn/err semantic).
- [ ] Eyebrow, section-head, stat, chip as small shared components (used by landing + dashboard).

---

## Phase 3 — Dashboard / app screens

Refresh to tokens + rounded, keep density (it's a tool). Per audit, these all use hardcoded cream/rust hex.

- [ ] `app/dashboard/layout.tsx` — token bg, theme per decision 1.
- [ ] `components/sidebar.tsx` + `components/mobile-header.tsx` — tokenized, rounded active states, brand upgrade button.
- [ ] `components/upload-dropzone.tsx` — rounded dropzone, tokenized, keep style-tile picker (already the good part).
- [ ] `components/jobs-table.tsx` — unify list + card radius, status pills semantic.
- [ ] `app/dashboard/{page,jobs,billing,usage,settings}.tsx` — token panels, rounded, keep eyebrow→heading system but bump contrast.
- [ ] `components/paywall-modal.tsx` — rounded modal, tokenized, reads `PRICING_TIERS`.
- [ ] `app/dashboard/usage` StatCard + progress → tokenized, semantic colors.

DoD: no hardcoded `#c1361f`/`#14120f1f`/`#faf9f6` literals remain (grep clean); one radius scale; one palette source.

---

## Phase 4 — Polish

- [ ] Motion pass: hero + marquee + hover reveals; `prefers-reduced-motion` global guard.
- [ ] Responsive audit (mobile hero, gallery, pricing wrap).
- [ ] A11y: focus-visible on all interactive, contrast check both themes, aria on decorative motion.
- [ ] Update `app/opengraph-image.tsx` + `app/icon.tsx` to new look.
- [ ] Lighthouse pass (perf/a11y/SEO).

---

## Sequencing

1. Phase 0 (tokens) — unblocks everything, ~half day.
2. Phase 1 (landing) — highest visible impact, what stakeholder saw. Ship + review.
3. Phase 2 (primitives) — small, enables Phase 3.
4. Phase 3 (dashboard) — largest surface, do after landing sign-off.
5. Phase 4 (polish) — continuous.

## Risks / gotchas

- Root `<html>` is hardcoded `dark` — landing currently overrides with cream inline; removing that cleanly is part of Phase 0/1.
- Don't fabricate social proof (logos/user counts) — placeholder-marked until real.
- `@remotion/player` in hero (decision 2B) bundles Remotion on the marketing route — measure before committing.
- `PRICING_TIERS` is single source — never re-hardcode prices in the new markup.
- Every dashboard file re-types the same hex — grep-sweep, don't hand-miss any (`#c1361f`, `#14120f1f`, `#a39e96`, `#1a1917`, `#faf9f6`, `#6b6862`).
- Keep transcription/render/billing logic untouched — this is presentation only.
