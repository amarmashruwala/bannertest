export type AspectRatio = "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "9:16" | "16:9" | "21:9";
export type ImageResolution = "1K" | "2K" | "4K";
export type ImageModel = "gemini-3-pro-image-preview" | "gemini-nano-banana-2.1";

export interface BannerFormat {
  id: string;
  name: string;
  width: number;
  height: number;
  category: "IAB Display" | "Social & Mobile";
  aspectRatioLabel: string;
  recommendedUse: string;
}

export interface AdCreative {
  id: string;
  brandName: string;
  headline: string;
  subheadline: string;
  callToAction: string;
  badgeText: string;
  accentColor: string;
  imageUrl: string;
  productUrl?: string;
  productDescription?: string;
  theme: "dark" | "light" | "vibrant";
  layoutStyle?: "bold-commercial" | "minimalist" | "editorial";
  copyVariations?: Array<{
    angle: string;
    headline: string;
    subheadline: string;
    callToAction: string;
    badgeText: string;
  }>;
}

export interface GenerationSettings {
  url: string;
  description: string;
  brandName: string;
  model: ImageModel;
  aspectRatio: AspectRatio;
  imageSize: ImageResolution;
  style: string;
}
