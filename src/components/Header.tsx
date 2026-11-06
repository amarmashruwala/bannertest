import React from "react";
import { Download } from "lucide-react";

interface HeaderProps {
  onExportAllZip: () => void;
  isZipping?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onExportAllZip, isZipping }) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Brand wordmark (single element, whitespace-nowrap shrink-0) */}
        <a
          href="/"
          className="text-lg font-bold tracking-tight text-white font-display whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 rotate-45 shrink-0" />
          <span>BannerCraft Studio</span>
        </a>

        {/* Zone 2: 4-5 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
          <a
            href="#display-network"
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            IAB Display
          </a>
          <a
            href="#social-mobile"
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Social Standards
          </a>
          <a
            href="#specs"
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Specifications
          </a>
          <a
            href="#studio-guide"
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Guidelines
          </a>
        </nav>

        {/* Zone 3: 1 primary action button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onExportAllZip}
            disabled={isZipping}
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-500 rounded-lg hover:bg-amber-400 shadow-md transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-slate-950" />
            <span>{isZipping ? "Packing ZIP..." : "Download All Banners (.zip)"}</span>
          </button>
        </div>

      </div>
    </header>
  );
};
