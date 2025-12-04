import { Elysia } from 'elysia';
import openapi from '@elysiajs/openapi';
import * as z from 'zod';

import { OpenAPI } from './better-auth';

export const openApiPlugins = new Elysia({ name: 'open-api' }).use(
  openapi({
    documentation: {
      tags: [
        {
          name: 'Better Auth',
          description: 'Authentication and user management endpoints',
        },
        {
          name: 'Upload',
          description: 'File upload related endpoints',
        },
        {
          name: 'AI Generation',
          description: 'AI Generation endpoints',
        },
        {
          name: 'Health',
          description: 'Check service health',
        },
      ],
      info: {
        title: 'NoCap.AI API',
        description: 'API documentation for NoCap.AI backend services.',
        version: '1.0.0',
      },
      components: await OpenAPI.components,
      paths: await OpenAPI.getPaths(),
    },
    mapJsonSchema: {
      zod: z.toJSONSchema,
    },
  })
);
