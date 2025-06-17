const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { createMPin, updateMPin, verifyMPin, getMPinStatus } = require('../controllers/mPinController');

// All MPin routes require authentication and are for users only (not admins)

/**
 * @route   POST /api/mpin/create
 * @desc    Create a new 6-digit MPin for the authenticated user
 * @access  Private (User only, not Admin)
 */
router.post('/create', authenticateToken, createMPin);

/**
 * @route   PUT /api/mpin/update
 * @desc    Update the 6-digit MPin for the authenticated user
 * @access  Private (User only, not Admin)
 */
router.put('/update', authenticateToken, updateMPin);

/**
 * @route   POST /api/mpin/verify
 * @desc    Verify the 6-digit MPin for the authenticated user
 * @access  Private (User only, not Admin)
 */
router.post('/verify', authenticateToken, verifyMPin);

/**
 * @route   GET /api/mpin/status
 * @desc    Get MPin status for the authenticated user
 * @access  Private (User only, not Admin)
 */
router.get('/status', authenticateToken, getMPinStatus);

module.exports = router; 