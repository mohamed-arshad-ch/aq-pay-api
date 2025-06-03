const express = require('express');
const router = express.Router();
const {
  createTransferMoneyTransaction,
  getUserTransferMoneyTransactions,
  getAllTransferMoneyTransactions,
  updateToProcessing,
  approveTransferTransaction,
  rejectTransferTransaction,
  getTransferTransactionById
} = require('../controllers/transferMoneyController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// User routes - Require authentication
router.post('/create', authenticateToken, createTransferMoneyTransaction);
router.get('/my-transactions', authenticateToken, getUserTransferMoneyTransactions);
router.get('/:id', authenticateToken, getTransferTransactionById);

// Admin routes - Require authentication and admin role
router.get('/admin/all-transactions', authenticateToken, requireAdmin, getAllTransferMoneyTransactions);
router.put('/admin/:id/processing', authenticateToken, requireAdmin, updateToProcessing);
router.put('/admin/:id/approve', authenticateToken, requireAdmin, approveTransferTransaction);
router.put('/admin/:id/reject', authenticateToken, requireAdmin, rejectTransferTransaction);

module.exports = router; 