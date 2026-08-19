"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/ui/Logo";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatINR } from "@/lib/utils";

type Slide = {
  imageUrl: string;
  title?: string | null;
  category?: string | null;
};

type FeaturedCampaign = {
  slug: string;
  title: string;
  collected: number;
  goal: number;
  percent: number;
  remaining: number;
} | null;

type Dict = {
  hero_badge: string;
  hero_intro: string;
  hero_join: string;
  hero_donate: string;
  hero_activities: string;
  hero_campaign: string;
  hero_collected: string;
  hero_complete: string;
  hero_goal: string;
  hero_view_campaign: string;
  hero_welcome_title: string;
  hero_welcome_body: string;
};

const DURATION = 5000;
const TICK = 50;

export function HeroSlider({
  tagline,
  slides,
  campaign,
  dict,
  logoUrl,
  orgName,
}: {
  tagline: string;
  slides: Slide[];
  campaign: FeaturedCampaign;
  dict: Dict;
  logoUrl?: string | null;
  orgName: string;
}) {
  const total = slides.length;
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const pausedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimers = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
  }, []);

  const startTimers = useCallback(() => {
    stopTimers();
    if (total <= 1 || pausedRef.current) return;
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % total);
      setProgress(0);
    }, DURATION);
    progressRef.current = setInterval(() => {
      setProgress((p) => Math.min(p + (TICK / DURATION) * 100, 100));
    }, TICK);
  }, [total, stopTimers]);

  // Start timers on mount and when total changes
  useEffect(() => {
    startTimers();
    return stopTimers;
  }, [startTimers, stopTimers]);

  const goTo = useCallback((idx: number) => {
    setCurrent((idx + total) % total);
    setProgress(0);
    // Restart timers after manual navigation
    stopTimers();
    if (!pausedRef.current) {
      setTimeout(() => {
        startTimers();
      }, 0);
    }
  }, [total, startTimers, stopTimers]);

  const handleMouseEnter = useCallback(() => {
    pausedRef.current = true;
    stopTimers();
  }, [stopTimers]);

  const handleMouseLeave = useCallback(() => {
    pausedRef.current = false;
    setProgress(0);
    startTimers();
  }, [startTimers]);

  const slide = slides[current];

  return (
    <section
      className="relative h-[92vh] min-h-[520px] max-h-[800px] overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── Slide backgrounds ── */}
      {slides.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={s.imageUrl}
            alt={s.title ?? "NYS"}
            className="h-full w-full object-cover"
            draggable={false}
          />
          {/* Dark gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.45) 55%, rgba(0,0,0,0.15) 100%)",
            }}
          />
          {/* Bottom fade */}
          <div
            className="absolute bottom-0 left-0 right-0 h-32"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)" }}
          />
          {/* Saffron-maroon top stripe */}
          <div
            className="absolute top-0 left-0 right-0 h-1.5"
            style={{ background: "linear-gradient(90deg, #d97706, #7f1d1d)" }}
          />
        </div>
      ))}

      {/* ── Gradient fallback when no slides ── */}
      {slides.length === 0 && (
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, #7f1d1d 0%, #d97706 50%, #92400e 100%)" }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='1.5' fill='rgba(255,255,255,0.06)'/%3E%3C/svg%3E\")",
            }}
          />
        </div>
      )}

      {/* ── Main content ── */}
      <div className="relative z-10 mx-auto grid h-full max-w-7xl items-center gap-8 px-6 lg:grid-cols-5 lg:px-8">
        {/* Left: Text */}
        <div className="lg:col-span-3">
          {/* Badge */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-sm">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="NYS" className="h-5 w-5 rounded-full" />
            ) : (
              <LogoMark className="h-5 w-5" />
            )}
            <span className="text-xs font-semibold tracking-wider text-white/90">{dict.hero_badge}</span>
          </div>

          {/* Tagline */}
          <h1
            className="text-3xl font-extrabold leading-tight text-white drop-shadow-sm sm:text-4xl lg:text-5xl xl:text-6xl"
            style={{ textShadow: "0 2px 12px rgba(0,0,0,0.4)" }}
          >
            {tagline}
          </h1>

          {/* Intro */}
          <p className="mt-4 max-w-xl text-base text-white/80 drop-shadow-sm">{dict.hero_intro}</p>

          {/* Slide caption */}
          {slide?.category && (
            <div className="mt-3 inline-block rounded-full bg-saffron-600/80 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
              📍 {slide.category}
              {slide.title ? ` · ${slide.title}` : ""}
            </div>
          )}

          {/* CTA Buttons */}
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/join"
              className="rounded-xl px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:scale-105 active:scale-95"
              style={{ background: "linear-gradient(135deg, #d97706, #b45309)" }}
            >
              {dict.hero_join}
            </Link>
            <Link
              href="/donate"
              className="rounded-xl border-2 border-white/60 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              {dict.hero_donate}
            </Link>
            <Link
              href="/activities"
              className="rounded-xl border border-white/30 bg-transparent px-6 py-3 text-sm font-medium text-white/80 transition hover:text-white"
            >
              {dict.hero_activities} →
            </Link>
          </div>
        </div>

        {/* Right: Campaign card */}
        <div className="hidden lg:col-span-2 lg:block">
          {campaign ? (
            <div className="rounded-2xl border border-white/20 bg-white/95 p-6 shadow-2xl backdrop-blur-md">
              <p className="text-xs font-bold uppercase tracking-widest text-saffron-700">{dict.hero_campaign}</p>
              <h2 className="mt-1 text-lg font-bold leading-snug text-gray-900">{campaign.title}</h2>
              <div className="mt-4">
                <ProgressBar percent={campaign.percent} />
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-base font-extrabold text-saffron-800">{formatINR(campaign.collected)}</div>
                    <div className="text-[10px] text-stone-500">{dict.hero_collected}</div>
                  </div>
                  <div>
                    <div className="text-base font-extrabold text-gray-900">{campaign.percent}%</div>
                    <div className="text-[10px] text-stone-500">{dict.hero_complete}</div>
                  </div>
                  <div>
                    <div className="text-base font-extrabold text-red-700">{formatINR(campaign.goal)}</div>
                    <div className="text-[10px] text-stone-500">{dict.hero_goal}</div>
                  </div>
                </div>
              </div>
              <Link
                href={`/campaigns/${campaign.slug}`}
                className="mt-4 block w-full rounded-xl py-3 text-center text-sm font-bold text-white transition hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #d97706, #b45309)" }}
              >
                {dict.hero_view_campaign}
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/20 bg-white/10 p-8 text-center backdrop-blur-md">
              <div className="text-5xl">🪔</div>
              <p className="mt-3 font-semibold text-white">{dict.hero_welcome_title}</p>
              <p className="mt-1 text-sm text-white/70">{dict.hero_welcome_body}</p>
              <Link
                href="/join"
                className="mt-4 inline-block rounded-xl px-6 py-2.5 text-sm font-bold text-white"
                style={{ background: "linear-gradient(135deg, #d97706, #b45309)" }}
              >
                {dict.hero_join}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Slider controls ── */}
      {total > 1 && (
        <>
          {/* Prev arrow */}
          <button
            onClick={() => goTo(current - 1)}
            className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-black/30 p-2.5 text-white backdrop-blur-sm transition hover:bg-black/50"
            aria-label="Previous"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Next arrow */}
          <button
            onClick={() => goTo(current + 1)}
            className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-black/30 p-2.5 text-white backdrop-blur-sm transition hover:bg-black/50"
            aria-label="Next"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots + progress bar */}
          <div className="absolute bottom-6 left-0 right-0 z-20 flex flex-col items-center gap-2">
            {/* Progress bar for current slide */}
            <div className="h-0.5 w-32 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full bg-saffron-400 transition-none"
                style={{ width: `${progress}%` }}
              />
            </div>
            {/* Dots */}
            <div className="flex gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === current ? "h-2 w-6 bg-saffron-400" : "h-2 w-2 bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Slide counter */}
          <div className="absolute bottom-6 right-4 z-20 rounded-full bg-black/30 px-2.5 py-1 text-xs font-medium text-white/80 backdrop-blur-sm">
            {current + 1} / {total}
          </div>
        </>
      )}

      {/* Org name watermark */}
      <div className="absolute bottom-6 left-6 z-20 hidden lg:block">
        <div className="text-xs font-medium tracking-wide text-white/40">{orgName}</div>
      </div>
    </section>
  );
}
