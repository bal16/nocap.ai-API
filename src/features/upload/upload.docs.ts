import * as z from 'zod';
import { UploadRequestSchema, UploadResponseSchema } from './upload.model';

export const generatePresignUrlSchema = {
  detail: {
    summary: 'Generate pre-signed upload URL',
    description: 'Returns a pre-signed URL to upload an image and a signed access URL.',
    operationId: 'generateImagePresignUrl',
    tags: ['Upload'],
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          example: {
            fileName: 'foto-unik.jpg',
            contentType: 'image/jpeg',
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Pre-signed URL generated',
        content: {
          'application/json': {
            example: {
              uploadUrl: 'https://my-bucket.s3.aws.com/users/123/posts/foto-unik.jpg?Signature=...',
              fileKey: 'users/123/posts/foto-unik.jpg',
              accessUrl: 'https://my-bucket.s3.aws.com/users/123/posts/foto-unik.jpg?Signature=...',
              expiresIn: 300,
              maxSize: 5_242_880,
            },
          },
        },
      },
      401: { description: 'Unauthorized' },
    },
  },
  body: UploadRequestSchema,
  response: {
    200: UploadResponseSchema,
    401: z.object({ message: z.string() }),
  },
};
