import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import {
  BUCKET_NAME,
  EXPIRATION_TIME_ACCESS,
  EXPIRATION_TIME_UPLOAD,
  s3,
  REGION,
} from '../../config/s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const getAccessUrl = async (fileKey: string) => {
  const getCommand = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileKey,
  });

  return await getSignedUrl(s3, getCommand, {
    expiresIn: EXPIRATION_TIME_ACCESS,
  });
};

export const getUploadUrl = async (fileKey: string, contentType: string) => {
  const putCommand = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileKey,
    ContentType: contentType,
  });

  return await getSignedUrl(s3, putCommand, {
    expiresIn: EXPIRATION_TIME_UPLOAD,
  });
};

// Derive extension from contentType, fallback to original filename's extension
const extFromContentType = (contentType: string, fallbackName?: string) => {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };
  if (map[contentType]) return map[contentType];
  if (fallbackName?.includes('.')) {
    return fallbackName.split('.').pop() as string;
  }
  return 'bin';
};

const generateFileKey = (userId: string, contentType: string, originalFileName?: string) => {
  const ext = extFromContentType(contentType, originalFileName);
  // Use Bun's global Web Crypto API
  const id = crypto.randomUUID();
  return `users/${userId}/${id}.${ext}`;
};

/**
 * Initialize an upload: returns presigned PUT URL and fileKey.
 * Do not return accessUrl here; generate it on read.
 */
export const getPreSignedUpload = async (
  userId: string,
  contentType: string,
  originalFileName?: string
) => {
  if (!contentType) {
    throw new Error('contentType is required');
  }

  const fileKey = generateFileKey(userId, contentType, originalFileName);
  const uploadUrl = await getUploadUrl(fileKey, contentType);

  // Clients can persist bucket/region along with fileKey if needed
  return { uploadUrl, fileKey, bucket: BUCKET_NAME, region: REGION };
};

/**
 * Generate a short-lived access URL for an existing fileKey.
 */
export const getPreSignedAccess = async (fileKey: string) => {
  const accessUrl = await getAccessUrl(fileKey);
  return { accessUrl, fileKey, bucket: BUCKET_NAME, region: REGION };
};
