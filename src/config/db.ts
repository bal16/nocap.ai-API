import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../prisma/generated/client';
import { env } from '../shared/env';

// Use validated DATABASE_URL from env
const connectionString = env.DATABASE_URL;

const adapter = new PrismaPg({ connectionString });
export const prisma = new PrismaClient({ adapter });
