import { Elysia } from 'elysia';
import * as z from 'zod';

import { env } from './shared/env';

import { betterAuthPlugin } from './plugins/better-auth';
import { loggerPlugins, logger } from './plugins/logger';
import { openApiPlugins } from './plugins/open-api';
import { corsPlugins } from './plugins/cors';

import { uploadController } from './features/upload/upload.controller';
import { contentGeneratorController } from './features/generate/generate.controller';

const app = new Elysia()
  .use(corsPlugins)
  .use(loggerPlugins)
  .use(betterAuthPlugin)
  .use(openApiPlugins)
  .use(uploadController)
  .use(contentGeneratorController)
  .get(
    '/health',
    ({ log }) => {
      log.info('health endpoint accessed');
      return {
        message: 'ok',
      };
    },
    {
      detail: {
        summary: 'Test service health',
        tags: ['Health'],
      },
      response: {
        200: z.object({
          message: z.string(),
        }),
      },
      responses: {
        200: {
          description: 'Pre-signed URL generated',
          content: {
            'application/json': {
              example: {
                message: 'ok',
              },
            },
          },
        },
      },
    }
  )
  .listen(env.PORT);

logger.info(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port} (${env.NODE_ENV})`
);

// export default app;
