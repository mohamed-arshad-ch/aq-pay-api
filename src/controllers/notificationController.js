const Notification = require('../models/Notification');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
 * Get all notifications (Admin only) - Enhanced with related details
 * @route GET /api/notifications/admin/all
 * @access Private (Admin only)
 */
const getAllNotifications = async (req, res) => {
  try {
    const { userId, type, unreadOnly = false, page = 1, limit = 10 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    
    // Build where clause for filtering
    const where = {};
    
    if (userId) {
      where.userId = userId;
    }
    
    if (type) {
      where.type = type.toUpperCase();
    }
    
    if (unreadOnly === 'true' || unreadOnly === true) {
      where.isRead = false;
    }
    
    // Get notifications with user info
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true
          }
        }
      }
    });
    
    // Enhance notifications with related details based on type
    const enhancedNotifications = await Promise.all(
      notifications.map(async (notification) => {
        const enhancedNotification = { ...notification };
        
        switch (notification.type) {
          case 'REGISTRATION':
            if (notification.registrationUserId) {
              const registrationUser = await prisma.user.findUnique({
                where: { id: notification.registrationUserId },
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  phoneNumber: true,
                  role: true,
                  isPortalAccess: true,
                  createdAt: true
                }
              });
              enhancedNotification.registrationDetails = registrationUser;
            }
            break;
            
          case 'PORTAL_ACCESS':
            if (notification.portalAccessUserId) {
              const portalUser = await prisma.user.findUnique({
                where: { id: notification.portalAccessUserId },
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  phoneNumber: true,
                  role: true,
                  isPortalAccess: true,
                  createdAt: true,
                  updatedAt: true
                }
              });
              enhancedNotification.portalAccessDetails = portalUser;
            }
            break;
            
          case 'ADD_MONEY':
            if (notification.addMoneyTransactionId) {
              const addMoneyTransaction = await prisma.addMoneyTransaction.findUnique({
                where: { id: notification.addMoneyTransactionId },
                include: {
                  user: {
                    select: {
                      id: true,
                      email: true,
                      firstName: true,
                      lastName: true,
                      phoneNumber: true
                    }
                  }
                }
              });
              enhancedNotification.addMoneyTransactionDetails = addMoneyTransaction;
            }
            break;
            
          case 'TRANSFER_MONEY':
            if (notification.transferMoneyTransactionId) {
              const transferMoneyTransaction = await prisma.transferMoneyTransaction.findUnique({
                where: { id: notification.transferMoneyTransactionId },
                include: {
                  user: {
                    select: {
                      id: true,
                      email: true,
                      firstName: true,
                      lastName: true,
                      phoneNumber: true
                    }
                  },
                  account: {
                    select: {
                      id: true,
                      accountHolderName: true,
                      accountNumber: true,
                      ifscCode: true
                    }
                  }
                }
              });
              enhancedNotification.transferMoneyTransactionDetails = transferMoneyTransaction;
            }
            break;
            
          case 'SYSTEM':
            // System notifications don't have additional details
            break;
            
          default:
            break;
        }
        
        return enhancedNotification;
      })
    );
    
    // Get total count for pagination
    const totalCount = await prisma.notification.count({ where });
    
    // Get total unread count
    const totalUnreadCount = await prisma.notification.count({
      where: {
        ...where,
        isRead: false
      }
    });

    res.status(200).json({
      success: true,
      data: {
        notifications: enhancedNotifications,
        totalUnreadCount,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          totalPages: Math.ceil(totalCount / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching all notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get notification statistics for admin dashboard
 * @route GET /api/notifications/admin/stats
 * @access Private (Admin only)
 */
const getNotificationStats = async (req, res) => {
  try {
    // Get counts by notification type
    const [
      totalNotifications,
      unreadNotifications,
      registrationNotifications,
      portalAccessNotifications,
      addMoneyNotifications,
      transferMoneyNotifications,
      systemNotifications
    ] = await Promise.all([
      prisma.notification.count(),
      prisma.notification.count({ where: { isRead: false } }),
      prisma.notification.count({ where: { type: 'REGISTRATION' } }),
      prisma.notification.count({ where: { type: 'PORTAL_ACCESS' } }),
      prisma.notification.count({ where: { type: 'ADD_MONEY' } }),
      prisma.notification.count({ where: { type: 'TRANSFER_MONEY' } }),
      prisma.notification.count({ where: { type: 'SYSTEM' } })
    ]);
    
    // Get counts by user
    const userNotificationCounts = await prisma.notification.groupBy({
      by: ['userId'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 5
    });
    
    // Get user details for top 5 users with most notifications
    const userIds = userNotificationCounts.map(item => item.userId);
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds }
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true
      }
    });
    
    // Combine user details with notification counts
    const topUsersWithNotifications = userNotificationCounts.map(item => {
      const user = users.find(u => u.id === item.userId);
      return {
        user,
        notificationCount: item._count.id
      };
    });

    res.status(200).json({
      success: true,
      data: {
        counts: {
          total: totalNotifications,
          unread: unreadNotifications,
          byType: {
            registration: registrationNotifications,
            portalAccess: portalAccessNotifications,
            addMoney: addMoneyNotifications,
            transferMoney: transferMoneyNotifications,
            system: systemNotifications
          }
        },
        topUsers: topUsersWithNotifications
      }
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
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

/**
 * Admin: Mark notification as read for any user
 * @route PUT /api/notifications/admin/:id/read
 * @access Private (Admin only)
 */
const adminMarkAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if notification exists
    const notification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Mark as read
    const updatedNotification = await Notification.markAsRead(id);

    res.status(200).json({
      success: true,
      message: 'Notification marked as read by admin',
      data: updatedNotification
    });
  } catch (error) {
    console.error('Error marking notification as read by admin:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Admin: Delete notification for any user
 * @route DELETE /api/notifications/admin/:id
 * @access Private (Admin only)
 */
const adminDeleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if notification exists
    const notification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Delete notification
    await Notification.delete(id);

    res.status(200).json({
      success: true,
      message: 'Notification deleted by admin'
    });
  } catch (error) {
    console.error('Error deleting notification by admin:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get unread notification count for the authenticated user
 * @route GET /api/notifications/unread-count
 * @access Private (User/Admin)
 */
const getUnreadNotificationCount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get unread count
    const unreadCount = await Notification.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      data: {
        unreadCount
      }
    });
  } catch (error) {
    console.error('Error fetching unread notification count:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get total unread notification count for admin dashboard
 * @route GET /api/notifications/admin/unread-count
 * @access Private (Admin only)
 */
const getTotalUnreadCount = async (req, res) => {
  try {
    // Get total unread count
    const totalUnreadCount = await prisma.notification.count({
      where: {
        isRead: false
      }
    });
    
    // Get unread counts by type
    const typeUnreadCounts = await Promise.all([
      prisma.notification.count({ where: { type: 'REGISTRATION', isRead: false } }),
      prisma.notification.count({ where: { type: 'PORTAL_ACCESS', isRead: false } }),
      prisma.notification.count({ where: { type: 'ADD_MONEY', isRead: false } }),
      prisma.notification.count({ where: { type: 'TRANSFER_MONEY', isRead: false } }),
      prisma.notification.count({ where: { type: 'SYSTEM', isRead: false } })
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        totalUnreadCount,
        byType: {
          registration: typeUnreadCounts[0],
          portalAccess: typeUnreadCounts[1],
          addMoney: typeUnreadCounts[2],
          transferMoney: typeUnreadCounts[3],
          system: typeUnreadCounts[4]
        }
      }
    });
  } catch (error) {
    console.error('Error fetching total unread notification count:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
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
}; 