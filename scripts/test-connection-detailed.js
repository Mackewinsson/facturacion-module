#!/usr/bin/env node

/**
 * Detailed database connection test
 */

require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('../src/generated/prisma');
const { PrismaMssql } = require('@prisma/adapter-mssql');

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

async function detailedTest() {
  console.log('🔍 DETAILED DATABASE CONNECTION TEST\n');
  console.log('═'.repeat(60));
  console.log('Configuration:');
  console.log(`  Host: ${config.server}`);
  console.log(`  Port: ${config.port || 'default'}`);
  console.log(`  Database: ${config.database}`);
  console.log(`  User: ${config.user}`);
  console.log('═'.repeat(60) + '\n');

  const adapter = new PrismaMssql(config);
  const prisma = new PrismaClient({
    adapter,
    log: ['error'],
  });

  try {
    console.log('⏳ Step 1: Testing basic connection...');
    const version = await prisma.$queryRaw`SELECT @@VERSION as version`;
    console.log('✅ Basic connection: OK\n');

    console.log('⏳ Step 2: Getting database information...');
    const dbInfo = await prisma.$queryRaw`
      SELECT 
        DB_NAME() as dbname,
        @@VERSION as version,
        GETDATE() as currentTime
    `;
    console.log(`   Database: ${dbInfo[0].dbname}`);
    console.log(`   Current Time: ${dbInfo[0].currentTime}\n`);

    console.log('⏳ Step 3: Counting tables...');
    const tableCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
    `;
    console.log(`   Total Tables: ${tableCount[0].count}\n`);

    console.log('⏳ Step 4: Getting sample table names...');
    const sampleTables = await prisma.$queryRaw`
      SELECT TOP 10 TABLE_NAME as name
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `;
    console.log('   Sample Tables:');
    sampleTables.forEach((table, idx) => {
      console.log(`   ${idx + 1}. ${table.name}`);
    });
    console.log('');

    console.log('⏳ Step 5: Testing a simple query...');
    try {
      // Try to query a common table if it exists
      const testQuery = await prisma.$queryRaw`
        SELECT TOP 1 TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_TYPE = 'BASE TABLE'
      `;
      console.log(`✅ Query test: OK (found table: ${testQuery[0].TABLE_NAME})\n`);
    } catch (err) {
      console.log(`⚠️  Query test: ${err.message}\n`);
    }

    console.log('═'.repeat(60));
    console.log('✅ ALL TESTS PASSED - Database connection is working!');
    console.log('═'.repeat(60));

  } catch (error) {
    console.error('\n❌ CONNECTION TEST FAILED!\n');
    console.error('Error Details:');
    console.error(`  Message: ${error.message}`);
    if (error.code) {
      console.error(`  Code: ${error.code}`);
    }
    if (error.originalError) {
      console.error(`  Original: ${error.originalError.message}`);
    }
    console.error('\n' + '═'.repeat(60));
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Connection closed.\n');
  }
}

detailedTest().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});

