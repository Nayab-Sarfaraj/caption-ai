import type { CompositionId } from '@/remotion/compositions/CaptionRoot'

export const STYLES: { id: CompositionId; label: string; desc: string; category: string }[] = [
  { id: 'WordByWord', label: 'Word by Word', desc: 'Active word scales up',            category: 'Highlight' },
  { id: 'Karaoke',   label: 'Karaoke',      desc: 'Words shift color',                 category: 'Highlight' },
  { id: 'Spring',    label: 'Spring',        desc: 'Words spring from below',           category: 'Highlight' },
  { id: 'BoxHighlight', label: 'Box Highlight', desc: 'Captions.ai-style keyword box pop', category: 'Highlight' },
  { id: 'Hype',      label: 'Hype',         desc: 'MrBeast-style bounce + glow',        category: 'Hype' },
  { id: 'Hormozi',   label: 'Hormozi',      desc: 'Yellow-stroke pop-in, Anton font',   category: 'Hype' },
  { id: 'Comic',     label: 'Comic',         desc: 'Cartoon font, keyword color swap',  category: 'Hype' },
  { id: 'Minimal',   label: 'Minimal',      desc: 'Restrained, single-color, no hype',  category: 'Clean' },
  { id: 'Pill',      label: 'Pill',          desc: 'Clean dark pill badge, no hype',     category: 'Clean' },
  { id: 'Fade',      label: 'Fade',          desc: 'Line fades per segment',             category: 'Clean' },
  { id: 'Script',    label: 'Script',        desc: 'Gold italic script accent word',     category: 'Editorial' },
]

export const CATEGORY_ORDER = ['Highlight', 'Hype', 'Clean', 'Editorial']

export const COMPOSITION_IDS = STYLES.map((s) => s.id) as [CompositionId, ...CompositionId[]]

export const FONTS = [
  { label: 'System',       value: 'system-ui, -apple-system, sans-serif' },
  { label: 'Bangers',      value: 'Bangers, "Comic Sans MS", cursive' },
  { label: 'Anton',        value: 'Anton, Impact, sans-serif' },
  { label: 'Montserrat',   value: 'Montserrat, sans-serif' },
  { label: 'Fredoka',      value: 'Fredoka, sans-serif' },
  { label: 'Roboto',       value: 'Roboto, sans-serif' },
  { label: 'Caveat',       value: 'Caveat, cursive' },
  { label: 'Inter',        value: 'Inter, system-ui, sans-serif' },
  { label: 'Impact',       value: 'Impact, "Arial Black", sans-serif' },
  { label: 'Arial Black',  value: '"Arial Black", "Arial Bold", sans-serif' },
  { label: 'Arial',        value: 'Arial, Helvetica, sans-serif' },
  { label: 'Helvetica',    value: '"Helvetica Neue", Helvetica, Arial, sans-serif' },
  { label: 'Verdana',      value: 'Verdana, Geneva, sans-serif' },
  { label: 'Tahoma',       value: 'Tahoma, Geneva, sans-serif' },
  { label: 'Trebuchet',    value: '"Trebuchet MS", sans-serif' },
  { label: 'Franklin',     value: '"Franklin Gothic Medium", "Arial Narrow", sans-serif' },
  { label: 'Century',      value: '"Century Gothic", "Apple Gothic", sans-serif' },
  { label: 'Candara',      value: 'Candara, Calibri, Optima, sans-serif' },
  { label: 'Gill Sans',    value: '"Gill Sans", "Gill Sans MT", Calibri, sans-serif' },
  { label: 'Optima',       value: 'Optima, Segoe, "Segoe UI", sans-serif' },
  { label: 'Georgia',      value: 'Georgia, serif' },
  { label: 'Palatino',     value: 'Palatino, "Palatino Linotype", serif' },
  { label: 'Times',        value: '"Times New Roman", Times, serif' },
  { label: 'Mono',         value: '"Courier New", Courier, monospace' },
  { label: 'Comic',        value: '"Comic Sans MS", "Chalkboard SE", cursive' },
]

export const FONTS_INITIAL = 5

export const FONT_VALUES = FONTS.map((f) => f.value) as [string, ...string[]]

export const HIGHLIGHT_PRESETS = ['#FACC15', '#FFFFFF', '#22C55E', '#3B82F6', '#EF4444', '#EC4899', '#F97316', '#A855F7']
export const TEXT_PRESETS      = ['#FFFFFF', '#000000', '#FACC15', '#A1A1AA', '#6EE7B7', '#93C5FD']
