#!/usr/bin/env node

/**
 * Database Connection Test Script
 * Tests connectivity to PostgreSQL database (local or Azure)
 * 
 * Usage:
 *   npm run db:test-connection
 *   or
 *   node scripts/test-db-connection.js
 * 
 * Ensure DATABASE_URL is set in your .env file
 */

const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient();
  
  console.log('🔍 Testing database connection...\n');
  console.log('Database URL:', process.env.DATABASE_URL ? 
    process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@') : 'Not set');
  
  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful!\n');
    
    // Test a simple query to verify we can execute queries
    const result = await prisma.$queryRaw`SELECT version(), current_database(), current_user`;
    console.log('📊 Database Information:');
    console.log('  PostgreSQL version:', result[0].version.split(' ')[0] + ' ' + result[0].version.split(' ')[1]);
    console.log('  Current database:', result[0].current_database);
    console.log('  Current user:', result[0].current_user);
    
    // Check if we're connected to Azure (SSL connection)
    try {
      const sslInfo = await prisma.$queryRaw`SHOW ssl`;
      console.log('  SSL/TLS active:', sslInfo[0].ssl === 'on' ? 'Yes ✅' : 'No');
    } catch (sslError) {
      // SSL check might not be available in all PostgreSQL versions
      console.log('  SSL/TLS active:', 'Unable to determine');
    }
    
    // Count tables to verify schema is accessible
    const tables = await prisma.$queryRaw`
      SELECT count(*) as table_count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('  Tables in schema:', tables[0].table_count);
    
    console.log('\n✅ All connection tests passed!');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Database connection failed!');
    console.error('Error:', error.message);
    
    // Provide helpful error messages
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Tip: Make sure PostgreSQL is running and accessible.');
    } else if (error.message.includes('authentication failed')) {
      console.error('\n💡 Tip: Check your username and password in DATABASE_URL.');
    } else if (error.message.includes('database') && error.message.includes('does not exist')) {
      console.error('\n💡 Tip: Create the database first or run migrations.');
    } else if (error.message.includes('SSL')) {
      console.error('\n💡 Tip: For Azure PostgreSQL, ensure sslmode=require is in your connection string.');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testConnection();
