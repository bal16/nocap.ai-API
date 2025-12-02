import { Elysia, type Context } from "elysia";
import { auth } from "./server";

const betterAuthView = (context: Context & { request: Request }) => {
  const BETTER_AUTH_ACCEPT_METHODS = ["POST", "GET"];
  // validate request method
  if (BETTER_AUTH_ACCEPT_METHODS.includes(context.request.method)) {
    return auth.handler(context.request);
    // biome-ignore lint/style/noUselessElse: <explanation>
  }
  context.error(405);
};

export const authService = new Elysia().all("/auth/*", betterAuthView);
