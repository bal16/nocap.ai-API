import * as z from 'zod';
import {
  CaptionSchema,
  CurationSchema,
  EngagementSchema,
  MetaSchema,
  SongSchema,
  TopicSchema,
} from './response.model';

// Request schema
export const GenerateRequestSchema = z.object({
  imageUrl: z.url({ message: 'URL Gambar publik' }),
  fileKey: z.string().optional(),
  tasks: z
    .array(z.string())
    .default(['curation', 'caption', 'songs', 'topics', 'engagement'])
    .describe('Daftar tugas yang harus dikerjakan AI'),
  language: z.string().default('id').optional(),
  context: z
    .object({
      userId: z.string().optional(),
      postIntent: z.string().optional(),
    })
    .optional(),
  limits: z
    .object({
      maxSongs: z.number().default(5).optional(),
      maxTopics: z.number().default(8).optional(),
    })
    .optional(),
});

export const GenerateResponseSchema = z.object({
  curation: CurationSchema,
  caption: CaptionSchema,
  songs: z.array(SongSchema),
  topics: z.array(TopicSchema),
  engagement: EngagementSchema,
  meta: MetaSchema,
});

// Error schema
export const ErrorResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  code: z.string().optional(),
  hint: z.string().optional(),
});

// Types
export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;
export type GenerateResponse = z.infer<typeof GenerateResponseSchema>;

// History schemas
