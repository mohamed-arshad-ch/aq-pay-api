const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint for Vercel
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'AQ-PAY API is running on Vercel',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      profile: 'GET /api/auth/profile (protected)',
      updateProfile: 'PUT /api/auth/profile (protected)',
      logout: 'POST /api/auth/logout (protected)'
    }
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler - Fixed the problematic route pattern
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

module.exports = app; 