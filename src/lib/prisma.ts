import { PrismaClient } from '@prisma/client';

// Prevent multiple instances in development
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'info', 'warn', 'error'], // Optional: for debugging
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;