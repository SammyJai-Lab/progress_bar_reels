// Database setup for Vercel
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Test database connection
async function testConnection() {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}

testConnection();

module.exports = { prisma };