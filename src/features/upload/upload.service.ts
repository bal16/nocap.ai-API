import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { BUCKET_NAME, EXPIRATION_TIME_ACCESS, EXPIRATION_TIME_UPLOAD, s3 } from '../../config/s3';
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

const generateFileKey = (fileName: string) => `uploads/${Date.now()}-${fileName}`;

export const getPreSignedUrl = async (fileName: string, contentType: string) => {
  const fileKey = generateFileKey(fileName);

  const uploadUrl = await getUploadUrl(fileKey, contentType);

  const accessUrl = await getAccessUrl(fileKey);

  return { uploadUrl, accessUrl, fileKey };
};
