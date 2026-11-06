import React from "react";
import { AdCreative, BannerFormat } from "../types/banner";

interface BannerCanvasProps {
  format: BannerFormat;
  creative: AdCreative;
  scale?: number;
  className?: string;
  onClick?: () => void;
}

export const BannerCanvas: React.FC<BannerCanvasProps> = ({
  format,
  creative,
  scale = 1,
  className = "",
  onClick,
}) => {
  const { width, height } = format;
  const isHorizontal = width > height * 2.5; // e.g. 728x90, 970x250, 320x50
  const isVeryTall = height >= width * 2.5;  // e.g. 160x600, 300x600, 1080x1920
  const isCompactMobile = width <= 320 && height <= 50;

  const accentColor = creative.accentColor || "#F59E0B";

  return (
    <div
      onClick={onClick}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: "top left",
      }}
      className={`relative overflow-hidden select-none font-sans bg-slate-950 text-white ${className}`}
    >
      {/* Background Photography Asset */}
      {creative.imageUrl && (
        <div className="absolute inset-0 pointer-events-none">
          <img
            src={creative.imageUrl}
            alt={creative.brandName}
            referrerPolicy="no-referrer"
            className={`w-full h-full object-cover transition-transform duration-500 ${
              isHorizontal ? "object-right" : isVeryTall ? "object-center" : "object-center"
            }`}
          />
        </div>
      )}

      {/* Dynamic Lighting & Scrim Overlays */}
      {isHorizontal ? (
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 via-55% to-slate-950/20" />
      ) : isVeryTall ? (
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/95 via-transparent via-45% to-slate-950/95" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 via-50% to-slate-950/30" />
      )}

      {/* Decorative Brand Accent Glow */}
      <div
        className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: accentColor }}
      />

      {/* Content Layer */}
      {isCompactMobile ? (
        // 320x50 Mobile Sticky Banner
        <div className="relative z-10 w-full h-full flex items-center justify-between px-3">
          <div className="flex flex-col justify-center min-w-0 pr-2">
            <span
              className="text-[9px] font-bold tracking-wider uppercase truncate"
              style={{ color: accentColor }}
            >
              {creative.brandName}
            </span>
            <span className="text-[11px] font-bold leading-tight text-white truncate font-display">
              {creative.headline}
            </span>
            <span className="text-[9px] text-slate-400 truncate">
              {creative.subheadline}
            </span>
          </div>
          <button
            type="button"
            className="shrink-0 px-2.5 py-1 text-[10px] font-bold rounded text-slate-950 shadow-md transition-transform active:scale-95"
            style={{ backgroundColor: accentColor }}
          >
            {creative.callToAction}
          </button>
        </div>
      ) : isHorizontal ? (
        // 728x90 Leaderboard or 970x250 Billboard
        <div
          className={`relative z-10 w-full h-full flex items-center justify-between ${
            width > 800 ? "px-8 py-5" : "px-5 py-3"
          }`}
        >
          <div className="flex flex-col justify-center max-w-[62%]">
            <div className="flex items-center gap-2 mb-1">
              {creative.badgeText && (
                <span
                  className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded text-slate-950"
                  style={{ backgroundColor: accentColor }}
                >
                  {creative.badgeText}
                </span>
              )}
              <span className="text-[10px] font-bold tracking-wider text-slate-300 uppercase">
                {creative.brandName}
              </span>
            </div>

            <h2
              className={`font-black tracking-tight text-white font-display leading-none mb-1 text-balance ${
                width > 800 ? "text-2xl" : "text-base"
              }`}
            >
              {creative.headline}
            </h2>

            <p
              className={`text-slate-300 leading-snug line-clamp-1 ${
                width > 800 ? "text-xs" : "text-[11px]"
              }`}
            >
              {creative.subheadline}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              className={`font-bold rounded-lg text-slate-950 shadow-lg tracking-wide transition-transform active:scale-95 ${
                width > 800 ? "px-6 py-2.5 text-sm" : "px-4 py-2 text-xs"
              }`}
              style={{ backgroundColor: accentColor }}
            >
              {creative.callToAction}
            </button>
          </div>
        </div>
      ) : isVeryTall ? (
        // 160x600 Wide Skyscraper, 300x600 Half Page, 1080x1920 Story
        <div
          className={`relative z-10 w-full h-full flex flex-col justify-between text-center ${
            width > 500 ? "p-12" : width > 200 ? "p-6" : "p-3"
          }`}
        >
          {/* Top Brand Lockup */}
          <div className="flex flex-col items-center">
            <span
              className={`font-black tracking-widest uppercase mb-1 ${
                width > 500 ? "text-xl" : width > 200 ? "text-xs" : "text-[9px]"
              }`}
              style={{ color: accentColor }}
            >
              {creative.brandName}
            </span>
            {creative.badgeText && (
              <span
                className={`font-black uppercase tracking-wider rounded text-slate-950 ${
                  width > 500
                    ? "px-4 py-1 text-sm mt-2"
                    : "px-2 py-0.5 text-[9px] mt-1"
                }`}
                style={{ backgroundColor: accentColor }}
              >
                {creative.badgeText}
              </span>
            )}
          </div>

          {/* Bottom Headline & Call To Action */}
          <div className="flex flex-col items-center mt-auto">
            <h2
              className={`font-black tracking-tight text-white font-display leading-tight mb-2 text-balance ${
                width > 500 ? "text-5xl mb-4" : width > 200 ? "text-xl" : "text-sm"
              }`}
            >
              {creative.headline}
            </h2>

            <p
              className={`text-slate-300 line-clamp-2 mb-4 leading-snug ${
                width > 500 ? "text-xl mb-8" : width > 200 ? "text-xs" : "text-[10px]"
              }`}
            >
              {creative.subheadline}
            </p>

            <button
              type="button"
              className={`w-full font-bold rounded-lg text-slate-950 shadow-xl transition-transform active:scale-95 ${
                width > 500
                  ? "py-5 text-xl font-extrabold rounded-xl"
                  : width > 200
                  ? "py-2.5 text-xs"
                  : "py-1.5 text-[10px]"
              }`}
              style={{ backgroundColor: accentColor }}
            >
              {creative.callToAction}
            </button>
          </div>
        </div>
      ) : (
        // Standard Rectangle & Square (300x250, 336x280, 1080x1080, 1080x1350, 1200x628)
        <div
          className={`relative z-10 w-full h-full flex flex-col justify-between ${
            width >= 1000 ? "p-12" : "p-5"
          }`}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between">
            <span
              className={`font-black tracking-widest uppercase ${
                width >= 1000 ? "text-xl" : "text-xs"
              }`}
              style={{ color: accentColor }}
            >
              {creative.brandName}
            </span>

            {creative.badgeText && (
              <span
                className={`font-black uppercase tracking-wider rounded text-slate-950 shadow-sm ${
                  width >= 1000
                    ? "px-3.5 py-1 text-sm"
                    : "px-2 py-0.5 text-[10px]"
                }`}
                style={{ backgroundColor: accentColor }}
              >
                {creative.badgeText}
              </span>
            )}
          </div>

          {/* Bottom Pitch & Action */}
          <div className="mt-auto">
            <h2
              className={`font-black tracking-tight text-white font-display leading-tight mb-1 text-balance ${
                width >= 1000
                  ? "text-5xl mb-3"
                  : width >= 400
                  ? "text-2xl"
                  : "text-lg"
              }`}
            >
              {creative.headline}
            </h2>

            <p
              className={`text-slate-300 line-clamp-2 leading-snug mb-3.5 ${
                width >= 1000 ? "text-xl mb-6" : "text-xs"
              }`}
            >
              {creative.subheadline}
            </p>

            <button
              type="button"
              className={`font-bold rounded-lg text-slate-950 shadow-lg transition-transform active:scale-95 ${
                width >= 1000
                  ? "px-8 py-3.5 text-lg font-extrabold"
                  : "px-4 py-2 text-xs"
              }`}
              style={{ backgroundColor: accentColor }}
            >
              {creative.callToAction}
            </button>
          </div>
        </div>
      )}

      {/* Frame Hairline Border */}
      <div className="absolute inset-0 border border-white/10 pointer-events-none" />
    </div>
  );
};
