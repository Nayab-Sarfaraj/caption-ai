"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Player } from "@remotion/player";
import { CaptionRoot } from "@/remotion/compositions/CaptionRoot";
import type { CompositionId } from "@/remotion/compositions/CaptionRoot";
import { CaptionStylePreview } from "@/components/caption-style-preview";
import { ColorSwatch } from "@/components/color-swatch";
import { PaywallModal } from "@/components/paywall-modal";
import {
  STYLES,
  CATEGORY_ORDER,
  FONTS,
  FONTS_INITIAL,
  HIGHLIGHT_PRESETS,
  TEXT_PRESETS,
} from "@/src/helpers/style-options";
import type { Transcript } from "@/src/types/transcript.types";

interface PreviewPlayerProps {
  jobId: string;
  videoSrc: string;
  transcript: Transcript;
  durationInFrames: number;
  width?: number;
  height?: number;
  filename: string;
  statusLabel: string;
  statusColor: string;
  transcriptSource?: string;
  createdAt?: string;
  isPaid: boolean;
  rendersRemaining: number; // 0 when isPaid — unlimited stops being a meaningful count
  initialNewsHeadline?: string;
  initialNewsCategory?: string;
}

interface StyleSettings {
  activeColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
  fontSizeMultiplier: number;
  posX: number; // caption horizontal position, 0–100 % of frame (50 = center)
  posY: number; // caption vertical position, 0–100 % of frame (82 = lower third)
}

type SettingsMap = Record<CompositionId, StyleSettings>;

const DEFAULT: StyleSettings = {
  activeColor: "#FACC15",
  textColor: "#FFFFFF",
  accentColor: "#A3E635",
  fontFamily: FONTS[0].value,
  fontSizeMultiplier: 1.0,
  posX: 50,
  posY: 82,
};

const INITIAL_SETTINGS: SettingsMap = {
  WordHighlight: { ...DEFAULT, activeColor: '#FFD329', fontFamily: 'Anton, Impact, sans-serif', posY: 76 },
  KaraokeFill: { ...DEFAULT, activeColor: '#FFD60A', fontFamily: 'Montserrat, sans-serif', posY: 76 },
  FocusCard: { ...DEFAULT, activeColor: '#FACC15', fontFamily: 'Montserrat, sans-serif', posY: 72 },
  ComicStrip: { ...DEFAULT, activeColor: '#F05268', textColor: '#FFF4C7', fontFamily: 'Bangers, "Comic Sans MS", cursive', posY: 70 },
  SoftCandy: { ...DEFAULT, activeColor: '#D63D61', textColor: '#34231F', fontFamily: 'Montserrat, sans-serif', posY: 66 },
  RetroScript: { ...DEFAULT, activeColor: '#FF9A3E', textColor: '#FFE08A', fontFamily: 'Lobster, cursive', posY: 72 },
  WordByWord: { ...DEFAULT },
  Karaoke: { ...DEFAULT },
  Fade: { ...DEFAULT },
  Spring: { ...DEFAULT },
  Hype: {
    ...DEFAULT,
    activeColor: "#22C55E",
    textColor: "#FFFFFF",
    fontFamily: 'Bangers, "Comic Sans MS", cursive',
  },
  Hormozi: {
    ...DEFAULT,
    activeColor: "#F7C204",
    textColor: "#FFFFFF",
    fontFamily: "Anton, Impact, sans-serif",
  },
  Minimal: {
    ...DEFAULT,
    activeColor: "#FFFFFF",
    textColor: "#FFFFFF",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  BoxHighlight: {
    ...DEFAULT,
    activeColor: "#7C3AED",
    textColor: "#FFFFFF",
    accentColor: "#A3E635",
    fontFamily: "Montserrat, sans-serif",
  },
  Comic: {
    ...DEFAULT,
    activeColor: "#38BDF8",
    textColor: "#FFFFFF",
    fontFamily: "Fredoka, sans-serif",
  },
  Pill: {
    ...DEFAULT,
    activeColor: "#1F2937",
    textColor: "#FFFFFF",
    fontFamily: "Roboto, sans-serif",
  },
  Script: {
    ...DEFAULT,
    activeColor: "#FBBF24",
    textColor: "#FFFFFF",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  SingleWord: {
    ...DEFAULT,
    activeColor: "#FACC15",
    textColor: "#FFFFFF",
    fontFamily: "Anton, Impact, sans-serif",
  },
  Typewriter: {
    ...DEFAULT,
    activeColor: "#FACC15",
    textColor: "#FFFFFF",
    fontFamily: '"Courier New", Courier, monospace',
  },
  NeonGlow: {
    ...DEFAULT,
    activeColor: "#22D3EE",
    textColor: "#FFFFFF",
    fontFamily: "Montserrat, sans-serif",
  },
  CaptionBar: {
    ...DEFAULT,
    activeColor: "#FACC15",
    textColor: "#FFFFFF",
    fontFamily: "Montserrat, sans-serif",
  },
  Gradient: {
    ...DEFAULT,
    activeColor: "#A855F7",
    textColor: "#F9A8D4",
    fontFamily: "Montserrat, sans-serif",
  },
  Highlighter: {
    ...DEFAULT,
    activeColor: "#FDE047",
    textColor: "#FFFFFF",
    fontFamily: "Montserrat, sans-serif",
  },
  Underline: {
    ...DEFAULT,
    activeColor: "#38BDF8",
    textColor: "#FFFFFF",
    fontFamily: "Montserrat, sans-serif",
  },
  Glide: {
    ...DEFAULT,
    activeColor: "#FACC15",
    textColor: "#FFFFFF",
    fontFamily: "Montserrat, sans-serif",
  },
  Outline: {
    ...DEFAULT,
    activeColor: "#FACC15",
    textColor: "#FFFFFF",
    fontFamily: "Anton, Impact, sans-serif",
  },
  Meme: {
    ...DEFAULT,
    activeColor: "#FFFFFF",
    textColor: "#FFFFFF",
    fontFamily: 'Impact, "Arial Black", sans-serif',
    posY: 15,
  },
  Pulse: { ...DEFAULT, activeColor: "#F43F5E", fontFamily: "Montserrat, sans-serif" },
  Sticker: { ...DEFAULT, activeColor: "#22C55E", fontFamily: "Fredoka, sans-serif" },
  Glitch: { ...DEFAULT, activeColor: "#FFFFFF", fontFamily: "Anton, Impact, sans-serif" },
  Wave: { ...DEFAULT, activeColor: "#A855F7", fontFamily: "Fredoka, sans-serif" },
  Handwritten: { ...DEFAULT, activeColor: "#FACC15", fontFamily: "Inter, system-ui, sans-serif" },
  NewsBar: { ...DEFAULT, activeColor: "#DC2626", fontFamily: "Montserrat, sans-serif", posY: 62 },
};

export function PreviewPlayer({
  jobId,
  videoSrc,
  transcript,
  durationInFrames,
  width = 1920,
  height = 1080,
  filename,
  statusLabel,
  statusColor,
  transcriptSource,
  createdAt,
  isPaid,
  rendersRemaining,
  initialNewsHeadline,
  initialNewsCategory,
}: PreviewPlayerProps) {
  const router = useRouter();
  const [style, setStyle] = useState<CompositionId>("WordByWord");
  const [settings, setSettings] = useState<SettingsMap>(INITIAL_SETTINGS);
  const [view, setView] = useState<"styles" | "appearance" | "fonts">("styles");
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [isSwitchingStyle, setIsSwitchingStyle] = useState(false);
  const [newsHeadline, setNewsHeadline] = useState(initialNewsHeadline ?? "");
  const [newsCategory, setNewsCategory] = useState(initialNewsCategory ?? "");
  const [suggestingHeadline, setSuggestingHeadline] = useState(false);

  const handleStyleChange = useCallback((newStyle: CompositionId) => {
    if (newStyle === style) return;
    setIsSwitchingStyle(true);
    setStyle(newStyle);
    setTimeout(() => {
      setIsSwitchingStyle(false);
    }, 180);
  }, [style]);

  const cur = settings[style];
  // Mirrors billing.service.ts's canRender — this render, if triggered now,
  // would come back watermarked (still allowed) or blocked outright.
  const willWatermark = !isPaid && rendersRemaining > 0;
  const blocked = !isPaid && rendersRemaining <= 0;

  const update = useCallback(
    <K extends keyof StyleSettings>(key: K, value: StyleSettings[K]) => {
      setSettings((prev) => ({
        ...prev,
        [style]: { ...prev[style], [key]: value },
      }));
    },
    [style],
  );

  // Restore the current style's colors, font, size and position to its defaults.
  const resetStyle = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      [style]: { ...INITIAL_SETTINGS[style] },
    }));
  }, [style]);

  const inputProps = useMemo(
    () => ({
      style,
      transcript,
      videoSrc,
      activeColor: cur.activeColor,
      textColor: cur.textColor,
      accentColor: cur.accentColor,
      fontFamily: cur.fontFamily,
      fontSizeMultiplier: cur.fontSizeMultiplier,
      posX: cur.posX,
      posY: cur.posY,
      watermark: willWatermark,
      newsHeadline: newsHeadline.trim() || undefined,
      newsCategory: newsCategory.trim() || undefined,
    }),
    [style, transcript, videoSrc, cur, willWatermark, newsHeadline, newsCategory],
  );

  const suggestNewsHeadline = useCallback(async () => {
    setSuggestingHeadline(true);
    setError(null);
    try {
      const response = await fetch(`/api/jobs/${jobId}/news-headline`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not generate a headline suggestion");
      setNewsHeadline(data.headline);
      setNewsCategory(data.category);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate a headline suggestion");
    } finally {
      setSuggestingHeadline(false);
    }
  }, [jobId]);

  const runExport = useCallback(async () => {
    const trimmedHeadline = newsHeadline.trim();
    const trimmedCategory = newsCategory.trim();
    if (style === "NewsBar" && (!trimmedHeadline || !trimmedCategory)) {
      setError("News Bar needs both a category and a headline before export.");
      return;
    }

    setExporting(true);
    setError(null);
    try {
      const res = await fetch(`/api/jobs/${jobId}/render`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          compositionId: style,
          activeColor: cur.activeColor,
          textColor: cur.textColor,
          accentColor: cur.accentColor,
          fontFamily: cur.fontFamily,
          fontSizeMultiplier: cur.fontSizeMultiplier,
          posX: cur.posX,
          posY: cur.posY,
          newsHeadline: style === "NewsBar" ? trimmedHeadline : undefined,
          newsCategory: style === "NewsBar" ? trimmedCategory : undefined,
        }),
      });
      if (!res.ok) {
        if (res.status === 402) {
          setShowPaywall(true);
          setExporting(false);
          return;
        }
        const data = await res.json();
        throw new Error(data.error ?? "Export failed");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
      setExporting(false);
    }
  }, [jobId, style, cur, router, newsHeadline, newsCategory]);

  const handleExportClick = useCallback(() => {
    if (!isPaid && blocked) {
      setShowPaywall(true);
    } else {
      runExport();
    }
  }, [blocked, isPaid, runExport]);

  const playerContainerRef = useRef<HTMLDivElement>(null);
  const [playerSize, setPlayerSize] = useState({ width: 0, height: 0 });

  // Remotion's <Player> isn't a native replaced element — it doesn't do the
  // browser's built-in "auto width/height + aspect-ratio + max-*" sizing the
  // way a plain <video> does (that resolved to 0×0 and the player vanished).
  // Compute real pixel dimensions instead: fill the container width, but cap
  // height at 75% of viewport so a portrait (9:16) video doesn't blow up past
  // the screen — recompute on container/window resize.
  const desktopContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ratio = width / height;

    const compute = () => {
      const el = playerContainerRef.current || desktopContainerRef.current;
      if (!el) return;
      const containerWidth = el.clientWidth || el.getBoundingClientRect().width || (window.innerWidth < 1024 ? window.innerWidth - 32 : 600);
      if (!containerWidth) return;

      const isMobile = window.innerWidth < 1024;
      const maxHeight = window.innerHeight * (isMobile ? 0.55 : 0.75);

      let w = containerWidth;
      let h = w / ratio;
      if (h > maxHeight) {
        h = maxHeight;
        w = h * ratio;
      }
      setPlayerSize({ width: Math.floor(w), height: Math.floor(h) });
    };

    compute();
    const timer = setTimeout(compute, 100);
    const timer2 = setTimeout(compute, 500);

    const el = playerContainerRef.current || desktopContainerRef.current;
    let ro: ResizeObserver | null = null;
    if (el) {
      ro = new ResizeObserver(compute);
      ro.observe(el);
    }
    window.addEventListener("resize", compute);
    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
      if (ro) ro.disconnect();
      window.removeEventListener("resize", compute);
    };
  }, [width, height]);

  const stylePanelContent = (
    <>
      {view === "appearance" && (
        <>
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setView("styles")}
                className="flex items-center gap-1 text-xs text-[var(--ink-dim)] hover:text-[var(--ink)] transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                Back
              </button>
              <p className="text-[11px] tracking-[0.15em] uppercase text-[var(--mute)]">
                {STYLES.find((s) => s.id === style)?.label}
              </p>
            </div>
            <button
              type="button"
              onClick={resetStyle}
              className="flex items-center gap-1 text-[10px] text-[var(--mute)] hover:text-[var(--brand)] rounded-md border border-[var(--hair)] px-2 py-1 transition-colors"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>
              Reset
            </button>
          </div>
          <ColorSwatch
            label={style === "BoxHighlight" ? "Box" : style === "Pill" ? "Pill Background" : "Highlight"}
            value={cur.activeColor}
            onChange={(v) => update("activeColor", v)}
            presets={HIGHLIGHT_PRESETS}
          />
          <ColorSwatch label="Text" value={cur.textColor} onChange={(v) => update("textColor", v)} presets={TEXT_PRESETS} />
          {style === "BoxHighlight" && (
            <ColorSwatch label="Accent" value={cur.accentColor} onChange={(v) => update("accentColor", v)} presets={HIGHLIGHT_PRESETS} />
          )}
          {style === "NewsBar" && (
            <div className="mt-4 space-y-2.5 rounded-xl border border-[var(--hair)] p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-[var(--mute)]">Lower-third text</p>
                <button type="button" onClick={suggestNewsHeadline} disabled={suggestingHeadline} className="text-[10px] font-medium text-[var(--brand)] hover:brightness-110 disabled:opacity-50">
                  {suggestingHeadline ? "Suggesting..." : "Suggest with AI"}
                </button>
              </div>
              <input value={newsCategory} onChange={(event) => setNewsCategory(event.target.value.slice(0, 24))} maxLength={24} placeholder="Category (e.g. TECH UPDATE)" className="w-full rounded-lg border border-[var(--hair)] bg-[var(--bg)] px-2.5 py-2 text-xs text-[var(--ink)] outline-none focus:border-[var(--brand)]" />
              <input value={newsHeadline} onChange={(event) => setNewsHeadline(event.target.value.slice(0, 70))} maxLength={70} placeholder="Headline" className="w-full rounded-lg border border-[var(--hair)] bg-[var(--bg)] px-2.5 py-2 text-xs text-[var(--ink)] outline-none focus:border-[var(--brand)]" />
              <p className="text-[10px] text-[var(--mute)]">Both fields are required for News Bar. You can edit the AI suggestion or type them yourself.</p>
            </div>
          )}
          <div className="space-y-2 mt-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-[var(--mute)]">Font</p>
              <button type="button" onClick={() => setView("fonts")} className="flex items-center gap-0.5 text-[10px] text-[var(--mute)] hover:text-[var(--ink-dim)] transition-colors">
                More
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {FONTS.slice(0, FONTS_INITIAL).map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => update("fontFamily", f.value)}
                  className={["px-2.5 py-1 rounded-lg border text-xs transition-all", cur.fontFamily === f.value ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--ink)]" : "border-[var(--hair)] text-[var(--ink-dim)] hover:border-[var(--faint)] hover:text-[var(--ink)]"].join(" ")}
                  style={{ fontFamily: f.value }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2 mt-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-[var(--mute)]">Size</p>
              <p className="text-xs text-[var(--ink-dim)] tabular-nums">{cur.fontSizeMultiplier.toFixed(2)}×</p>
            </div>
            <input type="range" min={0.5} max={2.0} step={0.05} value={cur.fontSizeMultiplier} onChange={(e) => update("fontSizeMultiplier", parseFloat(e.target.value))} className="w-full accent-[var(--brand)] cursor-pointer" />
            <div className="flex justify-between text-[10px] text-[var(--mute)]"><span>Small</span><span>Large</span></div>
          </div>
          <div className="space-y-2.5 mt-4">
            <p className="text-xs text-[var(--mute)]">Position</p>
            <div className="space-y-1">
              <input type="range" min={0} max={100} step={1} value={cur.posY} onChange={(e) => update("posY", parseInt(e.target.value, 10))} className="w-full accent-[var(--brand)] cursor-pointer" aria-label="Vertical position" />
              <div className="flex justify-between text-[10px] text-[var(--mute)]"><span>Top</span><span>Bottom</span></div>
            </div>
            <div className="space-y-1">
              <input type="range" min={0} max={100} step={1} value={cur.posX} onChange={(e) => update("posX", parseInt(e.target.value, 10))} className="w-full accent-[var(--brand)] cursor-pointer" aria-label="Horizontal position" />
              <div className="flex justify-between text-[10px] text-[var(--mute)]"><span>Left</span><span>Right</span></div>
            </div>
          </div>
        </>
      )}

      {view === "fonts" && (
        <>
          <div className="flex items-center gap-2 mb-4">
            <button type="button" onClick={() => setView("appearance")} className="flex items-center gap-1 text-xs text-[var(--ink-dim)] hover:text-[var(--ink)] transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
              Back
            </button>
            <p className="text-[11px] tracking-[0.15em] uppercase text-[var(--mute)]">Font Family</p>
          </div>
          <div className="overflow-y-auto max-h-64 pr-0.5">
            <div className="grid grid-cols-2 gap-2">
              {FONTS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => update("fontFamily", f.value)}
                  className={["rounded-lg border p-3 text-left transition-all space-y-1", cur.fontFamily === f.value ? "border-[var(--brand)] bg-[var(--brand-soft)]" : "border-[var(--hair)] hover:border-[var(--faint)]"].join(" ")}
                >
                  <p className="text-lg leading-none text-[var(--ink)]" style={{ fontFamily: f.value }}>Aa</p>
                  <p className="text-[10px] text-[var(--mute)]">{f.label}</p>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );

  const exportBar = (
    <>
      {!isPaid && (
        <p className="text-xs text-[var(--mute)] text-center">
          {willWatermark
            ? `${rendersRemaining} free render${rendersRemaining === 1 ? "" : "s"} left · watermarked`
            : "Free limit reached this month"}
        </p>
      )}
      {error && <p className="text-xs text-[var(--brand)] text-center">{error}</p>}
      <button
        type="button"
        onClick={handleExportClick}
        disabled={exporting}
        className="w-full rounded-lg bg-[var(--brand)] text-white text-sm font-bold py-3 hover:brightness-[1.08] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {exporting ? "Starting export…" : blocked ? "Upgrade to export" : `Export · ${STYLES.find((s) => s.id === style)?.label ?? style}`}
      </button>
    </>
  );

  return (
    <>
      {showPaywall && (
        <PaywallModal
          onClose={() => setShowPaywall(false)}
          onContinueFree={!blocked ? () => { setShowPaywall(false); runExport(); } : undefined}
          blockedMessage={blocked ? "Free render limit reached this month — upgrade for unlimited, watermark-free exports." : undefined}
        />
      )}

      {/* ─── MOBILE LAYOUT (< lg) ─── */}
      <div className="flex flex-col lg:hidden w-full pb-[80px]">
        {/* Zone 1: Player */}
        <div
          ref={playerContainerRef}
          className="relative w-full overflow-hidden bg-black flex items-center justify-center"
          style={{ minHeight: 240 }}
        >
          {playerSize.width > 0 ? (
            <Player
              component={CaptionRoot as unknown as React.FC<Record<string, unknown>>}
              inputProps={inputProps as unknown as Record<string, unknown>}
              durationInFrames={durationInFrames}
              compositionWidth={width}
              compositionHeight={height}
              fps={30}
              style={{ width: playerSize.width, height: playerSize.height }}
              controls
              clickToPlay
              showVolumeControls
            />
          ) : (
            <div className="w-full flex items-center justify-center text-xs text-[var(--mute)]" style={{ height: 260 }}>
              Loading preview…
            </div>
          )}

          {/* Smooth overlay spinner during style transitions */}
          {isSwitchingStyle && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2 z-20 transition-opacity">
              <div className="w-6 h-6 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin" />
              <span className="text-[11px] font-medium text-white/90">Updating style…</span>
            </div>
          )}
        </div>

        {/* Zone 2: Horizontal style rail */}
        <div className="w-full bg-[var(--panel)] border-t border-[var(--hair)]">
          {/* Job info strip */}
          <div className="flex items-center justify-between px-4 pt-3 pb-2 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: statusColor }} />
              <p className="text-xs text-[var(--ink)] truncate font-medium">{filename}</p>
            </div>
            {/* Customize button → opens bottom sheet */}
            <button
              type="button"
              onClick={() => { setView("appearance"); setMobileSheetOpen(true); }}
              className="shrink-0 flex items-center gap-1.5 text-xs font-medium text-[var(--ink)] rounded-lg border border-[var(--hair)] px-2.5 py-1.5 hover:border-[var(--brand)] hover:text-[var(--brand)] transition-colors"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
              Customize
            </button>
          </div>

          {/* Horizontal scroll rail of style cards */}
          <div className="flex gap-2.5 overflow-x-auto px-4 pt-2 pb-3 scroll-smooth" style={{ scrollbarWidth: 'none' }}>
            {STYLES.map((s) => {
              const active = style === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleStyleChange(s.id)}
                  className="shrink-0 flex flex-col items-center gap-1.5 focus:outline-none"
                  style={{ width: 104 }}
                >
                  <div
                    className={[
                      "relative w-full overflow-hidden rounded-xl transition-all aspect-[4/3]",
                      active ? "ring-2 ring-[var(--brand)] shadow-[0_0_12px_color-mix(in_srgb,var(--brand)_50%,transparent)]" : "ring-1 ring-[var(--hair)]",
                    ].join(" ")}
                  >
                    <div className="absolute inset-0 flex items-center justify-center [&>div]:w-full [&>div]:h-full [&>div]:min-h-0 [&>div]:flex [&>div]:items-center [&>div]:justify-center [&>div>div]:py-2 [&>div>div]:px-1 [&>div>div]:min-h-0">
                      <CaptionStylePreview id={s.id} />
                    </div>
                    {active && (
                      <span className="absolute top-1.5 left-1.5 w-4 h-4 rounded-full bg-[var(--brand)] flex items-center justify-center z-10">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                      </span>
                    )}
                  </div>
                  <p className={["text-[10px] font-medium leading-tight text-center truncate w-full", active ? "text-[var(--brand)]" : "text-[var(--mute)]"].join(" ")}>
                    {s.label}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Zone 3: Sticky export bar — solid background + blur so content never bleeds through */}
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--hair)] px-4 py-3 space-y-1.5" style={{ background: 'var(--bg)', backdropFilter: 'none' }}>
          {exportBar}
        </div>

        {/* Slide-up customization bottom sheet */}
        {mobileSheetOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileSheetOpen(false)}
            />
            {/* Sheet */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--panel)] border-t border-[var(--hair)] rounded-t-2xl max-h-[75vh] flex flex-col" style={{ animation: 'slideUp 0.25s cubic-bezier(0.32, 0.72, 0, 1)' }}>
              {/* Sheet handle + header */}
              <div className="flex items-center justify-between px-5 pt-4 pb-3 shrink-0">
                <div className="w-8 h-1 rounded-full bg-[var(--hair)] mx-auto absolute left-1/2 -translate-x-1/2 top-2.5" />
                <p className="text-sm font-semibold text-[var(--ink)]">
                  {view === "fonts" ? "Font Family" : `Edit · ${STYLES.find((s) => s.id === style)?.label ?? style}`}
                </p>
                <button type="button" onClick={() => setMobileSheetOpen(false)} className="text-[var(--mute)] hover:text-[var(--ink)] transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                </button>
              </div>
              {/* Sheet content */}
              <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-4">
                {stylePanelContent}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ─── DESKTOP LAYOUT (lg+) ─── */}
      <div className="hidden lg:flex flex-row gap-5 items-start w-full">
        {/* Left: player */}
        <div
          ref={desktopContainerRef}
          className="relative flex-1 min-w-0 min-h-[320px] overflow-hidden rounded-2xl border border-[var(--hair)] bg-black flex items-center justify-center p-2"
        >
          {playerSize.width > 0 ? (
            <Player
              component={CaptionRoot as unknown as React.FC<Record<string, unknown>>}
              inputProps={inputProps as unknown as Record<string, unknown>}
              durationInFrames={durationInFrames}
              compositionWidth={width}
              compositionHeight={height}
              fps={30}
              style={{ width: playerSize.width, height: playerSize.height }}
              controls
              clickToPlay
              showVolumeControls
            />
          ) : (
            <div className="w-full aspect-[9/16] max-h-[55vh] flex items-center justify-center text-xs text-[var(--mute)]">
              Loading preview...
            </div>
          )}

          {/* Smooth overlay spinner during style transitions */}
          {isSwitchingStyle && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2 z-20 transition-opacity">
              <div className="w-6 h-6 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin" />
              <span className="text-[11px] font-medium text-white/90">Updating style…</span>
            </div>
          )}
        </div>

        {/* Right: info + controls sidebar */}
        <div className="w-80 shrink-0 rounded-2xl border border-[var(--hair)] bg-[var(--panel)] flex flex-col sticky top-6 max-h-[calc(100vh-6rem)]">
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Job info */}
            <div className="space-y-1.5">
              <h1 className="text-sm font-bold text-[var(--ink)] truncate">{filename}</h1>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: statusColor }} />
                <span className="text-sm" style={{ color: statusColor }}>{statusLabel}</span>
              </div>
            </div>

            {transcriptSource && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--mute)]">Transcript</span>
                <span className="text-[var(--ink-dim)] text-xs">{transcriptSource === "user" ? "Uploaded SRT/VTT" : "AI · Deepgram"}</span>
              </div>
            )}
            {createdAt && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--mute)]">Created</span>
                <span className="text-[var(--ink-dim)] text-xs">{createdAt}</span>
              </div>
            )}

            <div className="border-t border-[var(--hair)]" />

            {view === "styles" && (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] tracking-[0.15em] uppercase text-[var(--mute)]">Caption Style</p>
                  <button
                    type="button"
                    onClick={() => setView("appearance")}
                    className="flex items-center gap-1.5 text-xs font-medium text-[var(--ink)] rounded-lg border border-[var(--hair)] px-2.5 py-1 hover:border-[var(--brand)] hover:text-[var(--brand)] transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                    Edit colors & font
                  </button>
                </div>
                <div className="space-y-4 pr-0.5">
                  {CATEGORY_ORDER.map((cat) => (
                    <div key={cat} className="space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--ink)]">{cat}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {STYLES.filter((s) => s.category === cat).map((s) => {
                          const active = style === s.id;
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => handleStyleChange(s.id)}
                              className={["relative text-left transition-all overflow-hidden rounded-xl", active ? "ring-2 ring-inset ring-[var(--brand)]" : "ring-1 ring-inset ring-[var(--hair)] hover:ring-[var(--faint)]"].join(" ")}
                            >
                              <CaptionStylePreview id={s.id} />
                              {active && (
                                <span className="absolute top-1.5 left-1.5 w-4 h-4 rounded-full bg-[var(--brand)] flex items-center justify-center">
                                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                                </span>
                              )}
                              <div className="px-2.5 py-2 bg-[var(--panel)]">
                                <p className="text-xs text-[var(--ink)] font-medium">{s.label}</p>
                                <p className="text-[10px] text-[var(--mute)] leading-tight mt-0.5">{s.desc}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {(view === "appearance" || view === "fonts") && stylePanelContent}
          </div>

          <div className="shrink-0 border-t border-[var(--hair)] p-5 pt-4 space-y-3">
            {exportBar}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
