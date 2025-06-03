const express = require('express');
const router = express.Router();

// Import middleware
const { authenticateToken, requireRole } = require('../middleware/auth');
const { USER_ROLES } = require('../utils/authUtils');

// Import controller
const {
  createAccount,
  getUserAccounts,
  getAccountById,
  updateAccount,
  deleteAccount
} = require('../controllers/accountController');

/**
 * @route   POST /api/accounts
 * @desc    Create a new account
 * @access  Private (User role only)
 */
router.post('/', 
  authenticateToken, 
  requireRole(USER_ROLES.USER), 
  createAccount
);

/**
 * @route   GET /api/accounts
 * @desc    Get all accounts for the authenticated user
 * @access  Private (User role only)
 */
router.get('/', 
  authenticateToken, 
  requireRole(USER_ROLES.USER), 
  getUserAccounts
);

/**
 * @route   GET /api/accounts/:id
 * @desc    Get account by ID
 * @access  Private (User role only)
 */
router.get('/:id', 
  authenticateToken, 
  requireRole(USER_ROLES.USER), 
  getAccountById
);

/**
 * @route   PUT /api/accounts/:id
 * @desc    Update account by ID
 * @access  Private (User role only)
 */
router.put('/:id', 
  authenticateToken, 
  requireRole(USER_ROLES.USER), 
  updateAccount
);

/**
 * @route   DELETE /api/accounts/:id
 * @desc    Delete account by ID
 * @access  Private (User role only)
 */
router.delete('/:id', 
  authenticateToken, 
  requireRole(USER_ROLES.USER), 
  deleteAccount
);

module.exports = router; 