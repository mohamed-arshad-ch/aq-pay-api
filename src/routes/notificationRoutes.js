const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const {
  getMyNotifications,
  getAllNotifications,
  getNotificationStats,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  adminMarkAsRead,
  adminDeleteNotification,
  getUnreadNotificationCount,
  getTotalUnreadCount
} = require('../controllers/notificationController');

/**
 * @route   GET /api/notifications
 * @desc    Get all notifications for the authenticated user
 * @access  Private (User/Admin)
 */
router.get('/', authenticateToken, getMyNotifications);

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get unread notification count for the authenticated user
 * @access  Private (User/Admin)
 */
router.get('/unread-count', authenticateToken, getUnreadNotificationCount);

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

/**
 * @route   GET /api/notifications/admin/all
 * @desc    Get all notifications in the system (admin only)
 * @access  Private (Admin only)
 */
router.get('/admin/all', authenticateToken, requireAdmin, getAllNotifications);

/**
 * @route   GET /api/notifications/admin/stats
 * @desc    Get notification statistics for admin dashboard
 * @access  Private (Admin only)
 */
router.get('/admin/stats', authenticateToken, requireAdmin, getNotificationStats);

/**
 * @route   GET /api/notifications/admin/unread-count
 * @desc    Get total unread notification count for admin dashboard
 * @access  Private (Admin only)
 */
router.get('/admin/unread-count', authenticateToken, requireAdmin, getTotalUnreadCount);

/**
 * @route   PUT /api/notifications/admin/:id/read
 * @desc    Admin can mark any notification as read
 * @access  Private (Admin only)
 */
router.put('/admin/:id/read', authenticateToken, requireAdmin, adminMarkAsRead);

/**
 * @route   DELETE /api/notifications/admin/:id
 * @desc    Admin can delete any notification
 * @access  Private (Admin only)
 */
router.delete('/admin/:id', authenticateToken, requireAdmin, adminDeleteNotification);

module.exports = router; 