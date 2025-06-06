const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { 
  getAllUsersWithDetails, 
  getUserDetailById, 
  getDashboardStats,
  getUserAccounts,
  getUserAddMoneyTransactions,
  getUserTransferMoneyTransactions,
  getUserAllTransactions
} = require('../controllers/adminController');

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get admin dashboard statistics and recent transactions
 * @access  Private (Admin only)
 */
router.get('/dashboard', authenticateToken, requireAdmin, getDashboardStats);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with their details, accounts, and transaction counts
 * @access  Private (Admin only)
 */
router.get('/users', authenticateToken, requireAdmin, getAllUsersWithDetails);

/**
 * @route   GET /api/admin/users/:userId
 * @desc    Get detailed information for a specific user including accounts and transactions
 * @access  Private (Admin only)
 */
router.get('/users/:userId', authenticateToken, requireAdmin, getUserDetailById);

/**
 * @route   GET /api/admin/users/:userId/accounts
 * @desc    Get all accounts for a specific user
 * @access  Private (Admin only)
 */
router.get('/users/:userId/accounts', authenticateToken, requireAdmin, getUserAccounts);

/**
 * @route   GET /api/admin/users/:userId/add-money-transactions
 * @desc    Get all add money transactions for a specific user
 * @access  Private (Admin only)
 */
router.get('/users/:userId/add-money-transactions', authenticateToken, requireAdmin, getUserAddMoneyTransactions);

/**
 * @route   GET /api/admin/users/:userId/transfer-money-transactions
 * @desc    Get all transfer money transactions for a specific user
 * @access  Private (Admin only)
 */
router.get('/users/:userId/transfer-money-transactions', authenticateToken, requireAdmin, getUserTransferMoneyTransactions);

/**
 * @route   GET /api/admin/users/:userId/all-transactions
 * @desc    Get all transactions for a specific user
 * @access  Private (Admin only)
 */
router.get('/users/:userId/all-transactions', authenticateToken, requireAdmin, getUserAllTransactions);

module.exports = router; 