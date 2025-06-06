const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/notificationController');

/**
 * @route   GET /api/notifications
 * @desc    Get all notifications for the authenticated user
 * @access  Private (User/Admin)
 */
router.get('/', authenticateToken, getMyNotifications);

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark a notification as read
 * @access  Private (User/Admin)
 */
router.put('/:id/read', authenticateToken, markAsRead);

/**
 * @route   PUT /api/notifications/mark-all-read
 * @desc    Mark all notifications as read
 * @access  Private (User/Admin)
 */
router.put('/mark-all-read', authenticateToken, markAllAsRead);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a notification
 * @access  Private (User/Admin)
 */
router.delete('/:id', authenticateToken, deleteNotification);

module.exports = router; 