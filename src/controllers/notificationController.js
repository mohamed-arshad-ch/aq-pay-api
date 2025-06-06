const Notification = require('../models/Notification');

/**
 * Get notifications for the authenticated user
 * @route GET /api/notifications
 * @access Private (User/Admin)
 */
const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { unreadOnly = false, page = 1, limit = 10 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    
    // Get notifications
    const notifications = await Notification.getForUser(
      userId, 
      unreadOnly === 'true' || unreadOnly === true, 
      skip, 
      take
    );
    
    // Get unread count
    const unreadCount = await Notification.getUnreadCount(userId);
    
    // Get total count for pagination
    const totalCount = await Notification.getForUser(
      userId, 
      unreadOnly === 'true' || unreadOnly === true, 
      0, 
      Number.MAX_SAFE_INTEGER
    ).then(res => res.length);

    res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          totalPages: Math.ceil(totalCount / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Mark a notification as read
 * @route PUT /api/notifications/:id/read
 * @access Private (User/Admin)
 */
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if notification exists and belongs to user
    const notification = await Notification.getForUser(userId);
    const belongsToUser = notification.some(n => n.id === id);

    if (!belongsToUser) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found or does not belong to you'
      });
    }

    // Mark as read
    const updatedNotification = await Notification.markAsRead(id);

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: updatedNotification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Mark all notifications as read
 * @route PUT /api/notifications/mark-all-read
 * @access Private (User/Admin)
 */
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    // Mark all as read
    const result = await Notification.markAllAsRead(userId);

    res.status(200).json({
      success: true,
      message: `${result.count} notifications marked as read`,
      data: result
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Delete a notification
 * @route DELETE /api/notifications/:id
 * @access Private (User/Admin)
 */
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if notification exists and belongs to user
    const notification = await Notification.getForUser(userId);
    const belongsToUser = notification.some(n => n.id === id);

    if (!belongsToUser) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found or does not belong to you'
      });
    }

    // Delete notification
    await Notification.delete(id);

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
}; 