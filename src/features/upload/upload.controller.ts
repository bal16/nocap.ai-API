import { Elysia } from 'elysia';

import { DEFAULT_MAX_SIZE, EXPIRATION_TIME_UPLOAD } from '../../config/s3';

import { loggerPlugins } from '../../plugins/logger';
import { betterAuthPlugin } from '../../plugins/better-auth';
import { openApiPlugins } from '../../plugins/open-api';

import { getPreSignedUrl } from './upload.service';
import { generatePresignUrlSchema } from './upload.docs';

export const uploadController = new Elysia({ name: 'Upload Controller', prefix: '/image' })
  .use(loggerPlugins)
  .use(betterAuthPlugin)
  .use(openApiPlugins)
  .post(
    '/get-presign-url',
    async ({ body }) => {
      const { fileName, contentType } = body;

      const { uploadUrl, accessUrl, fileKey } = await getPreSignedUrl(fileName, contentType);

      return {
        uploadUrl,
        fileKey,
        accessUrl,
        expiresIn: EXPIRATION_TIME_UPLOAD,
        maxSize: DEFAULT_MAX_SIZE,
      };
    },
    {
      auth: true,
      ...generatePresignUrlSchema,
    }
  );
