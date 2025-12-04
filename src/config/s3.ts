import { S3Client } from '@aws-sdk/client-s3';
import { env } from '../shared/env';

export const s3 = new S3Client({
  region: env.S3_REGION || 'ap-southeast-1',
  endpoint: env.S3_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  },
});

export const BUCKET_NAME = env.S3_BUCKET_NAME;
export const EXPIRATION_TIME_UPLOAD = 60 * 5; // 5 minutes
export const EXPIRATION_TIME_ACCESS = 60 * 60; // 1 hour
export const DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5MB
