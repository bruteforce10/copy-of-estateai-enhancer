import { GoogleGenAI } from "@google/genai";
import {
  EditorSettings,
  BrushToolMode,
  PropertyListingInput,
  ContentGenerationSettings,
  GeneratedContentResult,
} from "../types";

// Helper to convert blob/file to base64
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      const base64Data = base64String.split(",")[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const generateEnhancedImage = async (
  originalImageBase64: string,
  settings: EditorSettings,
  apiKey: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey });

  // Construct the prompt based on settings
  let prompt = "Act as a professional high-end real estate photo editor. ";
  prompt +=
    "Enhance this property image significantly while maintaining realism. ";

  // Apply specific instructions
  if (settings.sky !== "original") {
    prompt += `Replace the sky with a realistic ${settings.sky} sky. `;
  }

  if (settings.grass) {
    prompt += "Make the grass look greener, lush, and perfectly manicured. ";
  }

  if (settings.wallCleanup) {
    prompt += "Clean up any marks on the walls. ";
    if (settings.wallColor !== "original") {
      prompt += `Repaint the walls in a clean ${settings.wallColor} tone. `;
    }
  }

  if (settings.floorPolish !== "none") {
    prompt += `Make the floors look ${settings.floorPolish} and polished. `;
  }

  if (settings.declutter) {
    prompt +=
      "Remove clutter and personal items from the room to make it spacious. ";
  }

  if (settings.stagingStyle !== "none") {
    prompt += `Virtually stage the room in a ${settings.stagingStyle} interior design style with high-quality furniture. `;
  }

  // Composition Prompts - Perspectives
  if (settings.angle !== "original") {
    const angleMap: Record<string, string> = {
      "corner-left": "Reimagine the view from the left corner perspective.",
      "corner-right": "Reimagine the view from the right corner perspective.",
      "corner-front-left": "Show a front-left corner perspective view.",
      "corner-front-right": "Show a front-right corner perspective view.",

      front:
        "Adjust to a perfect straight-on front view (one-point perspective).",
      "eye-level": "Set the camera angle to eye-level front view.",
      "low-angle":
        "Use a low angle shot to make the property look grand and imposing.",
      "high-angle": "Use a high angle shot to show more of the layout.",

      "two-point-left":
        "Apply a two-point perspective focusing on the left side.",
      "two-point-right":
        "Apply a two-point perspective focusing on the right side.",
      "slight-angle":
        "Slightly angle the view to add depth (two-point perspective).",

      "tilt-up":
        "Tilt the camera up to showcase height or skyscrapers (three-point perspective).",
      "tilt-down":
        "Tilt the camera down from a height (three-point perspective).",

      "birds-eye": "Transform into a bird’s eye view aerial shot.",
      drone: "Simulate a high-quality drone shot from above.",
      "worms-eye": "Use a worm’s eye view from very low ground level.",

      "wide-angle":
        "Use a wide-angle lens to capture the entire room or exterior.",
      "interior-long":
        "Use a long shot to show the depth of the interior space.",
      "exterior-long": "Use a long shot to capture the full exterior context.",
      balcony: "Simulate a view looking out from a balcony.",
      entrance: "Focus the perspective on the main entrance.",
      backyard: "Show the view from the backyard looking towards the property.",
    };

    prompt += `${
      angleMap[settings.angle] || "Adjust the camera angle appropriately."
    } `;
  }

  if (settings.perspectiveFix) {
    prompt +=
      "Fix all vertical lines and correct any lens distortion. Ensure architectural lines are straight. ";
  }

  if (settings.depthOfField !== "none") {
    prompt += `Apply a ${settings.depthOfField} depth of field effect. `;
  }

  // Upscale / Resolution Prompts
  if (settings.upscale !== "1x") {
    prompt += `Apply ${settings.upscale} super-resolution upscaling. Maximize texture details, sharpness, and clarity to simulate an 8K resolution output. Ensure no pixelation or artifacts. `;
  }

  if (settings.customPrompt) {
    prompt += `Additional instructions: ${settings.customPrompt}. `;
  }

  if (settings.negativePrompt) {
    prompt += `Avoid the following: ${settings.negativePrompt}. `;
  }

  prompt +=
    "Ensure the lighting is balanced, exposure is perfect, and the image looks high-resolution and market-ready.";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image", // Using flash-image for good balance of speed/quality
      contents: {
        parts: [
          {
            text: prompt,
          },
          {
            inlineData: {
              mimeType: "image/jpeg", // Assuming jpeg for simplicity, or detect from source
              data: originalImageBase64,
            },
          },
        ],
      },
      config: {
        // We aren't using systemInstruction here as we put it in the prompt for image models usually
      },
    });

    // Extract the image from the response
    // The model typically returns a generated image in the candidates
    // Iterate to find image part
    if (response.candidates && response.candidates.length > 0) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return part.inlineData.data;
        }
      }
    }

    throw new Error("No image generated.");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const editImageWithMask = async (
  originalImageBase64: string,
  maskImageBase64: string,
  mode: BrushToolMode,
  customPrompt: string,
  strength: number,
  apiKey: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey });

  let prompt =
    "The second image is a mask containing red strokes indicating the area to edit. ";

  switch (mode) {
    case "remove":
      prompt +=
        "Remove the object(s) in the original image (first image) that correspond to the red areas in the mask. Inpaint the removed area to seamlessly match the background texture and lighting. Ensure no trace of the object remains.";
      break;
    case "replace":
      prompt += `Replace the area covered by the mask with: ${customPrompt}. Ensure it fits the perspective, lighting, and style of the room.`;
      break;
    case "recolor":
      prompt += `Recolor the masked object/area to be: ${
        customPrompt || "clean and new"
      }. Keep the original texture but change the color/tone.`;
      break;
    case "clone":
      prompt +=
        "Use context from the surrounding area to fill in the masked area. Acts like a clone stamp tool to extend the background or texture over the masked area.";
      break;
    case "outpaint":
      prompt +=
        "Fill the masked area seamlessly to extend the scene. Generate plausible background details that match the existing environment.";
      break;
    case "enhance":
      prompt += `Enhance the specific area covered by the mask. ${
        customPrompt || "Improve clarity, fix texture, and adjust lighting"
      }.`;
      break;
    default:
      prompt += "Inpaint the masked area seamlessly.";
  }

  if (strength < 100) {
    prompt += ` Apply this change with a strength of approximately ${strength}%, blending it slightly with the original if necessary.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: originalImageBase64,
            },
          },
          {
            inlineData: {
              mimeType: "image/png",
              data: maskImageBase64,
            },
          },
        ],
      },
    });

    if (response.candidates && response.candidates.length > 0) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return part.inlineData.data;
        }
      }
    }
    throw new Error("No image generated from edit.");
  } catch (error) {
    console.error("Gemini Edit Error:", error);
    throw error;
  }
};

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

  const instructions = `
    You are an expert Real Estate Copywriter and SEO Specialist.
    Generate content based on the provided Property Listing Details below.
    
    Target Audience: ${settings.targetAudience}
    Tone: ${settings.tone}
    Style: ${settings.style}
    Language: ${settings.language} (Ensure output is in this language, but hashtags can be mixed if relevant)
    ${ctaText}
    
    Please output strictly a valid JSON object without markdown formatting (do not use \`\`\`json).
    The JSON object must have the following keys:
    - "seoTitle": A catchy, SEO-friendly title including location and main keyword (max 60 chars).
    - "seoDescription": A meta description (150-160 chars) for search engines. Include a hook, specs summary, and call to action.
    - "listingDescription": A comprehensive, SEO-friendly property listing description for website use. Format with clear structure and sections:
      
      STRUCTURE (follow this exact format with clear section headers):
      
      [FIRST PARAGRAPH - approximately 600 words, start directly, no intro]
      Start directly with "Dijual [property type]..." - NO introductory phrases like "Berikut adalah" or "Kami menawarkan". Be direct and to the point. 
      
      This first paragraph should be comprehensive and approximately 600 words. Include ALL of the following information in a natural, flowing narrative:
      - Location, property type, condition, and main appeal
      - All specifications: facing, bedrooms, bathrooms, electricity, water source, garage, LT, LB, floors, certificate, status
      - All facilities mentioned
      - Key selling points and advantages
      - Location benefits and nearby POIs (briefly mentioned)
      - Natural keyword usage (location + property type) throughout for SEO
      
      Write in a natural, engaging narrative style that flows smoothly. Make it detailed but readable. The paragraph should be comprehensive enough to stand alone as a complete description, covering all key aspects of the property.
      
      Example structure (expand to ~600 words): "Dijual rumah dalam Komplek Taman Cosmos, Kebon Jeruk, Jakarta Barat. Rumah 3 lantai ini masih sangat baru—baru ditempati sekitar 5 bulan, kondisi terawat dan siap huni. [Continue with detailed specifications, facilities, advantages, location benefits, etc. in natural paragraph form, expanding to approximately 600 words total]"
      
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
      - Total length: 400-600 words (not too long)
      - Use double line breaks between major sections for readability
      - Be specific with numbers and details
      - Write in Indonesian if language is Indonesian, English if language is English
      - DO NOT include a conclusion/CTA section at the end - end with HARGA section
    - "instagramCaption": Engaging, narrative style, includes hooks, line breaks, and CTA for DM.
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
