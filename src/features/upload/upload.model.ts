import * as z from 'zod';

export const UploadRequestSchema = z.object({
  fileName: z
    .string()
    .min(1, 'fileName is required')
    .refine((s) => /\.[A-Za-z0-9]+$/.test(s), 'fileName must include an extension'),
  contentType: z
    .string()
    .min(1, 'contentType is required')
    .refine(
      (ct) =>
        /^image\/(png|jpeg|jpg|webp|gif)$/.test(ct) ||
        /^application\/(pdf|octet-stream)$/.test(ct) ||
        /^text\/(plain)$/.test(ct),
      'Unsupported content type'
    ),
});

export const UploadResponseSchema = z.object({
  uploadUrl: z.url(), // pre-signed URL for upload
  fileKey: z.string(), // storage object key to persist
  accessUrl: z.url(), // signed URL for accessing the uploaded image
});
