import { PrismaMssql } from '@prisma/adapter-mssql'
import { PrismaClient } from '../generated/prisma'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// SQL Server configuration
const config = {
  server: process.env.DB_HOST || 'localhost',
  port: process.env.DB_INSTANCE ? undefined : parseInt(process.env.DB_PORT || '1433'), // Don't specify port for named instances
  database: process.env.DB_NAME || 'MotosMunozDatos',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASS || 'sa2006Strong!',
  options: {
    encrypt: false, // Disabled for compatibility
    trustServerCertificate: true, // For development and self-signed certificates
    connectionTimeout: 30000, // 30 seconds
    requestTimeout: 30000, // 30 seconds
    enableArithAbort: true, // Required for some SQL Server configurations
    instanceName: process.env.DB_INSTANCE || undefined, // Support named instances
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
  },
}

// Create adapter and Prisma client
const adapter = new PrismaMssql(config)

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma