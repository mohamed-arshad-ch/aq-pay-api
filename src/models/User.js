const prisma = require('../config/database');
const { hashPassword } = require('../utils/authUtils');

class User {
  /**
   * Create a new user
   * @param {object} userData - User data
   * @returns {Promise<object>} - Created user (without password)
   */
  static async create(userData) {
    const { email, password, firstName, lastName } = userData;
    
    // Hash the password
    const hashedPassword = await hashPassword(password);
    
    // Create user in database
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName: firstName?.trim() || null,
        lastName: lastName?.trim() || null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return user;
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @param {boolean} includePassword - Whether to include password in result
   * @returns {Promise<object|null>} - User object or null
   */
  static async findByEmail(email, includePassword = false) {
    const selectFields = {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      createdAt: true,
      updatedAt: true,
    };

    if (includePassword) {
      selectFields.password = true;
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: selectFields
    });

    return user;
  }

  /**
   * Find user by ID
   * @param {string} id - User ID
   * @returns {Promise<object|null>} - User object or null
   */
  static async findById(id) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return user;
  }

  /**
   * Update user by ID
   * @param {string} id - User ID
   * @param {object} updateData - Data to update
   * @returns {Promise<object>} - Updated user
   */
  static async updateById(id, updateData) {
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return user;
  }

  /**
   * Delete user by ID
   * @param {string} id - User ID
   * @returns {Promise<object>} - Deleted user
   */
  static async deleteById(id) {
    const user = await prisma.user.delete({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      }
    });

    return user;
  }

  /**
   * Check if email exists
   * @param {string} email - Email to check
   * @returns {Promise<boolean>} - True if email exists
   */
  static async emailExists(email) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true }
    });

    return !!user;
  }
}

module.exports = User; 