const prisma = require('../config/database');
const bcrypt = require('bcryptjs');

class MPin {
  /**
   * Create a new MPin for a user
   * @param {string} userId - User ID
   * @param {string} pin - 6-digit PIN (plain text)
   * @returns {Promise<object>} - Created MPin
   */
  static async create(userId, pin) {
    // Validate PIN format (6 digits)
    if (!/^\d{6}$/.test(pin)) {
      throw new Error('PIN must be exactly 6 digits');
    }

    // Hash the PIN
    const hashedPin = await bcrypt.hash(pin, 10);

    const mPin = await prisma.mPin.create({
      data: {
        userId,
        pin: hashedPin,
        isActive: true
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    return mPin;
  }

  /**
   * Update an existing MPin for a user
   * @param {string} userId - User ID
   * @param {string} newPin - New 6-digit PIN (plain text)
   * @returns {Promise<object>} - Updated MPin
   */
  static async update(userId, newPin) {
    // Validate PIN format (6 digits)
    if (!/^\d{6}$/.test(newPin)) {
      throw new Error('PIN must be exactly 6 digits');
    }

    // Hash the new PIN
    const hashedPin = await bcrypt.hash(newPin, 10);

    const updatedMPin = await prisma.mPin.update({
      where: { userId },
      data: {
        pin: hashedPin,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    return updatedMPin;
  }

  /**
   * Verify a PIN for a user
   * @param {string} userId - User ID
   * @param {string} pin - 6-digit PIN to verify (plain text)
   * @returns {Promise<boolean>} - True if PIN is correct
   */
  static async verify(userId, pin) {
    // Validate PIN format (6 digits)
    if (!/^\d{6}$/.test(pin)) {
      return false;
    }

    const mPin = await prisma.mPin.findUnique({
      where: { 
        userId,
        isActive: true
      }
    });

    if (!mPin) {
      return false;
    }

    // Compare the provided PIN with the hashed PIN
    const isValid = await bcrypt.compare(pin, mPin.pin);

    if (isValid) {
      // Update last used timestamp
      await prisma.mPin.update({
        where: { userId },
        data: { lastUsedAt: new Date() }
      });
    }

    return isValid;
  }

  /**
   * Check if a user has an MPin
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} - True if user has an active MPin
   */
  static async exists(userId) {
    const mPin = await prisma.mPin.findUnique({
      where: { 
        userId,
        isActive: true
      }
    });

    return !!mPin;
  }

  /**
   * Get MPin details for a user (without the actual PIN)
   * @param {string} userId - User ID
   * @returns {Promise<object|null>} - MPin details or null
   */
  static async getByUserId(userId) {
    const mPin = await prisma.mPin.findUnique({
      where: { userId },
      select: {
        id: true,
        userId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        lastUsedAt: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    return mPin;
  }

  /**
   * Deactivate MPin for a user
   * @param {string} userId - User ID
   * @returns {Promise<object>} - Updated MPin
   */
  static async deactivate(userId) {
    const updatedMPin = await prisma.mPin.update({
      where: { userId },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    });

    return updatedMPin;
  }
}

module.exports = MPin; 