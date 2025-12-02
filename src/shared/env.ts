import { z } from 'zod';

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
    .refine((n) => n >= 1 && n <= 65535, 'PORT must be between 1 and 65535'),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
    .default((process.env.NODE_ENV ?? 'development') === 'development' ? 'debug' : 'info'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  ORIGIN: z.string().default('http://localhost:5173'),
});

type Env = z.infer<typeof EnvSchema>;

const raw = {
  NODE_ENV: Bun.env.NODE_ENV ?? process.env.NODE_ENV,
  PORT: Bun.env.PORT ?? process.env.PORT,
  LOG_LEVEL: Bun.env.LOG_LEVEL ?? process.env.LOG_LEVEL,
  DATABASE_URL: Bun.env.DATABASE_URL ?? process.env.DATABASE_URL,
  ORIGIN: Bun.env.ORIGIN ?? process.env.ORIGIN,
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
  };
}
