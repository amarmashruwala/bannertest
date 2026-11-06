import React, { useRef, useState } from "react";
import { Download, Edit3, Maximize2, Check } from "lucide-react";
import { BannerFormat, AdCreative } from "../types/banner";
import { BannerCanvas } from "./BannerCanvas";
import { downloadBannerPNG } from "../utils/canvasExport";

interface BannerCardProps {
  format: BannerFormat;
  creative: AdCreative;
  onEdit: (format: BannerFormat) => void;
}

export const BannerCard: React.FC<BannerCardProps> = ({
  format,
  creative,
  onEdit,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  // Compute responsive container scaling factor to fit preview viewport
  // Target max preview width ~360px, max preview height ~340px
  const maxW = 380;
  const maxH = 320;
  const scale = Math.min(1, maxW / format.width, maxH / format.height);

  const containerW = Math.round(format.width * scale);
  const containerH = Math.round(format.height * scale);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setDownloading(true);
      await downloadBannerPNG(format, creative, 2);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2000);
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="group relative bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all flex flex-col shadow-sm">
      {/* Top Metadata Row (Zero-Pill discipline: unboxed clean text with dot separators) */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800/80 bg-slate-900/40 text-xs">
        <div className="flex items-center gap-1.5 font-mono text-slate-400">
          <span className="font-semibold text-slate-200">{format.name}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="tabular-nums text-amber-400/90">{format.width}×{format.height}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="text-slate-500">{format.aspectRatioLabel}</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(format)}
            title="Inspect & Edit in Studio"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            title="Download 2× PNG"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
          >
            {downloaded ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Scaled Preview Canvas Stage */}
      <div
        onClick={() => onEdit(format)}
        className="relative flex-1 min-h-[180px] p-4 flex items-center justify-center bg-slate-950/80 cursor-pointer overflow-hidden group/canvas"
      >
        <div
          style={{ width: `${containerW}px`, height: `${containerH}px` }}
          className="relative shadow-2xl transition-transform duration-200 group-hover/canvas:scale-[1.01]"
        >
          <BannerCanvas
            format={format}
            creative={creative}
            scale={scale}
            className="shadow-inner"
          />
        </div>

        {/* Hover quick-edit prompt */}
        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700 text-xs font-medium text-slate-200 shadow-xl flex items-center gap-1.5">
            <Edit3 className="w-3 h-3 text-amber-400" />
            Click to Customize in Studio
          </span>
        </div>
      </div>

      {/* Bottom Placement Context */}
      <div className="px-4 py-2 bg-slate-900/30 border-t border-slate-800/60 text-[11px] text-slate-400 line-clamp-1">
        {format.recommendedUse}
      </div>
    </div>
  );
};
