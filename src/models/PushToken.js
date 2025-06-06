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
    // Check if token already exists
    const existingToken = await prisma.pushToken.findUnique({
      where: { token }
    });

    if (existingToken) {
      // If token exists but belongs to a different user, update the userId
      if (existingToken.userId !== userId) {
        // Deactivate the old token first
        await prisma.pushToken.update({
          where: { id: existingToken.id },
          data: { isActive: false }
        });
        
        // Create a new token for the current user
        return await prisma.pushToken.create({
          data: {
            userId,
            token,
            deviceInfo,
            isActive: true
          }
        });
      }
      
      // If token exists for the same user, update other information
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
   * Deactivate a token
   * @param {string} token - Expo push notification token
   * @returns {Promise<object>} - Updated token or null if not found
   */
  static async deactivateToken(token) {
    const existingToken = await prisma.pushToken.findUnique({
      where: { token }
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