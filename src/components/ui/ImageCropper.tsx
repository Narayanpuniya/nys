"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ZoomIn, ZoomOut, RotateCcw, Check, X } from "lucide-react";

type Props = {
  /** data: URL of the original image */
  src: string;
  onDone: (file: File, previewUrl: string) => void;
  onCancel: () => void;
  /** crop box size in px (default 280, always 1:1 square) */
  size?: number;
};

export function ImageCropper({ src, onDone, onCancel, size = 280 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef    = useRef<HTMLImageElement | null>(null);

  const [natW, setNatW] = useState(0);
  const [natH, setNatH] = useState(0);
  const [pos,  setPos]  = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  /* ── load image & compute initial fill-scale ── */
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const nw = img.naturalWidth;
      const nh = img.naturalHeight;
      setNatW(nw);
      setNatH(nh);
      const initScale = size / Math.min(nw, nh);
      const sw = nw * initScale;
      const sh = nh * initScale;
      setScale(initScale);
      setPos({ x: (size - sw) / 2, y: (size - sh) / 2 });
    };
    img.src = src;
    imgRef.current = img;
  }, [src, size]);

  /* ── draw on canvas whenever pos / scale change ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imgRef.current || !natW) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width  = size;
    canvas.height = size;
    ctx.clearRect(0, 0, size, size);
    ctx.drawImage(imgRef.current, pos.x, pos.y, natW * scale, natH * scale);
  }, [pos, scale, natW, natH, size]);

  /* ── mouse drag ── */
  const dragging   = useRef(false);
  const lastMouse  = useRef({ x: 0, y: 0 });

  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };
  const onGlobalMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    setPos(p => ({ x: p.x + dx, y: p.y + dy }));
  }, []);
  const onGlobalMouseUp = useCallback(() => { dragging.current = false; }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onGlobalMouseMove);
    window.addEventListener("mouseup",   onGlobalMouseUp);
    return () => {
      window.removeEventListener("mousemove", onGlobalMouseMove);
      window.removeEventListener("mouseup",   onGlobalMouseUp);
    };
  }, [onGlobalMouseMove, onGlobalMouseUp]);

  /* ── touch drag + pinch zoom ── */
  const lastTouch     = useRef<{ x: number; y: number } | null>(null);
  const lastPinchDist = useRef<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      lastTouch.current     = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      lastPinchDist.current = null;
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastPinchDist.current = Math.hypot(dx, dy);
      lastTouch.current     = null;
    }
  };
  const onTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1 && lastTouch.current) {
      const dx = e.touches[0].clientX - lastTouch.current.x;
      const dy = e.touches[0].clientY - lastTouch.current.y;
      lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setPos(p => ({ x: p.x + dx, y: p.y + dy }));
    } else if (e.touches.length === 2 && lastPinchDist.current != null) {
      const dx   = e.touches[0].clientX - e.touches[1].clientX;
      const dy   = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const ratio = dist / lastPinchDist.current;
      lastPinchDist.current = dist;
      setScale(s => clamp(s * ratio, 0.3, 6));
    }
  };

  /* ── zoom buttons ── */
  const zoom  = (f: number) => setScale(s => clamp(s * f, 0.3, 6));
  const reset = () => {
    if (!natW) return;
    const initScale = size / Math.min(natW, natH);
    const sw = natW * initScale;
    const sh = natH * initScale;
    setScale(initScale);
    setPos({ x: (size - sw) / 2, y: (size - sh) / 2 });
  };

  /* ── export cropped image ── */
  const handleDone = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(blob => {
      if (!blob) return;
      const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
      const url  = URL.createObjectURL(blob);
      onDone(file, url);
    }, "image/jpeg", 0.92);
  };

  const boxStyle: React.CSSProperties = {
    width:    size,
    height:   size,
    cursor:   "grab",
    border:   "3px solid #d97706",
    borderRadius: 16,
    overflow: "hidden",
    touchAction: "none",
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="w-full max-w-xs rounded-2xl bg-white p-5 shadow-2xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold text-stone-800">📸 फोटो क्रॉप करें</h3>
          <button type="button" onClick={onCancel} className="rounded-lg p-1 hover:bg-stone-100">
            <X className="h-5 w-5 text-stone-500" />
          </button>
        </div>

        {/* Canvas viewport */}
        <div
          className="mx-auto mb-1"
          style={boxStyle}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
        >
          <canvas ref={canvasRef} width={size} height={size} style={{ display: "block" }} />
        </div>

        <p className="mb-4 text-center text-[11px] text-stone-400">
          ← फोटो खींचें · जो बॉक्स में दिखे वही कटेगा →
        </p>

        {/* Zoom controls */}
        <div className="mb-5 flex items-center justify-center gap-2">
          <button type="button" onClick={() => zoom(0.85)}
            className="rounded-lg bg-stone-100 p-2 hover:bg-stone-200">
            <ZoomOut className="h-4 w-4 text-stone-600" />
          </button>
          <input
            type="range" min={30} max={600} value={Math.round(scale * 100)}
            onChange={e => setScale(Number(e.target.value) / 100)}
            className="w-28 accent-saffron-600"
          />
          <button type="button" onClick={() => zoom(1.15)}
            className="rounded-lg bg-stone-100 p-2 hover:bg-stone-200">
            <ZoomIn className="h-4 w-4 text-stone-600" />
          </button>
          <button type="button" onClick={reset} title="रीसेट"
            className="ml-1 rounded-lg bg-stone-100 p-2 hover:bg-stone-200">
            <RotateCcw className="h-4 w-4 text-stone-500" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button type="button" onClick={onCancel}
            className="flex-1 rounded-xl border border-stone-200 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50">
            रद्द करें
          </button>
          <button type="button" onClick={handleDone}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-saffron-600 py-2.5 text-sm font-bold text-white hover:bg-saffron-700">
            <Check className="h-4 w-4" /> क्रॉप करें
          </button>
        </div>
      </div>
    </div>
  );
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}
