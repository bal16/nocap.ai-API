import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { openAPI } from 'better-auth/plugins';
import { prisma } from './db';

export const auth = betterAuth({
  basePath: '/auth',

  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

  plugins: [openAPI()],

  emailAndPassword: {
    enabled: true,
    password: {
      hash: (input: string) => Bun.password.hash(input),
      verify: ({ password, hash }: { password: string; hash: string }) =>
        Bun.password.verify(password, hash),
    },
  },
});
