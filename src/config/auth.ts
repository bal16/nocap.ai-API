import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { openAPI, bearer } from 'better-auth/plugins';
import { prisma } from './db';
import { env } from '../shared/env';

export const auth = betterAuth({
  basePath: env.AUTH_BASE_PATH,

  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

  trustedOrigins: env.TRUSTED_ORIGINS ? env.TRUSTED_ORIGINS.split(',') : [],

  advanced: {
    useSecureCookies: true,
    defaultCookieAttributes: {
      sameSite: 'None',
      secure: true,
    }
  },

  plugins: [openAPI(), bearer()],

  emailAndPassword: {
    enabled: true,
    password: {
      // Bun.password.hash/verify return Promises; better-auth accepts async functions.
      hash: (input: string) => Bun.password.hash(input),
      verify: ({ password, hash }: { password: string; hash: string }) =>
        Bun.password.verify(password, hash),
    },
  },

  socialProviders: {
    google: {
      prompt: 'select_account',
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
});
