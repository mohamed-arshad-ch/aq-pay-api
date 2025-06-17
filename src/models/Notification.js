const prisma = require('../config/database');

class Notification {
  /**
   * Create a new notification
   * @param {object} data - Notification data
   * @returns {Promise<object>} - Created notification
   */
  static async create(data) {
    const { 
      userId, 
      title, 
      message, 
      type, 
      relatedId = null,
      registrationUserId = null,
      portalAccessUserId = null,
      addMoneyTransactionId = null,
      transferMoneyTransactionId = null
    } = data;
    
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        relatedId,
        registrationUserId,
        portalAccessUserId,
        addMoneyTransactionId,
        transferMoneyTransactionId,
        isRead: false
      }
    });

    return notification;
  }

  /**
   * Create registration notification
   * @param {string} userId - User ID
   * @returns {Promise<object>} - Created notification
   */
  static async createRegistrationNotification(userId) {
    return await this.create({
      userId,
      title: 'Registration Successful',
      message: 'Your registration was successful. Please wait for admin approval to access the portal.',
      type: 'REGISTRATION',
      registrationUserId: userId  // Store the registered user ID
    });
  }

  /**
   * Create portal access notification
   * @param {string} userId - User ID
   * @param {boolean} approved - Whether access was approved
   * @returns {Promise<object>} - Created notification
   */
  static async createPortalAccessNotification(userId, approved) {
    return await this.create({
      userId,
      title: approved ? 'Portal Access Approved' : 'Portal Access Denied',
      message: approved 
        ? 'Your request for portal access has been approved. You can now login and use the platform.' 
        : 'Your request for portal access has been denied. Please contact support for more information.',
      type: 'PORTAL_ACCESS',
      portalAccessUserId: userId  // Store the user ID whose access was approved/denied
    });
  }

  /**
   * Create add money transaction notification
   * @param {string} userId - User ID
   * @param {string} status - Transaction status
   * @param {number} amount - Transaction amount
   * @param {string} addMoneyTransactionId - Add Money Transaction ID
   * @returns {Promise<object>} - Created notification
   */
  static async createAddMoneyNotification(userId, status, amount, addMoneyTransactionId) {
    let title, message;
    
    switch (status) {
      case 'PENDING':
        title = 'Add Money Request Received';
        message = `Your request to add ₹${amount} to your wallet has been received and is pending approval.`;
        break;
      case 'PROCESSING':
        title = 'Add Money Request Processing';
        message = `Your request to add ₹${amount} to your wallet is now being processed.`;
        break;
      case 'COMPLETED':
        title = 'Money Added Successfully';
        message = `₹${amount} has been successfully added to your wallet.`;
        break;
      case 'REJECTED':
        title = 'Add Money Request Rejected';
        message = `Your request to add ₹${amount} to your wallet has been rejected. Please contact support for assistance.`;
        break;
      default:
        title = 'Add Money Status Update';
        message = `Your add money request for ₹${amount} status has been updated to ${status}.`;
    }

    return await this.create({
      userId,
      title,
      message,
      type: 'ADD_MONEY',
      addMoneyTransactionId: addMoneyTransactionId  // Store the add money transaction ID
    });
  }

  /**
   * Create transfer money transaction notification
   * @param {string} userId - User ID
   * @param {string} status - Transaction status
   * @param {number} amount - Transaction amount
   * @param {string} accountNumber - Account number (last 4 digits)
   * @param {string} transferMoneyTransactionId - Transfer Money Transaction ID
   * @returns {Promise<object>} - Created notification
   */
  static async createTransferMoneyNotification(userId, status, amount, accountNumber, transferMoneyTransactionId) {
    // Mask account number to show only last 4 digits
    const maskedAccount = accountNumber.slice(-4).padStart(accountNumber.length, '*');
    let title, message;
    
    switch (status) {
      case 'PENDING':
        title = 'Transfer Request Received';
        message = `Your request to transfer ₹${amount} to account ending with ${maskedAccount} has been received and is pending approval.`;
        break;
      case 'PROCESSING':
        title = 'Transfer Request Processing';
        message = `Your request to transfer ₹${amount} to account ending with ${maskedAccount} is now being processed.`;
        break;
      case 'COMPLETED':
        title = 'Money Transferred Successfully';
        message = `₹${amount} has been successfully transferred to account ending with ${maskedAccount}.`;
        break;
      case 'REJECTED':
        title = 'Transfer Request Rejected';
        message = `Your request to transfer ₹${amount} to account ending with ${maskedAccount} has been rejected. Please contact support for assistance.`;
        break;
      default:
        title = 'Transfer Status Update';
        message = `Your transfer request for ₹${amount} to account ending with ${maskedAccount} status has been updated to ${status}.`;
    }

    return await this.create({
      userId,
      title,
      message,
      type: 'TRANSFER_MONEY',
      transferMoneyTransactionId: transferMoneyTransactionId  // Store the transfer money transaction ID
    });
  }

  /**
   * Create system notification
   * @param {string} userId - User ID
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   * @returns {Promise<object>} - Created notification
   */
  static async createSystemNotification(userId, title, message) {
    return await this.create({
      userId,
      title,
      message,
      type: 'SYSTEM'
    });
  }

  /**
   * Get notifications for a user
   * @param {string} userId - User ID
   * @param {boolean} unreadOnly - Whether to get only unread notifications
   * @param {number} skip - Number of records to skip
   * @param {number} take - Number of records to take
   * @returns {Promise<object[]>} - Array of notifications
   */
  static async getForUser(userId, unreadOnly = false, skip = 0, take = 10) {
    const whereCondition = { userId };
    
    if (unreadOnly) {
      whereCondition.isRead = false;
    }

    const notifications = await prisma.notification.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
      skip,
      take
    });

    return notifications;
  }

  /**
   * Get count of unread notifications for a user
   * @param {string} userId - User ID
   * @returns {Promise<number>} - Count of unread notifications
   */
  static async getUnreadCount(userId) {
    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false
      }
    });

    return count;
  }

  /**
   * Mark notification as read
   * @param {string} id - Notification ID
   * @returns {Promise<object>} - Updated notification
   */
  static async markAsRead(id) {
    const notification = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });

    return notification;
  }

  /**
   * Mark all notifications as read for a user
   * @param {string} userId - User ID
   * @returns {Promise<object>} - Result
   */
  static async markAllAsRead(userId) {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    return result;
  }

  /**
   * Delete a notification
   * @param {string} id - Notification ID
   * @returns {Promise<object>} - Deleted notification
   */
  static async delete(id) {
    const notification = await prisma.notification.delete({
      where: { id }
    });

    return notification;
  }
}

module.exports = Notification; 