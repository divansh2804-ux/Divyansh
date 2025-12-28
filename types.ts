
export enum ThumbnailNiche {
  MYSTERY = 'Mystery & Dark History',
  FINANCE = 'Finance & Wealth',
  AI_SCIENCE = 'AI & Future Science',
  DOCUMENTARY = 'Cinematic Documentary',
  FACTS = 'Mind-Blowing Facts',
  GROWTH = 'YouTube Growth',
  CREATOR_ED = 'Creator Education',
  GAMING = 'Gaming & Esports'
}

export interface ThumbnailAssets {
  icon?: string;
  object?: string;
  background?: string;
}

export interface ThumbnailState {
  title: string;
  niche: ThumbnailNiche;
  assets: ThumbnailAssets;
  isGenerating: boolean;
  generatedImage?: string;
  shortHook?: string;
  fontFamily?: string;
  error?: string;
}

export interface GenerationResult {
  imageUrl: string;
  suggestedHook: string;
  fontFamily: string;
}
