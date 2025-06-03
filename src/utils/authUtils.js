const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Valid user roles
const USER_ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN'
};

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
async function hashPassword(password) {
  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    return hashedPassword;
  } catch (error) {
    throw new Error('Error hashing password');
  }
}

/**
 * Compare a plain text password with a hashed password
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password from database
 * @returns {Promise<boolean>} - True if passwords match
 */
async function comparePassword(password, hashedPassword) {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    throw new Error('Error comparing passwords');
  }
}

/**
 * Generate a JWT token for a user
 * @param {object} payload - User data to include in token (should include userId, email, role)
 * @returns {string} - JWT token
 */
function generateToken(payload) {
  try {
    // Ensure the payload includes required fields
    const tokenPayload = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role || USER_ROLES.USER,
      iat: Math.floor(Date.now() / 1000), // Issued at
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
    return token;
  } catch (error) {
    throw new Error('Error generating token');
  }
}

/**
 * Verify a JWT token
 * @param {string} token - JWT token to verify
 * @returns {object} - Decoded token payload
 */
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Check if a role is valid
 * @param {string} role - Role to validate
 * @returns {boolean} - True if role is valid
 */
function isValidRole(role) {
  return Object.values(USER_ROLES).includes(role?.toUpperCase());
}

/**
 * Check if user has required role
 * @param {string} userRole - User's current role
 * @param {string} requiredRole - Required role
 * @returns {boolean} - True if user has required role or higher
 */
function hasRole(userRole, requiredRole) {
  const roleHierarchy = {
    [USER_ROLES.USER]: 1,
    [USER_ROLES.ADMIN]: 2,
  };

  const userLevel = roleHierarchy[userRole?.toUpperCase()] || 0;
  const requiredLevel = roleHierarchy[requiredRole?.toUpperCase()] || 0;

  return userLevel >= requiredLevel;
}

/**
 * Check if user is admin
 * @param {string} userRole - User's role
 * @returns {boolean} - True if user is admin
 */
function isAdmin(userRole) {
  return userRole?.toUpperCase() === USER_ROLES.ADMIN;
}

/**
 * Check if user is regular user
 * @param {string} userRole - User's role
 * @returns {boolean} - True if user is regular user
 */
function isUser(userRole) {
  return userRole?.toUpperCase() === USER_ROLES.USER;
}

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  isValidRole,
  hasRole,
  isAdmin,
  isUser,
  USER_ROLES,
}; 