import React, { useState } from "react";
import {
  Home,
  FileText,
  Copy,
  Instagram,
  Facebook,
  Video,
  Hash,
  MapPin,
  Undo2,
  LayoutTemplate,
  Sparkles,
  Megaphone,
  ChevronRight,
} from "./components/Icons";
import { Button, Select } from "./components/UI";
import {
  PropertyListingInput,
  ContentGenerationSettings,
  GeneratedContentResult,
} from "./types";
import { generatePropertyContent } from "./services/geminiService";

// Component for listing description preview with expand/collapse
const ListingDescriptionPreview = ({ content }: { content: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxPreviewLength = 250;
  const shouldTruncate = content.length > maxPreviewLength;

  // Find a good break point (end of sentence or line)
  const getPreviewText = (text: string, maxLen: number) => {
    if (text.length <= maxLen) return text;
    const truncated = text.substring(0, maxLen);
    const lastNewline = truncated.lastIndexOf("\n");
    const lastPeriod = truncated.lastIndexOf(".");
    const lastBreak = Math.max(lastNewline, lastPeriod);
    return lastBreak > maxLen * 0.7
      ? truncated.substring(0, lastBreak + 1)
      : truncated;
  };

  const displayContent =
    shouldTruncate && !isExpanded
      ? getPreviewText(content, maxPreviewLength) + "..."
      : content;

  return (
    <div className="space-y-2">
      <div className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed font-normal">
        {displayContent.split("\n").map((line, idx) => {
          // Style section headers (lines in ALL CAPS or starting with specific keywords)
          const isHeader =
            line
              .trim()
              .match(/^(DETAIL|FASILITAS|AKSES|HARGA|KESIMPULAN|OPENING)/i) ||
            (line.trim().length > 0 &&
              line.trim() === line.trim().toUpperCase() &&
              line.trim().length < 50);
          return (
            <div
              key={idx}
              className={
                isHeader ? "font-bold text-slate-800 mt-3 mb-1 first:mt-0" : ""
              }
            >
              {line || "\u00A0"}
            </div>
          );
        })}
      </div>
      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 mt-2"
        >
          {isExpanded ? (
            <>
              <ChevronRight className="w-3 h-3 rotate-90" />
              Tampilkan lebih sedikit
            </>
          ) : (
            <>
              <ChevronRight className="w-3 h-3 -rotate-90" />
              Tampilkan lebih banyak
            </>
          )}
        </button>
      )}
    </div>
  );
};

const CTA_PRESETS: Record<string, string[]> = {
  "Soft-Selling": [
    "Info lengkap? Hubungi kami ya!",
    "Klik chat untuk tanya detail.",
    "Yuk lihat rumahnya langsung!",
  ],
  "Hard-Selling": [
    "Segera hubungi sebelum terjual!",
    "Unit terbatas – booking sekarang!",
    "Jangan sampai kehabisan!",
  ],
  Premium: [
    "Schedule private viewing today.",
    "For exclusive inquiry, contact us.",
    "Only for serious buyers.",
  ],
  Friendly: [
    "Kalau cocok, DM aja ya!",
    "Ping aja kalau mau tanya-tanya 🍀",
    "Mau liat videonya? Langsung chat!",
  ],
  WhatsApp: [
    "Klik link WhatsApp di bio untuk chat langsung.",
    "Chat via WhatsApp untuk fast response.",
  ],
  "Lead Magnet": [
    "Minta daftar rumah terbaru—gratis!",
    "Dapatkan rekomendasi properti sesuai budget Anda.",
  ],
};

const SeoGeneratorPage = ({ onBack }: { onBack: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GeneratedContentResult | null>(null);

  const [input, setInput] = useState<PropertyListingInput>({
    title: "",
    location: "",
    price: "",
    type: "House",
    status: "For Sale",
    specs: {
      lt: "",
      lb: "",
      bedrooms: "",
      bathrooms: "",
      floors: "",
      electricity: "",
      facing: "",
      certificate: "",
    },
    facilities: "",
    nearby: "",
    usp: "",
  });

  const [genSettings, setGenSettings] = useState<ContentGenerationSettings>({
    language: "Indonesian",
    tone: "Persuasive",
    style: "Premium/High-End",
    targetAudience: "Family",
    platforms: { website: true, instagram: true, tiktok: true, facebook: true },
    cta: {
      category: "Soft-Selling",
      text: "Info lengkap? Hubungi kami ya!",
      style: "Friendly",
      placements: {
        website: true,
        instagram: true,
        tiktok: true,
        facebook: true,
      },
    },
  });

  const handleGenerate = async () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      alert("API Key missing");
      return;
    }
    setLoading(true);
    try {
      const res = await generatePropertyContent(input, genSettings, apiKey);
      setResults(res);
    } catch (e) {
      alert("Failed to generate content");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  // Helper to change CTA text when preset category changes
  const handleCtaCategoryChange = (val: string) => {
    const category = val as any;
    const defaultText = CTA_PRESETS[category] ? CTA_PRESETS[category][0] : "";
    setGenSettings((prev) => ({
      ...prev,
      cta: {
        ...prev.cta,
        category,
        text: category === "Custom" ? "" : defaultText,
      },
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="h-14 sm:h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 z-20 shrink-0 sticky top-0">
        <div className="flex items-center">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary-600 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
            <Home className="text-white w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <h1 className="font-display font-bold text-base sm:text-lg text-slate-800">
            SEO Content Generator
          </h1>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full p-3 sm:p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Left: Input Form */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 overflow-y-auto h-[calc(100vh-120px)] sm:h-[calc(100vh-140px)] custom-scrollbar">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 sm:mb-6 flex items-center">
            <LayoutTemplate className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary-600" />{" "}
            Property Details
          </h2>

          <div className="space-y-4 sm:space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Title (Optional)
                </label>
                <input
                  className="w-full p-2 border rounded-md text-sm"
                  placeholder="e.g. Luxury Villa"
                  value={input.title}
                  onChange={(e) =>
                    setInput({ ...input, title: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Price
                </label>
                <input
                  className="w-full p-2 border rounded-md text-sm"
                  placeholder="e.g. 5.5 Miliar"
                  value={input.price}
                  onChange={(e) =>
                    setInput({ ...input, price: e.target.value })
                  }
                />
              </div>
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    className="w-full pl-9 p-2 border rounded-md text-sm"
                    placeholder="e.g. Pondok Indah, Jakarta Selatan"
                    value={input.location}
                    onChange={(e) =>
                      setInput({ ...input, location: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Type
                </label>
                <Select
                  label=""
                  value={input.type}
                  onChange={(v) => setInput({ ...input, type: v })}
                  options={[
                    { label: "House", value: "House" },
                    { label: "Apartment", value: "Apartment" },
                    { label: "Commercial", value: "Commercial" },
                    { label: "Land", value: "Land" },
                    { label: "Industri", value: "Industri" },
                    { label: "Warehouse", value: "Warehouse" },
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Status
                </label>
                <Select
                  label=""
                  value={input.status}
                  onChange={(v) => setInput({ ...input, status: v })}
                  options={[
                    { label: "For Sale", value: "For Sale" },
                    { label: "For Rent", value: "For Rent" },
                  ]}
                />
              </div>
            </div>

            {/* Specs */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2 sm:mb-3 border-b pb-1">
                Specifications
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                {Object.entries(input.specs).map(([key, val]) => {
                  const placeholders: Record<string, string> = {
                    lt: "e.g. 200 m²",
                    lb: "e.g. 150 m²",
                    bedrooms: "e.g. 3",
                    bathrooms: "e.g. 2",
                    floors: "e.g. 2",
                    electricity: "e.g. 2200 Watt",
                    facing: "e.g. Timur",
                    certificate: "e.g. SHM",
                  };
                  return (
                    <div key={key}>
                      <label className="block text-xs font-medium text-slate-500 mb-1 capitalize">
                        {key}
                      </label>
                      <input
                        className="w-full p-2 border rounded-md text-xs"
                        placeholder={placeholders[key] || ""}
                        value={val}
                        onChange={(e) =>
                          setInput({
                            ...input,
                            specs: { ...input.specs, [key]: e.target.value },
                          })
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Text Areas */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Facilities
                </label>
                <textarea
                  className="w-full p-2 border rounded-md text-sm h-20 resize-none"
                  placeholder="e.g. Swimming Pool, Gym, 24h Security..."
                  value={input.facilities}
                  onChange={(e) =>
                    setInput({ ...input, facilities: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nearby (POI)
                </label>
                <textarea
                  className="w-full p-2 border rounded-md text-sm h-16 resize-none"
                  placeholder="e.g. 5 min to Toll, Near International School..."
                  value={input.nearby}
                  onChange={(e) =>
                    setInput({ ...input, nearby: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Unique Selling Points (USP)
                </label>
                <textarea
                  className="w-full p-2 border rounded-md text-sm h-16 resize-none"
                  placeholder="e.g. Bebas Banjir, High Ceiling, Smart Home..."
                  value={input.usp}
                  onChange={(e) => setInput({ ...input, usp: e.target.value })}
                />
              </div>
            </div>

            {/* CTA Section */}
            <div className="bg-slate-50 p-3 sm:p-4 rounded-lg border border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 mb-2 sm:mb-3 flex items-center">
                <Megaphone className="w-4 h-4 mr-2 text-primary-600" /> Call to
                Action (CTA)
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      Category
                    </label>
                    <Select
                      label=""
                      value={genSettings.cta.category}
                      onChange={handleCtaCategoryChange}
                      options={[
                        "Soft-Selling",
                        "Hard-Selling",
                        "Premium",
                        "Friendly",
                        "WhatsApp",
                        "Lead Magnet",
                        "Custom",
                      ].map((v) => ({ label: v, value: v }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      Style Tone
                    </label>
                    <Select
                      label=""
                      value={genSettings.cta.style}
                      onChange={(v) =>
                        setGenSettings((prev) => ({
                          ...prev,
                          cta: { ...prev.cta, style: v },
                        }))
                      }
                      options={[
                        "Formal",
                        "Semi-Formal",
                        "Friendly",
                        "Premium",
                        "Hard-selling",
                      ].map((v) => ({ label: v, value: v }))}
                    />
                  </div>
                </div>

                {genSettings.cta.category !== "Custom" && (
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      Preset Option
                    </label>
                    <Select
                      label=""
                      value={genSettings.cta.text}
                      onChange={(v) =>
                        setGenSettings((prev) => ({
                          ...prev,
                          cta: { ...prev.cta, text: v },
                        }))
                      }
                      options={CTA_PRESETS[genSettings.cta.category].map(
                        (v) => ({ label: v, value: v })
                      )}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    CTA Text{" "}
                    {genSettings.cta.category !== "Custom" ? "(Editable)" : ""}
                  </label>
                  <textarea
                    className="w-full p-2 border rounded-md text-sm h-16 resize-none focus:ring-1 focus:ring-primary-500"
                    value={genSettings.cta.text}
                    onChange={(e) =>
                      setGenSettings((prev) => ({
                        ...prev,
                        cta: { ...prev.cta, text: e.target.value },
                      }))
                    }
                    placeholder="Type your custom CTA here..."
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-500 mb-2">
                    Apply CTA To:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 text-sm">
                    {Object.keys(genSettings.cta.placements).map((key) => (
                      <label
                        key={key}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={(genSettings.cta.placements as any)[key]}
                          onChange={(e) =>
                            setGenSettings((prev) => ({
                              ...prev,
                              cta: {
                                ...prev.cta,
                                placements: {
                                  ...prev.cta.placements,
                                  [key]: e.target.checked,
                                },
                              },
                            }))
                          }
                          className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="capitalize">{key}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Writing Settings */}
            <div className="bg-slate-50 p-3 sm:p-4 rounded-lg border border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 mb-2 sm:mb-3">
                Overall Style
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    Tone
                  </label>
                  <Select
                    label=""
                    value={genSettings.tone}
                    onChange={(v) =>
                      setGenSettings({ ...genSettings, tone: v })
                    }
                    options={[
                      "Informative",
                      "Persuasive",
                      "Luxury",
                      "Casual",
                      "Hard-selling",
                      "Soft-selling",
                    ].map((v) => ({ label: v, value: v }))}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    Audience
                  </label>
                  <Select
                    label=""
                    value={genSettings.targetAudience}
                    onChange={(v) =>
                      setGenSettings({ ...genSettings, targetAudience: v })
                    }
                    options={[
                      "Family",
                      "Investors",
                      "Professionals",
                      "College Student",
                      "High-Net-Worth",
                    ].map((v) => ({ label: v, value: v }))}
                  />
                </div>
              </div>
              <Button
                className="w-full mt-2"
                onClick={handleGenerate}
                isLoading={loading}
              >
                <Sparkles className="w-4 h-4 mr-2" /> Generate Content
              </Button>
            </div>
          </div>
        </div>

        {/* Right: Output */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 overflow-y-auto h-[calc(100vh-120px)] sm:h-[calc(100vh-140px)] lg:h-[calc(100vh-140px)] custom-scrollbar">
          {!results ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 px-4">
              <FileText className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 opacity-20" />
              <p className="text-sm sm:text-base text-center">
                Fill in the details and click Generate to see magic.
              </p>
            </div>
          ) : (
            <div className="space-y-6 sm:space-y-8 animate-fadeIn">
              {/* Website SEO */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-primary-600" />{" "}
                    Website SEO
                  </h3>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        results.seoTitle + "\n\n" + results.listingDescription
                      )
                    }
                    className="text-slate-500 hover:text-primary-600 p-1"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="bg-slate-50 p-3 sm:p-4 rounded-lg border border-slate-100 space-y-2 sm:space-y-3">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase">
                      Page Title
                    </span>
                    <p className="text-sm font-medium text-slate-800">
                      {results.seoTitle}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase">
                      Listing Description
                    </span>
                    <ListingDescriptionPreview
                      content={results.listingDescription || ""}
                    />
                  </div>
                </div>
              </div>

              {/* Instagram */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center">
                    <Instagram className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-pink-600" />{" "}
                    Instagram Caption
                  </h3>
                  <button
                    onClick={() =>
                      copyToClipboard(results.instagramCaption || "")
                    }
                    className="text-slate-500 hover:text-primary-600 p-1"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="bg-slate-50 p-3 sm:p-4 rounded-lg border border-slate-100">
                  <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap break-words">
                    {results.instagramCaption}
                  </p>
                </div>
              </div>

              {/* TikTok */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center">
                    <Video className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-black" />{" "}
                    TikTok Caption
                  </h3>
                  <button
                    onClick={() => copyToClipboard(results.tiktokCaption || "")}
                    className="text-slate-500 hover:text-primary-600 p-1"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="bg-slate-50 p-3 sm:p-4 rounded-lg border border-slate-100">
                  <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap break-words">
                    {results.tiktokCaption}
                  </p>
                </div>
              </div>

              {/* Facebook */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center">
                    <Facebook className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-blue-700" />{" "}
                    Facebook Post
                  </h3>
                  <button
                    onClick={() =>
                      copyToClipboard(results.facebookCaption || "")
                    }
                    className="text-slate-500 hover:text-primary-600 p-1"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="bg-slate-50 p-3 sm:p-4 rounded-lg border border-slate-100">
                  <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap break-words">
                    {results.facebookCaption}
                  </p>
                </div>
              </div>

              {/* Hashtags */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center">
                    <Hash className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-slate-600" />{" "}
                    Hashtags
                  </h3>
                  <button
                    onClick={() =>
                      copyToClipboard(results.hashtags?.join(" ") || "")
                    }
                    className="text-slate-500 hover:text-primary-600 p-1"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="bg-slate-50 p-3 sm:p-4 rounded-lg border border-slate-100">
                  <div className="flex flex-wrap gap-2">
                    {results.hashtags?.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-white border rounded text-xs text-primary-600 font-medium"
                      >
                        #{tag.replace("#", "")}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  return <SeoGeneratorPage onBack={() => {}} />;
}
