const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const config = require('./config/env');
const { initDB } = require('./models/database');
const blockchainListener = require('./services/blockchainListener');
const notificationService = require('./services/notificationService');
const analyticsService = require('./services/analyticsService');

const propertyRoutes = require('./routes/properties');
const paymentRoutes = require('./routes/payments');
const notificationRoutes = require('./routes/notifications');
const analyticsRoutes = require('./routes/analytics');

const errorHandler = require('./middleware/errorHandler');
const { requestLogger, errorLogger } = require('./utils/logger');
const { apiLimiter, paymentLimiter } = require('./middleware/rateLimit');

const app = express();
const server = http.createServer(app);

const io = require('socket.io')(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Compression middleware
app.use(compression());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(requestLogger);

// Rate limiting
app.use('/api/', apiLimiter);
app.use('/api/payments', paymentLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'ZuriRent Backend',
    version: '1.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: config.NODE_ENV
  };
  res.json(healthCheck);
});

// API routes
app.use('/api/properties', propertyRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error logging middleware
app.use(errorLogger);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Route not found' 
  });
});

// Socket.IO setup
notificationService.setSocketIO(io);

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  console.log(`\nReceived ${signal}. Starting graceful shutdown...`);
  
  server.close((err) => {
    if (err) {
      console.error('Error during server shutdown:', err);
      process.exit(1);
    }
    
    console.log('HTTP server closed.');
    console.log('Graceful shutdown completed.');
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Signal handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

async function startServer() {
  try {
    console.log('Starting ZuriRent Backend...');
    console.log('Environment:', config.NODE_ENV);
    
    // Initialize database
    await initDB();
    console.log('✅ Database initialized');

    // Start blockchain listener
    await blockchainListener.start();
    console.log('✅ Blockchain listener started');

    // Start analytics service
    analyticsService.startScheduledTasks();
    console.log('✅ Analytics service started');

    // Start server
    server.listen(config.PORT, () => {
      console.log(`🚀 RentChain backend running on port ${config.PORT}`);
      console.log(`📊 Health check available at http://localhost:${config.PORT}/health`);
      console.log(`🌐 Environment: ${config.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

module.exports = app; // For testing purposes

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ZuriRent Backend API',
      version: '1.0.0',
      description: 'Offchain backend for ZuriRent - Event indexing, payments, notifications',
    },
    servers: [
      {
        url: `http://localhost:${config.PORT}/api`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./routes/*.js'], // Path to the API routes
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));