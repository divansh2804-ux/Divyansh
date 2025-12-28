
import { GoogleGenAI } from "@google/genai";
import { ThumbnailNiche, ThumbnailAssets } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async generateThumbnailData(
    title: string,
    niche: ThumbnailNiche,
    assets: ThumbnailAssets
  ): Promise<{ imageUrl: string; hook: string; fontFamily: string }> {
    
    // Step 1: Generate high-impact hook
    const hookResponse = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Video Title: "${title}"\nNiche: ${niche}\nSuggest a extremely short, high-impact 1-4 word "Hook" text for a YouTube thumbnail. It must be curiosity-driven and represent the core intent. Ensure the words have clear semantic spacing. Return ONLY the 1-4 words. No quotes.`,
      config: {
        temperature: 0.8,
      }
    });

    const hook = hookResponse.text?.trim().split(/\s+/).slice(0, 4).join(' ') || "UNBELIEVABLE";

    // Step 2: Build Multi-Part Visual Request
    const parts: any[] = [];
    
    // Add assets as inline data if provided
    if (assets.background) {
      parts.push({
        text: "REFERENCE BACKGROUND: Use this exact image as the environment/backdrop."
      });
      parts.push({
        inlineData: { mimeType: 'image/jpeg', data: assets.background.split(',')[1] }
      });
    }
    
    if (assets.object) {
      parts.push({
        text: "REFERENCE MAIN OBJECT: Use this exact image as the primary focal subject."
      });
      parts.push({
        inlineData: { mimeType: 'image/jpeg', data: assets.object.split(',')[1] }
      });
    }

    if (assets.icon) {
      parts.push({
        text: "REFERENCE ICON: Use this exact image as a small branding or highlight overlay."
      });
      parts.push({
        inlineData: { mimeType: 'image/jpeg', data: assets.icon.split(',')[1] }
      });
    }
    
    parts.push({ text: this.buildVisualPrompt(title, niche, assets) });

    const imageResponse = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: "16:9" 
        }
      }
    });

    let imageUrl = '';
    for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!imageUrl) {
      throw new Error("Failed to generate thumbnail image.");
    }

    // Dynamic Font Selection
    let fontFamily = 'bebas';
    const lowerTitle = title.toLowerCase();
    if (niche === ThumbnailNiche.MYSTERY || lowerTitle.includes('secret')) fontFamily = 'cinzel';
    else if (niche === ThumbnailNiche.AI_SCIENCE || lowerTitle.includes('tech')) fontFamily = 'space-mono';
    else if (niche === ThumbnailNiche.GROWTH || niche === ThumbnailNiche.FACTS) fontFamily = 'anton';

    return { imageUrl, hook, fontFamily };
  }

  async editThumbnail(
    base64Image: string,
    editPrompt: string
  ): Promise<string> {
    const parts: any[] = [
      {
        inlineData: {
          mimeType: 'image/png',
          data: base64Image.split(',')[1],
        },
      },
      {
        text: `You are editing this YouTube thumbnail. 
        USER REQUEST: "${editPrompt}"
        
        ABSOLUTE RULES:
        - MAINTAIN THE EXACT IDENTITY AND CONTENT OF THE ORIGINAL IMAGE.
        - DO NOT ADD HUMANS OR HUMAN FACES.
        - ONLY apply the requested changes (e.g., lighting, color, adding specific effects like glow, haze, or small environmental details).
        - DO NOT add text, logos, or watermarks.
        - The result must be 16:9 aspect ratio.`,
      },
    ];

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });

    let imageUrl = '';
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!imageUrl) {
      throw new Error("Failed to edit thumbnail.");
    }

    return imageUrl;
  }

  private buildVisualPrompt(title: string, niche: ThumbnailNiche, assets: ThumbnailAssets): string {
    const hasAny = !!(assets.icon || assets.object || assets.background);
    
    const commonInstructions = `
      YouTube Thumbnail Style: Professional 16:9 cinematic imagery.
      ABSOLUTE RULES:
      - NO HUMAN FACES OR HUMAN FIGURES.
      - NO TEXT, NO LOGOS, NO WATERMARKS, NO BRANDING, NO OVERLAYS.
      - High contrast, vibrant colors, dramatic lighting (chiaroscuro), depth of field.
      - The image must HONESTLY represent the topic: "${title}".
    `;

    const assetPreservation = hasAny ? `
      ASSET INTEGRATION RULES:
      1. If a REFERENCE BACKGROUND is provided, use its EXACT composition and textures as the environment.
      2. If a REFERENCE MAIN OBJECT is provided, it MUST be the central hero of the thumbnail. Do not swap it.
      3. If a REFERENCE ICON is provided, place it strategically as a complementary visual highlight.
      - MAINTAIN THE IDENTITY OF ALL PROVIDED ASSETS. NO HALLUCINATIONS.
      - Only apply cinematic lighting, color grading, shadows, and glow effects to blend them perfectly.
    ` : `GENERATE SUBJECT: Create one high-impact central subject that represents "${title}" cinematically.`;

    let nicheStyle = "";
    switch (niche) {
      case ThumbnailNiche.MYSTERY: nicheStyle = "Style: Noir mystery, eerie lighting, dark shadows, cold/hot contrast."; break;
      case ThumbnailNiche.FINANCE: nicheStyle = "Style: Premium, wealth, sleek dark surfaces, glowing gold accents."; break;
      case ThumbnailNiche.AI_SCIENCE: nicheStyle = "Style: Futuristic, glowing neural networks, tech-noir aesthetics."; break;
      case ThumbnailNiche.DOCUMENTARY: nicheStyle = "Style: Gritty realism, high-detail textures, dramatic cinematic grading."; break;
      case ThumbnailNiche.FACTS: nicheStyle = "Style: Mind-blowing scale, surreal vibrant colors, energy glows."; break;
      case ThumbnailNiche.GROWTH: nicheStyle = "Style: Urgent, high energy, red/black high-contrast palette."; break;
      case ThumbnailNiche.CREATOR_ED: nicheStyle = "Style: Clean pro studio, minimalist lighting, elegant composition."; break;
      case ThumbnailNiche.GAMING: nicheStyle = "Style: Intense neon RGB, futuristic hardware vibes, high-energy glow."; break;
    }

    return `${commonInstructions}\n${assetPreservation}\n${nicheStyle}`;
  }
}

export const geminiService = new GeminiService();
