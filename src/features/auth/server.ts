import { betterAuth } from 'better-auth';

import { betterAuthOptions } from '../../config/auth';

export const auth = betterAuth(betterAuthOptions);
