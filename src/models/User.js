const prisma = require('../config/database');
const { hashPassword } = require('../utils/authUtils');

class User {
  /**
   * Create a new user
   * @param {object} userData - User data
   * @returns {Promise<object>} - Created user (without password)
   */
  static async create(userData) {
    const { email, password, firstName, lastName, phoneNumber, role = 'USER' } = userData;

    // Hash the password
    const hashedPassword = await hashPassword(password);

    let nextUserRoleNumber;
    if (userData.userRoleNumber) {
      nextUserRoleNumber = userData.userRoleNumber;
    } else {
      // Get the highest userRoleNumber to increment
      const lastUser = await prisma.user.findFirst({
        orderBy: { userRoleNumber: 'desc' },
        select: { userRoleNumber: true }
      });
      nextUserRoleNumber = lastUser ? (lastUser.userRoleNumber + 1) : 1001;
    }

    // Create user in database
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName: firstName?.trim() || null,
        lastName: lastName?.trim() || null,
        phoneNumber: phoneNumber?.trim() || null,
        userRoleNumber: nextUserRoleNumber,
        role: role.toUpperCase(), // Ensure role is uppercase
        isPortalAccess: false, // Default to false for new registrations
      },
      select: {
        id: true,
        userRoleNumber: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        role: true,
        isPortalAccess: true,
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
      userRoleNumber: true,
      email: true,
      firstName: true,
      lastName: true,
      phoneNumber: true,
      role: true,
      isPortalAccess: true,
      createdAt: true,
      updatedAt: true,
      wallet: {
        select: {
          id: true,
          balance: true,
          createdAt: true,
          updatedAt: true
        }
      }
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
        userRoleNumber: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        role: true,
        isPortalAccess: true,
        createdAt: true,
        updatedAt: true,
        wallet: {
          select: {
            id: true,
            balance: true,
            createdAt: true,
            updatedAt: true
          }
        }
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
    // If role is being updated, ensure it's uppercase
    if (updateData.role) {
      updateData.role = updateData.role.toUpperCase();
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        userRoleNumber: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        role: true,
        isPortalAccess: true,
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
        userRoleNumber: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        role: true,
        isPortalAccess: true,
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

  /**
   * Find all users with role filter
   * @param {string} role - Role to filter by (optional)
   * @param {number} skip - Number of records to skip
   * @param {number} take - Number of records to take
   * @returns {Promise<object[]>} - Array of users
   */
  static async findAll(role = null, skip = 0, take = 10) {
    const whereCondition = role ? { role: role.toUpperCase() } : {};

    const users = await prisma.user.findMany({
      where: whereCondition,
      select: {
        id: true,
        userRoleNumber: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        role: true,
        isPortalAccess: true,
        createdAt: true,
        updatedAt: true,
      },
      skip,
      take,
      orderBy: {
        createdAt: 'desc'
      }
    });

    return users;
  }

  /**
   * Count users by role
   * @param {string} role - Role to count (optional)
   * @returns {Promise<number>} - Count of users
   */
  static async count(role = null) {
    const whereCondition = role ? { role: role.toUpperCase() } : {};

    const count = await prisma.user.count({
      where: whereCondition
    });

    return count;
  }

  /**
   * Update portal access for a user
   * @param {string} id - User ID
   * @param {boolean} isPortalAccess - Portal access status
   * @returns {Promise<object>} - Updated user
   */
  static async updatePortalAccess(id, isPortalAccess) {
    const user = await prisma.user.update({
      where: { id },
      data: { isPortalAccess },
      select: {
        id: true,
        userRoleNumber: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        role: true,
        isPortalAccess: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return user;
  }

  /**
   * Get users with pending portal access (isPortalAccess = false)
   * @param {number} skip - Number of records to skip
   * @param {number} take - Number of records to take
   * @returns {Promise<object[]>} - Array of users with pending access
   */
  static async findPendingPortalAccess(skip = 0, take = 10) {
    const users = await prisma.user.findMany({
      where: {
        role: 'USER',
        isPortalAccess: false
      },
      select: {
        id: true,
        userRoleNumber: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        role: true,
        isPortalAccess: true,
        createdAt: true,
        updatedAt: true,
      },
      skip,
      take,
      orderBy: {
        createdAt: 'desc'
      }
    });

    return users;
  }

  /**
   * Count users with pending portal access
   * @returns {Promise<number>} - Count of users with pending access
   */
  static async countPendingPortalAccess() {
    const count = await prisma.user.count({
      where: {
        role: 'USER',
        isPortalAccess: false
      }
    });

    return count;
  }
}

module.exports = User; 