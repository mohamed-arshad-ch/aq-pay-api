const prisma = require('../config/database');

class PushToken {
  /**
   * Save or update a push token for a user
   * @param {string} userId - User ID
   * @param {string} token - Expo push notification token
   * @param {string} deviceInfo - Optional device information
   * @returns {Promise<object>} - Created or updated token
   */
  static async saveToken(userId, token, deviceInfo = null) {
    // Check if token already exists for the same user
    const existingToken = await prisma.pushToken.findFirst({
      where: { 
        token,
        userId
      }
    });

    if (existingToken) {
      // If token exists for the same user, update information
      return await prisma.pushToken.update({
        where: { id: existingToken.id },
        data: {
          deviceInfo: deviceInfo || existingToken.deviceInfo,
          isActive: true,
          updatedAt: new Date()
        }
      });
    }
    
    // Create new token
    return await prisma.pushToken.create({
      data: {
        userId,
        token,
        deviceInfo,
        isActive: true
      }
    });
  }
  
  /**
   * Get all active tokens for a user
   * @param {string} userId - User ID
   * @returns {Promise<array>} - Array of active tokens
   */
  static async getUserTokens(userId) {
    return await prisma.pushToken.findMany({
      where: {
        userId,
        isActive: true
      }
    });
  }
  
  /**
   * Deactivate a token for a specific user
   * @param {string} token - Expo push notification token
   * @param {string} userId - Optional user ID (if not provided, deactivates first matching token)
   * @returns {Promise<object>} - Updated token or null if not found
   */
  static async deactivateToken(token, userId = null) {
    const whereClause = { token };
    
    // If userId is provided, include it in the query
    if (userId) {
      whereClause.userId = userId;
    }
    
    const existingToken = await prisma.pushToken.findFirst({
      where: whereClause
    });
    
    if (!existingToken) {
      return null;
    }
    
    return await prisma.pushToken.update({
      where: { id: existingToken.id },
      data: {
        isActive: false
      }
    });
  }
  
  /**
   * Get all active tokens
   * @returns {Promise<array>} - Array of all active tokens
   */
  static async getAllActiveTokens() {
    return await prisma.pushToken.findMany({
      where: { isActive: true },
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
  }
}

module.exports = PushToken; 