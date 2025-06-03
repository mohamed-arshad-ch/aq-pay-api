const prisma = require('../config/database');

class Wallet {
  /**
   * Create a new wallet for a user
   * @param {string} userId - User ID
   * @returns {Promise<object>} - Created wallet
   */
  static async create(userId) {
    const wallet = await prisma.wallet.create({
      data: {
        userId,
        balance: 0.00
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            role: true
          }
        }
      }
    });

    return wallet;
  }

  /**
   * Find wallet by user ID
   * @param {string} userId - User ID
   * @returns {Promise<object|null>} - Wallet object or null
   */
  static async findByUserId(userId) {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            role: true
          }
        }
      }
    });

    return wallet;
  }

  /**
   * Update wallet balance
   * @param {string} userId - User ID
   * @param {number} newBalance - New balance amount
   * @returns {Promise<object>} - Updated wallet
   */
  static async updateBalance(userId, newBalance) {
    const wallet = await prisma.wallet.update({
      where: { userId },
      data: { balance: newBalance },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            role: true
          }
        }
      }
    });

    return wallet;
  }

  /**
   * Check if wallet exists for user
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} - True if wallet exists
   */
  static async exists(userId) {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      select: { id: true }
    });

    return !!wallet;
  }

  /**
   * Get wallet balance for user
   * @param {string} userId - User ID
   * @returns {Promise<number|null>} - Wallet balance or null if not found
   */
  static async getBalance(userId) {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      select: { balance: true }
    });

    return wallet ? parseFloat(wallet.balance) : null;
  }

  /**
   * Add amount to wallet balance
   * @param {string} userId - User ID
   * @param {number} amount - Amount to add
   * @returns {Promise<object>} - Updated wallet
   */
  static async addBalance(userId, amount) {
    const currentWallet = await this.findByUserId(userId);
    if (!currentWallet) {
      throw new Error('Wallet not found');
    }

    const currentBalance = parseFloat(currentWallet.balance);
    const newBalance = currentBalance + amount;

    return await this.updateBalance(userId, newBalance);
  }

  /**
   * Subtract amount from wallet balance
   * @param {string} userId - User ID
   * @param {number} amount - Amount to subtract
   * @returns {Promise<object>} - Updated wallet
   */
  static async subtractBalance(userId, amount) {
    const currentWallet = await this.findByUserId(userId);
    if (!currentWallet) {
      throw new Error('Wallet not found');
    }

    const currentBalance = parseFloat(currentWallet.balance);
    if (currentBalance < amount) {
      throw new Error('Insufficient balance');
    }

    const newBalance = currentBalance - amount;
    return await this.updateBalance(userId, newBalance);
  }
}

module.exports = Wallet; 