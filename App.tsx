
import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  ImageIcon, 
  Wand2, 
  Download, 
  ChevronRight, 
  Check, 
  Loader2, 
  Home, 
  Sun, 
  Palette, 
  Maximize, 
  Zap,
  Undo2, 
  Crop, 
  Sliders, 
  LayoutTemplate, 
  Eraser, 
  Brush, 
  Eye, 
  EyeOff, 
  Trash2, 
  Stamp, 
  RefreshCcw, 
  Sparkles, 
  PaintBucket, 
  MousePointer2, 
  FileText, 
  Copy, 
  Instagram, 
  Facebook, 
  Video, 
  Hash, 
  MapPin, 
  DollarSign, 
  Briefcase,
  Megaphone
} from './components/Icons';
import { Button, Slider, Toggle, Select } from './components/UI';
import { BeforeAfter } from './components/BeforeAfter';
import { MaskEditor, MaskEditorHandle } from './components/MaskEditor';
import { 
  DEFAULT_SETTINGS, 
  EditorSettings, 
  PropertyDetails, 
  BrushToolMode, 
  PropertyListingInput,
  ContentGenerationSettings,
  GeneratedContentResult
} from './types';
import { generateEnhancedImage, fileToGenerativePart, editImageWithMask, generatePropertyContent } from './services/geminiService';

// --- Subcomponents for Pages ---

const LandingPage = ({ onStart, onStartSeo }: { onStart: () => void, onStartSeo: () => void }) => (
  <div className="min-h-screen bg-slate-50 flex flex-col">
    {/* Navbar */}
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Home className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-display font-bold text-slate-900">EstateAI</span>
        </div>
        <div className="hidden md:flex items-center space-x-8">
          <button onClick={onStartSeo} className="text-slate-600 hover:text-primary-600 font-medium text-sm flex items-center transition-colors">
             <FileText className="w-4 h-4 mr-1"/> SEO Generator
          </button>
          <a href="#features" className="text-slate-600 hover:text-primary-600 font-medium text-sm">Features</a>
          <Button onClick={onStart}>Get Started</Button>
        </div>
      </div>
    </nav>

    {/* Hero */}
    <main className="flex-grow">
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-display font-bold text-slate-900 tracking-tight mb-6">
            Transform Property Photos <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">with AI Precision</span>
          </h1>
          <p className="mt-4 text-xl text-slate-600 max-w-2xl mx-auto mb-10">
            Automatically enhance, virtually stage, and fix real estate photography in seconds. 
            Increase engagement and sell faster.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" onClick={onStart} className="shadow-xl shadow-primary-500/20">
              <Upload className="mr-2 h-5 w-5" /> Enhance Photos
            </Button>
            <Button size="lg" variant="secondary" onClick={onStartSeo} className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
              <FileText className="mr-2 h-5 w-5" /> Generate Content
            </Button>
          </div>
        </div>
        
        {/* Abstract bg elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl opacity-30 pointer-events-none">
           <div className="absolute top-20 right-0 w-96 h-96 bg-primary-200 rounded-full blur-3xl mix-blend-multiply"></div>
           <div className="absolute top-40 left-0 w-72 h-72 bg-indigo-200 rounded-full blur-3xl mix-blend-multiply"></div>
        </div>
      </section>

      {/* Benefits */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: <Sun className="w-6 h-6"/>, title: "Sky Replacement", desc: "Turn gloomy days into bright sunny afternoons instantly." },
              { icon: <Palette className="w-6 h-6"/>, title: "Virtual Staging", desc: "Fill empty rooms with modern, stylish furniture styles." },
              { icon: <FileText className="w-6 h-6"/>, title: "SEO Writing", desc: "Generate professional listing descriptions and social captions." }
            ].map((feature, idx) => (
              <div key={idx} className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary-600 mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>

    <footer className="bg-slate-900 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p>&copy; 2024 EstateAI. Built with Gemini 2.5.</p>
      </div>
    </footer>
  </div>
);

const UploadPage = ({ onUpload }: { onUpload: (file: File) => void }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl p-10 text-center">
          <div className="mb-8">
            <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">Upload Property Photo</h2>
            <p className="text-slate-500">Supported formats: JPG, PNG, WEBP (Max 10MB)</p>
          </div>

          <div
            className={`border-4 border-dashed rounded-xl p-12 transition-all cursor-pointer ${
              isDragging ? "border-primary-500 bg-primary-50" : "border-slate-200 hover:border-primary-400 hover:bg-slate-50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            <div className="w-20 h-20 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Upload className="w-10 h-10" />
            </div>
            <p className="text-lg font-medium text-slate-700 mb-2">Click to upload or drag and drop</p>
            <p className="text-sm text-slate-400">High resolution images recommended</p>
            <input 
              id="file-upload" 
              type="file" 
              className="hidden" 
              accept="image/*" 
              onChange={handleChange}
            />
          </div>
          
          <div className="mt-8 flex justify-center">
             <Button variant="ghost" onClick={() => window.location.reload()}>
               <span className="flex items-center text-slate-500">
                 <ChevronRight className="rotate-180 mr-1 w-4 h-4"/> Back to Home
               </span>
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component for listing description preview with expand/collapse
const ListingDescriptionPreview = ({ content }: { content: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxPreviewLength = 250;
  const shouldTruncate = content.length > maxPreviewLength;
  
  // Find a good break point (end of sentence or line)
  const getPreviewText = (text: string, maxLen: number) => {
    if (text.length <= maxLen) return text;
    const truncated = text.substring(0, maxLen);
    const lastNewline = truncated.lastIndexOf('\n');
    const lastPeriod = truncated.lastIndexOf('.');
    const lastBreak = Math.max(lastNewline, lastPeriod);
    return lastBreak > maxLen * 0.7 ? truncated.substring(0, lastBreak + 1) : truncated;
  };
  
  const displayContent = shouldTruncate && !isExpanded 
    ? getPreviewText(content, maxPreviewLength) + '...' 
    : content;

  return (
    <div className="space-y-2">
      <div className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed font-normal">
        {displayContent.split('\n').map((line, idx) => {
          // Style section headers (lines in ALL CAPS or starting with specific keywords)
          const isHeader = line.trim().match(/^(DETAIL|FASILITAS|AKSES|HARGA|KESIMPULAN|OPENING)/i) || 
                          (line.trim().length > 0 && line.trim() === line.trim().toUpperCase() && line.trim().length < 50);
          return (
            <div 
              key={idx} 
              className={isHeader ? "font-bold text-slate-800 mt-3 mb-1 first:mt-0" : ""}
            >
              {line || '\u00A0'}
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
  'Soft-Selling': [
    "Info lengkap? Hubungi kami ya!",
    "Klik chat untuk tanya detail.",
    "Yuk lihat rumahnya langsung!"
  ],
  'Hard-Selling': [
    "Segera hubungi sebelum terjual!",
    "Unit terbatas – booking sekarang!",
    "Jangan sampai kehabisan!"
  ],
  'Premium': [
    "Schedule private viewing today.",
    "For exclusive inquiry, contact us.",
    "Only for serious buyers."
  ],
  'Friendly': [
    "Kalau cocok, DM aja ya!",
    "Ping aja kalau mau tanya-tanya 🍀",
    "Mau liat videonya? Langsung chat!"
  ],
  'WhatsApp': [
    "Klik link WhatsApp di bio untuk chat langsung.",
    "Chat via WhatsApp untuk fast response."
  ],
  'Lead Magnet': [
    "Minta daftar rumah terbaru—gratis!",
    "Dapatkan rekomendasi properti sesuai budget Anda."
  ]
};

const SeoGeneratorPage = ({ onBack }: { onBack: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GeneratedContentResult | null>(null);
  
  const [input, setInput] = useState<PropertyListingInput>({
    title: '',
    location: '',
    price: '',
    type: 'House',
    status: 'For Sale',
    specs: {
      lt: '', lb: '', bedrooms: '', bathrooms: '', floors: '', electricity: '', facing: '', certificate: ''
    },
    facilities: '',
    nearby: '',
    usp: ''
  });

  const [genSettings, setGenSettings] = useState<ContentGenerationSettings>({
    language: 'Indonesian',
    tone: 'Persuasive',
    style: 'Premium/High-End',
    targetAudience: 'Family',
    platforms: { website: true, instagram: true, tiktok: true, facebook: true },
    cta: {
      category: 'Soft-Selling',
      text: "Info lengkap? Hubungi kami ya!",
      style: 'Friendly',
      placements: { website: true, instagram: true, tiktok: true, facebook: true }
    }
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
    const defaultText = CTA_PRESETS[category] ? CTA_PRESETS[category][0] : '';
    setGenSettings(prev => ({
      ...prev,
      cta: {
        ...prev.cta,
        category,
        text: category === 'Custom' ? '' : defaultText
      }
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
       {/* Header */}
       <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-20 shrink-0 sticky top-0">
        <div className="flex items-center cursor-pointer" onClick={onBack}>
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
             <Home className="text-white w-5 h-5" />
          </div>
          <h1 className="font-display font-bold text-lg text-slate-800">Content Generator</h1>
        </div>
        <div className="flex items-center space-x-4">
           <Button variant="outline" size="sm" onClick={onBack}>
             <Undo2 className="w-4 h-4 mr-2"/> Back to Home
           </Button>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: Input Form */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-y-auto h-[calc(100vh-140px)] custom-scrollbar">
           <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
             <LayoutTemplate className="w-5 h-5 mr-2 text-primary-600"/> Property Details
           </h2>

           <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Title (Optional)</label>
                   <input className="w-full p-2 border rounded-md text-sm" placeholder="e.g. Luxury Villa" value={input.title} onChange={e => setInput({...input, title: e.target.value})} />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Price</label>
                   <input className="w-full p-2 border rounded-md text-sm" placeholder="e.g. 5.5 Miliar" value={input.price} onChange={e => setInput({...input, price: e.target.value})} />
                 </div>
                 <div className="col-span-2">
                   <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                   <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400"/>
                      <input className="w-full pl-9 p-2 border rounded-md text-sm" placeholder="e.g. Pondok Indah, Jakarta Selatan" value={input.location} onChange={e => setInput({...input, location: e.target.value})} />
                   </div>
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                   <Select label="" value={input.type} onChange={v => setInput({...input, type: v})} options={[{label:'House', value:'House'}, {label:'Apartment', value:'Apartment'}, {label:'Commercial', value:'Commercial'}, {label:'Land', value:'Land'}]} />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                   <Select label="" value={input.status} onChange={v => setInput({...input, status: v})} options={[{label:'For Sale', value:'For Sale'}, {label:'For Rent', value:'For Rent'}]} />
                 </div>
              </div>

              {/* Specs */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3 border-b pb-1">Specifications</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                   {Object.entries(input.specs).map(([key, val]) => (
                     <div key={key}>
                       <label className="block text-xs font-medium text-slate-500 mb-1 capitalize">{key}</label>
                       <input className="w-full p-2 border rounded-md text-xs" value={val} onChange={e => setInput({...input, specs: {...input.specs, [key]: e.target.value}})} />
                     </div>
                   ))}
                </div>
              </div>

              {/* Text Areas */}
              <div className="space-y-3">
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Facilities</label>
                   <textarea className="w-full p-2 border rounded-md text-sm h-20" placeholder="e.g. Swimming Pool, Gym, 24h Security..." value={input.facilities} onChange={e => setInput({...input, facilities: e.target.value})} />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Nearby (POI)</label>
                   <textarea className="w-full p-2 border rounded-md text-sm h-16" placeholder="e.g. 5 min to Toll, Near International School..." value={input.nearby} onChange={e => setInput({...input, nearby: e.target.value})} />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Unique Selling Points (USP)</label>
                   <textarea className="w-full p-2 border rounded-md text-sm h-16" placeholder="e.g. Bebas Banjir, High Ceiling, Smart Home..." value={input.usp} onChange={e => setInput({...input, usp: e.target.value})} />
                 </div>
              </div>

              {/* CTA Section - NEW ADDITION */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                 <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center">
                   <Megaphone className="w-4 h-4 mr-2 text-primary-600"/> Call to Action (CTA)
                 </h3>
                 <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                       <div>
                         <label className="block text-xs text-slate-500 mb-1">Category</label>
                         <Select 
                           label="" 
                           value={genSettings.cta.category} 
                           onChange={handleCtaCategoryChange}
                           options={['Soft-Selling', 'Hard-Selling', 'Premium', 'Friendly', 'WhatsApp', 'Lead Magnet', 'Custom'].map(v => ({label: v, value: v}))} 
                         />
                       </div>
                       <div>
                         <label className="block text-xs text-slate-500 mb-1">Style Tone</label>
                         <Select 
                           label="" 
                           value={genSettings.cta.style} 
                           onChange={v => setGenSettings(prev => ({...prev, cta: {...prev.cta, style: v}}))}
                           options={['Formal', 'Semi-Formal', 'Friendly', 'Premium', 'Hard-selling'].map(v => ({label: v, value: v}))} 
                         />
                       </div>
                    </div>

                    {genSettings.cta.category !== 'Custom' && (
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Preset Option</label>
                        <Select 
                          label="" 
                          value={genSettings.cta.text} 
                          onChange={v => setGenSettings(prev => ({...prev, cta: {...prev.cta, text: v}}))}
                          options={CTA_PRESETS[genSettings.cta.category].map(v => ({label: v, value: v}))} 
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs text-slate-500 mb-1">CTA Text {genSettings.cta.category !== 'Custom' ? '(Editable)' : ''}</label>
                      <textarea 
                        className="w-full p-2 border rounded-md text-sm h-16 focus:ring-1 focus:ring-primary-500" 
                        value={genSettings.cta.text}
                        onChange={e => setGenSettings(prev => ({...prev, cta: {...prev.cta, text: e.target.value}}))}
                        placeholder="Type your custom CTA here..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-500 mb-2">Apply CTA To:</label>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {Object.keys(genSettings.cta.placements).map(key => (
                          <label key={key} className="flex items-center space-x-2 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={(genSettings.cta.placements as any)[key]} 
                              onChange={e => setGenSettings(prev => ({
                                ...prev, 
                                cta: {
                                  ...prev.cta, 
                                  placements: {...prev.cta.placements, [key]: e.target.checked}
                                }
                              }))}
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
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                 <h3 className="text-sm font-bold text-slate-900 mb-3">Overall Style</h3>
                 <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Tone</label>
                      <Select label="" value={genSettings.tone} onChange={v => setGenSettings({...genSettings, tone: v})} options={['Informative', 'Persuasive', 'Luxury', 'Casual', 'Hard-selling', 'Soft-selling'].map(v => ({label: v, value: v}))} />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Audience</label>
                      <Select label="" value={genSettings.targetAudience} onChange={v => setGenSettings({...genSettings, targetAudience: v})} options={['Family', 'Investors', 'Professionals', 'Students', 'High-Net-Worth'].map(v => ({label: v, value: v}))} />
                    </div>
                 </div>
                 <Button className="w-full mt-2" onClick={handleGenerate} isLoading={loading}>
                   <Sparkles className="w-4 h-4 mr-2"/> Generate Content
                 </Button>
              </div>
           </div>
        </div>

        {/* Right: Output */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-y-auto h-[calc(100vh-140px)] custom-scrollbar">
          {!results ? (
             <div className="h-full flex flex-col items-center justify-center text-slate-400">
               <FileText className="w-16 h-16 mb-4 opacity-20"/>
               <p>Fill in the details and click Generate to see magic.</p>
             </div>
          ) : (
            <div className="space-y-8 animate-fadeIn">
               
               {/* Website SEO */}
               <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-slate-900 flex items-center"><MapPin className="w-4 h-4 mr-2 text-primary-600"/> Website SEO</h3>
                    <button onClick={() => copyToClipboard(results.seoTitle + '\n\n' + results.listingDescription)} className="text-slate-500 hover:text-primary-600"><Copy className="w-4 h-4"/></button>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-3">
                     <div>
                       <span className="text-xs font-bold text-slate-400 uppercase">Page Title</span>
                       <p className="text-sm font-medium text-slate-800">{results.seoTitle}</p>
                     </div>
                     <div>
                       <span className="text-xs font-bold text-slate-400 uppercase">Listing Description</span>
                       <ListingDescriptionPreview content={results.listingDescription || ''} />
                     </div>
                  </div>
               </div>

               {/* Instagram */}
               <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-slate-900 flex items-center"><Instagram className="w-4 h-4 mr-2 text-pink-600"/> Instagram Caption</h3>
                    <button onClick={() => copyToClipboard(results.instagramCaption || '')} className="text-slate-500 hover:text-primary-600"><Copy className="w-4 h-4"/></button>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                     <p className="text-sm text-slate-700 whitespace-pre-wrap">{results.instagramCaption}</p>
                  </div>
               </div>

               {/* TikTok */}
               <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-slate-900 flex items-center"><Video className="w-4 h-4 mr-2 text-black"/> TikTok Caption</h3>
                    <button onClick={() => copyToClipboard(results.tiktokCaption || '')} className="text-slate-500 hover:text-primary-600"><Copy className="w-4 h-4"/></button>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                     <p className="text-sm text-slate-700 whitespace-pre-wrap">{results.tiktokCaption}</p>
                  </div>
               </div>

                {/* Facebook */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-slate-900 flex items-center"><Facebook className="w-4 h-4 mr-2 text-blue-700"/> Facebook Post</h3>
                    <button onClick={() => copyToClipboard(results.facebookCaption || '')} className="text-slate-500 hover:text-primary-600"><Copy className="w-4 h-4"/></button>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                     <p className="text-sm text-slate-700 whitespace-pre-wrap">{results.facebookCaption}</p>
                  </div>
               </div>

               {/* Hashtags */}
               <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-slate-900 flex items-center"><Hash className="w-4 h-4 mr-2 text-slate-600"/> Hashtags</h3>
                    <button onClick={() => copyToClipboard(results.hashtags?.join(' ') || '')} className="text-slate-500 hover:text-primary-600"><Copy className="w-4 h-4"/></button>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                     <div className="flex flex-wrap gap-2">
                       {results.hashtags?.map((tag, i) => (
                         <span key={i} className="px-2 py-1 bg-white border rounded text-xs text-primary-600 font-medium">#{tag.replace('#','')}</span>
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
  const [view, setView] = useState<'landing' | 'upload' | 'editor' | 'seo'>('landing');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'magic-brush' | 'property' | 'staging' | 'composition' | 'advanced'>('basic');
  
  // Settings State
  const [settings, setSettings] = useState<EditorSettings>(DEFAULT_SETTINGS);
  
  // Magic Brush State
  const maskEditorRef = useRef<MaskEditorHandle>(null);
  const [brushSize, setBrushSize] = useState(30);
  const [brushHardness, setBrushHardness] = useState(80);
  const [isEraser, setIsEraser] = useState(false);
  const [showMask, setShowMask] = useState(true);
  const [hasMask, setHasMask] = useState(false);
  const [brushMode, setBrushMode] = useState<BrushToolMode>('remove');
  const [customBrushPrompt, setCustomBrushPrompt] = useState('');
  const [brushStrength, setBrushStrength] = useState(100);

  // Output overlay details
  const [details, setDetails] = useState<PropertyDetails>({
    title: 'Modern Apartment',
    price: '$850,000',
    location: 'Downtown, NY',
    contact: 'Call Agent: 555-0123',
    showOverlay: false
  });

  // Calculate CSS filters for basic adjustments (only applied to display)
  const getCssFilters = () => {
    return {
      filter: `
        brightness(${100 + settings.brightness}%) 
        contrast(${100 + settings.contrast}%) 
        saturate(${100 + settings.sharpness / 2}%) 
        sepia(${settings.temperature > 0 ? settings.temperature / 2 : 0}%)
      `
    };
  };

  const handleUpload = (uploadedFile: File) => {
    const url = URL.createObjectURL(uploadedFile);
    setOriginalImage(url);
    setFile(uploadedFile);
    // Initially, generated image is same as original until AI runs
    setGeneratedImage(url);
    setView('editor');
  };

  const handleGenerate = async () => {
    if (!originalImage || !file) return;

    setIsGenerating(true);
    try {
      // Get base64
      const base64 = await fileToGenerativePart(file);
      
      const apiKey = process.env.API_KEY || '';
      
      if (!apiKey) {
        alert("API Key is missing. Please set process.env.API_KEY");
        setIsGenerating(false);
        return;
      }

      const base64Result = await generateEnhancedImage(base64, settings, apiKey);
      
      const resultUrl = `data:image/jpeg;base64,${base64Result}`;
      setGeneratedImage(resultUrl);
    } catch (error) {
      console.error("Enhancement failed", error);
      alert("Failed to enhance image. See console for details.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMagicEdit = async () => {
    if (!generatedImage || !maskEditorRef.current) return;
    
    const maskDataUrl = maskEditorRef.current.getMaskImage();
    if (!maskDataUrl) {
      alert("Could not get mask data.");
      return;
    }
    
    // Remove prefix for mask
    const maskBase64 = maskDataUrl.split(',')[1];
    
    setIsGenerating(true);
    try {
      const apiKey = process.env.API_KEY || '';
      if (!apiKey) throw new Error("API Key missing");

      // We need the base64 of the CURRENT image being viewed to apply the removal on top of it
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const currentImageBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(blob);
      });

      const resultBase64 = await editImageWithMask(
        currentImageBase64, 
        maskBase64, 
        brushMode,
        customBrushPrompt,
        brushStrength,
        apiKey
      );
      
      const newImageUrl = `data:image/jpeg;base64,${resultBase64}`;
      setGeneratedImage(newImageUrl);
      
      // Clear mask after success
      maskEditorRef.current.clearMask();
      
    } catch (error) {
      console.error("Magic edit failed", error);
      alert("Failed to edit image.");
    } finally {
      setIsGenerating(false);
    }
  };

  const updateSetting = (key: keyof EditorSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Download Handler
  const handleDownload = () => {
    if (!generatedImage) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = generatedImage;
    
    img.onload = () => {
      // Use original image dimensions
      const targetWidth = img.width;
      const targetHeight = img.height;

      canvas.width = targetWidth;
      canvas.height = targetHeight;
      
      if (!ctx) return;

      // Apply filters
      ctx.filter = `
        brightness(${100 + settings.brightness}%) 
        contrast(${100 + settings.contrast}%) 
        saturate(${100 + settings.sharpness / 2}%) 
        sepia(${settings.temperature > 0 ? settings.temperature / 2 : 0}%)
      `;
      
      // Draw Image
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      ctx.filter = 'none'; // reset filter for text

      // Draw Overlay if enabled
      if (details.showOverlay) {
        // Gradient background for text
        const gradient = ctx.createLinearGradient(0, canvas.height - 150, 0, canvas.height);
        gradient.addColorStop(0, "transparent");
        gradient.addColorStop(1, "rgba(0,0,0,0.8)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, canvas.height - 200, canvas.width, 200);

        // Responsive text sizing based on image width
        const baseFontSize = Math.max(20, canvas.width / 30);
        
        ctx.fillStyle = "white";
        ctx.font = `bold ${baseFontSize}px Inter, sans-serif`;
        ctx.fillText(details.price, baseFontSize, canvas.height - (baseFontSize * 2));
        
        ctx.font = `${baseFontSize * 0.8}px Inter, sans-serif`;
        ctx.fillText(details.title, baseFontSize, canvas.height - baseFontSize);
        
        ctx.textAlign = "right";
        ctx.font = `${baseFontSize * 0.6}px Inter, sans-serif`;
        ctx.fillText(details.contact, canvas.width - baseFontSize, canvas.height - baseFontSize);
      }

      const link = document.createElement('a');
      link.download = 'estate-ai-enhanced.jpg';
      link.href = canvas.toDataURL('image/jpeg', 0.9);
      link.click();
    };
  };

  // Render Logic
  if (view === 'landing') return <LandingPage onStart={() => setView('upload')} onStartSeo={() => setView('seo')} />;
  if (view === 'upload') return <UploadPage onUpload={handleUpload} />;
  if (view === 'seo') return <SeoGeneratorPage onBack={() => setView('landing')} />;

  // EDITOR PAGE
  return (
    <div className="h-screen bg-slate-100 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-20 shrink-0">
        <div className="flex items-center cursor-pointer" onClick={() => setView('landing')}>
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
             <Home className="text-white w-5 h-5" />
          </div>
          <h1 className="font-display font-bold text-lg text-slate-800">Editor</h1>
        </div>
        <div className="flex items-center space-x-4">
           <Button variant="outline" size="sm" onClick={() => {
              setSettings(DEFAULT_SETTINGS);
              setGeneratedImage(originalImage);
           }}>
             <Undo2 className="w-4 h-4 mr-2"/> Reset
           </Button>
           
           {activeTab !== 'magic-brush' ? (
             <Button 
               variant="primary" 
               size="sm" 
               onClick={handleGenerate} 
               isLoading={isGenerating}
               className="min-w-[140px]"
             >
               <Wand2 className="w-4 h-4 mr-2" /> 
               {isGenerating ? 'Enhancing...' : 'Magic Enhance'}
             </Button>
           ) : (
             <Button 
               variant="primary" 
               size="sm" 
               onClick={handleMagicEdit} 
               isLoading={isGenerating}
               disabled={!hasMask}
               className="min-w-[140px] bg-indigo-600 hover:bg-indigo-700"
             >
               <Sparkles className="w-4 h-4 mr-2" /> 
               {isGenerating ? 'Processing...' : 'Run AI Edit'}
             </Button>
           )}

           <div className="h-6 w-px bg-slate-300 mx-2"></div>
           <Button variant="secondary" size="sm" onClick={handleDownload}>
             <Download className="w-4 h-4 mr-2" /> Download
           </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Controls */}
        <aside className="w-80 bg-white border-r border-slate-200 flex flex-col z-10 shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-hide">
            {[
              { id: 'basic', icon: <Sliders size={18}/>, label: 'Basic' },
              { id: 'magic-brush', icon: <Brush size={18}/>, label: 'Brush' },
              { id: 'property', icon: <Home size={18}/>, label: 'Prop.' },
              { id: 'staging', icon: <LayoutTemplate size={18}/>, label: 'Stage' },
              { id: 'composition', icon: <Crop size={18}/>, label: 'Comp.' },
              { id: 'advanced', icon: <Maximize size={18}/>, label: 'Adv.' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 min-w-[60px] py-4 flex flex-col items-center justify-center text-[10px] font-medium transition-colors ${
                  activeTab === tab.id 
                    ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <div className="mb-1">{tab.icon}</div>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Controls Scroll Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            
            {activeTab === 'basic' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700 mb-4">
                  These adjustments apply instantly to the preview.
                </div>
                <Slider label="Brightness" value={settings.brightness} min={-50} max={50} onChange={(v) => updateSetting('brightness', v)} />
                <Slider label="Contrast" value={settings.contrast} min={-50} max={50} onChange={(v) => updateSetting('contrast', v)} />
                <Slider label="Vibrance" value={settings.sharpness} min={-50} max={50} onChange={(v) => updateSetting('sharpness', v)} />
                <Slider label="Warmth" value={settings.temperature} min={-50} max={50} onChange={(v) => updateSetting('temperature', v)} />
              </div>
            )}

            {activeTab === 'magic-brush' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-indigo-50 p-3 rounded-lg text-xs text-indigo-700 mb-4 flex items-start">
                  <Brush className="w-3 h-3 mr-1 mt-0.5 shrink-0"/>
                  Paint an area and choose an AI Action.
                </div>

                {/* Brush Settings */}
                <div className="space-y-4">
                   <div className="flex items-center justify-between p-1 bg-slate-100 rounded-lg">
                      <button 
                        onClick={() => setIsEraser(false)}
                        className={`flex-1 flex items-center justify-center py-2 rounded-md text-sm font-medium transition-colors ${!isEraser ? 'bg-white shadow text-primary-600' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        <Brush className="w-4 h-4 mr-2" /> Draw
                      </button>
                      <button 
                        onClick={() => setIsEraser(true)}
                        className={`flex-1 flex items-center justify-center py-2 rounded-md text-sm font-medium transition-colors ${isEraser ? 'bg-white shadow text-primary-600' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        <Eraser className="w-4 h-4 mr-2" /> Erase
                      </button>
                   </div>

                   <Slider label="Brush Size" value={brushSize} min={5} max={150} onChange={setBrushSize} />
                   <Slider label="Brush Hardness" value={brushHardness} min={0} max={100} onChange={setBrushHardness} />

                   <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" onClick={() => maskEditorRef.current?.undo()}>
                        <Undo2 className="w-4 h-4 mr-2"/> Undo
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => maskEditorRef.current?.clearMask()}>
                        <Trash2 className="w-4 h-4 mr-2"/> Clear
                      </Button>
                   </div>
                   
                   <div className="h-px bg-slate-100 my-4"></div>

                   {/* AI Action Select */}
                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-2">AI Action</label>
                     <div className="grid grid-cols-2 gap-2">
                       {[
                         { id: 'remove', icon: <Eraser size={14}/>, label: 'Remove' },
                         { id: 'replace', icon: <RefreshCcw size={14}/>, label: 'Replace' },
                         { id: 'recolor', icon: <PaintBucket size={14}/>, label: 'Recolor' },
                         { id: 'clone', icon: <Stamp size={14}/>, label: 'Clone' },
                         { id: 'outpaint', icon: <Maximize size={14}/>, label: 'Fill' },
                         { id: 'enhance', icon: <Sparkles size={14}/>, label: 'Enhance' },
                       ].map(mode => (
                         <button
                           key={mode.id}
                           onClick={() => setBrushMode(mode.id as BrushToolMode)}
                           className={`flex items-center justify-center px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                             brushMode === mode.id 
                               ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                               : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                           }`}
                         >
                           <span className="mr-1.5">{mode.icon}</span>
                           {mode.label}
                         </button>
                       ))}
                     </div>
                   </div>

                   {/* Contextual Inputs based on mode */}
                   {(brushMode === 'replace' || brushMode === 'recolor' || brushMode === 'enhance') && (
                     <div className="animate-fadeIn">
                       <label className="block text-sm font-medium text-slate-700 mb-2">
                         {brushMode === 'replace' ? 'Replace with what?' : 
                          brushMode === 'recolor' ? 'New color/texture?' : 
                          'Enhancement details'}
                       </label>
                       <textarea 
                         className="w-full p-2 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                         rows={2}
                         placeholder={
                           brushMode === 'replace' ? "e.g. A modern leather armchair" :
                           brushMode === 'recolor' ? "e.g. Navy blue matte finish" :
                           "e.g. Make it brighter and cleaner"
                         }
                         value={customBrushPrompt}
                         onChange={(e) => setCustomBrushPrompt(e.target.value)}
                       />
                     </div>
                   )}

                   <Slider label="Effect Strength" value={brushStrength} min={10} max={100} onChange={setBrushStrength} />
                   
                   <div className="flex items-center justify-between pt-2">
                     <span className="text-sm font-medium text-slate-700">Show Mask Overlay</span>
                     <button onClick={() => setShowMask(!showMask)} className="text-slate-500 hover:text-primary-600">
                        {showMask ? <Eye className="w-5 h-5"/> : <EyeOff className="w-5 h-5"/>}
                     </button>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'property' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-purple-50 p-3 rounded-lg text-xs text-purple-700 mb-4 flex items-start">
                  <Wand2 className="w-3 h-3 mr-1 mt-0.5 shrink-0"/>
                  Requires Magic Enhance to apply changes.
                </div>
                
                <Select 
                  label="Sky Replacement" 
                  value={settings.sky} 
                  onChange={(v) => updateSetting('sky', v)}
                  options={[
                    { label: 'Original Sky', value: 'original' },
                    { label: 'Clear Blue', value: 'clear' },
                    { label: 'Sunset / Golden Hour', value: 'sunset' },
                    { label: 'Moody / Cloudy', value: 'cloudy' },
                    { label: 'Dramatic', value: 'dramatic' },
                  ]}
                />

                <div className="h-px bg-slate-100 my-4"></div>

                <Toggle label="Green Grass Enhancement" checked={settings.grass} onChange={(v) => updateSetting('grass', v)} description="Make lawns look lush and green" />
                <Toggle label="Wall Clean-up" checked={settings.wallCleanup} onChange={(v) => updateSetting('wallCleanup', v)} />
                
                {settings.wallCleanup && (
                   <Select 
                   label="Wall Repaint Color" 
                   value={settings.wallColor} 
                   onChange={(v) => updateSetting('wallColor', v)}
                   options={[
                     { label: 'Keep Original', value: 'original' },
                     { label: 'Clean White', value: 'white' },
                     { label: 'Modern Beige', value: 'beige' },
                     { label: 'Cool Grey', value: 'grey' },
                   ]}
                 />
                )}

                <div className="h-px bg-slate-100 my-4"></div>

                <Select 
                  label="Floor Finish" 
                  value={settings.floorPolish} 
                  onChange={(v) => updateSetting('floorPolish', v)}
                  options={[
                    { label: 'No Change', value: 'none' },
                    { label: 'High Gloss Polish', value: 'glossy' },
                    { label: 'Matte Finish', value: 'matte' },
                  ]}
                />
                
                <Toggle label="Declutter Room" checked={settings.declutter} onChange={(v) => updateSetting('declutter', v)} description="Remove small objects and mess" />
              </div>
            )}

            {activeTab === 'staging' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-purple-50 p-3 rounded-lg text-xs text-purple-700 mb-4 flex items-start">
                  <Wand2 className="w-3 h-3 mr-1 mt-0.5 shrink-0"/>
                  Generates new furniture. Best for empty rooms.
                </div>
                
                <Select 
                  label="Interior Style" 
                  value={settings.stagingStyle} 
                  onChange={(v) => updateSetting('stagingStyle', v)}
                  options={[
                    { label: 'No Staging', value: 'none' },
                    { label: 'Minimalist', value: 'minimalist' },
                    { label: 'Scandinavian', value: 'scandinavian' },
                    { label: 'Modern Luxury', value: 'modern-luxury' },
                    { label: 'Japandi', value: 'japandi' },
                  ]}
                />
                
                {settings.stagingStyle !== 'none' && (
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-600">
                    <p className="font-medium mb-1">Staging Tips:</p>
                    <ul className="list-disc pl-4 space-y-1 text-xs">
                      <li>Works best on empty rooms.</li>
                      <li>Use "Declutter" first if room has items.</li>
                      <li>AI will match lighting automatically.</li>
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'composition' && (
               <div className="space-y-6 animate-fadeIn">
                 <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700 mb-4">
                    Enhance composition and correct distortion.
                 </div>

                <Select 
                    label="Camera Perspective" 
                    value={settings.angle} 
                    onChange={(v) => updateSetting('angle', v)}
                    groups={[
                      {
                        label: 'Standard',
                        options: [
                          { label: 'Original', value: 'original' }
                        ]
                      },
                      {
                        label: 'Corner Perspectives',
                        options: [
                          { label: 'Left Corner View', value: 'corner-left' },
                          { label: 'Right Corner View', value: 'corner-right' },
                          { label: 'Front-Left Corner', value: 'corner-front-left' },
                          { label: 'Front-Right Corner', value: 'corner-front-right' }
                        ]
                      },
                      {
                        label: 'One-Point Perspective',
                        options: [
                          { label: 'Front View', value: 'front' },
                          { label: 'Eye-Level Front', value: 'eye-level' },
                          { label: 'Low Angle Front', value: 'low-angle' },
                          { label: 'High Angle Front', value: 'high-angle' }
                        ]
                      },
                      {
                         label: 'Two-Point Perspective',
                         options: [
                           { label: 'Left Side Focus', value: 'two-point-left' },
                           { label: 'Right Side Focus', value: 'two-point-right' },
                           { label: 'Slight Angled View', value: 'slight-angle' }
                         ]
                      },
                      {
                        label: 'Three-Point Perspective',
                        options: [
                           { label: 'Tilt-Up (Tall Buildings)', value: 'tilt-up' },
                           { label: 'Tilt-Down (High View)', value: 'tilt-down' }
                        ]
                      },
                      {
                        label: 'Aerial & Ground',
                        options: [
                           { label: 'Bird’s Eye View', value: 'birds-eye' },
                           { label: 'Drone View (High)', value: 'drone' },
                           { label: 'Worm’s Eye View (Low)', value: 'worms-eye' }
                        ]
                      },
                      {
                        label: 'Specialized Real Estate',
                        options: [
                           { label: 'Wide Angle Room', value: 'wide-angle' },
                           { label: 'Interior Long Shot', value: 'interior-long' },
                           { label: 'Exterior Long Shot', value: 'exterior-long' },
                           { label: 'Balcony View', value: 'balcony' },
                           { label: 'Entrance Focus', value: 'entrance' },
                           { label: 'Backyard View', value: 'backyard' }
                        ]
                      }
                    ]}
                 />

                 <div className="h-px bg-slate-100 my-4"></div>

                 <Toggle label="Perspective Fix" checked={settings.perspectiveFix} onChange={(v) => updateSetting('perspectiveFix', v)} description="Straighten vertical lines" />

                 <Select 
                    label="Depth of Field" 
                    value={settings.depthOfField} 
                    onChange={(v) => updateSetting('depthOfField', v)}
                    options={[
                      { label: 'None (Sharp)', value: 'none' },
                      { label: 'Shallow (Blur BG)', value: 'shallow' },
                      { label: 'Deep (Everything Sharp)', value: 'deep' },
                    ]}
                 />

               </div>
            )}

            {activeTab === 'advanced' && (
              <div className="space-y-6 animate-fadeIn">
                
                <div className="bg-purple-50 p-3 rounded-lg text-xs text-purple-700 mb-4 flex items-start">
                  <Maximize className="w-3 h-3 mr-1 mt-0.5 shrink-0"/>
                  Advanced control for AI generation
                </div>

                <Select 
                  label="AI Upscaling" 
                  value={settings.upscale} 
                  onChange={(v) => updateSetting('upscale', v)}
                  options={[
                    { label: 'Standard (1x)', value: '1x' },
                    { label: 'Enhance 2x (HD)', value: '2x' },
                    { label: 'Enhance 4x (4K)', value: '4x' },
                    { label: 'Enhance 8x (8K)', value: '8x' },
                  ]}
                />

                <div className="h-px bg-slate-100 my-4"></div>

                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-2">Custom AI Prompt</label>
                   <textarea 
                     className="w-full h-24 p-3 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                     placeholder="E.g. Add a fire to the fireplace, make the lighting warmer..."
                     value={settings.customPrompt}
                     onChange={(e) => updateSetting('customPrompt', e.target.value)}
                   />
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-2">Negative Prompt</label>
                   <textarea 
                     className="w-full h-16 p-3 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                     placeholder="E.g. people, pets, mess..."
                     value={settings.negativePrompt}
                     onChange={(e) => updateSetting('negativePrompt', e.target.value)}
                   />
                </div>
                
                <Slider label="AI Strength" value={settings.strength} min={0} max={100} onChange={(v) => updateSetting('strength', v)} />
                
                <div className="h-px bg-slate-100 my-4"></div>
                <h3 className="font-medium text-slate-900 mb-4">Output Overlay</h3>
                <Toggle label="Show Property Details" checked={details.showOverlay} onChange={(v) => setDetails(p => ({...p, showOverlay: v}))} />
                
                {details.showOverlay && (
                  <div className="space-y-3">
                    <input type="text" placeholder="Price" className="w-full p-2 border rounded text-sm" value={details.price} onChange={e => setDetails(p => ({...p, price: e.target.value}))}/>
                    <input type="text" placeholder="Title" className="w-full p-2 border rounded text-sm" value={details.title} onChange={e => setDetails(p => ({...p, title: e.target.value}))}/>
                    <input type="text" placeholder="Contact" className="w-full p-2 border rounded text-sm" value={details.contact} onChange={e => setDetails(p => ({...p, contact: e.target.value}))}/>
                  </div>
                )}
              </div>
            )}

          </div>
        </aside>

        {/* Center: Canvas / Preview */}
        <main className="flex-1 bg-slate-100 relative flex items-center justify-center p-8 overflow-hidden">
           <div className="relative w-full h-full flex items-center justify-center">
             <div 
               className="relative shadow-2xl rounded-lg overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-white border border-slate-200 transition-all duration-300 ease-in-out w-full h-full max-w-full max-h-full"
               style={{
                 aspectRatio: 'auto',
                 margin: 'auto'
               }}
             >
               {/* Conditional Rendering for Cleanup vs Standard Mode */}
               {originalImage && generatedImage ? (
                  activeTab === 'magic-brush' ? (
                     <MaskEditor 
                       ref={maskEditorRef}
                       imageSrc={generatedImage} 
                       brushSize={brushSize}
                       brushHardness={brushHardness}
                       isEraser={isEraser}
                       showMask={showMask}
                       onMaskChange={setHasMask}
                       className="w-full h-full flex items-center justify-center bg-slate-800"
                     />
                  ) : (
                    <BeforeAfter 
                      beforeImage={originalImage} 
                      afterImage={generatedImage} 
                      filters={getCssFilters()}
                      className="w-full h-full"
                      objectFit="contain"
                    />
                  )
               ) : (
                  <div className="flex items-center justify-center h-full text-slate-400">
                    No image loaded
                  </div>
               )}
               
               {/* Overlay Preview (Hide during cleanup) */}
               {details.showOverlay && activeTab !== 'magic-brush' && (
                 <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-black/90 to-transparent pointer-events-none p-8 flex flex-col justify-end text-white z-20">
                    <div className="flex justify-between items-end">
                      <div>
                        <h2 className="text-3xl font-bold">{details.price}</h2>
                        <p className="text-xl opacity-90">{details.title}</p>
                      </div>
                      <div className="text-right">
                         <p className="text-lg font-medium">{details.contact}</p>
                         <p className="text-sm opacity-70">{details.location}</p>
                      </div>
                    </div>
                 </div>
               )}
             </div>
           </div>

           {/* Processing Loader Overlay */}
           {isGenerating && (
             <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
               <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center">
                 <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-4" />
                 <h3 className="text-xl font-bold text-slate-900">
                   {activeTab === 'magic-brush' ? 'Applying Magic Edit...' : 'Enhancing Property...'}
                 </h3>
                 <p className="text-slate-500 mt-2">
                   {activeTab === 'magic-brush' ? 'Processing your brush strokes.' : 'Replacing sky, fixing walls, and polishing floors.'}
                 </p>
               </div>
             </div>
           )}
        </main>
      </div>
    </div>
  );
}
