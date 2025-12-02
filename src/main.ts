import { Elysia } from 'elysia';
import openapi from '@elysiajs/openapi';

import { cors } from '@elysiajs/cors';

import { OpenAPI } from './plugins/openApi';
import { auth } from './features/auth/server';
// import { auth } from "./features/auth/server";
// import { authService } from "./features/auth/auth.service";

const app = new Elysia()
  .use(
    cors({
      origin: 'localhost:5173',
    })
  )
  .use(
    openapi({
      documentation: {
        components: await OpenAPI.components,
        paths: await OpenAPI.getPaths(),
      },
    })
  )
  .mount(auth.handler)
  .get('/', () => ({
    message: 'Hello Elysia',
  }))
  // .get("/example", () => "Hello Elysia")
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

// export default app;
