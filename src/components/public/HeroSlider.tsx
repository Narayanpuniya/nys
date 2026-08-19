"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatINR } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────────────────────
type Slide = { imageUrl: string; title?: string | null; id?: string };
type FeaturedCampaign = {
  slug: string; title: string; collected: number; goal: number;
  percent: number; remaining: number;
} | null;
type Dict = {
  hero_badge: string; hero_intro: string; hero_join: string; hero_donate: string;
  hero_activities: string; hero_campaign: string; hero_collected: string;
  hero_complete: string; hero_goal: string; hero_view_campaign: string;
  hero_welcome_title: string; hero_welcome_body: string;
};

const DURATION = 5000;
const TICK = 50;

// ── Per-slide content (default slides) ───────────────────────────────────────
type SlideContent = {
  badge?: string;
  label?: string;
  sectionTitle?: string;
  sectionSubtitle?: string;
  bullets?: string[];
  showCTA?: boolean;
  showCampaign?: boolean;
};

const SLIDE_CONTENT: Record<string, SlideContent> = {
  "default-1": {
    badge: "ESTD. 2023 · JODHPUR, RAJASTHAN",
    showCTA: true,
    showCampaign: true,
  },
  "default-2": {
    label: "हमारा विज़न · OUR VISION",
    sectionTitle: "शिक्षा",
    sectionSubtitle: "EDUCATION",
    bullets: [
      "सरकारी विद्यालयों का विकास एवं सुदृढ़ीकरण",
      "ग्राम स्तर पर पुस्तकालय निर्माण",
      "होनहार प्रतिभाओं का प्रोत्साहन एवं सहयोग",
    ],
  },
  "default-3": {
    label: "हमारा विज़न · OUR VISION",
    sectionTitle: "खेल",
    sectionSubtitle: "SPORTS & WELLNESS",
    bullets: [
      "खेल मैदान विकास एवं आधुनिकीकरण",
      "खेल संसाधनों की व्यवस्था एवं प्रबंधन",
      "खेल प्रतिभाओं का प्रोत्साहन एवं मार्गदर्शन",
      "योग द्वारा स्वस्थ जीवन शैली को प्रोत्साहन",
    ],
  },
  "default-4": {
    label: "हमारा विज़न · OUR VISION",
    sectionTitle: "पर्यावरण",
    sectionSubtitle: "ENVIRONMENT",
    bullets: [
      "जल संरक्षण एवं प्रबंधन",
      "वन्य जीव संरक्षण",
      "वन व ओरण विकास",
      "Eco Tourism Development",
      "Heritage Development",
    ],
  },
  "default-5": {
    label: "हमारा विज़न · OUR VISION",
    sectionTitle: "व्यवसाय",
    sectionSubtitle: "BUSINESS & SKILLS",
    bullets: [
      "कौशल विकास केन्द्र निर्माण",
      "Craft Conservation",
      "महिला सशक्तिकरण",
    ],
  },
};

// ── Main HeroSlider ───────────────────────────────────────────────────────────
export function HeroSlider({
  tagline, slides, campaign, dict, logoUrl, orgName, orgAddress, regNo,
}: {
  tagline: string;
  slides: Slide[];
  campaign: FeaturedCampaign;
  dict: Dict;
  logoUrl?: string | null;
  orgName: string;
  orgAddress?: string;
  regNo?: string;
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

  useEffect(() => { startTimers(); return stopTimers; }, [startTimers, stopTimers]);

  const goTo = useCallback((idx: number) => {
    setCurrent((idx + total) % total);
    setProgress(0);
    stopTimers();
    if (!pausedRef.current) setTimeout(() => startTimers(), 0);
  }, [total, startTimers, stopTimers]);

  const handleMouseEnter = useCallback(() => { pausedRef.current = true; stopTimers(); }, [stopTimers]);
  const handleMouseLeave = useCallback(() => { pausedRef.current = false; setProgress(0); startTimers(); }, [startTimers]);

  const slide = slides[current];
  const slideId = slide?.id ?? "";
  const content = SLIDE_CONTENT[slideId];

  return (
    <section
      className="relative min-h-[520px] overflow-hidden lg:min-h-[600px]"
      style={{ height: "calc(100vh - 120px)" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .slide-content { animation: fadeUp 0.55s ease forwards; }
      `}</style>

      {/* ── Backgrounds ── */}
      {slides.map((s, i) => (
        <div key={i} className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: i === current ? 1 : 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={s.imageUrl} alt={s.title ?? "NYS"} className="h-full w-full object-cover" draggable={false} />
          <div className="absolute inset-0" style={{ background: "rgba(40,6,6,0.58)" }} />
        </div>
      ))}
      {slides.length === 0 && (
        <div className="absolute inset-0" style={{ background: "linear-gradient(160deg,#7f1d1d 0%,#991b1b 40%,#b45309 100%)" }} />
      )}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-28"
        style={{ background: "linear-gradient(to top,rgba(127,29,29,0.5),transparent)" }} />

      {/* ── Slide content — keyed so it re-animates on slide change ── */}
      <div key={current} className="slide-content absolute inset-0 z-10 flex flex-col items-center justify-center px-4 text-center">

        {/* Logo — every slide */}
        {logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt={orgName}
            className="mb-4 h-16 w-16 rounded-full border-4 border-orange-300/40 object-contain shadow-2xl sm:h-20 sm:w-20"
          />
        )}

        {/* Org name — every slide, big */}
        <h1
          className="max-w-4xl text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl xl:text-6xl"
          style={{ textShadow: "0 2px 24px rgba(0,0,0,0.6)" }}
        >
          {orgName}
        </h1>

        {/* ── Slide-specific content ── */}
        {content ? (
          <>
            {/* Thin divider */}
            <div
              className="mt-4 mb-4 h-px w-32 sm:w-48"
              style={{ background: "linear-gradient(90deg,transparent,rgba(251,191,36,0.5),transparent)" }}
            />

            {/* Badge (slide 1 only) */}
            {content.badge && (
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-4 py-1 text-xs font-bold tracking-widest text-amber-300">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                {content.badge}
              </div>
            )}

            {/* Vision label (slides 2-5) */}
            {content.label && (
              <p className="text-xs font-bold tracking-widest text-amber-400 uppercase mb-1">
                {content.label}
              </p>
            )}

            {/* Section title (e.g. "शिक्षा") */}
            {content.sectionTitle && (
              <div className="flex items-center gap-3 justify-center mt-1">
                <h2
                  className="text-3xl font-black text-white sm:text-4xl lg:text-5xl"
                  style={{ textShadow: "0 2px 16px rgba(0,0,0,0.5)" }}
                >
                  {content.sectionTitle}
                </h2>
              </div>
            )}

            {/* English subtitle + separator */}
            {content.sectionSubtitle && (
              <div className="mt-2 flex items-center justify-center gap-3">
                <span className="text-xs font-bold tracking-widest text-amber-400 uppercase sm:text-sm">
                  {content.sectionSubtitle}
                </span>
                <div className="h-px w-16 sm:w-24" style={{ background: "linear-gradient(90deg,rgba(251,191,36,0.6),transparent)" }} />
              </div>
            )}

            {/* Bullet points */}
            {content.bullets && content.bullets.length > 0 && (
              <ul className="mt-4 inline-flex flex-col items-start gap-2 text-left">
                {content.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-400" />
                    <span className="text-sm font-medium text-stone-200 leading-snug sm:text-base">{b}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* CTA (slide 1 परिचय) */}
            {content.showCTA && (
              <>
                {/* Tagline */}
                <p className="mt-4 max-w-2xl text-sm font-medium text-orange-100 sm:text-base lg:text-lg"
                  style={{ textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}>
                  {tagline}
                </p>
                {orgAddress && <p className="mt-1 text-xs text-orange-200/70 sm:text-sm">{orgAddress}</p>}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <Link href="/join"
                    className="rounded-full px-7 py-2.5 text-sm font-bold text-white shadow-xl transition hover:scale-105 active:scale-95"
                    style={{ background: "linear-gradient(135deg,#d97706,#b45309)", boxShadow: "0 4px 20px rgba(217,119,6,0.4)" }}>
                    {dict.hero_join}
                  </Link>
                  <Link href="/activities"
                    className="rounded-full border-2 border-white/40 bg-white/10 px-6 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20">
                    {dict.hero_activities}
                  </Link>
                  <Link href="/donate"
                    className="rounded-full border border-orange-300/50 px-5 py-2.5 text-sm font-medium text-orange-200 transition hover:text-white">
                    {dict.hero_donate} →
                  </Link>
                </div>
              </>
            )}

            {/* Campaign widget (slide 1 only) */}
            {content.showCampaign && campaign && (
              <div className="mt-5 w-full max-w-sm rounded-2xl border border-white/20 bg-white/10 p-4 text-left backdrop-blur-md">
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
                <Link href={`/campaigns/${campaign.slug}`}
                  className="mt-3 block w-full rounded-xl py-2 text-center text-xs font-bold text-white"
                  style={{ background: "linear-gradient(135deg,#d97706,#b45309)" }}>
                  {dict.hero_view_campaign}
                </Link>
              </div>
            )}
          </>
        ) : (
          /* ── Default (custom/uploaded slides) ── */
          <>
            <p className="mt-4 max-w-2xl text-sm font-medium text-orange-100 sm:text-lg"
              style={{ textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}>
              {tagline}
            </p>
            {orgAddress && <p className="mt-2 text-xs text-orange-200/70 sm:text-sm">{orgAddress}</p>}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link href="/join"
                className="rounded-full px-7 py-2.5 text-sm font-bold text-white shadow-xl transition hover:scale-105"
                style={{ background: "linear-gradient(135deg,#d97706,#b45309)" }}>
                {dict.hero_join}
              </Link>
              <Link href="/activities"
                className="rounded-full border-2 border-white/40 bg-white/10 px-6 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20">
                {dict.hero_activities}
              </Link>
            </div>
            {campaign && (
              <div className="mt-5 w-full max-w-sm rounded-2xl border border-white/20 bg-white/10 p-4 text-left backdrop-blur-md">
                <p className="text-[10px] font-bold uppercase tracking-widest text-orange-300">{dict.hero_campaign}</p>
                <p className="mt-0.5 text-sm font-bold text-white leading-snug">{campaign.title}</p>
                <div className="mt-2"><ProgressBar percent={campaign.percent} /></div>
                <Link href={`/campaigns/${campaign.slug}`}
                  className="mt-3 block w-full rounded-xl py-2 text-center text-xs font-bold text-white"
                  style={{ background: "linear-gradient(135deg,#d97706,#b45309)" }}>
                  {dict.hero_view_campaign}
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Slider controls ── */}
      {total > 1 && (
        <>
          <button onClick={() => goTo(current - 1)}
            className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-black/30 p-2.5 text-white backdrop-blur-sm transition hover:bg-black/50"
            aria-label="Previous">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button onClick={() => goTo(current + 1)}
            className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-black/30 p-2.5 text-white backdrop-blur-sm transition hover:bg-black/50"
            aria-label="Next">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="absolute bottom-6 left-0 right-0 z-20 flex flex-col items-center gap-2">
            <div className="h-0.5 w-24 overflow-hidden rounded-full bg-white/20">
              <div className="h-full bg-orange-400 transition-none" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex gap-2">
              {slides.map((_, i) => (
                <button key={i} onClick={() => goTo(i)}
                  className={`rounded-full transition-all duration-300 ${i === current ? "h-2 w-6 bg-orange-400" : "h-2 w-2 bg-white/40 hover:bg-white/70"}`}
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
