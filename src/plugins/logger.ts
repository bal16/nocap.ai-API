import { wrap } from '@bogeychan/elysia-logger';
import { Elysia } from 'elysia';
import pino from 'pino';
import { env } from '../shared/env';

const isDev = env.NODE_ENV === 'development';

export const logger = pino({
  level: env.LOG_LEVEL,
  ...(isDev
    ? {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true },
        },
      }
    : {}), // no pretty in production
});

export const loggerPlugins = new Elysia({ name: 'logger' }).use(
  wrap(logger, { autoLogging: true })
);
