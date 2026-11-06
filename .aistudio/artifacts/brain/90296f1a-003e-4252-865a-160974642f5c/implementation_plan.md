# BannerCraft Studio — High-Impact Banner Ad Generator

An intelligent creative suite that transforms any product URL and description into professional, multi-size banner ad campaigns with studio-grade photography, tailored ad copy, and an interactive in-canvas editor.

## User Review & Critical Decisions

> [!IMPORTANT]
> The creative defaults and core scope have been aligned based on your feedback:
> - **Banner Formats**: Generates complete campaign sets across all major IAB display standards (300×250, 728×90, 160×600, 300×600, 970×250, 320×50) and social formats (1080×1080 Square, 1080×1920 Stories/Reels, 1200×628 Landscape, 1080×1350 Portrait).
> - **Visual Style**: Modern high-impact commercial aesthetic with bold headline typography, rich contrast, and commercial product lighting.
> - **In-App Visual Studio**: Real-time canvas editor allowing immediate in-place edits to headlines, subtext, call-to-action buttons, badges, color accents, and high-resolution export.
> - **Model & Image Engine**: Native support for `gemini-3-pro-image-preview` for studio-quality generation and `gemini-nano-banana-2.1` for rapid generation, with explicit affordances for image resolution (1K, 2K, 4K) and aspect ratios (1:1, 2:3, 3:2, 3:4, 4:3, 9:16, 16:9, 21:9).

---

## 1. Overview & Core Concept

### What It Does
BannerCraft Studio empowers marketers, e-commerce founders, and digital designers to generate conversion-focused banner ad packages in seconds:
1. **Input & Extraction**: The user provides a product URL and description (or uses quick-fill sample presets like luxury watches, smart audio hardware, organic skincare, or athletic apparel).
2. **AI Creative Strategy**: Gemini analyzes the product positioning, value proposition, and target audience to craft high-conversion copy hooks (punchy headlines, benefit subtext, urgency tags, and action-driven CTAs).
3. **Studio Imagery Engine**: Generates commercial product visuals using `gemini-3-pro-image-preview` (with 1K, 2K, 4K resolution selection and aspect ratio controls: 1:1, 2:3, 3:2, 3:4, 4:3, 9:16, 16:9, 21:9) or `gemini-nano-banana-2.1`.
4. **Adaptive Banner Layouts**: Automatically formats and renders the product visual and copy across all industry-standard display and social ad sizes.
5. **Interactive Creative Studio**: Users can select any banner to tweak copy, adjust font scale, toggle overlays, reposition elements, swap color themes, and export high-res PNGs or download the entire campaign bundle.

### Target Audience & Persona
Digital marketers, growth agencies, e-commerce merchants, and banner designers who need multi-channel advertising assets ready for Google Ads, Meta, TikTok, LinkedIn, and programmatic networks without hours of manual resizing.

### Key Value
Eliminates repetitive manual design labor by orchestrating AI copy generation, high-fidelity studio imagery, responsive ad layout composition, and instant multi-format export in a single unified workflow.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Brief & Setup**:
   - Clean top bar with brand wordmark and quick actions.
   - Input workspace with product URL input, product description, industry category selector, and sample product templates.
   - Creative controls drawer: Image generation model selector (`gemini-3-pro-image-preview` vs `gemini-nano-banana-2.1`), target aspect ratio picker (`1:1`, `2:3`, `3:2`, `3:4`, `4:3`, `9:16`, `16:9`, `21:9`), and image quality resolution (`1K`, `2K`, `4K`).
2. **Campaign Generation**:
   - Single-click "Generate Ad Suite" button.
   - Synchronized progress state showing AI copy synthesis and studio visual rendering.
3. **Multi-Size Ad Grid Overview**:
   - Clean gallery categorized into **IAB Display Network** (Medium Rectangle 300×250, Leaderboard 728×90, Wide Skyscraper 160×600, Half Page 300×600, Billboard 970×250, Mobile Leaderboard 320×50) and **Social & Mobile** (Square Feed 1080×1080, Vertical Story 1080×1920, Landscape Link 1200×628, Portrait 1080×1350).
   - Instant live preview with responsive scaling.
4. **Interactive In-App Visual Editor**:
   - Click any banner to open full-scale inspector and editor.
   - Live editable fields: Headline, Subheadline, CTA Button text, Offer Tag/Discount, Brand Name, and Accent Color scheme.
   - Real-time canvas renderer ensuring exact proportions and font containment.
   - Single-banner high-resolution PNG export or bulk campaign export.

### Visual Identity & Theme
- **Aesthetic Direction**: Modern high-impact commercial studio. Deep neutral slate canvas (`#090D16` dark mode / `#F8FAFC` light mode) with high-contrast architectural surfaces, sharp typography, and vibrant electric amber/crimson accents (`#F59E0B` / `#EF4444`).
- **Typography**: Display headlines set in bold geometric sans (`Plus Jakarta Sans`), body copy in clean legible `DM Sans`, and dimensions/metrics in monospace tabular figures (`font-mono tabular-nums`).
- **Zero-Pill Restraint**: Clean text-based metadata with dot separators (`300 × 250 · IAB Standard · Medium Rectangle`); buttons and segmented controls use sleek rectangular tactile styling.
- **Top Bar Contract**: Single-row 3-zone header featuring the `BannerCraft` wordmark, contextual navigation links (`Ad Formats`, `Style Presets`, `Documentation`), and primary action (`Generate Suite`).

---

## 3. Key Product Decisions & Trade-Offs

### 1. Dual Image Model Architecture
- **Decision**: Provide explicit options for `gemini-3-pro-image-preview` (studio commercial photography with 1K, 2K, 4K fidelity) and `gemini-nano-banana-2.1` (rapid iteration, custom aspect ratios).
- **Why**: Fulfills the user's mandatory instructions while giving full control over image resolution and composition ratios (`1:1`, `2:3`, `3:2`, `3:4`, `4:3`, `9:16`, `16:9`, `21:9`).

### 2. Client-Side High-Res Canvas Rendering vs External Server Renders
- **Decision**: Render banners dynamically using responsive CSS layout engines paired with an HTML5 high-DPI Canvas rasterizer for export.
- **Why**: Zero-latency interactive edits (typing immediately updates all banners) and instant client-side PNG downloads without server bottlenecks or rendering timeouts.

### 3. Server-Side Gemini API Proxy
- **Decision**: Server-side Express API routes (`/api/generate-copy`, `/api/generate-image`, `/api/scrape-url-summary`) using `@google/genai` with `process.env.GEMINI_API_KEY`.
- **Why**: Complies with strict security guidelines prohibiting client-side API key exposure while enabling automated URL product parsing and multimodal image generation.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        BannerCraft Studio UI                           │
│                                                                        │
│  ┌──────────────────────────────┐    ┌──────────────────────────────┐  │
│  │     Product Input Deck       │    │   Studio Generator Controls  │  │
│  │  - URL & Scrape Extraction   │    │  - Model: gemini-3-pro-image │  │
│  │  - Product Title & Story     │    │  - Quality: 1K / 2K / 4K     │  │
│  │  - Presets (Tech/Watch/Skin) │    │  - Aspect Ratio: 1:1..21:9   │  │
│  └──────────────┬───────────────┘    └──────────────┬───────────────┘  │
│                 │                                   │                  │
│                 ▼                                   ▼                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │             Full-Stack Express API Server (server.ts)            │  │
│  │   POST /api/analyze-product       POST /api/generate-ad-image    │  │
│  │   (gemini-3.8-flash for copy)     (gemini-3-pro-image / nano)    │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     │                                  │
│                                     ▼                                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                     Campaign Ad Creative State                   │  │
│  │  { brand, headline, subhead, cta, discount, visualUrl, colors }  │  │
│  └──────────────────┬───────────────────────────────┬───────────────┘  │
│                     │                               │                  │
│                     ▼                               ▼                  │
│  ┌──────────────────────────────┐    ┌──────────────────────────────┐  │
│  │     IAB Standard Display     │    │    Social & Mobile Suite     │  │
│  │  300×250 · 728×90 · 160×600  │    │  1080×1080 · 1080×1920       │  │
│  │  300×600 · 970×250 · 320×50  │    │  1200×628  · 1080×1350       │  │
│  └──────────────────────────────┘    └──────────────────────────────┘  │
│                     │                               │                  │
│                     └───────────────┬───────────────┘                  │
│                                     ▼                                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │               Interactive Canvas Inspector & Export              │  │
│  │  - Real-time text & layout tweaks - High-DPI PNG Canvas Export   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Supported Banner Sizes & Formats
1. **Medium Rectangle (300×250)**: Standard high-CTR inline web format.
2. **Leaderboard (728×90)**: Top-of-page desktop banner format.
3. **Billboard (970×250)**: High-impact premium masthead.
4. **Half Page (300×600)**: Rich media vertical display format.
5. **Wide Skyscraper (160×600)**: Classic side rail format.
6. **Mobile Leaderboard (320×50)**: Standard mobile smartphone sticky banner.
7. **Square Post (1080×1080 / 1:1)**: Instagram & Facebook feed ad standard.
8. **Story / Reel (1080×1920 / 9:16)**: Full-screen mobile immersive story format.
9. **Landscape Feed (1200×628 / 1.91:1)**: Meta & LinkedIn sponsored link format.
10. **Portrait Feed (1080×1350 / 4:5)**: High-visibility mobile feed format.

### Key Implementation Steps
1. **Server API (`server.ts`)**:
   - Setup Express server with JSON endpoints.
   - Product analysis endpoint using `gemini-3.8-flash` to extract branding, benefit hook, headline, subheadline, call-to-action, and optimized image generation prompt.
   - Image generation endpoint utilizing `@google/genai` supporting `gemini-3-pro-image-preview` and `gemini-nano-banana-2.1`, with `imageConfig: { aspectRatio, imageSize }` (1K, 2K, 4K).
2. **Ad Banner Component System**:
   - Specialized layout engines for horizontal banners (728×90, 970×250, 320×50), vertical banners (160×600, 300×600, 1080×1920), and rectangular/square banners (300×250, 1080×1080, 1200×628, 1080×1350).
   - Scrim overlays, contrast protection, and auto-scaling typography to prevent clipping.
3. **Studio Inspector & In-App Visual Editor**:
   - Direct inline text editing with live feedback.
   - Color palette presets and custom accent picker.
   - High-DPI canvas download rendering crisp 2x/4x images.
4. **Verification & Polish**:
   - End-to-end testing, TypeScript validation, and build compilation.
