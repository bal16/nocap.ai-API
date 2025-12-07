import { Elysia } from 'elysia';
import cors from '@elysiajs/cors';

import { env } from '../shared/env';

export const corsPlugins = new Elysia({ name: 'cors' }).use(
  cors({
    origin: env.ORIGIN,
    credentials: true,
  })
);
