#!/usr/bin/env node

/**
 * Database Connection Test Script
 * Tests connectivity to PostgreSQL database (local or Azure)
 * 
 * Usage:
 *   node scripts/test-db-connection.js
 *   npm run db:test-connection
 * 
 * Environment Variables Required:
 *   DATABASE_URL - PostgreSQL connection string
 */

const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient({
    log: ['error', 'warn'],
  });
  
  console.log('🔄 Testing database connection...\n');
  
  try {
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful!\n');
    
    // Test a simple query to verify database access
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('📊 PostgreSQL version:');
    console.log(result);
    console.log('');
    
    // Test database schema access
    const userCount = await prisma.user.count();
    console.log(`📈 Database statistics:`);
    console.log(`   - Users: ${userCount}`);
    
    const courseCount = await prisma.course.count();
    console.log(`   - Courses: ${courseCount}`);
    
    const summaryCount = await prisma.summary.count();
    console.log(`   - Summaries: ${summaryCount}\n`);
    
    console.log('✅ All database checks passed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection failed!\n');
    console.error('Error details:', error.message);
    console.error('');
    
    // Provide helpful debugging information
    if (error.message.includes('SSL')) {
      console.error('💡 Tip: For Azure PostgreSQL, ensure your connection string includes sslmode=require');
      console.error('   Example: postgresql://user:pass@host:5432/db?sslmode=require\n');
    }
    
    if (error.message.includes('authentication failed')) {
      console.error('💡 Tip: Check your username and password in the DATABASE_URL\n');
    }
    
    if (error.message.includes('Connection refused') || error.message.includes('ECONNREFUSED')) {
      console.error('💡 Tip: Ensure the database server is running and accessible');
      console.error('   - For local: Check if PostgreSQL is running');
      console.error('   - For Azure: Check firewall rules and network connectivity\n');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testConnection().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
