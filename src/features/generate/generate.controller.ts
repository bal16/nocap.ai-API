import { Elysia } from 'elysia';

import { loggerPlugins } from '../../plugins/logger';
import { betterAuthPlugin } from '../../plugins/better-auth';
import { openApiPlugins } from '../../plugins/open-api';

import { generateContent, getHistoryDetail, getUserHistory } from './services';
import { analyzeContentSchema, getHistoryDetailSchema, getHistorySchema } from './generate.docs';

export const contentGeneratorController = new Elysia({
  name: 'Generate Controller',
  prefix: '/generate',
})
  .use(loggerPlugins)
  .use(openApiPlugins)
  .use(betterAuthPlugin)
  .post(
    '/from-image',
    async ({ body, user, set }) => {
      try {
        const result = await generateContent(user.id, body);
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
      ...analyzeContentSchema,
      auth: true,
    }
  )
  .get(
    '/history',
    async ({ query, user, set }) => {
      try {
        const result = await getUserHistory(user.id, query.limit);
        set.status = 200;
        return { status: 200, message: 'History fetched successfully', ...result };
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
      ...getHistorySchema,
      auth: true,
    }
  )
  .get(
    '/history/:id',
    async ({ params, user, set }) => {
      try {
        const result = await getHistoryDetail(user.id, params.id);

        if (!result) {
          set.status = 404;
          return { status: 404, message: 'History not found' };
        }

        set.status = 200;
        return result;
      } catch (err: unknown) {
        if (err instanceof Error && err.message === 'Unauthorized Access') {
          set.status = 403;
          return { status: 403, message: 'You don\'t have permission to view this item' };
        }
        set.status = 500;
        return { status: 500, message: 'Internal Server Error' };
      }
    },
    {
      ...getHistoryDetailSchema,
      auth: true,
    }
  );
