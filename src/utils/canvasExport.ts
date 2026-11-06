import JSZip from "jszip";
import { AdCreative, BannerFormat } from "../types/banner";

/**
 * High-DPI Canvas Rasterizer for Banner Ads
 * Renders text, backgrounds, badges, and buttons onto a crisp Canvas and triggers download.
 */
export async function renderBannerToCanvas(
  format: BannerFormat,
  creative: AdCreative,
  scale: number = 2
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = format.width * scale;
  canvas.height = format.height * scale;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not initialize 2D canvas context");

  ctx.scale(scale, scale);

  const { width, height } = format;
  const isHorizontal = width > height * 2.5; // e.g. 728x90, 970x250, 320x50
  const isVeryTall = height >= width * 2.5;  // e.g. 160x600, 300x600, 1080x1920
  const isCompactMobile = width <= 320 && height <= 50;

  // 1. Draw Base Background
  ctx.fillStyle = creative.theme === "light" ? "#F8FAFC" : "#0A0E17";
  ctx.fillRect(0, 0, width, height);

  // 2. Load and Draw Product Image
  if (creative.imageUrl) {
    try {
      const img = await loadImage(creative.imageUrl);
      
      if (isHorizontal) {
        // Horizontal banner: image on right half with smooth fade
        const imgAspect = img.width / img.height;
        const targetH = height;
        const targetW = targetH * imgAspect;
        const imgX = width - targetW + 20;

        ctx.save();
        ctx.drawImage(img, imgX, 0, targetW, targetH);
        
        // Draw horizontal gradient overlay to blend image into text area
        const grad = ctx.createLinearGradient(0, 0, width, 0);
        grad.addColorStop(0, creative.theme === "light" ? "rgba(248,250,252,1)" : "rgba(10,14,23,1)");
        grad.addColorStop(0.55, creative.theme === "light" ? "rgba(248,250,252,0.95)" : "rgba(10,14,23,0.92)");
        grad.addColorStop(0.75, creative.theme === "light" ? "rgba(248,250,252,0.3)" : "rgba(10,14,23,0.3)");
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      } else if (isVeryTall) {
        // Skyscraper / Vertical banner: product featured in top-middle, text below
        const imgAspect = img.width / img.height;
        const targetW = width * 1.1;
        const targetH = targetW / imgAspect;
        const imgY = height * 0.18;
        const imgX = (width - targetW) / 2;

        ctx.save();
        ctx.drawImage(img, imgX, imgY, targetW, targetH);

        // Gradient at top and bottom of image
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, creative.theme === "light" ? "rgba(248,250,252,0.98)" : "rgba(10,14,23,0.98)");
        grad.addColorStop(0.2, creative.theme === "light" ? "rgba(248,250,252,0.2)" : "rgba(10,14,23,0.2)");
        grad.addColorStop(0.5, "rgba(0,0,0,0)");
        grad.addColorStop(0.7, creative.theme === "light" ? "rgba(248,250,252,0.9)" : "rgba(10,14,23,0.95)");
        grad.addColorStop(1, creative.theme === "light" ? "rgba(248,250,252,1)" : "rgba(10,14,23,1)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      } else {
        // Standard rectangle / square: full cover with bottom-to-top dark contrast scrim
        const imgAspect = img.width / img.height;
        const canvasAspect = width / height;
        let dw = width;
        let dh = height;
        let dx = 0;
        let dy = 0;

        if (imgAspect > canvasAspect) {
          dh = height;
          dw = dh * imgAspect;
          dx = (width - dw) / 2;
        } else {
          dw = width;
          dh = dw / imgAspect;
          dy = (height - dh) / 2;
        }

        ctx.save();
        ctx.drawImage(img, dx, dy, dw, dh);

        // Contrast protection scrim
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, "rgba(5,7,12,0.4)");
        grad.addColorStop(0.35, "rgba(5,7,12,0.15)");
        grad.addColorStop(0.65, "rgba(5,7,12,0.75)");
        grad.addColorStop(1, "rgba(5,7,12,0.95)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }
    } catch (e) {
      console.warn("Failed to load image for canvas export, drawing geometric backdrop", e);
    }
  }

  // 3. Draw Brand Name / Logo
  ctx.save();
  const textColor = "#FFFFFF";
  const mutedTextColor = "rgba(255, 255, 255, 0.75)";
  const accentColor = creative.accentColor || "#F59E0B";

  if (isCompactMobile) {
    // 320x50 Mobile Leaderboard: Tight compact single line
    ctx.font = "bold 9px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = accentColor;
    ctx.fillText(creative.brandName.toUpperCase(), 10, 15);

    ctx.font = "bold 11px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = textColor;
    ctx.fillText(truncateText(creative.headline, 22), 10, 31);

    ctx.font = "9px 'DM Sans', sans-serif";
    ctx.fillStyle = mutedTextColor;
    ctx.fillText(truncateText(creative.subheadline, 26), 10, 44);

    // CTA button on right
    drawButton(ctx, width - 82, 10, 72, 30, creative.callToAction, accentColor, 8);
  } else if (isHorizontal) {
    // Horizontal Banner (e.g. 728x90, 970x250)
    const paddingLeft = width > 800 ? 36 : 24;
    const badgeY = height * 0.22;
    const headY = height * 0.52;
    const subY = height * 0.76;

    // Badge / Brand
    drawBadge(ctx, paddingLeft, badgeY - 14, creative.badgeText, accentColor, width > 800 ? 11 : 9);
    ctx.font = `600 ${width > 800 ? 11 : 9}px 'Plus Jakarta Sans', sans-serif`;
    ctx.fillStyle = mutedTextColor;
    ctx.fillText(creative.brandName.toUpperCase(), paddingLeft + (creative.badgeText ? 110 : 0), badgeY);

    // Headline
    const headSize = Math.max(16, Math.min(28, Math.round(height * 0.26)));
    ctx.font = `bold ${headSize}px 'Plus Jakarta Sans', sans-serif`;
    ctx.fillStyle = textColor;
    ctx.fillText(truncateText(creative.headline, 32), paddingLeft, headY);

    // Subhead
    const subSize = Math.max(10, Math.min(14, Math.round(height * 0.14)));
    ctx.font = `${subSize}px 'DM Sans', sans-serif`;
    ctx.fillStyle = mutedTextColor;
    ctx.fillText(truncateText(creative.subheadline, 48), paddingLeft, subY);

    // CTA button on far right or center-right
    const btnW = width > 800 ? 140 : 110;
    const btnH = height > 150 ? 46 : 36;
    const btnX = width > 800 ? width * 0.55 : width * 0.62;
    const btnY = (height - btnH) / 2;
    drawButton(ctx, btnX, btnY, btnW, btnH, creative.callToAction, accentColor, width > 800 ? 13 : 11);

  } else if (isVeryTall) {
    // Tall Skyscraper (160x600, 300x600, 1080x1920)
    const pad = width > 200 ? 24 : 12;

    // Top: Brand & Badge
    ctx.font = `bold ${width > 200 ? 11 : 9}px 'Plus Jakarta Sans', sans-serif`;
    ctx.fillStyle = accentColor;
    ctx.textAlign = "center";
    ctx.fillText(creative.brandName.toUpperCase(), width / 2, pad + 16);

    if (creative.badgeText) {
      drawCenterBadge(ctx, width / 2, pad + 38, creative.badgeText, accentColor, width > 200 ? 10 : 8);
    }

    // Bottom content area
    ctx.textAlign = "center";
    const bottomY = height - (width > 200 ? 140 : 110);
    const headSize = width > 500 ? 56 : (width > 200 ? 22 : 14);

    ctx.font = `bold ${headSize}px 'Plus Jakarta Sans', sans-serif`;
    ctx.fillStyle = textColor;
    wrapText(ctx, creative.headline, width / 2, bottomY, width - pad * 2, headSize * 1.1, 2);

    const subSize = width > 500 ? 24 : (width > 200 ? 12 : 9);
    ctx.font = `${subSize}px 'DM Sans', sans-serif`;
    ctx.fillStyle = mutedTextColor;
    wrapText(ctx, creative.subheadline, width / 2, bottomY + headSize * 1.5, width - pad * 2, subSize * 1.25, 2);

    // Button
    const btnW = Math.min(width - pad * 2, width > 500 ? 320 : 180);
    const btnH = width > 500 ? 64 : (width > 200 ? 42 : 32);
    const btnX = (width - btnW) / 2;
    const btnY = height - pad - btnH;
    ctx.textAlign = "left";
    drawButton(ctx, btnX, btnY, btnW, btnH, creative.callToAction, accentColor, width > 500 ? 20 : (width > 200 ? 13 : 10));

  } else {
    // Standard Box / Rectangular (300x250, 336x280, 1080x1080, 1080x1350, 1200x628)
    const pad = width >= 1000 ? 64 : 20;

    // Top Brand & Badge
    ctx.font = `bold ${width >= 1000 ? 18 : 11}px 'Plus Jakarta Sans', sans-serif`;
    ctx.fillStyle = accentColor;
    ctx.fillText(creative.brandName.toUpperCase(), pad, pad + (width >= 1000 ? 24 : 12));

    if (creative.badgeText) {
      drawBadge(ctx, pad, pad + (width >= 1000 ? 44 : 26), creative.badgeText, accentColor, width >= 1000 ? 15 : 10);
    }

    // Bottom Copy & CTA
    const bottomAreaH = height * 0.44;
    const contentY = height - bottomAreaH;

    const headSize = Math.max(16, Math.min(72, Math.round(width * 0.058)));
    ctx.font = `bold ${headSize}px 'Plus Jakarta Sans', sans-serif`;
    ctx.fillStyle = textColor;
    wrapText(ctx, creative.headline, pad, contentY, width - pad * 2, headSize * 1.15, 2);

    const subSize = Math.max(11, Math.min(28, Math.round(width * 0.026)));
    ctx.font = `${subSize}px 'DM Sans', sans-serif`;
    ctx.fillStyle = mutedTextColor;
    wrapText(ctx, creative.subheadline, pad, contentY + headSize * 1.8, width - pad * 2, subSize * 1.3, 2);

    // Action button
    const btnW = Math.max(110, Math.min(320, Math.round(width * 0.32)));
    const btnH = Math.max(34, Math.min(64, Math.round(height * 0.09)));
    const btnY = height - pad - btnH;
    drawButton(ctx, pad, btnY, btnW, btnH, creative.callToAction, accentColor, width >= 1000 ? 20 : 12);
  }

  // Draw clean hairline border
  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, width - 1, height - 1);

  ctx.restore();
  return canvas;
}

/**
 * Helper to download single banner as PNG
 */
export async function downloadBannerPNG(
  format: BannerFormat,
  creative: AdCreative,
  scale: number = 2
) {
  const canvas = await renderBannerToCanvas(format, creative, scale);
  const dataUrl = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = dataUrl;
  const cleanBrand = creative.brandName.toLowerCase().replace(/[^a-z0-9]/g, "-");
  a.download = `${cleanBrand}_${format.width}x${format.height}_banner.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Bulk Export all banners as a single ZIP archive
 */
export async function exportCampaignZip(
  formats: BannerFormat[],
  creative: AdCreative,
  onProgress?: (current: number, total: number) => void
) {
  const zip = new JSZip();
  const folder = zip.folder(`${creative.brandName || "BannerCraft"}_ad_suite`);

  for (let i = 0; i < formats.length; i++) {
    const format = formats[i];
    if (onProgress) onProgress(i + 1, formats.length);
    const canvas = await renderBannerToCanvas(format, creative, 2);
    const base64Data = canvas.toDataURL("image/png").replace(/^data:image\/png;base64,/, "");
    folder?.file(`${format.id}_${format.width}x${format.height}.png`, base64Data, { base64: true });
  }

  const content = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(content);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${creative.brandName.toLowerCase().replace(/[^a-z0-9]/g, "-")}_banner_campaign.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Internal drawing helpers
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

function truncateText(str: string, maxLen: number): string {
  if (!str) return "";
  return str.length > maxLen ? str.slice(0, maxLen - 1) + "…" : str;
}

function drawBadge(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, color: string, fontSize: number) {
  if (!text) return;
  ctx.save();
  ctx.font = `bold ${fontSize}px 'Plus Jakarta Sans', sans-serif`;
  const textWidth = ctx.measureText(text.toUpperCase()).width;
  const padX = fontSize * 0.7;
  const padY = fontSize * 0.35;
  const h = fontSize + padY * 2;
  const w = textWidth + padX * 2;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 4);
  ctx.fill();

  ctx.fillStyle = "#090D16";
  ctx.fillText(text.toUpperCase(), x + padX, y + fontSize + padY * 0.4);
  ctx.restore();
}

function drawCenterBadge(ctx: CanvasRenderingContext2D, centerX: number, y: number, text: string, color: string, fontSize: number) {
  if (!text) return;
  ctx.save();
  ctx.font = `bold ${fontSize}px 'Plus Jakarta Sans', sans-serif`;
  const textWidth = ctx.measureText(text.toUpperCase()).width;
  const padX = fontSize * 0.7;
  const padY = fontSize * 0.35;
  const h = fontSize + padY * 2;
  const w = textWidth + padX * 2;
  const x = centerX - w / 2;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 4);
  ctx.fill();

  ctx.fillStyle = "#090D16";
  ctx.textAlign = "left";
  ctx.fillText(text.toUpperCase(), x + padX, y + fontSize + padY * 0.4);
  ctx.restore();
}

function drawButton(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  text: string,
  bgColor: string,
  fontSize: number
) {
  ctx.save();
  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 6);
  ctx.fill();

  ctx.font = `bold ${fontSize}px 'Plus Jakarta Sans', sans-serif`;
  ctx.fillStyle = "#090D16";
  ctx.textAlign = "center";
  ctx.fillText(text, x + w / 2, y + h / 2 + fontSize * 0.35);
  ctx.restore();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number = 3
) {
  if (!text) return;
  const words = text.split(" ");
  let line = "";
  let lineCount = 0;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      if (lineCount + 1 >= maxLines) {
        ctx.fillText(line.trim() + "…", x, y);
        return;
      }
      ctx.fillText(line.trim(), x, y);
      line = words[n] + " ";
      y += lineHeight;
      lineCount++;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, y);
}
