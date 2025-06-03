const express = require('express');
const router = express.Router();
const {
  // User endpoints
  getUserPendingTransactions,
  getUserProcessingTransactions,
  getUserCompletedTransactions,
  getUserRejectedTransactions,
  
  // Admin endpoints
  getAdminPendingTransactions,
  getAdminProcessingTransactions,
  getAdminCompletedTransactions,
  getAdminRejectedTransactions
} = require('../controllers/transactionStatusController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// User routes - Require authentication
router.get('/user/pending', authenticateToken, getUserPendingTransactions);
router.get('/user/processing', authenticateToken, getUserProcessingTransactions);
router.get('/user/completed', authenticateToken, getUserCompletedTransactions);
router.get('/user/rejected', authenticateToken, getUserRejectedTransactions);

// Admin routes - Require authentication and admin role
router.get('/admin/pending', authenticateToken, requireAdmin, getAdminPendingTransactions);
router.get('/admin/processing', authenticateToken, requireAdmin, getAdminProcessingTransactions);
router.get('/admin/completed', authenticateToken, requireAdmin, getAdminCompletedTransactions);
router.get('/admin/rejected', authenticateToken, requireAdmin, getAdminRejectedTransactions);

module.exports = router; 