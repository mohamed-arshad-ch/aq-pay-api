const express = require('express');
const router = express.Router();
const {
  getUserAllTransactions,
  getTransactionByOrderId,
  getUserTransactionStats,
  getAdminAllTransactions
} = require('../controllers/allTransactionController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// User routes - Require authentication
router.get('/my-transactions', authenticateToken, getUserAllTransactions);
router.get('/order/:orderId', authenticateToken, getTransactionByOrderId);
router.get('/my-stats', authenticateToken, getUserTransactionStats);

// Admin routes - Require authentication and admin role
router.get('/admin/all-transactions', authenticateToken, requireAdmin, getAdminAllTransactions);

module.exports = router; 