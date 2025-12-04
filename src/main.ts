import { Elysia } from 'elysia';
import openapi from '@elysiajs/openapi';
import { cors } from '@elysiajs/cors';
import * as z from 'zod';

import { betterAuthPlugin, OpenAPI } from './plugins/better-auth';
import { loggerPlugins, logger } from './plugins/logger';
import { env } from './shared/env';

const app = new Elysia()
  .use(
    cors({
      origin: env.ORIGIN,
    })
  )
  .use(loggerPlugins)
  .use(betterAuthPlugin)
  .use(
    openapi({
      documentation: {
        components: await OpenAPI.components,
        paths: await OpenAPI.getPaths(),
      },
    })
  )
  .get(
    '/',
    (ctx) => {
      ctx.log.info('Root endpoint accessed');
      return {
        message: 'Hello Elysia',
      };
    },
    {
      detail: {
        summary: 'Test unauthenticated route',
        tags: ['test'],
      },
      response: {
        200: z.object({
          message: z.string(),
        }),
      },
    }
  )
  .get(
    '/users/:id',
    ({ params, user }) => {
      const userId = params.id;
      const authenticatedUserName = user.name;
      return { id: userId, name: authenticatedUserName };
    },
    {
      auth: true,
      detail: {
        summary: 'Test authenticated route',
        tags: ['test'],
      },
      params: z.object({
        id: z.string(),
      }),
      response: {
        200: z.object({
          id: z.string(),
          name: z.string(),
        }),
      },
    }
  )
  .listen(env.PORT); // from env

logger.info(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port} (${env.NODE_ENV})`
);

// export default app;
