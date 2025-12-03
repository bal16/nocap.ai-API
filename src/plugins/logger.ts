import { wrap } from '@bogeychan/elysia-logger';
import { Elysia } from 'elysia';
import pino from 'pino';

export const logger = pino({
  level: 'debug',
  transport: {
    target: 'pino-pretty', // For human-readable console output
    options: {
      colorize: true,
    },
  },
});

export const loggerPlugins = new Elysia({ name: 'logger' }).use(
  wrap(logger, {
    autoLogging: true,
  })
);
