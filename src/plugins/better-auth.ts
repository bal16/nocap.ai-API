import { Elysia } from 'elysia';
import { auth } from '../config/auth';

export const betterAuthPlugin = new Elysia({ name: 'better-auth' }).mount(auth.handler).macro({
  auth: {
    async resolve({ status, request: { headers } }) {
      const session = await auth.api.getSession({ headers });

      if (!session) {
        return status(401, { message: 'Unauthorized' });
      }

      return {
        user: session.user,
        session: session.session,
      };
    },
  },
});

let _schema: ReturnType<typeof auth.api.generateOpenAPISchema>;

const getSchema = async () => {
  if (!_schema) {
    _schema = auth.api.generateOpenAPISchema();
  }
  return _schema;
};

export const OpenAPI = {
  getPaths: (prefix = '/auth') =>
    getSchema().then(({ paths }) => {
      const reference: typeof paths = Object.create(null);

      for (const path of Object.keys(paths)) {
        const key = prefix + path;
        reference[key] = paths[path];

        for (const method of Object.keys(paths[path])) {
          const operation = (reference[key] as Record<string, { tags: string[] }>)[method];

          operation.tags = ['Better Auth'];
        }
      }

      return reference;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as Promise<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  components: getSchema().then(({ components }) => components) as Promise<any>,
} as const;
