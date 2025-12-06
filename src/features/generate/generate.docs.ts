import {
  GenerateRequestSchema,
  GenerateResponseSchema,
  ErrorResponseSchema,
} from './models/generate.model';
import {
  HistoryDetailResponseSchema,
  HistoryListResponseSchema,
  HistoryQuerySchema,
} from './models/history.model';

export const analyzeContentSchema = {
  detail: {
    summary: 'Generate from Image',
    description:
      'Generate curation, caption, songs, topics, and engagement analytics from an image.',
    operationId: 'generateFromImage',
    tags: ['AI Generation'],
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          example: {
            fileKey: 'users/123/posts/foto-unik.jpg',
            accessUrl: 'https://my-bucket.s3.aws.com/users/123/posts/foto-unik.jpg?Signature=...',
            tasks: ['curation', 'caption', 'songs', 'topics', 'engagement'],
            language: 'en',
            context: { userId: 'usr_123', postIntent: 'travel vlog' },
            limits: { maxSongs: 5, maxTopics: 8 },
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Success',
        content: {
          'application/json': {
            example: {
              curation: {
                isAppropriate: true,
                labels: ['outdoor', 'landscape'],
                risk: 'low',
                notes: 'No sensitive content detected.',
              },
              caption: {
                text: 'Sunset hues over the quiet coastline.',
                alternatives: ['Golden hour by the sea.', 'A calm evening embracing the shore.'],
              },
              songs: [
                { title: 'Ocean Eyes', artist: 'Billie Eilish', reason: 'Calm coastal vibe' },
                { title: 'Sunset Lover', artist: 'Petit Biscuit', reason: 'Warm sunset mood' },
              ],
              topics: [
                { topic: 'Travel', confidence: 0.94 },
                { topic: 'Photography', confidence: 0.89 },
                { topic: 'Nature', confidence: 0.87 },
              ],
              engagement: {
                estimatedScore: 0.78,
                drivers: ['color palette', 'subject clarity'],
                suggestions: ['Add a human subject', 'Include location tag'],
              },
              meta: {
                language: 'en',
                generatedAt: '2025-12-03T07:30:16Z',
              },
            },
          },
        },
      },
      400: {
        description: 'Bad Request / Image Error',
        content: {
          'application/json': {
            example: {
              message: 'Image URL not accessible',
              code: 'IMAGE_FETCH_FAILED',
              hint: 'Ensure the image is publicly accessible or provide a valid signed URL.',
            },
          },
        },
      },
      401: { description: 'Unauthorized' },
      502: { description: 'Analysis service unavailable' },
    },
  },
  body: GenerateRequestSchema,
  response: {
    200: GenerateResponseSchema,
    400: ErrorResponseSchema,
    401: ErrorResponseSchema,
    500: ErrorResponseSchema,
    502: ErrorResponseSchema,
  },
};

export const getHistorySchema = {
  detail: {
    summary: 'Get Generation History',
    description: 'Fetch generated outputs history for the current session.',
    operationId: 'getGenerationHistory',
    tags: ['AI Generation'],
    security: [{ bearerAuth: [] }],
    // responses: {
    //   200: {
    //     description: 'History List',
    //     content: { 'application/json': { schema: HistoryListResponseSchema } },
    //   },
    //   401: { description: 'Unauthorized' },
    // },
  },
  query: HistoryQuerySchema,
  response: {
    200: HistoryListResponseSchema,
    401: ErrorResponseSchema,
    500: ErrorResponseSchema,
  },
};

export const getHistoryDetailSchema = {
  auth: true,
  detail: {
    summary: 'Get History Detail',
    description: 'Fetch a single generated item by ID.',
    operationId: 'getGenerationHistoryDetail',
    tags: ['AI Generation'],
    security: [{ bearerAuth: [] }],
  //   responses: {
  //     200: {
  //       description: 'Detail Item',
  //       content: { 'application/json': { schema: HistoryDetailResponseSchema } },
  //     },
  //     403: { description: 'Forbidden' },
  //     404: { description: 'Not Found' },
  //     401: { description: 'Unauthorized' },
  //   },
  },
  response: {
    200: HistoryDetailResponseSchema,
    403: ErrorResponseSchema,
    404: ErrorResponseSchema,
    401: ErrorResponseSchema,
  },
};
