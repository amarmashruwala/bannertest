import React, { useState } from "react";
import { X, Download, Sparkles, Check, RefreshCw } from "lucide-react";
import { AdCreative, BannerFormat } from "../types/banner";
import { BANNER_FORMATS } from "../constants/bannerFormats";
import { BannerCanvas } from "./BannerCanvas";
import { downloadBannerPNG } from "../utils/canvasExport";

interface VisualEditorModalProps {
  initialFormat: BannerFormat;
  creative: AdCreative;
  onUpdateCreative: (updated: AdCreative) => void;
  onClose: () => void;
}

const COLOR_PRESETS = [
  { name: "Electric Amber", hex: "#F59E0B" },
  { name: "Solar Gold", hex: "#EAB308" },
  { name: "Neon Lime", hex: "#84CC16" },
  { name: "Botanical Teal", hex: "#14B8A6" },
  { name: "Vivid Crimson", hex: "#EF4444" },
  { name: "Cobalt Blue", hex: "#3B82F6" },
  { name: "Royal Violet", hex: "#8B5CF6" },
  { name: "Clean White", hex: "#FFFFFF" },
];

export const VisualEditorModal: React.FC<VisualEditorModalProps> = ({
  initialFormat,
  creative,
  onUpdateCreative,
  onClose,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<BannerFormat>(initialFormat);
  const [exportScale, setExportScale] = useState<number>(2); // 1x, 2x, 4x
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Local editable creative fields
  const handleFieldChange = (key: keyof AdCreative, value: any) => {
    onUpdateCreative({
      ...creative,
      [key]: value,
    });
  };

  const handleApplyVariation = (variation: {
    headline: string;
    subheadline: string;
    callToAction: string;
    badgeText: string;
  }) => {
    onUpdateCreative({
      ...creative,
      headline: variation.headline,
      subheadline: variation.subheadline,
      callToAction: variation.callToAction,
      badgeText: variation.badgeText,
    });
  };

  const handleDownload = async () => {
    try {
      setIsExporting(true);
      await downloadBannerPNG(selectedFormat, creative, exportScale);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 2200);
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  // Preview sizing
  const maxStageW = 540;
  const maxStageH = 460;
  const scale = Math.min(1, maxStageW / selectedFormat.width, maxStageH / selectedFormat.height);
  const stageW = Math.round(selectedFormat.width * scale);
  const stageH = Math.round(selectedFormat.height * scale);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-6xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Editor Top Bar (Zero-Pill discipline) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-white font-display">
              In-App Visual Studio
            </h2>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <div className="flex items-center gap-2">
              <label htmlFor="format-select" className="text-xs text-slate-400">
                Format:
              </label>
              <select
                id="format-select"
                value={selectedFormat.id}
                onChange={(e) => {
                  const found = BANNER_FORMATS.find((f) => f.id === e.target.value);
                  if (found) setSelectedFormat(found);
                }}
                className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
              >
                {BANNER_FORMATS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.width}×{f.height})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Editor Body: Stage Left + Inspector Right */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
          
          {/* Left Canvas Preview Stage */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col items-center justify-center bg-slate-950 border-r border-slate-800/80 overflow-auto">
            <div
              style={{ width: `${stageW}px`, height: `${stageH}px` }}
              className="relative shadow-2xl transition-all"
            >
              <BannerCanvas
                format={selectedFormat}
                creative={creative}
                scale={scale}
                className="shadow-2xl rounded-sm"
              />
            </div>

            {/* Stage Footer Bar with Resolution Scale & Export */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 w-full max-w-md pt-4 border-t border-slate-900 text-xs text-slate-400">
              <div className="flex items-center gap-2 font-mono">
                <span>Export Scale:</span>
                <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                  <button
                    onClick={() => setExportScale(1)}
                    className={`px-2 py-1 rounded text-xs transition-colors ${
                      exportScale === 1
                        ? "bg-slate-800 text-white font-semibold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    1× ({selectedFormat.width}×{selectedFormat.height})
                  </button>
                  <button
                    onClick={() => setExportScale(2)}
                    className={`px-2 py-1 rounded text-xs transition-colors ${
                      exportScale === 2
                        ? "bg-slate-800 text-white font-semibold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    2× Retina
                  </button>
                  <button
                    onClick={() => setExportScale(4)}
                    className={`px-2 py-1 rounded text-xs transition-colors ${
                      exportScale === 4
                        ? "bg-slate-800 text-white font-semibold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    4× Ultra-HD
                  </button>
                </div>
              </div>

              <button
                onClick={handleDownload}
                disabled={isExporting}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shadow-md transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
              >
                {isExporting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : exportSuccess ? (
                  <Check className="w-3.5 h-3.5 text-slate-950" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>{exportSuccess ? "Exported!" : "Download PNG"}</span>
              </button>
            </div>
          </div>

          {/* Right Inspector Controls (Scrollable) */}
          <div className="lg:col-span-5 p-6 space-y-6 overflow-y-auto bg-slate-900/50">
            
            {/* Section 1: Brand & Badge */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold tracking-wider text-slate-400 uppercase font-mono">
                Brand & Promotion
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    value={creative.brandName}
                    onChange={(e) => handleFieldChange("brandName", e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Urgency Badge
                  </label>
                  <input
                    type="text"
                    value={creative.badgeText}
                    onChange={(e) => handleFieldChange("badgeText", e.target.value)}
                    placeholder="e.g. 50% OFF"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Advertising Copy */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold tracking-wider text-slate-400 uppercase font-mono">
                Ad Headline & Body
              </h3>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-slate-400">
                    Primary Headline
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {creative.headline.length} chars
                  </span>
                </div>
                <input
                  type="text"
                  value={creative.headline}
                  onChange={(e) => handleFieldChange("headline", e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-white font-display focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-slate-400">
                    Subheadline / Value Prop
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {creative.subheadline.length} chars
                  </span>
                </div>
                <textarea
                  rows={2}
                  value={creative.subheadline}
                  onChange={(e) => handleFieldChange("subheadline", e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Button Call To Action (CTA)
                </label>
                <input
                  type="text"
                  value={creative.callToAction}
                  onChange={(e) => handleFieldChange("callToAction", e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Section 3: A/B Variations Quick Switcher */}
            {creative.copyVariations && creative.copyVariations.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 font-mono uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>A/B Copy Angles</span>
                </div>
                <div className="space-y-1.5">
                  {creative.copyVariations.map((v, i) => (
                    <button
                      key={i}
                      onClick={() => handleApplyVariation(v)}
                      className="w-full p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 hover:bg-slate-800 text-left transition-colors group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-semibold text-amber-400">
                          {v.angle}
                        </span>
                        <span className="text-[10px] text-slate-400 group-hover:text-slate-200">
                          Apply Angle →
                        </span>
                      </div>
                      <div className="text-xs font-bold text-white truncate">
                        {v.headline}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {v.subheadline}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Section 4: Accent Color & Theme */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <h3 className="text-xs font-semibold tracking-wider text-slate-400 uppercase font-mono">
                Accent Color
              </h3>

              <div className="grid grid-cols-4 gap-2">
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color.hex}
                    onClick={() => handleFieldChange("accentColor", color.hex)}
                    className={`flex items-center gap-1.5 p-1.5 rounded-lg border text-left text-[11px] transition-all ${
                      creative.accentColor.toLowerCase() === color.hex.toLowerCase()
                        ? "border-amber-400 bg-slate-800 text-white font-medium"
                        : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="truncate">{color.name.split(" ")[0]}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <label className="text-xs text-slate-400">Custom Hex:</label>
                <input
                  type="text"
                  value={creative.accentColor}
                  onChange={(e) => handleFieldChange("accentColor", e.target.value)}
                  className="w-28 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-white"
                />
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
