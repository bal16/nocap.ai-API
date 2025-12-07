import { Elysia } from 'elysia';
import cors from '@elysiajs/cors';

import { env } from '../shared/env';

export const corsPlugins = new Elysia({ name: 'cors' }).use(
  cors({
    origin: env.TRUSTED_ORIGINS ? env.TRUSTED_ORIGINS.split(',') : true, //sebelumnya env.ORIGIN
    credentials: true,
  })
);
