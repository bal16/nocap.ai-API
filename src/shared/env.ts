import * as z from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z
    .string()
    .default('3000')
    .transform((v) => {
      const n = Number.parseInt(v, 10);
      if (Number.isNaN(n)) throw new Error('PORT must be an integer');
      return n;
    })
    .refine((n) => n >= 1 && n <= 65_535, 'PORT must be between 1 and 65535'),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
    .default((process.env.NODE_ENV ?? 'development') === 'development' ? 'debug' : 'info'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Deprecated: use TRUSTED_ORIGINS for CORS
  ORIGIN: z.string().default('http://localhost:5173'),

  // CORS: comma-separated list of trusted origins
  TRUSTED_ORIGINS: z.string().optional(),

  // Auth-related configuration
  AUTH_BASE_PATH: z.string().default('/auth'),
  GEMINI_API_URL: z.string().min(1, 'GEMINI_API_URL is required'),
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
  ANALYSIS_API_URL: z.string().min(1, 'ANALYSIS_API_URL is required'),
  ANALYSIS_API_KEY: z.string().min(1, 'ANALYSIS_API_KEY is required'),
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),

  // S3 configuration
  S3_REGION: z.string().min(1, 'S3_REGION is required'),
  S3_ENDPOINT: z.string().min(1, 'S3_ENDPOINT is required'),
  S3_BUCKET_NAME: z.string().min(1, 'S3_BUCKET_NAME is required'),
  S3_ACCESS_KEY_ID: z.string().min(1, 'S3_ACCESS_KEY_ID is required'),
  S3_SECRET_ACCESS_KEY: z.string().min(1, 'S3_SECRET_ACCESS_KEY is required'),
});

type Env = z.infer<typeof EnvSchema>;

const raw = {
  NODE_ENV: Bun.env.NODE_ENV ?? process.env.NODE_ENV,
  PORT: Bun.env.PORT ?? process.env.PORT,
  LOG_LEVEL: Bun.env.LOG_LEVEL ?? process.env.LOG_LEVEL,
  DATABASE_URL: Bun.env.DATABASE_URL ?? process.env.DATABASE_URL,

  ORIGIN: Bun.env.ORIGIN ?? process.env.ORIGIN,
  TRUSTED_ORIGINS: Bun.env.TRUSTED_ORIGINS ?? process.env.TRUSTED_ORIGINS,

  AUTH_BASE_PATH: Bun.env.AUTH_BASE_PATH ?? process.env.AUTH_BASE_PATH,
  GEMINI_API_URL: Bun.env.GEMINI_API_URL ?? process.env.GEMINI_API_URL,
  GEMINI_API_KEY: Bun.env.GEMINI_API_KEY ?? process.env.GEMINI_API_KEY,
  ANALYSIS_API_URL: Bun.env.ANALYSIS_API_URL ?? process.env.ANALYSIS_API_URL,
  ANALYSIS_API_KEY: Bun.env.ANALYSIS_API_KEY ?? process.env.ANALYSIS_API_KEY,
  GOOGLE_CLIENT_ID: Bun.env.GOOGLE_CLIENT_ID ?? process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: Bun.env.GOOGLE_CLIENT_SECRET ?? process.env.GOOGLE_CLIENT_SECRET,

  S3_REGION: Bun.env.S3_REGION ?? process.env.S3_REGION,
  S3_ENDPOINT: Bun.env.S3_ENDPOINT ?? process.env.S3_ENDPOINT,
  S3_BUCKET_NAME: Bun.env.S3_BUCKET_NAME ?? process.env.S3_BUCKET_NAME,
  S3_ACCESS_KEY_ID: Bun.env.S3_ACCESS_KEY_ID ?? process.env.S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY: Bun.env.S3_SECRET_ACCESS_KEY ?? process.env.S3_SECRET_ACCESS_KEY,
};

const result = EnvSchema.safeParse(raw);

if (!result.success) {
  const msg = result.error.issues
    .map((err) => {
      const path = err.path.join('.');
      const val = path ? (raw as Record<string, unknown>)[path] : undefined;
      return `${path}: ${err.message}${val !== undefined ? ` (got: ${JSON.stringify(val)})` : ''}`;
    })
    .join('; ');
  throw new Error(`Invalid environment: ${msg}`);
}

export const env: Env = result.data;

export function envSummary() {
  return {
    NODE_ENV: env.NODE_ENV,
    PORT: env.PORT,
    LOG_LEVEL: env.LOG_LEVEL,
    ORIGIN: env.ORIGIN,
    AUTH_BASE_PATH: env.AUTH_BASE_PATH,
    TRUSTED_ORIGINS: env.TRUSTED_ORIGINS,
    // Intentionally omit secrets
  };
}
