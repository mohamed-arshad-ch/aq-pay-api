const express = require('express');
const router = express.Router();

// Import middleware
const { authenticateToken, requireRole } = require('../middleware/auth');
const { USER_ROLES } = require('../utils/authUtils');

// Import controller
const {
  getWalletBalance,
  getWallet
} = require('../controllers/walletController');

/**
 * @route   GET /api/wallet
 * @desc    Get wallet details for the authenticated user
 * @access  Private (User role only)
 */
router.get('/', 
  authenticateToken, 
  requireRole(USER_ROLES.USER), 
  getWallet
);

/**
 * @route   GET /api/wallet/balance
 * @desc    Get wallet balance for the authenticated user
 * @access  Private (User role only)
 */
router.get('/balance', 
  authenticateToken, 
  requireRole(USER_ROLES.USER), 
  getWalletBalance
);

module.exports = router; 