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
