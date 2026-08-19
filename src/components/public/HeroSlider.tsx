"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatINR } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────
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

// ── Slide definitions ─────────────────────────────────────────────────────────
type SlideDef = {
  label?: string;
  sectionTitle?: string;
  sectionSubtitle?: string;
  bullets?: string[];
  isIntro?: boolean;     // slide 1 — show tagline + CTA + campaign
};

const SLIDES: Record<string, SlideDef> = {
  "default-1": { isIntro: true },
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

// ── Decorative Icons ──────────────────────────────────────────────────────────

function NysCircleIcon({ logoUrl }: { logoUrl?: string | null }) {
  return (
    <svg viewBox="0 0 240 240" className="w-full max-w-[220px] opacity-80 drop-shadow-2xl" aria-hidden>
      <circle cx="120" cy="120" r="114" fill="none" stroke="#d97706" strokeWidth="0.6" opacity="0.25"/>
      <circle cx="120" cy="120" r="96"  fill="none" stroke="#d97706" strokeWidth="0.8" opacity="0.35"/>
      <circle cx="120" cy="120" r="78"  fill="none" stroke="#d97706" strokeWidth="1"   opacity="0.45"/>
      <circle cx="120" cy="120" r="60"  fill="none" stroke="#f59e0b" strokeWidth="1.5" opacity="0.6"/>
      {[0,90,180,270].map(a => {
        const rad=(a-90)*Math.PI/180, r=96;
        return <line key={a} x1={120+r*Math.cos(rad)} y1={120+r*Math.sin(rad)}
          x2={120+(r-14)*Math.cos(rad)} y2={120+(r-14)*Math.sin(rad)}
          stroke="#f59e0b" strokeWidth="2.5" opacity="0.7"/>;
      })}
      <polygon points="120,6 128,15 120,24 112,15" fill="#d97706" opacity="0.8"/>
      <circle cx="120" cy="120" r="48" fill="rgba(127,29,29,0.85)" stroke="#f59e0b" strokeWidth="1.5"/>
      {logoUrl
        ? <image href={logoUrl} x="82" y="82" width="76" height="76" clipPath="circle(38px at 38px 38px)"/>
        : <>
            <text x="120" y="113" textAnchor="middle" fill="#f59e0b" fontSize="20" fontWeight="bold">NYS</text>
            <text x="120" y="133" textAnchor="middle" fill="#f59e0b" fontSize="8" letterSpacing="2">NARAYANPURI</text>
          </>
      }
    </svg>
  );
}

function LampIcon() {
  return (
    <svg viewBox="0 0 160 230" className="w-full max-w-[160px] opacity-85 drop-shadow-xl" aria-hidden>
      <ellipse cx="80" cy="50" rx="36" ry="36" fill="#f59e0b" opacity="0.07"/>
      <ellipse cx="80" cy="50" rx="24" ry="24" fill="#f59e0b" opacity="0.1"/>
      {[[-25,-24],[-12,-28],[0,-30],[12,-28],[25,-24]].map(([dx,dy],i)=>(
        <line key={i} x1={80} y1={50} x2={80+dx} y2={50+dy} stroke="#fbbf24" strokeWidth="1.5" opacity="0.55" strokeLinecap="round"/>
      ))}
      <ellipse cx="80" cy="54" rx="16" ry="20" fill="#fbbf24" opacity="0.9"/>
      <ellipse cx="80" cy="58" rx="9" ry="12" fill="#fef3c7" opacity="0.8"/>
      <path d="M 44 70 Q 80 62 116 70 L 103 108 Q 80 102 57 108 Z" fill="#d97706"/>
      <path d="M 44 70 Q 80 64 116 70 L 113 76 Q 80 72 47 76 Z" fill="#b45309"/>
      <rect x="76" y="108" width="8" height="68" rx="3" fill="#78350f"/>
      <ellipse cx="80" cy="178" rx="30" ry="6" fill="#92400e"/>
      <rect x="52" y="178" width="56" height="9" rx="3" fill="#b45309"/>
      <rect x="46" y="186" width="68" height="8" rx="3" fill="#92400e"/>
      <rect x="42" y="193" width="76" height="8" rx="3" fill="#78350f"/>
    </svg>
  );
}

function SportsRadarIcon() {
  return (
    <svg viewBox="0 0 240 240" className="w-full max-w-[210px] opacity-80 drop-shadow-xl" aria-hidden>
      <ellipse cx="120" cy="120" rx="110" ry="68" fill="none" stroke="#d97706" strokeWidth="0.8" opacity="0.3"/>
      <ellipse cx="120" cy="120" rx="90"  ry="55" fill="none" stroke="#d97706" strokeWidth="1"   opacity="0.4"/>
      <ellipse cx="120" cy="120" rx="70"  ry="43" fill="none" stroke="#d97706" strokeWidth="1"   opacity="0.5"/>
      <ellipse cx="120" cy="120" rx="50"  ry="30" fill="none" stroke="#f59e0b" strokeWidth="1.5" opacity="0.65"/>
      <ellipse cx="120" cy="120" rx="68" ry="110" fill="none" stroke="#d97706" strokeWidth="0.8" opacity="0.3"/>
      <ellipse cx="120" cy="120" rx="55" ry="90"  fill="none" stroke="#d97706" strokeWidth="1"   opacity="0.4"/>
      <ellipse cx="120" cy="120" rx="43" ry="70"  fill="none" stroke="#d97706" strokeWidth="1"   opacity="0.5"/>
      <line x1="120" y1="10" x2="120" y2="230" stroke="#d97706" strokeWidth="0.5" opacity="0.3"/>
      <line x1="10" y1="120" x2="230" y2="120" stroke="#d97706" strokeWidth="0.5" opacity="0.3"/>
      <line x1="120" y1="10" x2="120" y2="22" stroke="#f59e0b" strokeWidth="2.5" opacity="0.8"/>
      <line x1="120" y1="218" x2="120" y2="230" stroke="#f59e0b" strokeWidth="2.5" opacity="0.8"/>
      <line x1="10" y1="120" x2="22" y2="120" stroke="#f59e0b" strokeWidth="2.5" opacity="0.8"/>
      <line x1="218" y1="120" x2="230" y2="120" stroke="#f59e0b" strokeWidth="2.5" opacity="0.8"/>
      <polygon points="120,5 129,14 120,23 111,14" fill="#d97706" opacity="0.85"/>
      <circle cx="120" cy="120" r="32" fill="rgba(127,29,29,0.9)" stroke="#f59e0b" strokeWidth="2"/>
      <text x="120" y="115" textAnchor="middle" fill="#f59e0b" fontSize="12" fontWeight="bold">NYS</text>
      <text x="120" y="129" textAnchor="middle" fill="#f59e0b" fontSize="7.5" letterSpacing="1">SPORTS</text>
    </svg>
  );
}

function TreeIcon() {
  return (
    <svg viewBox="0 0 180 250" className="w-full max-w-[170px] opacity-85 drop-shadow-xl" aria-hidden>
      <circle cx="90" cy="100" r="75" fill="#16a34a" opacity="0.06"/>
      <circle cx="90" cy="90" r="75" fill="none" stroke="#16a34a" strokeWidth="0.6" opacity="0.2" strokeDasharray="5 4"/>
      <circle cx="90" cy="90" r="55" fill="none" stroke="#15803d" strokeWidth="0.6" opacity="0.28" strokeDasharray="4 4"/>
      <polygon points="90,14 140,82 40,82" fill="#16a34a" opacity="0.95"/>
      <polygon points="90,35 148,112 32,112" fill="#15803d" opacity="0.92"/>
      <polygon points="90,58 156,146 24,146" fill="#14532d" opacity="0.88"/>
      <polygon points="90,24 112,65 68,65" fill="#22c55e" opacity="0.18"/>
      <polygon points="90,46 116,98 64,98" fill="#22c55e" opacity="0.14"/>
      <rect x="80" y="146" width="20" height="56" rx="4" fill="#92400e"/>
      <rect x="80" y="146" width="10" height="56" rx="4" fill="#78350f" opacity="0.5"/>
      <path d="M 80 200 Q 60 208 46 203" stroke="#78350f" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
      <path d="M 100 200 Q 120 208 134 203" stroke="#78350f" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
      <path d="M 90 202 L 90 218" stroke="#78350f" strokeWidth="4" strokeLinecap="round"/>
      <ellipse cx="90" cy="220" rx="44" ry="7" fill="#166534" opacity="0.35"/>
    </svg>
  );
}

function BusinessIcon() {
  return (
    <svg viewBox="0 0 220 220" className="w-full max-w-[200px] opacity-80 drop-shadow-xl" aria-hidden>
      <circle cx="110" cy="110" r="102" fill="none" stroke="#d97706" strokeWidth="0.7" opacity="0.28"/>
      <circle cx="110" cy="110" r="84"  fill="none" stroke="#d97706" strokeWidth="1"   opacity="0.38"/>
      {Array.from({length:12},(_,i)=>{
        const a=(i*30-90)*Math.PI/180,r1=84,r2=96;
        return <line key={i} x1={110+r1*Math.cos(a)} y1={110+r1*Math.sin(a)}
          x2={110+r2*Math.cos(a)} y2={110+r2*Math.sin(a)}
          stroke="#d97706" strokeWidth="3" opacity="0.5" strokeLinecap="round"/>;
      })}
      <circle cx="110" cy="110" r="60" fill="rgba(127,29,29,0.5)" stroke="#d97706" strokeWidth="1.5" opacity="0.8"/>
      {Array.from({length:8},(_,i)=>{
        const a=(i*45-90)*Math.PI/180,r1=37,r2=47;
        return <line key={i} x1={110+r1*Math.cos(a)} y1={110+r1*Math.sin(a)}
          x2={110+r2*Math.cos(a)} y2={110+r2*Math.sin(a)}
          stroke="#f59e0b" strokeWidth="2" opacity="0.65" strokeLinecap="round"/>;
      })}
      <circle cx="110" cy="110" r="30" fill="rgba(127,29,29,0.92)" stroke="#f59e0b" strokeWidth="2"/>
      <text x="110" y="105" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="bold">NYS</text>
      <text x="110" y="119" textAnchor="middle" fill="#f59e0b" fontSize="7.5" letterSpacing="1">SKILLS</text>
    </svg>
  );
}

// Map slide id → icon component
const ICON_MAP: Record<string, React.ReactNode> = {
  "default-3": <SportsRadarIcon />,
  "default-4": <TreeIcon />,
  "default-5": <BusinessIcon />,
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
    timerRef.current = setInterval(() => { setCurrent(c => (c+1)%total); setProgress(0); }, DURATION);
    progressRef.current = setInterval(() => { setProgress(p => Math.min(p+(TICK/DURATION)*100, 100)); }, TICK);
  }, [total, stopTimers]);

  useEffect(() => { startTimers(); return stopTimers; }, [startTimers, stopTimers]);

  const goTo = useCallback((idx: number) => {
    setCurrent((idx+total)%total); setProgress(0); stopTimers();
    if (!pausedRef.current) setTimeout(startTimers, 0);
  }, [total, startTimers, stopTimers]);

  const slide = slides[current];
  const slideId = slide?.id ?? "";
  const def = SLIDES[slideId];

  return (
    <section
      className="relative min-h-[520px] overflow-hidden lg:min-h-[600px]"
      style={{ height: "calc(100vh - 120px)" }}
      onMouseEnter={() => { pausedRef.current=true; stopTimers(); }}
      onMouseLeave={() => { pausedRef.current=false; setProgress(0); startTimers(); }}
    >
      <style>{`
        @keyframes heroIn {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .hero-in { animation: heroIn 0.6s ease forwards; }
      `}</style>

      {/* Backgrounds */}
      {slides.map((s,i)=>(
        <div key={i} className="absolute inset-0 transition-opacity duration-1000" style={{opacity:i===current?1:0}}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={s.imageUrl} alt={s.title??"NYS"} className="h-full w-full object-cover" draggable={false}/>
          <div className="absolute inset-0" style={{background:"rgba(35,4,4,0.55)"}}/>
        </div>
      ))}
      {slides.length===0 && <div className="absolute inset-0" style={{background:"linear-gradient(160deg,#7f1d1d 0%,#991b1b 40%,#b45309 100%)"}}/>}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32" style={{background:"linear-gradient(to top,rgba(100,20,20,0.5),transparent)"}}/>

      {/* ── Content — re-keyed on slide change ── */}
      <div key={current} className="hero-in absolute inset-0 z-10 flex flex-col">

        {/* ── TOP: Logo + Org name — always on every slide ── */}
        <div className="flex flex-col items-center pt-6 text-center sm:pt-8 lg:pt-10">
          {logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={orgName}
              className="mb-3 h-14 w-14 rounded-full border-4 border-orange-300/40 object-contain shadow-2xl sm:h-18 sm:w-18 lg:h-20 lg:w-20"/>
          )}
          <h1
            className="max-w-4xl px-4 text-2xl font-extrabold leading-tight text-white sm:text-3xl lg:text-4xl xl:text-5xl"
            style={{textShadow:"0 2px 24px rgba(0,0,0,0.65)"}}
          >
            {orgName}
          </h1>
          {/* Divider */}
          <div className="mt-3 h-px w-48 sm:w-64"
            style={{background:"linear-gradient(90deg,transparent,rgba(251,191,36,0.55),transparent)"}}/>
        </div>

        {/* ── BOTTOM: Two-column — left content | right icon ── */}
        <div className="flex flex-1 items-center justify-center gap-0 px-6 lg:gap-8 lg:px-12 xl:px-20">

          {def ? (
            <>
              {/* ── LEFT: slide-specific content ── */}
              <div className={`flex flex-1 flex-col ${def.isIntro ? "items-center text-center" : "items-start text-left"} max-w-xl`}>

                {/* Slide 1: intro content */}
                {def.isIntro && (
                  <>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-4 py-1 text-xs font-bold tracking-widest text-amber-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400"/>
                      ESTD. 2023 · JODHPUR, RAJASTHAN
                    </div>
                    <p className="max-w-xl text-sm font-medium text-orange-100 sm:text-base lg:text-lg"
                      style={{textShadow:"0 1px 8px rgba(0,0,0,0.4)"}}>
                      {tagline}
                    </p>
                    {orgAddress && <p className="mt-1 text-xs text-orange-200/70 sm:text-sm">{orgAddress}</p>}
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                      <Link href="/join"
                        className="rounded-full px-7 py-2.5 text-sm font-bold text-white shadow-xl transition hover:scale-105 active:scale-95"
                        style={{background:"linear-gradient(135deg,#d97706,#b45309)",boxShadow:"0 4px 20px rgba(217,119,6,0.4)"}}>
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
                    {campaign && (
                      <div className="mt-5 w-full max-w-sm rounded-2xl border border-white/20 bg-white/10 p-4 text-left backdrop-blur-md">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-orange-300">{dict.hero_campaign}</p>
                        <p className="mt-0.5 text-sm font-bold text-white leading-snug">{campaign.title}</p>
                        <div className="mt-2"><ProgressBar percent={campaign.percent}/>
                          <div className="mt-2 grid grid-cols-3 gap-1 text-center text-[10px]">
                            <div><div className="font-bold text-orange-300">{formatINR(campaign.collected)}</div><div className="text-white/50">{dict.hero_collected}</div></div>
                            <div><div className="font-bold text-white">{campaign.percent}%</div><div className="text-white/50">{dict.hero_complete}</div></div>
                            <div><div className="font-bold text-orange-300">{formatINR(campaign.goal)}</div><div className="text-white/50">{dict.hero_goal}</div></div>
                          </div>
                        </div>
                        <Link href={`/campaigns/${campaign.slug}`}
                          className="mt-3 block w-full rounded-xl py-2 text-center text-xs font-bold text-white"
                          style={{background:"linear-gradient(135deg,#d97706,#b45309)"}}>
                          {dict.hero_view_campaign}
                        </Link>
                      </div>
                    )}
                  </>
                )}

                {/* Slides 2-5: vision content */}
                {!def.isIntro && (
                  <>
                    {def.label && (
                      <p className="text-xs font-bold tracking-widest text-amber-400 uppercase mb-2 sm:text-sm">
                        {def.label}
                      </p>
                    )}
                    {def.sectionTitle && (
                      <h2 className="text-4xl font-black text-white sm:text-5xl lg:text-6xl"
                        style={{textShadow:"0 2px 20px rgba(0,0,0,0.5)"}}>
                        {def.sectionTitle}
                      </h2>
                    )}
                    {def.sectionSubtitle && (
                      <div className="mt-2 flex items-center gap-3">
                        <span className="text-xs font-bold tracking-widest text-amber-400 uppercase sm:text-sm">
                          {def.sectionSubtitle}
                        </span>
                        <div className="h-px flex-1 max-w-24"
                          style={{background:"linear-gradient(90deg,rgba(251,191,36,0.6),transparent)"}}/>
                      </div>
                    )}
                    {def.bullets && (
                      <ul className="mt-4 space-y-2 sm:mt-5 sm:space-y-2.5">
                        {def.bullets.map((b,i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-400"/>
                            <span className="text-sm font-medium text-stone-200 leading-snug sm:text-base">{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </div>

              {/* ── RIGHT: Icon — hidden on mobile ── */}
              <div className="hidden shrink-0 lg:flex lg:w-[220px] xl:w-[260px] items-center justify-center">
                {def.isIntro
                  ? <NysCircleIcon logoUrl={logoUrl}/>
                  : (ICON_MAP[slideId] ?? <NysCircleIcon logoUrl={logoUrl}/>)
                }
              </div>
            </>
          ) : (
            /* ── Fallback for custom slides ── */
            <div className="flex flex-1 flex-col items-center text-center max-w-2xl">
              <p className="text-sm font-medium text-orange-100 sm:text-base lg:text-lg"
                style={{textShadow:"0 1px 8px rgba(0,0,0,0.4)"}}>
                {tagline}
              </p>
              {orgAddress && <p className="mt-1 text-xs text-orange-200/70 sm:text-sm">{orgAddress}</p>}
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link href="/join"
                  className="rounded-full px-7 py-2.5 text-sm font-bold text-white shadow-xl transition hover:scale-105"
                  style={{background:"linear-gradient(135deg,#d97706,#b45309)"}}>
                  {dict.hero_join}
                </Link>
                <Link href="/activities"
                  className="rounded-full border-2 border-white/40 bg-white/10 px-6 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20">
                  {dict.hero_activities}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Controls ── */}
      {total > 1 && (
        <>
          <button onClick={()=>goTo(current-1)}
            className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-black/30 p-2.5 text-white backdrop-blur-sm transition hover:bg-black/50"
            aria-label="Previous">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <button onClick={()=>goTo(current+1)}
            className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-black/30 p-2.5 text-white backdrop-blur-sm transition hover:bg-black/50"
            aria-label="Next">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
          <div className="absolute bottom-6 left-0 right-0 z-20 flex flex-col items-center gap-2">
            <div className="h-0.5 w-24 overflow-hidden rounded-full bg-white/20">
              <div className="h-full bg-orange-400 transition-none" style={{width:`${progress}%`}}/>
            </div>
            <div className="flex gap-2">
              {slides.map((_,i)=>(
                <button key={i} onClick={()=>goTo(i)}
                  className={`rounded-full transition-all duration-300 ${i===current?"h-2 w-6 bg-orange-400":"h-2 w-2 bg-white/40 hover:bg-white/70"}`}
                  aria-label={`Slide ${i+1}`}/>
              ))}
            </div>
          </div>
          <div className="absolute bottom-6 right-4 z-20 rounded-full bg-black/30 px-2.5 py-1 text-xs font-medium text-white/70 backdrop-blur-sm">
            {current+1} / {total}
          </div>
        </>
      )}
    </section>
  );
}
