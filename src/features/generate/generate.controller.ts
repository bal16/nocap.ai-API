import { Elysia } from 'elysia';
import { ContentGeneratorService } from './generate.service';
import { betterAuthPlugin } from '../../plugins/better-auth';

// Import semua Schema yang dibutuhkan
import {
  GenerateRequestSchema,
  GenerateResponseSchema,
  ErrorResponseSchema,
  HistoryQuerySchema,
  HistoryListResponseSchema,
  // HistoryDetailResponseSchema,
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

          if (err.message === 'Gambar tidak sesuai kriteria (Inappropriate).') {
            set.status = 400;
            return { status: 400, message: err.message, code: 'CONTENT_MODERATION_REJECTED' };
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
        502: ErrorResponseSchema,
      },
      detail: {
        summary: 'Generate from Image',
        description: 'Generate curation, caption, songs, and topics from image.',
        tags: ['AI Generation'],
        security: [{ bearerAuth: [] }],
      },
    }
  )
  .get(
    '/history',
    async ({ query, user, set }) => {
      try {
        const result = await service.getUserHistory(user.id, query.limit, query.cursor);
        set.status = 200;
        return result;
      } catch (err: unknown) {
        set.status = 500;
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        return {
          status: 500,
          message: errorMessage,
          code: 'HISTORY_FETCH_FAILED',
          hint: 'Please try again later or contact support if the issue persists.',
        };
      }
    },
    {
      auth: true,
      query: HistoryQuerySchema,
      response: {
        200: HistoryListResponseSchema,
        500: ErrorResponseSchema,
      },

      detail: {
        summary: 'Get Generation History',
        description: 'Fetch generated outputs history for the current session.',
        tags: ['AI Generation'],
        security: [{ bearerAuth: [] }],
      },
    }
  );

// .get(
//   '/history/:id',
//   async ({ params, user, set }) => {
//     try {
//       const result = await service.getHistoryDetail(user.id, params.id);

//       if (!result) {
//         set.status = 404;
//         return { status: 404, message: 'History not found' };
//       }

//       set.status = 200;
//       return result;
//     } catch (err: unknown) {
//       if (err instanceof Error && err.message === 'Unauthorized Access') {
//         set.status = 403;
//         return { status: 403, message: "You don't have permission to view this item" };
//       }
//       set.status = 500;
//       return { status: 500, message: 'Internal Server Error' };
//     }
//   },
//   {
//     auth: true,
//     response: {
//       200: HistoryDetailResponseSchema,
//       403: ErrorResponseSchema,
//       404: ErrorResponseSchema,
//       500: ErrorResponseSchema,
//     },

//     detail: {
//       summary: 'Get History Detail',
//       tags: ['AI Generation'],
//       security: [{ bearerAuth: [] }],
//     },
//   }
// );
