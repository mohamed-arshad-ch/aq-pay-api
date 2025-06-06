const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getRecentMapTransactions } = require('../controllers/dashboardController');

/**
 * @route   GET /api/dashboard/map-transactions
 * @desc    Get recent transactions for map display
 * @access  Private (User/Admin)
 */
router.get('/map-transactions', authenticateToken, getRecentMapTransactions);

module.exports = router; 