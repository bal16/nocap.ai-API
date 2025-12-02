import { Elysia } from 'elysia';
import { Logestic } from 'logestic';

export const loggerPlugin = new Elysia({ name: 'LoggerPlugin' }).use(
  Logestic.preset('fancy') //common, simple
);
