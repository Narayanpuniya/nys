"use client";

import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight, X, Maximize2 } from "lucide-react";

interface PhotoSlideshowProps {
  images: string[];       // all photos (main + gallery)
  altPrefix?: string;
}

/**
 * Swipeable photo gallery with thumbnail strip.
 * Touch-swipe + arrow navigation + lightbox fullscreen.
 */
export function PhotoSlideshow({ images, altPrefix = "फोटो" }: PhotoSlideshowProps) {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const touchStartX = useRef<number | null>(null);

  if (images.length === 0) return null;

  // Single image — just show it, no controls needed
  if (images.length === 1) {
    return (
      <div className="relative mt-5 overflow-hidden rounded-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[0]}
          alt={`${altPrefix} 1`}
          className="h-auto w-full rounded-2xl"
          style={{ display: "block" }}
        />
      </div>
    );
  }

  const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length);
  const next = () => setCurrent((c) => (c + 1) % images.length);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
    touchStartX.current = null;
  }

  return (
    <>
      <div className="mt-5">
        {/* ── Main viewer ── */}
        <div
          className="relative overflow-hidden rounded-2xl bg-stone-100"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={current}
            src={images[current]}
            alt={`${altPrefix} ${current + 1}`}
            className="h-auto w-full rounded-2xl"
            style={{ display: "block", minHeight: "180px", objectFit: "contain" }}
          />

          {/* Left arrow */}
          <button
            onClick={prev}
            aria-label="पिछला"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition hover:bg-black/60"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Right arrow */}
          <button
            onClick={next}
            aria-label="अगला"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition hover:bg-black/60"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Counter + fullscreen */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
            <span className="rounded-full bg-black/50 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
              {current + 1} / {images.length}
            </span>
            <button
              onClick={() => setLightbox(true)}
              aria-label="पूरा आकार"
              className="rounded-full bg-black/40 p-1.5 text-white backdrop-blur-sm hover:bg-black/60"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* ── Thumbnail strip ── */}
        <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`shrink-0 overflow-hidden rounded-lg border-2 transition ${
                i === current
                  ? "border-saffron-500 opacity-100"
                  : "border-transparent opacity-60 hover:opacity-90"
              }`}
              style={{ width: 60, height: 48 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`${altPrefix} ${i + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      </div>

      {/* ── Lightbox ── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightbox(false)}
          onTouchStart={onTouchStart}
          onTouchEnd={(e) => { onTouchEnd(e); }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[current]}
            alt={`${altPrefix} ${current + 1}`}
            className="max-h-[90vh] max-w-full rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setLightbox(false)}
            className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white hover:bg-white/40"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white hover:bg-white/40"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white hover:bg-white/40"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/20 px-3 py-1 text-sm font-semibold text-white">
            {current + 1} / {images.length}
          </span>
        </div>
      )}
    </>
  );
}
