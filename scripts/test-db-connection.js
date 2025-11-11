#!/usr/bin/env node

/**
 * Test database connection using Prisma client
 */

require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('../src/generated/prisma');
const { PrismaMssql } = require('@prisma/adapter-mssql');

// SQL Server configuration
const config = {
  server: process.env.DB_HOST || 'localhost',
  port: process.env.DB_INSTANCE ? undefined : parseInt(process.env.DB_PORT || '1433'),
  database: process.env.DB_NAME || 'MotosMunozDatos',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASS || 'sa2006Strong!',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    connectionTimeout: 30000,
    requestTimeout: 30000,
    enableArithAbort: true,
    instanceName: process.env.DB_INSTANCE || undefined,
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
  },
};

async function testConnection() {
  console.log('🔌 Testing database connection...\n');
  console.log('Configuration:');
  console.log(`  Host: ${config.server}`);
  console.log(`  Port: ${config.port || 'default'}`);
  console.log(`  Database: ${config.database}`);
  console.log(`  User: ${config.user}`);
  console.log(`  Password: ${'*'.repeat(config.password.length)}\n`);

  const adapter = new PrismaMssql(config);
  const prisma = new PrismaClient({
    adapter,
    log: ['error'],
  });

  try {
    console.log('⏳ Connecting to database...');
    
    // Test connection by querying a simple table
    // Try to get database version or count from a common table
    const result = await prisma.$queryRaw`SELECT @@VERSION as version`;
    
    if (result && result.length > 0) {
      console.log('✅ Connection successful!\n');
      console.log('SQL Server Version:');
      console.log(`  ${result[0].version}\n`);
    }

    // Try to query database name
    const dbResult = await prisma.$queryRaw`SELECT DB_NAME() as dbname`;
    if (dbResult && dbResult.length > 0) {
      console.log(`📊 Current Database: ${dbResult[0].dbname}\n`);
    }

    // Try to get table count
    try {
      const tableCount = await prisma.$queryRaw`
        SELECT COUNT(*) as count 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_TYPE = 'BASE TABLE'
      `;
      if (tableCount && tableCount.length > 0) {
        console.log(`📋 Tables in database: ${tableCount[0].count}\n`);
      }
    } catch (err) {
      console.log('⚠️  Could not get table count (this is okay)\n');
    }

    console.log('✅ Database connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Connection failed!\n');
    console.error('Error details:');
    console.error(`  Message: ${error.message}`);
    if (error.code) {
      console.error(`  Code: ${error.code}`);
    }
    if (error.originalError) {
      console.error(`  Original Error: ${error.originalError.message}`);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Connection closed.');
  }
}

testConnection().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});

