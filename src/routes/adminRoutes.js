const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { getAllUsersWithDetails, getUserDetailById, getDashboardStats } = require('../controllers/adminController');

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

module.exports = router; 