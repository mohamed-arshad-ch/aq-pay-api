const app = require('./app');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Test database connection
async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    // Don't exit in serverless environment
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
}

// Graceful shutdown
async function gracefulShutdown() {
  console.log('🔄 Starting graceful shutdown...');
  await prisma.$disconnect();
  console.log('👋 Goodbye!');
  if (process.env.NODE_ENV !== 'production') {
    process.exit(0);
  }
}

// Handle shutdown signals (not applicable in serverless)
if (process.env.NODE_ENV !== 'production') {
  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);
}

// Start server (only in non-serverless environment)
async function startServer() {
  try {
    await connectDatabase();
    
    // Only start server if not in Vercel/serverless environment
    if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
      const server = app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
        console.log(`📊 Environment: ${process.env.NODE_ENV}`);
        console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
      });

      return server;
    }
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
}

// Initialize database connection
connectDatabase();

// Start server only in development
if (require.main === module) {
  startServer();
}

// Export the Express app for Vercel
module.exports = app; 