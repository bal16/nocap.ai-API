import {
  GenerateRequestSchema,
  GenerateResponseSchema,
  ErrorResponseSchema,
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
