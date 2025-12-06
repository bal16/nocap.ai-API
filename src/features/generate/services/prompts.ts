import type { AnalyzeResponse } from '../models/ai-service.model';

/**
 * Prompt
 */
export const buildAnalysisContext = (designData: AnalyzeResponse): string => {
  if (!designData?.data?.curation) return '';
  const { clutter, balance } = designData.data.curation;
  return `
Visual Technical Analysis Data:
- Is Appropriate: ${designData.data.isAppropriate}
- Clutter Score: ${clutter?.score} (${clutter?.message})
- Balance Score: ${balance?.score} (${balance?.message})
Use this data to tailor the caption and music vibe.
`;
};

export const buildPrompt = (args: {
  tasks: string[];
  language: string;
  userIntent?: string;
  maxSongs: number;
  maxTopics: number;
  analysisContext?: string;
}) => {
  const { tasks, language, userIntent, maxSongs, maxTopics, analysisContext } = args;

  return `
Act as an AI Social Media Specialist.
Analyze the provided image.
${analysisContext ?? ''}${userIntent ? `\nUser Intent: "${userIntent}"` : ''}

Perform these tasks: ${tasks.join(', ')}.
Target Language: ${language}.

STRICTLY output a JSON object matching this schema.
Respect the array limits defined below:
{
  "curation": {
    "isAppropriate": boolean,
    "labels": ["string"],
    "risk": "low" | "medium" | "high",
    "notes": "string (Moderation notes)"
  },
  "caption": {
    "text": "string (engaging caption)",
    "alternatives": ["string"]
  },
  "songs": [ {"title": "string", "artist": "string", "reason": "string"} ] (MAXIMUM ${maxSongs} items),
  "topics": [ {"topic": "string", "confidence": number} ] (MAXIMUM ${maxTopics} items),
  "engagement": {
    "estimatedScore": number (0.0 - 1.0),
    "drivers": ["string"],
    "suggestions": ["string"]
  }
}
Do not wrap in markdown. Just raw JSON.
`.trim();
};
