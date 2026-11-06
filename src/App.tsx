import React, { useState } from "react";
import { Download, SlidersHorizontal, Sparkles, LayoutGrid } from "lucide-react";
import { AdCreative, BannerFormat } from "./types/banner";
import { BANNER_FORMATS } from "./constants/bannerFormats";
import { SAMPLE_TEMPLATES } from "./constants/sampleTemplates";
import { Header } from "./components/Header";
import { GeneratorDrawer } from "./components/GeneratorDrawer";
import { BannerCard } from "./components/BannerCard";
import { VisualEditorModal } from "./components/VisualEditorModal";
import { exportCampaignZip } from "./utils/canvasExport";

export default function App() {
  const [creative, setCreative] = useState<AdCreative>(SAMPLE_TEMPLATES[0]);
  const [categoryFilter, setCategoryFilter] = useState<"All" | "IAB Display" | "Social & Mobile">("All");
  const [activeEditFormat, setActiveEditFormat] = useState<BannerFormat | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [isZipping, setIsZipping] = useState(false);

  // Filter banner formats based on selected tab
  const filteredFormats = BANNER_FORMATS.filter((format) => {
    if (categoryFilter === "All") return true;
    return format.category === categoryFilter;
  });

  const handleExportAllZip = async () => {
    try {
      setIsZipping(true);
      await exportCampaignZip(BANNER_FORMATS, creative);
    } catch (err) {
      console.error("ZIP packaging failed:", err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar Contract compliant Header */}
      <Header onExportAllZip={handleExportAllZip} isZipping={isZipping} />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-10">
        
        {/* Hero Section & Studio Context */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
            <Sparkles className="w-4 h-4" />
            <span>AI Multi-Size Creative Engine</span>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <span className="text-slate-400">IAB Display & Social Standards</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-display text-balance max-w-3xl">
            Generate High-Impact Banner Ads in Every Standard Size
          </h1>

          <p className="text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            Enter any product description and website URL. Gemini generates strategic copy hooks, studio commercial photography with <span className="text-amber-400 font-mono">gemini-3-pro-image-preview</span> (1K–4K), and auto-formats across all 11 industry display and social specifications.
          </p>
        </section>

        {/* Campaign Generator & Model Settings Drawer */}
        <section>
          <GeneratorDrawer
            onGenerate={({ creative: newCreative }) => {
              setCreative(newCreative);
            }}
            onSelectSample={(sample) => {
              setCreative(sample);
            }}
            isGenerating={isGenerating}
            statusMessage={statusMessage}
          />
        </section>

        {/* Ad Gallery Filter Tabs & Campaign Banner Grid */}
        <section className="space-y-6 pt-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-amber-400" />
                <span>Generated Campaign Banners</span>
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mt-0.5">
                <span>Active Campaign: <strong className="text-slate-300">{creative.brandName}</strong></span>
                <span aria-hidden="true">·</span>
                <span>{filteredFormats.length} Formats Ready</span>
              </div>
            </div>

            {/* Interactive Category Filter Buttons (Functional Segmented Control) */}
            <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setCategoryFilter("All")}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  categoryFilter === "All"
                    ? "bg-slate-800 text-white shadow-sm font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                All Formats (11)
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter("IAB Display")}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  categoryFilter === "IAB Display"
                    ? "bg-slate-800 text-white shadow-sm font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                IAB Display (7)
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter("Social & Mobile")}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  categoryFilter === "Social & Mobile"
                    ? "bg-slate-800 text-white shadow-sm font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Social & Mobile (4)
              </button>
            </div>
          </div>

          {/* Banner Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFormats.map((format) => (
              <BannerCard
                key={format.id}
                format={format}
                creative={creative}
                onEdit={(fmt) => setActiveEditFormat(fmt)}
              />
            ))}
          </div>

        </section>

        {/* Specifications Guide Section */}
        <section id="specs" className="pt-10 border-t border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white font-display">
            IAB & Social Standard Ad Specifications
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-1.5">
              <div className="font-semibold text-amber-400 font-mono uppercase">
                Display Network Standards
              </div>
              <p className="text-slate-400 leading-relaxed">
                Covers Medium Rectangle (300×250), Leaderboard (728×90), Half Page (300×600), and Billboard (970×250) for Google Ads and programmatic ad servers.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-1.5">
              <div className="font-semibold text-amber-400 font-mono uppercase">
                Studio Image Quality
              </div>
              <p className="text-slate-400 leading-relaxed">
                Powered by <code className="text-slate-200">gemini-3-pro-image-preview</code> with configurable 1K, 2K, and 4K output resolution and native aspect ratios from 1:1 to 21:9.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-1.5">
              <div className="font-semibold text-amber-400 font-mono uppercase">
                Interactive Visual Editor
              </div>
              <p className="text-slate-400 leading-relaxed">
                Click any banner card to inspect, customize headlines and buttons, apply A/B copy variations, and download pixel-perfect high-DPI PNGs.
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* Interactive Visual Studio Modal */}
      {activeEditFormat && (
        <VisualEditorModal
          initialFormat={activeEditFormat}
          creative={creative}
          onUpdateCreative={(updated) => setCreative(updated)}
          onClose={() => setActiveEditFormat(null)}
        />
      )}

      {/* Quiet Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>BannerCraft Studio · Automated Banner Ad Campaign Generator</span>
          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span>IAB Standards</span>
            <span aria-hidden="true">·</span>
            <span>gemini-3-pro-image-preview</span>
            <span aria-hidden="true">·</span>
            <span>4K High-DPI Canvas</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
