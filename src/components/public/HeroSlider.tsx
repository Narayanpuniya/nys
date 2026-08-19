"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
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
  orgAddress,
}: {
  tagline: string;
  slides: Slide[];
  campaign: FeaturedCampaign;
  dict: Dict;
  logoUrl?: string | null;
  orgName: string;
  orgAddress?: string;
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

  useEffect(() => {
    startTimers();
    return stopTimers;
  }, [startTimers, stopTimers]);

  const goTo = useCallback(
    (idx: number) => {
      setCurrent((idx + total) % total);
      setProgress(0);
      stopTimers();
      if (!pausedRef.current) setTimeout(() => startTimers(), 0);
    },
    [total, startTimers, stopTimers],
  );

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
      className="relative min-h-[480px] overflow-hidden lg:min-h-[580px]"
      style={{ height: "calc(100vh - 120px)" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Slide title animation keyframe */}
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
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
          {/* Dark overlay — lighter so background patterns show through */}
          <div
            className="absolute inset-0"
            style={{ background: "rgba(50,8,8,0.52)" }}
          />
        </div>
      ))}

      {/* ── Gradient fallback when no slides ── */}
      {slides.length === 0 && (
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(160deg, #7f1d1d 0%, #991b1b 40%, #b45309 100%)" }}
        />
      )}

      {/* ── Bottom gradient fade ── */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-24"
        style={{ background: "linear-gradient(to top, rgba(127,29,29,0.4), transparent)" }}
      />

      {/* ── Main centered content ── */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">

        {/* Logo */}
        {logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt={orgName}
            className="mb-5 h-20 w-20 rounded-full border-4 border-orange-300/40 object-contain shadow-2xl"
          />
        )}

        {/* Org Name — big bold */}
        <h1
          className="max-w-4xl text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl xl:text-6xl"
          style={{ textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}
        >
          {orgName}
        </h1>

        {/* Current slide title badge — changes with each slide */}
        {slide?.title && (
          <div
            key={current}
            className="mt-4 inline-flex items-center gap-2 rounded-full px-5 py-1.5"
            style={{
              background: "linear-gradient(135deg, rgba(217,119,6,0.75), rgba(127,29,29,0.6))",
              border: "1px solid rgba(251,191,36,0.4)",
              backdropFilter: "blur(8px)",
              animation: "fadeSlideUp 0.6s ease forwards",
            }}
          >
            <span
              className="text-sm font-bold tracking-wide text-white"
              style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
            >
              {slide.title}
            </span>
          </div>
        )}

        {/* Tagline / उद्देश्य */}
        <p
          className="mt-3 max-w-2xl text-base font-medium text-orange-100 sm:text-lg lg:text-xl"
          style={{ textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}
        >
          {tagline}
        </p>

        {/* Address */}
        {orgAddress && (
          <p className="mt-2 text-sm text-orange-200/70">{orgAddress}</p>
        )}

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/join"
            className="rounded-full px-8 py-3 text-sm font-bold text-white shadow-xl transition hover:scale-105 active:scale-95"
            style={{ background: "linear-gradient(135deg, #d97706, #b45309)", boxShadow: "0 4px 20px rgba(217,119,6,0.4)" }}
          >
            {dict.hero_join}
          </Link>
          <Link
            href="/activities"
            className="rounded-full border-2 border-white/50 bg-white/10 px-8 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            {dict.hero_activities}
          </Link>
          <Link
            href="/donate"
            className="rounded-full border border-orange-300/50 bg-transparent px-6 py-3 text-sm font-medium text-orange-200 transition hover:text-white"
          >
            {dict.hero_donate} →
          </Link>
        </div>

        {/* Campaign widget (compact, below CTAs) */}
        {campaign && (
          <div className="mt-8 w-full max-w-sm rounded-2xl border border-white/20 bg-white/10 p-4 text-left backdrop-blur-md">
            <p className="text-[10px] font-bold uppercase tracking-widest text-orange-300">{dict.hero_campaign}</p>
            <p className="mt-0.5 text-sm font-bold text-white leading-snug">{campaign.title}</p>
            <div className="mt-2">
              <ProgressBar percent={campaign.percent} />
              <div className="mt-2 grid grid-cols-3 gap-1 text-center text-[10px]">
                <div><div className="font-bold text-orange-300">{formatINR(campaign.collected)}</div><div className="text-white/50">{dict.hero_collected}</div></div>
                <div><div className="font-bold text-white">{campaign.percent}%</div><div className="text-white/50">{dict.hero_complete}</div></div>
                <div><div className="font-bold text-orange-300">{formatINR(campaign.goal)}</div><div className="text-white/50">{dict.hero_goal}</div></div>
              </div>
            </div>
            <Link
              href={`/campaigns/${campaign.slug}`}
              className="mt-3 block w-full rounded-xl py-2 text-center text-xs font-bold text-white"
              style={{ background: "linear-gradient(135deg, #d97706, #b45309)" }}
            >
              {dict.hero_view_campaign}
            </Link>
          </div>
        )}
      </div>

      {/* ── Slider controls ── */}
      {total > 1 && (
        <>
          <button
            onClick={() => goTo(current - 1)}
            className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-black/30 p-2.5 text-white backdrop-blur-sm transition hover:bg-black/50"
            aria-label="Previous"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => goTo(current + 1)}
            className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-black/30 p-2.5 text-white backdrop-blur-sm transition hover:bg-black/50"
            aria-label="Next"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Progress + dots */}
          <div className="absolute bottom-6 left-0 right-0 z-20 flex flex-col items-center gap-2">
            <div className="h-0.5 w-24 overflow-hidden rounded-full bg-white/20">
              <div className="h-full bg-orange-400 transition-none" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === current ? "h-2 w-6 bg-orange-400" : "h-2 w-2 bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="absolute bottom-6 right-4 z-20 rounded-full bg-black/30 px-2.5 py-1 text-xs font-medium text-white/70 backdrop-blur-sm">
            {current + 1} / {total}
          </div>
        </>
      )}
    </section>
  );
}
