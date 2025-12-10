export type BrushToolMode =
  | "remove"
  | "replace"
  | "recolor"
  | "clone"
  | "outpaint"
  | "enhance";

export type PerspectiveMode =
  | "original"
  // Corner
  | "corner-left"
  | "corner-right"
  | "corner-front-left"
  | "corner-front-right"
  // One-Point
  | "front"
  | "eye-level"
  | "low-angle"
  | "high-angle"
  // Two-Point
  | "two-point-left"
  | "two-point-right"
  | "slight-angle"
  // Three-Point
  | "tilt-up"
  | "tilt-down"
  // Aerial & Ground
  | "birds-eye"
  | "drone"
  | "worms-eye"
  // Specialized
  | "wide-angle"
  | "interior-long"
  | "exterior-long"
  | "balcony"
  | "entrance"
  | "backyard";

export interface EditorSettings {
  // Basic
  brightness: number;
  contrast: number;
  sharpness: number;
  temperature: number;
  noiseReduction: "off" | "low" | "medium" | "high";

  // Property Specific
  sky: "original" | "clear" | "sunset" | "cloudy" | "dramatic";
  grass: boolean;
  wallCleanup: boolean;
  wallColor: "original" | "white" | "beige" | "grey";
  floorPolish: "none" | "glossy" | "matte";
  declutter: boolean;

  // Staging
  stagingStyle:
    | "none"
    | "minimalist"
    | "scandinavian"
    | "modern-luxury"
    | "japandi";

  // Composition
  angle: PerspectiveMode;
  perspectiveFix: boolean;
  depthOfField: "none" | "shallow" | "deep";

  // Advanced
  upscale: "1x" | "2x" | "4x" | "8x";
  customPrompt: string;
  negativePrompt: string;
  strength: number; // 0-100
  seed: number;
}

export const DEFAULT_SETTINGS: EditorSettings = {
  brightness: 0,
  contrast: 0,
  sharpness: 0,
  temperature: 0,
  noiseReduction: "off",
  sky: "original",
  grass: false,
  wallCleanup: false,
  wallColor: "original",
  floorPolish: "none",
  declutter: false,
  stagingStyle: "none",
  angle: "original",
  perspectiveFix: false,
  depthOfField: "none",
  upscale: "1x",
  customPrompt: "",
  negativePrompt: "",
  strength: 75,
  seed: 42,
};

export interface PropertyDetails {
  title: string;
  price: string;
  location: string;
  contact: string;
  showOverlay: boolean;
}

// --- SEO Content Generator Types ---

export interface PropertyListingInput {
  title: string;
  location: string;
  price: string;
  type: "House" | "Apartment" | "Commercial" | "Land";
  status: "For Sale" | "For Rent";
  specs: {
    lt: string; // Luas Tanah
    lb: string; // Luas Bangunan
    bedrooms: string;
    bathrooms: string;
    floors: string;
    electricity: string;
    facing: string; // Hadap
    certificate: string; // SHM, HGB etc
  };
  facilities: string;
  nearby: string; // POI
  usp: string; // Unique Selling Points
}

export interface ContentGenerationSettings {
  language: "Indonesian" | "English";
  tone:
    | "Informative"
    | "Persuasive"
    | "Luxury"
    | "Casual"
    | "Hard-selling"
    | "Soft-selling";
  style: "Formal" | "Semi-Formal" | "Relaxed" | "Premium/High-End" | "Friendly";
  targetAudience:
    | "Family"
    | "Investors"
    | "Professionals"
    | "Students"
    | "High-Net-Worth";
  platforms: {
    website: boolean;
    instagram: boolean;
    tiktok: boolean;
    facebook: boolean;
  };
  cta?: {
    category: string;
    text: string;
    style: string;
    placements: {
      website: boolean;
      instagram: boolean;
      tiktok: boolean;
      facebook: boolean;
    };
  };
}

export interface GeneratedContentResult {
  seoTitle?: string;
  seoDescription?: string;
  listingDescription?: string;
  instagramCaption?: string;
  tiktokCaption?: string;
  facebookCaption?: string;
  hashtags?: string[];
}
