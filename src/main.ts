import { Elysia } from 'elysia';
import openapi from '@elysiajs/openapi';
import { cors } from '@elysiajs/cors';

import { betterAuthPlugin, OpenAPI } from './plugins/better-auth';
import { env } from './shared/env'; // use validated env
import * as z from 'zod';
import { customLogger } from './plugins/logger';
import { wrap } from '@bogeychan/elysia-logger';
// import { loggerPlugin } from './plugins/logger';

const app = new Elysia()
  .use(
    cors({
      origin: env.ORIGIN,
    })
  )
  .use(
    wrap(customLogger, {
      autoLogging: true,
    })
  )
  .use(
    openapi({
      documentation: {
        components: await OpenAPI.components,
        paths: await OpenAPI.getPaths(),
      },
    })
  )
  // .use(loggerPlugin)
  .use(betterAuthPlugin)
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
        summary: 'Buscar um usuario pelo ID',
        tags: ['users'],
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
  .get('/', () => ({
    message: 'Hello Elysia',
  }))
  .listen(env.PORT); // from env

customLogger.info(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port} (${env.NODE_ENV})`
);

// export default app;
