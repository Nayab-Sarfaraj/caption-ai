import type { CompositionId } from '@/remotion/compositions/CaptionRoot'

export interface StyleSeoMeta {
  slug: string
  compositionId: CompositionId
  title: string
  h1: string
  metaDescription: string
  searchIntentKeywords: string[]
  tagline: string
  description: string
  useCases: string[]
  faqs: Array<{ q: string; a: string }>
}

export const STYLE_SEO_MAP: Record<string, StyleSeoMeta> = {
  hormozi: {
    slug: 'hormozi',
    compositionId: 'Hormozi',
    title: 'Alex Hormozi Subtitle Generator — Free Animated Captions | Instacap',
    h1: 'Alex Hormozi Style Caption Generator',
    metaDescription:
      'Generate high-retention Alex Hormozi style subtitles with bold yellow pop-in text & black outlines for Instagram Reels, TikTok, and YouTube Shorts.',
    searchIntentKeywords: [
      'alex hormozi subtitles generator',
      'hormozi caption style',
      'alex hormozi yellow captions',
      'hormozi text animation reels',
    ],
    tagline: 'Bold yellow pop-in captions engineered for maximum short-form retention.',
    description:
      'Inspired by Alex Hormozi’s viral content strategy, this style uses high-impact Anton typography with yellow keyword highlights and heavy black strokes to capture viewer attention instantly.',
    useCases: [
      'Instagram Reels & TikTok talking-head videos',
      'Business & marketing advice clips',
      'Podcast highlight shorts',
    ],
    faqs: [
      {
        q: 'What is the Alex Hormozi caption style?',
        a: 'The Hormozi caption style uses bold all-caps typography with bright yellow highlighting on key spoken words and heavy dark outlines to ensure 100% legibility on mobile screens.',
      },
      {
        q: 'How does Instacap generate Hormozi style captions?',
        a: 'Instacap uses Deepgram AI to transcribe your audio with millisecond accuracy, automatically applying Hormozi font styling, word pops, and yellow keyword accents.',
      },
    ],
  },
  hype: {
    slug: 'hype',
    compositionId: 'Hype',
    title: 'MrBeast Style Caption Generator — High Energy Subtitles | Instacap',
    h1: 'MrBeast / Hype Style Caption Generator',
    metaDescription:
      'Create high-energy MrBeast style kinetic captions with dynamic bounce & vibrant color pops. Perfect for YouTube Shorts, Reels, and TikTok clips.',
    searchIntentKeywords: [
      'mrbeast subtitle generator',
      'hype caption generator',
      'bangers font captions',
      'high energy animated captions',
    ],
    tagline: 'Kinetic bounce and vibrant pop animations that maximize watch time.',
    description:
      'Modeled after top YouTube creators like MrBeast, the Hype style delivers comic-book energy with kinetic scale animations and intense multi-color accents.',
    useCases: [
      'Gaming & challenge clips',
      'Fast-paced YouTube Shorts',
      'Vlog highlights & reaction videos',
    ],
    faqs: [
      {
        q: 'Why use MrBeast style subtitles?',
        a: 'High-energy kinetic captions keep viewers engaged during fast transitions, increasing video retention rates on YouTube Shorts and TikTok.',
      },
      {
        q: 'Can I edit the text and colors?',
        a: 'Yes, Instacap allows full customization of active colors, text colors, and positioning for all Hype style captions.',
      },
    ],
  },
  karaoke: {
    slug: 'karaoke',
    compositionId: 'Karaoke',
    title: 'Karaoke Style Video Caption Generator | Instacap',
    h1: 'Karaoke Style Word Highlight Subtitles',
    metaDescription:
      'Generate smooth karaoke-style captions where words seamlessly change color as spoken. Boost engagement on Instagram Reels & TikTok.',
    searchIntentKeywords: [
      'karaoke video caption generator',
      'word highlight subtitles',
      'sing-along text generator',
      'realtime word highlight captions',
    ],
    tagline: 'Smooth, continuous word-by-word color transitions as you speak.',
    description:
      'The Karaoke caption style highlights each individual word in real time as it is spoken in the video, providing a satisfying visual flow.',
    useCases: ['Voiceover commentary', 'Educational tutorials', 'Lyrics & music videos'],
    faqs: [
      {
        q: 'How does karaoke captioning work?',
        a: 'Words remain a base color and instantly shift to a vibrant highlight color exact to the audio timestamp.',
      },
    ],
  },
  'single-word': {
    slug: 'single-word',
    compositionId: 'SingleWord',
    title: 'Single Word Caption Generator — Punchy Animated Subtitles | Instacap',
    h1: 'Single Word Animated Caption Generator',
    metaDescription:
      'Display one giant punchy word at a time for ultra-fast short-form video retention. Perfect for TikTok, Reels, and Shorts.',
    searchIntentKeywords: [
      'single word caption generator',
      'one word at a time subtitle',
      'punchy captions reels',
      'fast word subtitle generator',
    ],
    tagline: 'One high-impact word at a time for relentless pacing.',
    description:
      'Displays a single large word in the center or lower third of the screen, creating intense focus and maximum pacing for short-form clips.',
    useCases: ['Motivational speeches', 'Fast tips & hacks', 'High-speed storytelling'],
    faqs: [
      {
        q: 'Why use single word captions?',
        a: 'Single word captions force viewers to focus on one word per frame, making videos feel faster and boosting completion rate metrics.',
      },
    ],
  },
  'neon-glow': {
    slug: 'neon-glow',
    compositionId: 'NeonGlow',
    title: 'Neon Glow Animated Subtitles Generator | Instacap',
    h1: 'Neon Glow Style Caption Generator',
    metaDescription:
      'Create glowing neon text captions for dark aesthetic videos. Perfect for nightlife, podcasts, music, and gaming content.',
    searchIntentKeywords: [
      'neon glow captions',
      'glowing text subtitles',
      'neon animated subtitles',
      'glowing video captions generator',
    ],
    tagline: 'Vibrant glowing text effect that pops against dark video backgrounds.',
    description:
      'Active words light up with a luminous neon outline and soft ambient glow, providing a sleek cyberpunk aesthetic.',
    useCases: ['Nightlife & music clips', 'Gaming streams', 'Dark theme podcast clips'],
    faqs: [
      {
        q: 'Can I customize the neon glow color?',
        a: 'Yes, customize active glow colors to match your brand palette.',
      },
    ],
  },
  comic: {
    slug: 'comic',
    compositionId: 'Comic',
    title: 'Comic Book Style Animated Subtitles | Instacap',
    h1: 'Comic & Cartoon Style Caption Generator',
    metaDescription:
      'Fun, playfull cartoon captions with Fredoka typography & vibrant keyword color swaps for creators.',
    searchIntentKeywords: [
      'comic book caption generator',
      'cartoon subtitles online',
      'playful video captions',
    ],
    tagline: 'Playful Fredoka font with dynamic keyword color swaps.',
    description:
      'Designed for family-friendly, comedy, or gaming content with rounded comic typography and colorful word accents.',
    useCases: ['Kids & family content', 'Comedy skits', 'Gaming clips'],
    faqs: [
      {
        q: 'Is Fredoka font included free?',
        a: 'Yes, Fredoka and all custom Google display fonts are rendered automatically.',
      },
    ],
  },
  gradient: {
    slug: 'gradient',
    compositionId: 'Gradient',
    title: 'Gradient Animated Video Subtitles | Instacap',
    h1: 'Gradient Sweep Caption Generator',
    metaDescription:
      'Sleek gradient-fill captions with an animated color sweep across spoken words.',
    searchIntentKeywords: ['gradient caption generator', 'gradient text subtitles', 'color sweep captions'],
    tagline: 'Smooth multi-color gradient sweeps across active words.',
    description:
      'Modern aesthetic style utilizing multi-hue gradient fills that sweep across words in sync with voiceovers.',
    useCases: ['Tech reviews', 'Modern brand clips', 'Design tutorials'],
    faqs: [
      {
        q: 'How are gradient colors rendered?',
        a: 'Gradient sweeps are rendered natively via CSS/SVG gradient masks for sharp resolution.',
      },
    ],
  },
  highlighter: {
    slug: 'highlighter',
    compositionId: 'Highlighter',
    title: 'Marker Highlighter Video Captions | Instacap',
    h1: 'Marker Highlighter Style Subtitles',
    metaDescription:
      'Simulate a marker swipe behind spoken words for educational and tutorial videos.',
    searchIntentKeywords: ['highlighter caption generator', 'marker subtitle effect', 'text highlight video captions'],
    tagline: 'Marker swipe background animation highlighting spoken words.',
    description:
      'Creates a realistic marker highlight box behind words as they are pronounced, ideal for educational content.',
    useCases: ['Educational videos', 'Documentary clips', 'Course teasers'],
    faqs: [{ q: 'Is the highlight animation smooth?', a: 'Yes, smooth spring animations drive the highlight swipe.' }],
  },
  underline: {
    slug: 'underline',
    compositionId: 'Underline',
    title: 'Animated Underline Video Subtitles | Instacap',
    h1: 'Animated Underline Caption Generator',
    metaDescription:
      'Clean animated line sweeps beneath active spoken words for minimalist video captions.',
    searchIntentKeywords: ['underline caption generator', 'animated line subtitles', 'minimal underline captions'],
    tagline: 'Sleek underline sweeps beneath spoken text.',
    description:
      'Adds an elegant line sweep underneath active words, maintaining a clean visual look without heavy boxes.',
    useCases: ['Corporate videos', 'Interviews', 'Thought leadership clips'],
    faqs: [{ q: 'Can I change line stroke thickness?', a: 'Yes, stroke styling is fully customizable.' }],
  },
  glide: {
    slug: 'glide',
    compositionId: 'Glide',
    title: 'Glide & Slide Animated Video Captions | Instacap',
    h1: 'Glide Motion Caption Generator',
    metaDescription:
      'Smooth sliding text animations for sleek video subtitle motion graphics.',
    searchIntentKeywords: ['slide in captions', 'glide subtitle generator', 'motion captions video'],
    tagline: 'Smooth horizontal glide transitions per line.',
    description:
      'Words smoothly slide into place from the side, providing fluid motion graphics for video captions.',
    useCases: ['Travel vlogs', 'Fashion & lifestyle', 'Product promos'],
    faqs: [{ q: 'Does glide motion affect timing?', a: 'No, motion is strictly timed to spoken start frames.' }],
  },
  outline: {
    slug: 'outline',
    compositionId: 'Outline',
    title: 'Outline Hollow Text Video Captions | Instacap',
    h1: 'Hollow Outline Caption Generator',
    metaDescription:
      'Hollow stroke outline text where active words fill with solid color as spoken.',
    searchIntentKeywords: ['outline text subtitles', 'hollow captions generator', 'stroke subtitle effect'],
    tagline: 'Hollow stroke text that fills solid on active words.',
    description:
      'Displays translucent outline text that fills with solid vibrant color as words are spoken.',
    useCases: ['Streetwear & fashion clips', 'Music videos', 'Creative portfolio reels'],
    faqs: [{ q: 'What stroke colors are supported?', a: 'White, black, or custom stroke outlines are supported.' }],
  },
  meme: {
    slug: 'meme',
    compositionId: 'Meme',
    title: 'Meme Style Video Subtitle Generator | Instacap',
    h1: 'Meme Style Impact Subtitles',
    metaDescription:
      'Classic all-caps Impact font meme captions default positioned at top or bottom of frame.',
    searchIntentKeywords: ['meme subtitle generator', 'impact font captions', 'top text meme video maker'],
    tagline: 'Classic Impact font all-caps styling for viral meme videos.',
    description:
      'Iconic white Impact font with thick black outline, positioned for high-intent viral social meme clips.',
    useCases: ['Meme videos', 'Reaction clips', 'Social commentary'],
    faqs: [{ q: 'Can meme text be placed at the top of the video?', a: 'Yes, position controls allow top, middle, or bottom placement.' }],
  },
  minimal: {
    slug: 'minimal',
    compositionId: 'Minimal',
    title: 'Minimalist Clean Video Subtitles Generator | Instacap',
    h1: 'Minimalist Clean Caption Generator',
    metaDescription:
      'Restrained, elegant single-color captions for professional and aesthetic video creators.',
    searchIntentKeywords: ['minimalist video captions', 'clean subtitle generator', 'simple video text'],
    tagline: 'Restrained, understated typography for high-end aesthetic content.',
    description:
      'Subtle, elegant subtitle rendering without loud boxes or intense effects, ideal for premium brands.',
    useCases: ['Brand documentaries', 'Cinematic vlogs', 'Corporate announcements'],
    faqs: [{ q: 'Is Minimal font customizable?', a: 'Yes, customizable font sizes and colors are available.' }],
  },
  pill: {
    slug: 'pill',
    compositionId: 'Pill',
    title: 'Pill Badge Animated Video Captions | Instacap',
    h1: 'Pill Badge Style Subtitles',
    metaDescription:
      'Per-word dark rounded pill badges for high contrast video captions on bright backgrounds.',
    searchIntentKeywords: ['pill caption generator', 'rounded box subtitles', 'badge style video text'],
    tagline: 'Rounded pill badges behind each active word.',
    description:
      'Surrounds active words with a sleek rounded pill background badge to ensure maximum contrast on bright videos.',
    useCases: ['Outdoor vlogs', 'Fitness clips', 'Travel Reels'],
    faqs: [{ q: 'Does pill background work on high-contrast scenes?', a: 'Yes, pill background ensures 100% legibility anywhere.' }],
  },
  captionbar: {
    slug: 'captionbar',
    compositionId: 'CaptionBar',
    title: 'Solid Caption Bar Video Subtitles | Instacap',
    h1: 'Solid Caption Bar Subtitles',
    metaDescription:
      'Solid rounded background bar behind full caption lines for podcast and interview clips.',
    searchIntentKeywords: ['caption bar generator', 'solid background subtitles', 'podcast caption bar'],
    tagline: 'Full-line background bar for maximum broadcast legibility.',
    description:
      'Places a solid rounded rectangle bar behind the entire caption line, ideal for podcast clips and interviews.',
    useCases: ['Podcast interviews', 'News & commentary', 'Talk shows'],
    faqs: [{ q: 'Can I change caption bar opacity?', a: 'Yes, opacity and background colors are fully editable.' }],
  },
  fade: {
    slug: 'fade',
    compositionId: 'Fade',
    title: 'Smooth Fade In Video Subtitles | Instacap',
    h1: 'Smooth Fade Caption Generator',
    metaDescription:
      'Gentle opacity fade transitions per sentence segment for cinematic video captions.',
    searchIntentKeywords: ['fade in captions', 'smooth opacity subtitles', 'cinematic fade captions'],
    tagline: 'Gentle opacity fades per caption phrase.',
    description:
      'Phrases smoothly fade in and out, providing a calm and cinematic reading experience.',
    useCases: ['Documentary shorts', 'Meditation & wellness clips', 'Storytelling'],
    faqs: [{ q: 'How fast do phrases fade?', a: 'Fade speed adapts to sentence length and speech cadence.' }],
  },
  typewriter: {
    slug: 'typewriter',
    compositionId: 'Typewriter',
    title: 'Typewriter Effect Video Subtitles | Instacap',
    h1: 'Typewriter Effect Caption Generator',
    metaDescription:
      'Character-by-character typewriter text animation with blinking cursor for video captions.',
    searchIntentKeywords: ['typewriter caption generator', 'typewriter video text effect', 'blinking cursor subtitles'],
    tagline: 'Retro character-by-character typing effect with blinking cursor.',
    description:
      'Simulates a retro typewriter typing out words letter by letter in sync with speech audio.',
    useCases: ['Coding tutorials', 'Tech news', 'Creative writing clips'],
    faqs: [{ q: 'Is the cursor animated?', a: 'Yes, includes a pulsing blinking cursor.' }],
  },
  script: {
    slug: 'script',
    compositionId: 'Script',
    title: 'Cursive Script Accent Video Subtitles | Instacap',
    h1: 'Cursive Script Accent Captions',
    metaDescription:
      'Elegant gold cursive script typography on key accent words for luxury and lifestyle videos.',
    searchIntentKeywords: ['script font captions', 'cursive video subtitles', 'luxury video caption generator'],
    tagline: 'Elegant cursive script accents for key spoken words.',
    description:
      'Combines clean sans-serif text with elegant cursive script accents on keywords for lifestyle and luxury content.',
    useCases: ['Luxury fashion', 'Beauty & skincare', 'Wedding videos'],
    faqs: [{ q: 'Which font is used for script accents?', a: 'Uses Google Caveat cursive font styling.' }],
  },
  spring: {
    slug: 'spring',
    compositionId: 'Spring',
    title: 'Spring Motion Animated Video Captions | Instacap',
    h1: 'Spring Motion Subtitle Generator',
    metaDescription:
      'Dynamic physics-driven spring pop animations for engaging social video captions.',
    searchIntentKeywords: ['spring text animation', 'physics captions video', 'bouncy video subtitles'],
    tagline: 'Physics-based spring bounce animation on active words.',
    description:
      'Active words spring up from below with natural physics-based elastic bounce.',
    useCases: ['TikTok trends', 'Youth content', 'Animation vlogs'],
    faqs: [{ q: 'Is spring animation smooth?', a: 'Driven by Remotion spring physics engine.' }],
  },
  wordbyword: {
    slug: 'wordbyword',
    compositionId: 'WordByWord',
    title: 'Word by Word Animated Caption Generator | Instacap',
    h1: 'Word by Word Animated Subtitle Generator',
    metaDescription:
      'Active word scale up effect for crisp word-by-word animated captions on short-form video.',
    searchIntentKeywords: ['word by word caption generator', 'word scale subtitles', 'animated word captions'],
    tagline: 'Standard active word scale-up highlighting.',
    description:
      'The foundational word-by-word animation where each active word scales up cleanly as spoken.',
    useCases: ['General short-form video', 'Tutorials', 'Vlogs'],
    faqs: [{ q: 'How accurate is word timing?', a: 'Timestamps are accurate to the millisecond via Deepgram Nova-2.' }],
  },
  boxhighlight: {
    slug: 'boxhighlight',
    compositionId: 'BoxHighlight',
    title: 'Box Highlight Style Video Captions | Instacap',
    h1: 'Box Highlight Subtitle Generator',
    metaDescription:
      'Captions.ai style colored highlight box around key active words for high-retention video.',
    searchIntentKeywords: ['box highlight captions', 'captions.ai style generator', 'boxed word subtitles'],
    tagline: 'Colored rectangular highlight box around key active words.',
    description:
      'Surrounds keywords with a solid colored rectangle box, popular on Captions.ai for high retention.',
    useCases: ['Talking head videos', 'Business reels', 'Explainer clips'],
    faqs: [{ q: 'Can I change the box highlight color?', a: 'Yes, fully customizable box color settings.' }],
  },
}
