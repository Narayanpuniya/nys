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

// ── Slide-specific content for default slides ─────────────────────────────────
const SLIDE_CONTENT: Record<string, {
  layout: "intro" | "vision" | "cta";
  badge?: string;
  label?: string;
  heading?: string;
  subheading?: string;
  bullets?: string[];
  iconPos?: "left" | "right" | "corner";
}> = {
  "default-1": {
    layout: "intro",
    badge: "ESTD. 2023 · JODHPUR, RAJASTHAN",
    iconPos: "right",
  },
  "default-2": {
    layout: "vision",
    label: "हमारा विज़न · OUR VISION",
    heading: "शिक्षा",
    subheading: "EDUCATION",
    bullets: [
      "सरकारी विद्यालयों का विकास एवं सुदृढ़ीकरण",
      "ग्राम स्तर पर पुस्तकालय निर्माण",
      "होनहार प्रतिभाओं का प्रोत्साहन एवं सहयोग",
    ],
    iconPos: "left",
  },
  "default-3": {
    layout: "vision",
    label: "हमारा विज़न · OUR VISION",
    heading: "खेल",
    subheading: "SPORTS & WELLNESS",
    bullets: [
      "खेल मैदान विकास एवं आधुनिकीकरण",
      "खेल संसाधनों की व्यवस्था एवं प्रबंधन",
      "खेल प्रतिभाओं का प्रोत्साहन एवं मार्गदर्शन",
      "योग द्वारा स्वस्थ जीवन शैली को प्रोत्साहन",
    ],
    iconPos: "right",
  },
  "default-4": {
    layout: "vision",
    label: "हमारा विज़न · OUR VISION",
    heading: "पर्यावरण",
    subheading: "ENVIRONMENT",
    bullets: [
      "जल संरक्षण एवं प्रबंधन",
      "वन्य जीव संरक्षण",
      "वन व ओरण विकास",
      "Eco Tourism Development",
      "Heritage Development",
    ],
    iconPos: "corner",
  },
  "default-5": {
    layout: "vision",
    label: "हमारा विज़न · OUR VISION",
    heading: "व्यवसाय",
    subheading: "BUSINESS & SKILLS",
    bullets: [
      "कौशल विकास केन्द्र निर्माण",
      "Craft Conservation",
      "महिला सशक्तिकरण",
    ],
    iconPos: "corner",
  },
};

// ── SVG Decorative Icons ──────────────────────────────────────────────────────

function NysCircleIcon({ logoUrl }: { logoUrl?: string | null }) {
  return (
    <svg viewBox="0 0 240 240" className="h-44 w-44 opacity-75 drop-shadow-xl md:h-56 md:w-56">
      <circle cx="120" cy="120" r="112" fill="none" stroke="#d97706" strokeWidth="0.8" opacity="0.3" />
      <circle cx="120" cy="120" r="96"  fill="none" stroke="#d97706" strokeWidth="1"   opacity="0.4" />
      <circle cx="120" cy="120" r="78"  fill="none" stroke="#d97706" strokeWidth="1"   opacity="0.5" />
      <circle cx="120" cy="120" r="60"  fill="none" stroke="#f59e0b" strokeWidth="1.5" opacity="0.6" />
      {/* Cardinal ticks */}
      {[0,90,180,270].map(a => {
        const r = 96, rad = (a - 90) * Math.PI / 180;
        const x1 = 120 + r * Math.cos(rad), y1 = 120 + r * Math.sin(rad);
        const x2 = 120 + (r-12) * Math.cos(rad), y2 = 120 + (r-12) * Math.sin(rad);
        return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f59e0b" strokeWidth="2" opacity="0.7" />;
      })}
      {/* Diamond top */}
      <polygon points="120,8 127,16 120,24 113,16" fill="#d97706" opacity="0.8" />
      {/* Center circle */}
      <circle cx="120" cy="120" r="48" fill="rgba(127,29,29,0.85)" stroke="#f59e0b" strokeWidth="1.5" />
      {logoUrl ? (
        <image href={logoUrl} x="84" y="84" width="72" height="72" />
      ) : (
        <>
          <text x="120" y="114" textAnchor="middle" fill="#f59e0b" fontSize="18" fontWeight="bold">NYS</text>
          <text x="120" y="132" textAnchor="middle" fill="#f59e0b" fontSize="8" letterSpacing="2">NARAYANPURI</text>
        </>
      )}
    </svg>
  );
}

function LampIcon() {
  return (
    <svg viewBox="0 0 180 260" className="h-52 w-40 opacity-80 drop-shadow-xl">
      {/* Glow */}
      <ellipse cx="90" cy="52" rx="42" ry="42" fill="#f59e0b" opacity="0.08" />
      <ellipse cx="90" cy="52" rx="28" ry="28" fill="#f59e0b" opacity="0.12" />
      {/* Light rays */}
      {[[-30,-28],[-15,-32],[0,-34],[15,-32],[30,-28]].map(([dx,dy],i) => (
        <line key={i} x1={90} y1={52} x2={90+dx} y2={52+dy}
          stroke="#fbbf24" strokeWidth="1.5" opacity="0.5" strokeLinecap="round" />
      ))}
      {/* Bulb */}
      <ellipse cx="90" cy="56" rx="18" ry="22" fill="#fbbf24" opacity="0.9" />
      <ellipse cx="90" cy="60" rx="10" ry="13" fill="#fef3c7" opacity="0.8" />
      {/* Lamp shade */}
      <path d="M 50 76 Q 90 68 130 76 L 115 120 Q 90 114 65 120 Z" fill="#d97706" />
      <path d="M 50 76 Q 90 70 130 76 L 128 82 Q 90 77 52 82 Z" fill="#b45309" />
      {/* Neck */}
      <rect x="84" y="120" width="12" height="6" rx="2" fill="#92400e" />
      {/* Stem */}
      <rect x="87" y="126" width="6" height="72" rx="3" fill="#78350f" />
      {/* Base disk */}
      <ellipse cx="90" cy="200" rx="32" ry="7" fill="#92400e" />
      {/* Book stack */}
      <rect x="56" y="202" width="68" height="10" rx="3" fill="#b45309" />
      <rect x="50" y="210" width="80" height="9" rx="3" fill="#92400e" />
      <rect x="46" y="218" width="88" height="9" rx="3" fill="#78350f" />
    </svg>
  );
}

function SportsRadarIcon() {
  return (
    <svg viewBox="0 0 240 240" className="h-44 w-44 opacity-75 drop-shadow-xl md:h-52 md:w-52">
      {/* Outer ellipse rings */}
      <ellipse cx="120" cy="120" rx="108" ry="68" fill="none" stroke="#d97706" strokeWidth="0.8" opacity="0.35" />
      <ellipse cx="120" cy="120" rx="90" ry="56"  fill="none" stroke="#d97706" strokeWidth="1"   opacity="0.45" />
      <ellipse cx="120" cy="120" rx="72" ry="44"  fill="none" stroke="#d97706" strokeWidth="1"   opacity="0.55" />
      <ellipse cx="120" cy="120" rx="54" ry="32"  fill="none" stroke="#f59e0b" strokeWidth="1.5" opacity="0.65" />
      {/* Vertical ellipse rings */}
      <ellipse cx="120" cy="120" rx="68" ry="108" fill="none" stroke="#d97706" strokeWidth="0.8" opacity="0.35" />
      <ellipse cx="120" cy="120" rx="56" ry="90"  fill="none" stroke="#d97706" strokeWidth="1"   opacity="0.45" />
      <ellipse cx="120" cy="120" rx="44" ry="72"  fill="none" stroke="#d97706" strokeWidth="1"   opacity="0.55" />
      {/* Cross lines */}
      <line x1="120" y1="12" x2="120" y2="228" stroke="#d97706" strokeWidth="0.6" opacity="0.3" />
      <line x1="12" y1="120" x2="228" y2="120" stroke="#d97706" strokeWidth="0.6" opacity="0.3" />
      {/* Cardinal ticks */}
      <line x1="120" y1="12" x2="120" y2="22" stroke="#f59e0b" strokeWidth="2" opacity="0.8" />
      <line x1="120" y1="218" x2="120" y2="228" stroke="#f59e0b" strokeWidth="2" opacity="0.8" />
      <line x1="12" y1="120" x2="22" y2="120" stroke="#f59e0b" strokeWidth="2" opacity="0.8" />
      <line x1="218" y1="120" x2="228" y2="120" stroke="#f59e0b" strokeWidth="2" opacity="0.8" />
      {/* Shield/diamond top */}
      <polygon points="120,7 128,14 120,21 112,14" fill="#d97706" opacity="0.85" />
      {/* Center circle */}
      <circle cx="120" cy="120" r="30" fill="rgba(127,29,29,0.9)" stroke="#f59e0b" strokeWidth="2" />
      <circle cx="120" cy="120" r="24" fill="none" stroke="#f59e0b" strokeWidth="0.5" opacity="0.5" />
      <text x="120" y="116" textAnchor="middle" fill="#f59e0b" fontSize="11" fontWeight="bold">NYS</text>
      <text x="120" y="128" textAnchor="middle" fill="#f59e0b" fontSize="7" letterSpacing="1">SPORTS</text>
    </svg>
  );
}

function TreeIcon() {
  return (
    <svg viewBox="0 0 200 260" className="h-48 w-40 opacity-80 drop-shadow-xl">
      {/* Glow aura */}
      <circle cx="100" cy="100" r="70" fill="#16a34a" opacity="0.06" />
      {/* Outer leaf ring hints */}
      <circle cx="100" cy="90" r="80" fill="none" stroke="#16a34a" strokeWidth="0.5" opacity="0.2" strokeDasharray="6 4" />
      <circle cx="100" cy="90" r="60" fill="none" stroke="#15803d" strokeWidth="0.5" opacity="0.3" strokeDasharray="4 4" />
      {/* Tree layers */}
      <polygon points="100,18 145,85 55,85" fill="#16a34a" opacity="0.9" />
      <polygon points="100,40 150,115 50,115" fill="#15803d" opacity="0.9" />
      <polygon points="100,65 155,148 45,148" fill="#14532d" opacity="0.85" />
      {/* Trunk */}
      <rect x="88" y="148" width="24" height="52" rx="4" fill="#92400e" />
      <rect x="88" y="148" width="12" height="52" rx="4" fill="#78350f" opacity="0.5" />
      {/* Root lines */}
      <path d="M 88 198 Q 70 205 55 200" stroke="#78350f" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M 112 198 Q 130 205 145 200" stroke="#78350f" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M 100 200 L 100 212" stroke="#78350f" strokeWidth="4" strokeLinecap="round" />
      {/* Leaf highlights */}
      <polygon points="100,28 118,68 82,68" fill="#22c55e" opacity="0.25" />
      <polygon points="100,50 122,100 78,100" fill="#22c55e" opacity="0.2" />
      {/* Ground */}
      <ellipse cx="100" cy="215" rx="50" ry="8" fill="#166534" opacity="0.4" />
    </svg>
  );
}

// Business/Skills icon for व्यवसाय (slide 5)
function BusinessIcon({ small }: { small?: boolean }) {
  const cls = small
    ? "h-20 w-20 opacity-30 drop-shadow"
    : "h-44 w-44 opacity-75 drop-shadow-xl md:h-52 md:w-52";
  return (
    <svg viewBox="0 0 220 220" className={cls}>
      {/* Outer ring */}
      <circle cx="110" cy="110" r="100" fill="none" stroke="#d97706" strokeWidth="0.8" opacity="0.3" />
      <circle cx="110" cy="110" r="82" fill="none" stroke="#d97706" strokeWidth="1" opacity="0.4" />
      {/* Gear teeth (outer) */}
      {Array.from({length: 12}, (_, i) => {
        const a = (i * 30 - 90) * Math.PI / 180;
        const r1 = 84, r2 = 96;
        const x1 = 110 + r1 * Math.cos(a), y1 = 110 + r1 * Math.sin(a);
        const x2 = 110 + r2 * Math.cos(a), y2 = 110 + r2 * Math.sin(a);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#d97706" strokeWidth="3" opacity="0.5" strokeLinecap="round" />;
      })}
      {/* Gear body */}
      <circle cx="110" cy="110" r="58" fill="rgba(127,29,29,0.5)" stroke="#d97706" strokeWidth="1.5" opacity="0.8" />
      {/* Inner gear teeth */}
      {Array.from({length: 8}, (_, i) => {
        const a = (i * 45 - 90) * Math.PI / 180;
        const r1 = 36, r2 = 46;
        const x1 = 110 + r1 * Math.cos(a), y1 = 110 + r1 * Math.sin(a);
        const x2 = 110 + r2 * Math.cos(a), y2 = 110 + r2 * Math.sin(a);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f59e0b" strokeWidth="2" opacity="0.6" strokeLinecap="round" />;
      })}
      {/* Inner hub */}
      <circle cx="110" cy="110" r="28" fill="rgba(127,29,29,0.9)" stroke="#f59e0b" strokeWidth="2" />
      {/* Center text */}
      <text x="110" y="105" textAnchor="middle" fill="#f59e0b" fontSize="9" fontWeight="bold">NYS</text>
      <text x="110" y="118" textAnchor="middle" fill="#f59e0b" fontSize="7" letterSpacing="1">SKILLS</text>
    </svg>
  );
}

// Small corner tree for environment/nature slides
function SmallTreeIcon() {
  return (
    <svg viewBox="0 0 80 110" className="h-20 w-14 opacity-25">
      <polygon points="40,5 62,40 18,40" fill="#16a34a" />
      <polygon points="40,22 66,62 14,62" fill="#15803d" />
      <polygon points="40,42 68,82 12,82" fill="#14532d" />
      <rect x="34" y="82" width="12" height="22" rx="3" fill="#78350f" />
    </svg>
  );
}

function JoinIcon() {
  return (
    <svg viewBox="0 0 220 220" className="h-44 w-44 opacity-75 drop-shadow-xl md:h-52 md:w-52">
      {/* Outer decorative rings */}
      <circle cx="110" cy="110" r="100" fill="none" stroke="#d97706" strokeWidth="0.8" opacity="0.3" />
      <circle cx="110" cy="110" r="84"  fill="none" stroke="#d97706" strokeWidth="1"   opacity="0.4" />
      {/* People silhouettes (3 people circle) */}
      {/* Person 1 - top */}
      <circle cx="110" cy="50" r="16" fill="#d97706" opacity="0.7" />
      <path d="M 80 88 Q 110 72 140 88" fill="#b45309" opacity="0.7" />
      {/* Person 2 - bottom left */}
      <circle cx="62" cy="150" r="16" fill="#d97706" opacity="0.65" />
      <path d="M 32 182 Q 62 168 92 182" fill="#b45309" opacity="0.65" />
      {/* Person 3 - bottom right */}
      <circle cx="158" cy="150" r="16" fill="#d97706" opacity="0.65" />
      <path d="M 128 182 Q 158 168 188 182" fill="#b45309" opacity="0.65" />
      {/* Connecting arcs */}
      <path d="M 94 62 Q 62 104 74 138" fill="none" stroke="#f59e0b" strokeWidth="1.5" opacity="0.5" />
      <path d="M 126 62 Q 158 104 146 138" fill="none" stroke="#f59e0b" strokeWidth="1.5" opacity="0.5" />
      <path d="M 78 164 L 142 164" stroke="#f59e0b" strokeWidth="1.5" opacity="0.5" />
      {/* Center badge */}
      <circle cx="110" cy="110" r="28" fill="rgba(127,29,29,0.9)" stroke="#f59e0b" strokeWidth="2" />
      <text x="110" y="105" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="bold">NYS</text>
      <text x="110" y="119" textAnchor="middle" fill="#f59e0b" fontSize="7" letterSpacing="1">JOIN</text>
    </svg>
  );
}

// ── Layout: Intro (slide 1 — NYS परिचय) ──────────────────────────────────────
function IntroLayout({
  orgName, orgAddress, tagline, regNo, logoUrl,
}: { orgName: string; orgAddress?: string; tagline: string; regNo?: string; logoUrl?: string | null }) {
  return (
    <div className="relative z-10 flex h-full flex-col justify-between px-6 py-8 md:px-12 md:py-10">
      {/* Main content */}
      <div className="flex flex-1 items-center gap-8">
        {/* Left text */}
        <div className="flex-1 max-w-xl">
          {/* Badge */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-4 py-1.5 text-xs font-bold tracking-widest text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            ESTD. 2023 · JODHPUR, RAJASTHAN
          </div>

          {/* Org name */}
          <h1
            className="text-4xl font-black leading-tight text-white md:text-5xl lg:text-6xl"
            style={{ textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}
          >
            {orgName}
          </h1>

          {/* Short name */}
          <div className="mt-2 text-xl font-bold tracking-wider text-amber-400">(NYS)</div>

          {/* Separator */}
          <div
            className="my-4 h-px w-64"
            style={{ background: "linear-gradient(90deg, rgba(251,191,36,0.7), transparent)" }}
          />

          {/* Address */}
          {orgAddress && (
            <p className="text-sm font-medium text-stone-300">{orgAddress}</p>
          )}

          {/* Tagline quote */}
          <blockquote
            className="mt-5 border-l-4 border-amber-400 pl-4 text-base text-stone-200 leading-relaxed"
          >
            {tagline}
          </blockquote>
        </div>

        {/* Right: decorative circle */}
        <div className="hidden shrink-0 lg:flex items-center justify-center pr-8">
          <NysCircleIcon logoUrl={logoUrl} />
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="flex items-center justify-between border-t border-white/10 pt-3 text-xs text-stone-400"
      >
        <span>
          {orgName} (NYS)
          {regNo && <span className="hidden sm:inline"> · Reg. {regNo}</span>}
        </span>
        <span className="font-medium text-amber-400">www.nys.org.in</span>
      </div>
    </div>
  );
}

// ── Layout: Vision (slides 2–5) ───────────────────────────────────────────────
const SLIDE_ICONS: Record<string, React.ReactNode> = {
  "default-2": <LampIcon />,
  "default-3": <SportsRadarIcon />,
  "default-4": <TreeIcon />,
  "default-5": <BusinessIcon />,
};

// Small corner icons for "corner" iconPos
const SLIDE_CORNER_ICONS: Record<string, React.ReactNode> = {
  "default-4": <SmallTreeIcon />,
  "default-5": <BusinessIcon small />,
};

function VisionLayout({
  slideId, label, heading, subheading, bullets, iconPos, orgName, dict,
}: {
  slideId: string;
  label?: string;
  heading?: string;
  subheading?: string;
  bullets?: string[];
  iconPos?: "left" | "right" | "corner";
  orgName: string;
  dict: Dict;
}) {
  const icon = SLIDE_ICONS[slideId];
  const cornerIcon = SLIDE_CORNER_ICONS[slideId];

  return (
    <div className="relative z-10 flex h-full flex-col justify-between px-6 py-8 md:px-12 md:py-10">
      {/* Corner icon (bottom-right decoration for slides 4 & 5) */}
      {iconPos === "corner" && cornerIcon && (
        <div className="pointer-events-none absolute bottom-10 right-6">
          {cornerIcon}
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 items-center gap-6 lg:gap-12">
        {/* Left icon */}
        {iconPos === "left" && icon && (
          <div className="hidden shrink-0 lg:flex items-end justify-center pl-4 pb-4">
            {icon}
          </div>
        )}

        {/* Text block */}
        <div className="flex-1 max-w-lg">
          {label && (
            <p className="mb-3 text-xs font-bold tracking-widest text-amber-400 uppercase">
              {label}
            </p>
          )}
          {heading && (
            <h1
              className="text-5xl font-black text-white md:text-6xl lg:text-7xl"
              style={{ textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}
            >
              {heading}
            </h1>
          )}
          {subheading && (
            <div className="mt-3 flex items-center gap-3">
              <span className="text-sm font-bold tracking-widest text-amber-400 uppercase">
                {subheading}
              </span>
              <div
                className="flex-1 h-px max-w-40"
                style={{ background: "linear-gradient(90deg, rgba(251,191,36,0.6), transparent)" }}
              />
            </div>
          )}
          {bullets && bullets.length > 0 && (
            <ul className="mt-5 space-y-2.5">
              {bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-400" />
                  <span className="text-sm font-medium text-stone-200 leading-snug md:text-base">{b}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right icon */}
        {iconPos === "right" && icon && (
          <div className="hidden shrink-0 lg:flex items-center justify-center pr-8">
            {icon}
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between border-t border-white/10 pt-3 text-xs text-stone-400">
        <span>{orgName} (NYS)</span>
        <span className="font-medium text-amber-400">www.nys.org.in</span>
      </div>
    </div>
  );
}

// ── Layout: CTA (slide 5 — NYS से जुड़ें) ────────────────────────────────────
function CTALayout({
  label, heading, subheading, bullets, orgName, dict,
}: {
  label?: string; heading?: string; subheading?: string; bullets?: string[];
  orgName: string; dict: Dict;
}) {
  return (
    <div className="relative z-10 flex h-full flex-col justify-between px-6 py-8 md:px-12 md:py-10">
      <div className="flex flex-1 items-center gap-8">
        {/* Text */}
        <div className="flex-1 max-w-lg">
          {label && (
            <p className="mb-3 text-xs font-bold tracking-widest text-amber-400 uppercase">{label}</p>
          )}
          {heading && (
            <h1 className="text-5xl font-black text-white md:text-6xl" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}>
              {heading}
            </h1>
          )}
          {subheading && (
            <div className="mt-3 flex items-center gap-3">
              <span className="text-sm font-bold tracking-widest text-amber-400 uppercase">{subheading}</span>
              <div className="flex-1 h-px max-w-32" style={{ background: "linear-gradient(90deg, rgba(251,191,36,0.6), transparent)" }} />
            </div>
          )}
          {bullets && (
            <ul className="mt-5 space-y-2.5">
              {bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-400" />
                  <span className="text-sm font-medium text-stone-200 leading-snug md:text-base">{b}</span>
                </li>
              ))}
            </ul>
          )}
          {/* CTA buttons */}
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/join"
              className="rounded-full px-8 py-3 text-sm font-bold text-white shadow-xl transition hover:scale-105 active:scale-95"
              style={{ background: "linear-gradient(135deg, #d97706, #b45309)", boxShadow: "0 4px 20px rgba(217,119,6,0.4)" }}
            >
              {dict.hero_join}
            </Link>
            <Link
              href="/activities"
              className="rounded-full border-2 border-white/40 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              {dict.hero_activities}
            </Link>
          </div>
        </div>

        {/* Right icon */}
        <div className="hidden shrink-0 lg:flex items-center justify-center pr-8">
          <JoinIcon />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-white/10 pt-3 text-xs text-stone-400">
        <span>{orgName} (NYS)</span>
        <span className="font-medium text-amber-400">www.nys.org.in</span>
      </div>
    </div>
  );
}

// ── Default centered layout (for custom/uploaded slides) ─────────────────────
function DefaultLayout({
  orgName, orgAddress, tagline, logoUrl, slide, current, campaign, dict,
}: {
  orgName: string; orgAddress?: string; tagline: string;
  logoUrl?: string | null; slide: Slide | undefined;
  current: number; campaign: FeaturedCampaign; dict: Dict;
}) {
  return (
    <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
      {logoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt={orgName} className="mb-5 h-20 w-20 rounded-full border-4 border-orange-300/40 object-contain shadow-2xl" />
      )}
      <h1 className="max-w-4xl text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl xl:text-6xl"
        style={{ textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}>
        {orgName}
      </h1>
      {slide?.title && (
        <div key={current} className="mt-4 inline-flex items-center gap-2 rounded-full px-5 py-1.5"
          style={{
            background: "linear-gradient(135deg, rgba(217,119,6,0.75), rgba(127,29,29,0.6))",
            border: "1px solid rgba(251,191,36,0.4)", backdropFilter: "blur(8px)",
            animation: "fadeSlideUp 0.6s ease forwards",
          }}>
          <span className="text-sm font-bold tracking-wide text-white" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
            {slide.title}
          </span>
        </div>
      )}
      <p className="mt-3 max-w-2xl text-base font-medium text-orange-100 sm:text-lg lg:text-xl"
        style={{ textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}>
        {tagline}
      </p>
      {orgAddress && <p className="mt-2 text-sm text-orange-200/70">{orgAddress}</p>}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/join" className="rounded-full px-8 py-3 text-sm font-bold text-white shadow-xl transition hover:scale-105"
          style={{ background: "linear-gradient(135deg, #d97706, #b45309)" }}>
          {dict.hero_join}
        </Link>
        <Link href="/activities" className="rounded-full border-2 border-white/50 bg-white/10 px-8 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20">
          {dict.hero_activities}
        </Link>
        <Link href="/donate" className="rounded-full border border-orange-300/50 px-6 py-3 text-sm font-medium text-orange-200 transition hover:text-white">
          {dict.hero_donate} →
        </Link>
      </div>
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
          <Link href={`/campaigns/${campaign.slug}`}
            className="mt-3 block w-full rounded-xl py-2 text-center text-xs font-bold text-white"
            style={{ background: "linear-gradient(135deg, #d97706, #b45309)" }}>
            {dict.hero_view_campaign}
          </Link>
        </div>
      )}
    </div>
  );
}

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

  const handleMouseEnter = useCallback(() => {
    pausedRef.current = true; stopTimers();
  }, [stopTimers]);

  const handleMouseLeave = useCallback(() => {
    pausedRef.current = false; setProgress(0); startTimers();
  }, [startTimers]);

  const slide = slides[current];
  const slideId = (slide as { id?: string })?.id ?? "";
  const content = SLIDE_CONTENT[slideId];

  return (
    <section
      className="relative min-h-[480px] overflow-hidden lg:min-h-[580px]"
      style={{ height: "calc(100vh - 120px)" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Animation keyframes */}
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Slide backgrounds */}
      {slides.map((s, i) => (
        <div key={i} className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: i === current ? 1 : 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={s.imageUrl} alt={s.title ?? "NYS"} className="h-full w-full object-cover" draggable={false} />
          <div className="absolute inset-0" style={{ background: "rgba(50,8,8,0.54)" }} />
        </div>
      ))}

      {/* Gradient fallback */}
      {slides.length === 0 && (
        <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, #7f1d1d 0%, #991b1b 40%, #b45309 100%)" }} />
      )}

      {/* Bottom fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24"
        style={{ background: "linear-gradient(to top, rgba(127,29,29,0.4), transparent)" }} />

      {/* Slide content — keyed to current so layouts animate in */}
      <div key={current} className="absolute inset-0" style={{ animation: "fadeSlideUp 0.5s ease forwards" }}>
        {content?.layout === "intro" ? (
          <IntroLayout
            orgName={orgName}
            orgAddress={orgAddress}
            tagline={tagline}
            regNo={regNo}
            logoUrl={logoUrl}
          />
        ) : content?.layout === "cta" ? (
          <CTALayout
            label={content.label}
            heading={content.heading}
            subheading={content.subheading}
            bullets={content.bullets}
            orgName={orgName}
            dict={dict}
          />
        ) : content?.layout === "vision" ? (
          <VisionLayout
            slideId={slideId}
            label={content.label}
            heading={content.heading}
            subheading={content.subheading}
            bullets={content.bullets}
            iconPos={content.iconPos}
            orgName={orgName}
            dict={dict}
          />
        ) : (
          <DefaultLayout
            orgName={orgName}
            orgAddress={orgAddress}
            tagline={tagline}
            logoUrl={logoUrl}
            slide={slide}
            current={current}
            campaign={campaign}
            dict={dict}
          />
        )}
      </div>

      {/* Slider controls */}
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

          {/* Progress + dots */}
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
