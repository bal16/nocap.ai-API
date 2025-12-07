import * as z from 'zod';
import {
  CaptionSchema,
  CurationSchema,
  EngagementSchema,
  MetaSchema,
  SongSchema,
  TopicSchema,
} from './response.model';

export const HistoryQuerySchema = z.object({
  // Query params come as strings
  limit: z.string().default('20').optional(),
});

export const HistoryListResponseSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      fileKey: z.union([z.string(), z.null()]),
      imageUrl: z.string(),
      engagement: z
        .object({
          estimatedScore: z.number(),
        })
        .optional(),
      createdAt: z.string(),
    })
  ),
  pageInfo: z.object({
    limit: z.number(),
    nextCursor: z.union([z.string(), z.null()]),
    hasNextPage: z.boolean(),
  }),
});

export const HistoryDetailResponseSchema = z.object({
  item: z.object({
    id: z.string(),
    fileKey: z.string(),
    imageUrl: z.string(),
    curation: CurationSchema,
    caption: CaptionSchema,
    songs: z.array(SongSchema),
    topics: z.array(TopicSchema),
    engagement: EngagementSchema,
    meta: MetaSchema,
  }),
});
