import { PrismaClient } from '@prisma/client';

// import { getDatabaseUrl } from './helper';

declare global {
  // We need `var` to declare a global variable in TypeScript
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// todo  vercel and non vercel
// const db = process.env.DATABASE_URL;

const db = process.env.POSTGRES_URL;


if (!globalThis.prisma) {
  // console.log('db in prisma index.ts', db);
  globalThis.prisma = new PrismaClient({ datasourceUrl: db });
}

export const prisma =
  globalThis.prisma ||
  new PrismaClient({
    datasourceUrl: db,
    log: ['query', 'info', 'warn', 'error'],

  });

export const getPrismaClient = () => prisma;
