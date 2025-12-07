import { Elysia } from 'elysia';

import { DEFAULT_MAX_SIZE, EXPIRATION_TIME_UPLOAD } from '../../config/s3';

import { loggerPlugins } from '../../plugins/logger';
import { betterAuthPlugin } from '../../plugins/better-auth';
import { openApiPlugins } from '../../plugins/open-api';

import { getPreSignedUpload, getPreSignedAccess } from './upload.service';
import { generatePresignUrlSchema, generateAccessUrlSchema } from './upload.docs';
import { AccessUrlRequestSchema } from './upload.model';

export const uploadController = new Elysia({ name: 'Upload Controller', prefix: '/image' })
  .use(loggerPlugins)
  .use(betterAuthPlugin)
  .use(openApiPlugins)
  // Init upload: returns uploadUrl + fileKey
  .post(
    '/get-presign-url',
    async ({ body, user }) => {
      const { fileName, contentType } = body;

      const userId = user?.id;
      if (!userId) {
        throw new Error('Unauthorized');
      }

      const { uploadUrl, fileKey, bucket, region } = await getPreSignedUpload(
        userId,
        contentType,
        fileName
      );

      return {
        uploadUrl,
        fileKey,
        bucket,
        region,
        expiresIn: EXPIRATION_TIME_UPLOAD,
        maxSize: DEFAULT_MAX_SIZE,
      };
    },
    {
      auth: true,
      ...generatePresignUrlSchema,
    }
  )
  // Read: returns short-lived access URL for a given fileKey
  .post(
    '/get-access-url',
    async ({ body }) => {
      const parsed = AccessUrlRequestSchema.parse(body);
      const { fileKey } = parsed;

      const { accessUrl, bucket, region } = await getPreSignedAccess(fileKey);
      return {
        accessUrl,
        fileKey,
        bucket,
        region,
        expiresIn: 300, // align with EXPIRATION_TIME_ACCESS if you export it
      };
    },
    {
      auth: true,
      ...generateAccessUrlSchema,
    }
  );
