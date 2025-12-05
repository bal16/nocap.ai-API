import {
  GenerateRequestSchema,
  GenerateResponseSchema,
  ErrorResponseSchema,
  HistoryQuerySchema,
  HistoryListResponseSchema,
  HistoryDetailResponseSchema,
} from './generate.model';

export const analyzeContentSchema = {
  auth: true as const,

  detail: {
    summary: 'Generate AI Content from Image',
    description: 'Mengirim gambar ke Gemini AI untuk analisis kurasi, caption, lagu, dan topik.',
    tags: ['AI Generation'],
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: 'Success',
        content: {
          'application/json': {
            schema: GenerateResponseSchema,
          },
        },
      },
      400: {
        description: 'Bad Request / Image Error',
        content: {
          'application/json': {
            schema: ErrorResponseSchema,
          },
        },
      },
    },
  },

  body: GenerateRequestSchema,

  response: {
    200: GenerateResponseSchema,
    400: ErrorResponseSchema,
    500: ErrorResponseSchema,
  },
};

export const getHistorySchema = {
  auth: true as const,
  detail: {
    summary: 'Get Generation History',
    tags: ['AI Generation'],
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: 'History List',
        content: { 'application/json': { schema: HistoryListResponseSchema } },
      },
    },
  },
  query: HistoryQuerySchema,
  response: {
    200: HistoryListResponseSchema,
    401: ErrorResponseSchema,
  },
};

export const getHistoryDetailSchema = {
  auth: true as const,
  detail: {
    summary: 'Get History Detail',
    tags: ['AI Generation'],
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: 'Detail Item',
        content: { 'application/json': { schema: HistoryDetailResponseSchema } },
      },
      404: { description: 'Not Found' },
    },
  },
  response: {
    200: HistoryDetailResponseSchema,
    404: ErrorResponseSchema,
    403: ErrorResponseSchema,
  },
};
