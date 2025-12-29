const { verifyToken, hasRole, isAdmin, USER_ROLES } = require('../utils/authUtils');
const prisma = require('../config/database');

/**
 * Middleware to authenticate JWT tokens
 */
async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Access token required'
      });
    }

    // Verify the token
    const decoded = verifyToken(token);

    // Check if user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        userRoleNumber: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Check if the role in token matches current user role
    if (user.role !== decoded.role) {
      return res.status(401).json({
        status: 'error',
        message: 'Token role mismatch. Please login again.'
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token'
    });
  }
}

/**
 * Middleware to require specific role
 * @param {string} requiredRole - Required role (USER or ADMIN)
 * @returns {Function} - Express middleware function
 */
function requireRole(requiredRole) {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Authentication required'
        });
      }

      if (!hasRole(req.user.role, requiredRole)) {
        return res.status(403).json({
          status: 'error',
          message: `Access denied. ${requiredRole} role required.`
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Authorization error'
      });
    }
  };
}

/**
 * Middleware to require admin role
 */
function requireAdmin(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    if (!isAdmin(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Admin role required.'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Authorization error'
    });
  }
}

/**
 * Middleware to allow only the user themselves or admin
 * Useful for profile operations where users can access their own data
 * @param {string} userIdParam - The request parameter name that contains the user ID (default: 'userId')
 */
function requireSelfOrAdmin(userIdParam = 'userId') {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Authentication required'
        });
      }

      const targetUserId = req.params[userIdParam] || req.user.id;

      // Allow if user is admin or accessing their own data
      if (isAdmin(req.user.role) || req.user.id === targetUserId) {
        next();
      } else {
        return res.status(403).json({
          status: 'error',
          message: 'Access denied. You can only access your own data.'
        });
      }
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Authorization error'
      });
    }
  };
}

/**
 * Optional authentication middleware
 * Adds user to request if token is valid, but doesn't fail if no token
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = verifyToken(token);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          userRoleNumber: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (user && user.role === decoded.role) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
}

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireSelfOrAdmin,
  optionalAuth,
}; 