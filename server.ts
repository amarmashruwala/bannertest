import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Enable CORS for all local and iframe origins
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Server-side Google GenAI initialization with required telemetry User-Agent header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Endpoint 1: Analyze Product URL & Description to generate high-converting ad copy
app.post("/api/analyze-product", async (req, res) => {
  try {
    const { url = "", description = "", brandName = "", style = "Modern Commercial" } = req.body;

    if (!description && !url) {
      return res.status(400).json({ error: "Please provide a product description or website URL." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured in the environment.",
      });
    }

    const promptText = `
You are an expert digital advertising creative director.
Analyze the following product details and URL, then craft high-performing, high-CTR display and social banner ad campaign copy.

Product URL: ${url || "N/A"}
Product Description: ${description || "N/A"}
Specified Brand: ${brandName || "N/A"}
Target Visual Style: ${style}

Generate:
1. brandName: The clean product or company brand name (infer from URL/description if not given).
2. headline: High-impact punchy banner headline (2 to 5 words max, urgent, bold, memorable).
3. subheadline: Persuasive secondary value proposition (6 to 12 words max, clear customer benefit).
4. callToAction: Clear, action-driving button label (e.g. "Shop Now", "Get 20% Off", "Claim Offer", "Discover More", "Order Today").
5. badgeText: Short urgency or promotional badge (e.g. "50% OFF", "NEW ARRIVAL", "LIMITED DROP", "FREE DELIVERY", "TOP RATED").
6. suggestedAccentColor: A hex color code that fits this brand and product (e.g., #F59E0B for amber, #EF4444 for crimson, #10B981 for emerald, #3B82F6 for royal blue, #8B5CF6 for violet).
7. imagePrompt: A vivid, commercial studio photography prompt suitable for generating an advertisement visual (describe lighting, composition, materials, background, and studio quality).
8. copyVariations: 3 alternate angles for A/B testing:
   - variation 1: Focus on Urgency / Sale
   - variation 2: Focus on Premium Craft / Quality
   - variation 3: Focus on Problem / Solution
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: promptText,
      config: {
        systemInstruction: "You are an elite digital advertising creative director creating high-converting banner ads. Return structured JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            brandName: { type: Type.STRING },
            headline: { type: Type.STRING },
            subheadline: { type: Type.STRING },
            callToAction: { type: Type.STRING },
            badgeText: { type: Type.STRING },
            suggestedAccentColor: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            copyVariations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  angle: { type: Type.STRING },
                  headline: { type: Type.STRING },
                  subheadline: { type: Type.STRING },
                  callToAction: { type: Type.STRING },
                  badgeText: { type: Type.STRING },
                },
                required: ["angle", "headline", "subheadline", "callToAction", "badgeText"],
              },
            },
          },
          required: [
            "brandName",
            "headline",
            "subheadline",
            "callToAction",
            "badgeText",
            "suggestedAccentColor",
            "imagePrompt",
            "copyVariations",
          ],
        },
      },
    });

    const parsedData = JSON.parse(response.text || "{}");
    return res.json(parsedData);
  } catch (error: any) {
    console.error("Error analyzing product:", error);
    return res.status(500).json({
      error: error.message || "Failed to generate ad copy",
    });
  }
});

// Endpoint 2: Robust Scrape or Extract details from URL (never crashes)
app.post("/api/extract-url", async (req, res) => {
  try {
    const rawUrl = (req.body?.url || "").trim();
    if (!rawUrl) {
      return res.status(400).json({ error: "Please enter a URL." });
    }

    let urlObj: URL;
    try {
      urlObj = new URL(rawUrl.startsWith("http://") || rawUrl.startsWith("https://") ? rawUrl : `https://${rawUrl}`);
    } catch {
      // Derive brand from simple text
      const clean = rawUrl.replace(/[^a-zA-Z0-9]/g, " ").trim();
      const fallbackBrand = clean.charAt(0).toUpperCase() + clean.slice(1);
      return res.json({
        title: fallbackBrand || "Featured Brand",
        description: `Explore products from ${rawUrl}`,
        domain: rawUrl,
      });
    }

    const domain = urlObj.hostname.replace(/^www\./, "");
    const hostParts = domain.split(".");
    const brandGuess = (hostParts[0] || "brand").charAt(0).toUpperCase() + (hostParts[0] || "brand").slice(1);

    // Extract path keywords (e.g. /products/pro-anc-headphones -> "Pro Anc Headphones")
    const pathWords = urlObj.pathname
      .split("/")
      .filter((segment) => segment && !["products", "item", "collection", "p", "dp", "shop"].includes(segment.toLowerCase()))
      .map((seg) => seg.replace(/[-_]/g, " ").trim())
      .filter(Boolean)
      .join(" ");

    const formattedProductGuess = pathWords
      ? pathWords.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
      : "";

    // Attempt lightweight fetch with strict 1.8s timeout
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1800);
      const fetchRes = await fetch(urlObj.href, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (fetchRes.ok) {
        const html = await fetchRes.text();
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i) ||
                          html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i);
        const ogTitle = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);

        let extractedTitle = ogTitle ? ogTitle[1] : (titleMatch ? titleMatch[1] : "");
        // Clean up entity escapes like &amp; &#x27;
        extractedTitle = extractedTitle
          .replace(/&amp;/g, "&")
          .replace(/&#x27;/g, "'")
          .replace(/&quot;/g, '"')
          .trim();

        let extractedDesc = (descMatch ? descMatch[1] : "")
          .replace(/&amp;/g, "&")
          .replace(/&#x27;/g, "'")
          .replace(/&quot;/g, '"')
          .trim();

        if (extractedTitle || extractedDesc) {
          return res.json({
            title: extractedTitle || formattedProductGuess || brandGuess,
            description: extractedDesc || (formattedProductGuess ? `${formattedProductGuess} by ${brandGuess}` : `Official products from ${domain}`),
            domain,
          });
        }
      }
    } catch {
      // Fetch timed out or network blocked; proceed directly to smart fallback
    }

    // Smart fallback if fetch did not yield content
    const finalTitle = formattedProductGuess
      ? `${formattedProductGuess} — ${brandGuess}`
      : brandGuess;
    const finalDesc = formattedProductGuess
      ? `Discover the new ${formattedProductGuess} engineered by ${brandGuess}. Premium quality and exclusive online offers.`
      : `Official store and product catalog for ${brandGuess} at ${domain}.`;

    return res.json({
      title: finalTitle,
      description: finalDesc,
      domain,
    });
  } catch (err: any) {
    return res.json({
      title: "Featured Product",
      description: "Premium product advertisement campaign.",
      domain: "store.com",
    });
  }
});

// Endpoint 3: Generate Studio Product Image via Gemini
// Supports gemini-3-pro-image-preview and gemini-nano-banana-2.1 with 1K, 2K, 4K resolutions and 1:1, 2:3, 3:2, 3:4, 4:3, 9:16, 16:9, 21:9 aspect ratios
app.post("/api/generate-image", async (req, res) => {
  try {
    const {
      prompt,
      model = "gemini-3-pro-image-preview",
      aspectRatio = "1:1",
      imageSize = "1K",
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Image prompt is required." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured.",
      });
    }

    // Supported aspect ratios
    const validRatios = ["1:1", "2:3", "3:2", "3:4", "4:3", "9:16", "16:9", "21:9"];
    const targetRatio = validRatios.includes(aspectRatio) ? aspectRatio : "1:1";

    // Supported image sizes
    const validSizes = ["1K", "2K", "4K"];
    const targetSize = validSizes.includes(imageSize) ? imageSize : "1K";

    // Target model: gemini-3-pro-image-preview or gemini-nano-banana-2.1
    const targetModel = model === "gemini-nano-banana-2.1" ? "gemini-nano-banana-2.1" : "gemini-3-pro-image-preview";

    const response = await ai.models.generateContent({
      model: targetModel,
      contents: {
        parts: [
          {
            text: `High-end commercial advertisement product photograph: ${prompt}. Professional studio lighting, clean background, sharp focus, vibrant commercial quality, no text or watermark.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: targetRatio as any,
          imageSize: targetSize as any,
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData?.data) {
        const base64EncodeString = part.inlineData.data;
        const mime = part.inlineData.mimeType || "image/png";
        return res.json({
          imageUrl: `data:${mime};base64,${base64EncodeString}`,
          aspectRatio: targetRatio,
          imageSize: targetSize,
          model: targetModel,
        });
      }
    }

    return res.status(500).json({
      error: "No image was returned from the generative model. Please try refining your prompt.",
    });
  } catch (error: any) {
    console.error("Error generating image:", error);
    return res.status(500).json({
      error: error.message || "Failed to generate image.",
    });
  }
});

// Setup Vite middleware in dev or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`BannerCraft Studio Server listening on port ${PORT}`);
  });
}

startServer();
