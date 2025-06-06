const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const {
  savePushToken,
  getMyPushTokens,
  deletePushToken,
  getAllPushTokens
} = require('../controllers/pushTokenController');

/**
 * @route   POST /api/push-tokens
 * @desc    Save or update a push token
 * @access  Private (User/Admin)
 */
router.post('/', authenticateToken, savePushToken);

/**
 * @route   GET /api/push-tokens/my-tokens
 * @desc    Get all push tokens for the authenticated user
 * @access  Private (User/Admin)
 */
router.get('/my-tokens', authenticateToken, getMyPushTokens);

/**
 * @route   DELETE /api/push-tokens
 * @desc    Delete a push token (deactivate it)
 * @access  Private (User/Admin)
 */
router.delete('/', authenticateToken, deletePushToken);

/**
 * @route   GET /api/push-tokens/admin/all
 * @desc    Get all active push tokens (Admin only)
 * @access  Private (Admin only)
 */
router.get('/admin/all', authenticateToken, requireAdmin, getAllPushTokens);

module.exports = router; 