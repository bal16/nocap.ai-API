import * as z from 'zod';
import {
  UploadRequestSchema,
  UploadResponseSchema,
  AccessUrlRequestSchema,
  AccessUrlResponseSchema,
} from './upload.model';

export const generatePresignUrlSchema = {
  detail: {
    summary: 'Generate pre-signed upload URL',
    description:
      'Returns a pre-signed URL to upload an image along with fileKey. Access URLs are generated separately on read.',
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
              uploadUrl:
                'https://my-bucket.s3.aws.com/users/123/550e8400-e29b-41d4-a716-446655440000.jpg?Signature=...',
              fileKey: 'users/123/550e8400-e29b-41d4-a716-446655440000.jpg',
              bucket: 'my-bucket',
              region: 'us-east-1',
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

export const generateAccessUrlSchema = {
  detail: {
    summary: 'Generate pre-signed access URL',
    description: 'Returns a short-lived pre-signed URL to read an object by fileKey.',
    operationId: 'generateImageAccessUrl',
    tags: ['Upload'],
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          example: {
            fileKey: 'users/123/550e8400-e29b-41d4-a716-446655440000.jpg',
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Access URL generated',
        content: {
          'application/json': {
            example: {
              accessUrl:
                'https://my-bucket.s3.aws.com/users/123/550e8400-e29b-41d4-a716-446655440000.jpg?Signature=...',
              fileKey: 'users/123/550e8400-e29b-41d4-a716-446655440000.jpg',
              bucket: 'my-bucket',
              region: 'us-east-1',
              expiresIn: 300,
            },
          },
        },
      },
      401: { description: 'Unauthorized' },
    },
  },
  body: AccessUrlRequestSchema,
  response: {
    200: AccessUrlResponseSchema,
    401: z.object({ message: z.string() }),
  },
};
