'use client'

import { useEffect, useRef, useState } from 'react'

const WORDS = [
  { text: 'STOP', isKeyword: false },
  { text: 'WASTING', isKeyword: false },
  { text: 'HOURS', isKeyword: true },
  { text: 'ON', isKeyword: false },
  { text: 'EDITING', isKeyword: false },
]

export function HeroCaptionDemo() {
  const [step, setStep] = useState(0)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Kinetic Word-by-Word Loop (550ms interval matching mockup)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) return

    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % WORDS.length)
    }, 550)

    return () => clearInterval(interval)
  }, [])

  // Muted auto-play video observer
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          v.play().catch(() => {})
        } else {
          v.pause()
        }
      },
      { threshold: 0.25 },
    )

    io.observe(v)
    return () => io.disconnect()
  }, [])

  const progressPercent = 30 + (step / WORDS.length) * 45

  return (
    <div className="relative w-full flex items-center justify-center min-h-[580px] sm:min-h-[640px] lg:min-h-[680px]">
      {/* Background Card Left - Tilted & Dimmed for 3D Cinematic Depth */}
      <div
        className="absolute -left-2 sm:-left-6 lg:-left-8 top-10 sm:top-12 w-[220px] sm:w-[260px] lg:w-[280px] aspect-[9/16] rounded-[28px] overflow-hidden bg-[#070708] border border-white/[0.06] -rotate-6 opacity-35 filter blur-[0.6px] pointer-events-none hidden sm:block select-none"
        aria-hidden="true"
      >
        <img
          alt=""
          className="w-full h-full object-cover grayscale contrast-125"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5GFB-gMYZ_vfCr1TZKesq71UtL4OTW8lmyBn3emQ00F2tGBARJV-dhWuGxWgTvbQ94Fbm2bzQUmXqyV9i0ChTwB1xUiLbx2ydHdBPYBwNB6e4daTtigwTRVTlxxSpwWiCRX4JeSg0zSJOwFjZjkZQZi2FLFr4XIq_jx0mWhaS1CpxnBs7XhC6UHlb7B4vPuD2cw84GGCkY_PzKRmWAdzgMxnJxbPkvMWlJHVPWERJyTih-qfdadCe"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      </div>

      {/* Background Card Right - Tilted & Dimmed for 3D Cinematic Depth */}
      <div
        className="absolute -right-2 sm:-right-6 lg:-right-8 top-12 sm:top-16 w-[220px] sm:w-[260px] lg:w-[280px] aspect-[9/16] rounded-[28px] overflow-hidden bg-[#070708] border border-white/[0.06] rotate-6 opacity-35 filter blur-[0.6px] pointer-events-none hidden sm:block select-none"
        aria-hidden="true"
      >
        <img
          alt=""
          className="w-full h-full object-cover grayscale contrast-125"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDyK0W7j5ZBWd4bTFArOin5HV_rMDs3DEAQGCPPuEJbSJridXw-h8O-xNvCunxwNoaEYRxgm1iUUQb2lQQKlwDIyA94Xzvm9O9aLP8kUd3i74Tykb_-PJl4usq9RRMxmlPEvE_zuX1JQjt7RoBvs7DyLEAuydmF6kmahltRi3FkhiDqE2nYz7TiKDb8w5MVDmcRrhlKPR7_Bj0fipdD9apNE7QaUrsRINzxoEZJPHb7CAOJOfVHpFL6"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      </div>

      {/* PRIMARY HERO REEL: High-Impact Vertical Phone Showcase */}
      <div className="relative z-20 w-[300px] sm:w-[380px] lg:w-[420px] aspect-[9/16] rounded-[36px] overflow-hidden bg-black border border-white/[0.14] shadow-[0_28px_85px_rgba(0,0,0,0.95)] flex flex-col group ring-1 ring-white/[0.08]">
        <div className="relative w-full h-full overflow-hidden">
          {/* Creator Imagery with Subtle Hover Zoom */}
          <img
            alt="Creator recording talking-head video"
            className={`w-full h-full object-cover scale-[1.02] brightness-95 contrast-105 transition-transform duration-700 group-hover:scale-105 ${
              isVideoLoaded ? 'opacity-0' : 'opacity-100'
            }`}
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-ngYbxbcWNTdyVrc4W78I8v8KF9nr7HQztAxHwv-BiU5QypNoYuOL_52f3-Bb-3Hp3Wi9_ZTJtEPl4UE3d6G7DVcxiW4wXtQpsiWiWSoHlJjcyeODiPWLWEafUFG6wsiQw1Gi8duJ821DaNSPeR8iKQJ2em2G840w_lrZ937ZVou9nNfzYwTj2UL39ShBbfZN0-UckO8SHQOS9bZpgsEucB1XnenwWzNS2WAhCxWlO--ZuudHD4Gp"
          />

          {/* Optional Local Video Support */}
          <video
            ref={videoRef}
            src="/hero-demo.mp4"
            className={`absolute inset-0 w-full h-full object-cover scale-[1.02] transition-opacity duration-500 ${
              isVideoLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            muted
            loop
            playsInline
            preload="metadata"
            onLoadedData={() => setIsVideoLoaded(true)}
            aria-hidden="true"
          />

          {/* Gradient Scrims & Edge Borders */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-black/45 pointer-events-none" />
          <div className="absolute inset-0 rounded-[36px] border border-white/[0.08] pointer-events-none" />

          {/* Dynamic Kinetic Caption Stage */}
          <div
            className="absolute inset-x-3 sm:inset-x-4 bottom-14 sm:bottom-16 z-30 flex flex-col items-center text-center select-none"
            id="caption-stage"
          >
            <div className="inline-block bg-black/85 backdrop-blur-md px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-2xl border border-white/10 shadow-2xl max-w-[92%]">
              <p className="font-headline text-[20px] sm:text-[26px] md:text-[28px] font-black uppercase tracking-tight text-white leading-tight">
                {WORDS.map((w, idx) => {
                  const isActive = idx === step

                  if (w.isKeyword) {
                    return (
                      <span
                        key={w.text}
                        className={`caption-word px-2 sm:px-2.5 py-0.5 mx-1 rounded font-black bg-[#ffc700] text-black shadow-[0_0_24px_rgba(255,199,0,0.5)] ${
                          isActive ? 'active-pop' : ''
                        }`}
                      >
                        {w.text}
                      </span>
                    )
                  }

                  return (
                    <span
                      key={w.text}
                      className={`caption-word mx-1 ${isActive ? 'active-pop' : ''}`}
                      style={{
                        color: isActive ? '#ffc700' : undefined,
                      }}
                    >
                      {w.text}
                    </span>
                  )
                })}
              </p>
            </div>
          </div>

          {/* HUD Player Progress & Info */}
          <div className="absolute bottom-4 sm:bottom-5 inset-x-5 sm:inset-x-6 z-30 flex flex-col gap-2 pointer-events-none">
            <div className="flex items-center justify-between text-white/60 font-mono text-[10px] sm:text-[11px]">
              <span className="flex items-center gap-1.5 text-white/80">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d00] animate-pulse" />
                00:04 / 00:30
              </span>
              <span className="uppercase tracking-widest text-[9px] sm:text-[10px] text-white/50">
                INSTACAP 4K
              </span>
            </div>
            <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#ff4d00] rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
