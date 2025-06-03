const express = require('express');
const router = express.Router();
const {
  createAddMoneyTransaction,
  getUserAddMoneyTransactions,
  getAllAddMoneyTransactions,
  updateToProcessing,
  approveTransaction,
  rejectTransaction
} = require('../controllers/addMoneyController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// User routes - Require authentication
router.post('/create', authenticateToken, createAddMoneyTransaction);
router.get('/my-transactions', authenticateToken, getUserAddMoneyTransactions);

// Admin routes - Require authentication and admin role
router.get('/admin/all-transactions', authenticateToken, requireAdmin, getAllAddMoneyTransactions);
router.put('/admin/:id/processing', authenticateToken, requireAdmin, updateToProcessing);
router.put('/admin/:id/approve', authenticateToken, requireAdmin, approveTransaction);
router.put('/admin/:id/reject', authenticateToken, requireAdmin, rejectTransaction);

module.exports = router; 