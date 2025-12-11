import { GoogleGenAI } from "@google/genai";
import {
  PropertyListingInput,
  ContentGenerationSettings,
  GeneratedContentResult,
} from "../types";

export const generatePropertyContent = async (
  input: PropertyListingInput,
  settings: ContentGenerationSettings,
  apiKey: string
): Promise<GeneratedContentResult> => {
  const ai = new GoogleGenAI({ apiKey });

  // Prepare input summary
  const listingDetails = `
    Title: ${input.title || "Untitled Property"}
    Location: ${input.location}
    Price: ${input.price}
    Type: ${input.type}
    Status: ${input.status}
    Specs:
      - Land Size (LT): ${input.specs.lt}
      - Building Size (LB): ${input.specs.lb}
      - Bedrooms: ${input.specs.bedrooms}
      - Bathrooms: ${input.specs.bathrooms}
      - Floors: ${input.specs.floors}
      - Electricity: ${input.specs.electricity}
      - Facing: ${input.specs.facing}
      - Certificate: ${input.specs.certificate}
    Facilities: ${input.facilities}
    Nearby (POI): ${input.nearby}
    USP (Selling Points): ${input.usp}
  `;

  const ctaText = settings.cta?.text
    ? ` Use this specific call to action text in the listing description: "${settings.cta.text}"`
    : "";

  const ctaInfo = settings.cta
    ? `
    CTA Settings:
    - Category: ${settings.cta.category}
    - Text: "${settings.cta.text}"
    - Style: ${settings.cta.style}
    - Apply to Instagram: ${settings.cta.placements.instagram ? "Yes" : "No"}
    `
    : "";

  const instructions = `
    You are an expert Real Estate Copywriter and SEO Specialist.
    Generate content based on the provided Property Listing Details below.
    
    Target Audience: ${settings.targetAudience}
    Tone: ${settings.tone}
    Style: ${settings.style}
    Language: ${settings.language} (Ensure output is in this language, but hashtags can be mixed if relevant)
    ${ctaText}
    ${ctaInfo}
    
    Please output strictly a valid JSON object without markdown formatting (do not use \`\`\`json).
    The JSON object must have the following keys:
    - "seoTitle": A catchy, SEO-friendly title including location and main keyword (max 60 chars).
    - "seoDescription": A meta description (150-160 chars) for search engines. Include a hook, specs summary, and call to action.
    - "listingDescription": A comprehensive, SEO-friendly property listing description for website use. Format with clear structure and sections:
      
      STRUCTURE (follow this exact format with clear section headers):
      
      [FIRST PARAGRAPH - maximum 150 words, start directly, no intro]
      Start directly with "Dijual [property type]..." - NO introductory phrases like "Berikut adalah" or "Kami menawarkan". Be direct and to the point. 
      
      This first paragraph should be concise and maximum 300 words. Include the following information in a natural, flowing narrative:
      - Location, property type, condition, and main appeal
      - Key specifications: facing, bedrooms, bathrooms, LT, LB, floors, certificate, status
      - Main facilities (briefly mentioned)
      - Key selling points and advantages
      - Location benefits (briefly mentioned)
      - Natural keyword usage (location + property type) throughout for SEO
      
      Write in a natural, engaging narrative style that flows smoothly. Keep it concise but informative. The paragraph should be ONE paragraph only, covering the essential aspects of the property.
      
      Example structure (max 300 words): "Dijual rumah dalam Komplek Taman Cosmos, Kebon Jeruk, Jakarta Barat. Rumah 3 lantai ini masih sangat baru—baru ditempati sekitar 5 bulan, kondisi terawat dan siap huni. [Continue with key specifications, main facilities, advantages, and location benefits in natural paragraph form, keeping it under 300 words total]"
      
      DETAIL & SPESIFIKASI:
      - Hadap: [facing]
      - Kamar Tidur: [bedrooms]
      - Kamar Mandi: [bathrooms]
      - Listrik: [electricity]
      - Air: [water source if available, e.g., PAM]
      - Garasi: [garage info, e.g., "1 mobil" or "2 mobil"]
      - Luas Tanah (LT): [lt]
      - Luas Bangunan (LB): [lb]
      - Lantai: [floors]
      - Sertifikat: [certificate]
      - Status: [condition/status, e.g., "Rumah baru, dihuni 5 bulan"]
      
      FASILITAS:
      - [Facility 1]
      - [Facility 2]
      - [Facility 3]
      (List all facilities mentioned in bullet format, one per line)
      
      AKSES LOKASI SANGAT STRATEGIS:
      [X] menit ke:
      - [POI 1]
      - [POI 2]
      
      [Y] menit ke:
      - [POI 3]
      - [POI 4]
      
      (Group nearby POIs by travel time categories: 5 menit, 10 menit, 15 menit, 20 menit, etc. Use clear time headers)
      
      HARGA:
      [Price information if available, e.g., "Rp 1.7 Miliar (Semi Furnished)" or "Rp 1.6 Miliar (Non Furnished)"]
      
      FORMATTING RULES:
      - Start first paragraph directly with "Dijual..." - NO introductory phrases
      - Second paragraph should flow naturally from first paragraph with specifications
      - Use clear section headers in ALL CAPS (e.g., "DETAIL & SPESIFIKASI:", "FASILITAS:", "AKSES LOKASI SANGAT STRATEGIS:", "HARGA:")
      - Keep each section concise and scannable
      - Use bullet points (dash format) for facilities and POIs
      - Group location access by time categories with clear headers
      - Natural keyword usage (location + property type) throughout
      - First paragraph: Maximum 300 words, ONE paragraph only
      - Use double line breaks between major sections for readability
      - Be specific with numbers and details
      - Write in Indonesian if language is Indonesian, English if language is English
      - DO NOT include a conclusion/CTA section at the end - end with HARGA section
    - "instagramCaption": Engaging Instagram caption with the following format:
      
      FORMAT STRUCTURE:
      1. Opening hook (1-2 lines, catchy and engaging, can include emoji)
      2. Brief description/benefit (1-2 lines, optional)
      3. "Check It Out:" or "Chek It Out:" header
      4. Specifications list using emoji (🥇 or 🎖️ or 🎗️):
         - Format: [emoji] [specification]
         - Example: 🥇Harga 1 Man, 🥇Free DP, 🥇2 Lantai - 3 Bedroom
      5. Location/POI list using 📍 emoji:
         - Format: 📍[location/POI]
         - Example: 📍10 Menit ke Akses Tol, 📍5 Menit Ke Mall
      6. Facilities list using ✨ or 🎗️ emoji (if applicable):
         - Format: ✨[facility]
      7. CTA section:
         IMPORTANT: Use the CTA text and style from the CTA Settings provided above.
         - If CTA category is "Soft-Selling" or "Friendly": Use friendly, approachable tone
         - If CTA category is "Hard-Selling": Use urgent, action-oriented tone
         - If CTA category is "Premium": Use formal, exclusive tone
         - If CTA category is "WhatsApp": Emphasize WhatsApp availability
         - If CTA category is "Lead Magnet": Focus on free offer/incentive
         - If CTA category is "Custom": Use the exact CTA text provided
         
         Format the CTA section based on CTA style:
         - For "Friendly" style: Use casual, warm language
         - For "Formal" style: Use professional language
         - For "Premium" style: Use sophisticated language
         - For "Hard-selling" style: Use urgent, compelling language
         
         Structure:
         - Header: "For More Information:" or "More info:" or "For more information:" or match the CTA style
         - CTA Text: Use the exact CTA text from CTA Settings provided above. If the CTA text is provided, use it exactly or adapt it naturally to fit Instagram format while maintaining its meaning and tone.
         - Phone number with emoji: ☎️ : [phone] (optional: @username)
         - "(Whatsapp Available)" or "(Whatsapp Available 24 Jam)" - include if CTA category is "WhatsApp" or if appropriate
         
         Examples based on CTA settings:
         - If CTA text is "Info lengkap? Hubungi kami ya!" and style is "Friendly":
           "For more information:\nInfo lengkap? Hubungi kami ya!\n\n☎️ : [phone]\n(Whatsapp Available)"
         - If CTA text is "Segera hubungi sebelum terjual!" and style is "Hard-selling":
           "More info:\nSegera hubungi sebelum terjual!\n\n☎️ : [phone]\n(Whatsapp Available 24 Jam)"
         - If CTA category is "Custom", use the exact CTA text provided in the settings.
         
         IMPORTANT: Always use the CTA text from CTA Settings. The CTA section must reflect the exact text, category, and style from the settings provided above.
      
      STYLE GUIDELINES:
      - Use emojis naturally and appropriately
      - Keep it engaging and conversational
      - Use line breaks for readability
      - Include relevant emojis (😍, ❤️, 🤩, ✨, etc.) in opening hook
      - Make specifications and locations easy to scan with emoji bullets
      - Keep total length appropriate for Instagram (not too long)
      - Use Indonesian language if language setting is Indonesian
    - "tiktokCaption": Short, punchy, viral style, focuses on visual appeal or price/value.
    - "facebookCaption": Informative, slightly longer, community-focused, includes full details.
    - "hashtags": An array of strings. Include both location-specific hashtags and trending real estate hashtags.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { text: instructions },
        { text: `Listing Details:\n${listingDetails}` },
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No content generated");

    const json = JSON.parse(text);
    return json as GeneratedContentResult;
  } catch (error) {
    console.error("Gemini Content Generation Error:", error);
    throw error;
  }
};
