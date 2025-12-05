import { t, type Static } from 'elysia';

export const GenerateRequestSchema = t.Object({
  imageUrl: t.String({ format: 'uri', description: 'URL Gambar publik' }),
  fileKey: t.Optional(t.String()),
  tasks: t.Array(t.String(), {
    default: ['curation', 'caption', 'songs', 'topics', 'engagement'],
    description: 'Daftar tugas yang harus dikerjakan AI',
  }),
  language: t.Optional(t.String({ default: 'id' })),
  context: t.Optional(
    t.Object({
      userId: t.Optional(t.String()),
      postIntent: t.Optional(t.String()),
    })
  ),
  limits: t.Optional(
    t.Object({
      maxSongs: t.Optional(t.Number({ default: 5 })),
      maxTopics: t.Optional(t.Number({ default: 8 })),
    })
  ),
});

export const GenerateResponseSchema = t.Object({
  curation: t.Object({
    isAppropriate: t.Boolean(),
    risk: t.String(),
    notes: t.String(),
    labels: t.Array(t.String()),
  }),
  caption: t.Object({
    text: t.String(),
    alternatives: t.Array(t.String()),
  }),
  songs: t.Array(
    t.Object({
      title: t.String(),
      artist: t.String(),
      reason: t.String(),
    })
  ),
  topics: t.Array(
    t.Object({
      topic: t.String(),
      confidence: t.Number(),
    })
  ),
  engagement: t.Object({
    estimatedScore: t.Number(),
    drivers: t.Array(t.String()),
    suggestions: t.Array(t.String()),
  }),
  meta: t.Object({
    language: t.String(),
    generatedAt: t.String(),
  }),
});

export const ErrorResponseSchema = t.Object({
  status: t.Number(),
  message: t.String(),
  code: t.Optional(t.String()),
  hint: t.Optional(t.String()),
});

export type GenerateRequest = Static<typeof GenerateRequestSchema>;
export type GenerateResponse = Static<typeof GenerateResponseSchema>;

export interface GeminiPart {
  text?: string;
  inline_data?: {
    mime_type: string;
    data: string;
  };
}

export interface GeminiCandidate {
  content?: {
    parts?: GeminiPart[];
  };
}

export interface GeminiApiResponse {
  candidates?: GeminiCandidate[];
  error?: {
    code: number;
    message: string;
    status: string;
  };
}
