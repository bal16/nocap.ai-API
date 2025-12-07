import * as z from 'zod';

// Response schema
export const CurationSchema = z.object({
  isAppropriate: z.boolean(),
  risk: z.string(),
  notes: z.string(),
  labels: z.array(z.string()),
});

export const CaptionSchema = z.object({
  text: z.string(),
  alternatives: z.array(z.string()),
});

export const SongSchema = z.object({
  title: z.string(),
  artist: z.string(),
  reason: z.string().optional(),
});

export const TopicSchema = z.object({
  topic: z.string(),
  confidence: z.number().optional(),
});

export const EngagementSchema = z.object({
  estimatedLikes: z.number(),
  estimatedScore: z.number(),
  drivers: z.array(z.string()),
  suggestions: z.array(z.string()),
});

export const MetaSchema = z.object({
  language: z.string(),
  generatedAt: z.string(),
});
