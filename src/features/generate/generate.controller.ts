import { Elysia } from 'elysia';
import { ContentGeneratorService } from './generate.service';
import { betterAuthPlugin } from '../../plugins/better-auth';

import {
  GenerateRequestSchema,
  GenerateResponseSchema,
  ErrorResponseSchema,
} from './generate.model';

const service = new ContentGeneratorService();

export const contentGeneratorController = new Elysia({ prefix: '/generate' })
  .use(betterAuthPlugin)
  .post(
    '/from-image',
    async ({ body, user, set }) => {
      try {
        const result = await service.generateContent(user.id, body);
        set.status = 200;
        return result;
      } catch (err: unknown) {
        set.status = 500;
        if (err instanceof Error) {
          if (err.message.includes('Image URL not accessible')) {
            set.status = 400;
            return {
              status: 400,
              message: 'Image URL not accessible',
              code: 'IMAGE_FETCH_FAILED',
              hint: 'Ensure the image is publicly accessible or provide a valid signed URL.',
            };
          }

          if (err.message.includes('Layanan Analisis Desain sedang tidak tersedia')) {
            set.status = 502;
            return { status: 502, message: err.message, code: 'ANALYSIS_SERVICE_DOWN' };
          }
          return { status: 500, message: err.message };
        }
        return { status: 500, message: 'Internal Server Error' };
      }
    },

    {
      auth: true,
      body: GenerateRequestSchema,
      response: {
        200: GenerateResponseSchema,
        400: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },

      detail: {
        summary: 'Generate from Image',
        description: 'Generate curation, caption, songs, and topics from image.',
        tags: ['AI Generation'],
        security: [{ bearerAuth: [] }],
      },
    }
  );
