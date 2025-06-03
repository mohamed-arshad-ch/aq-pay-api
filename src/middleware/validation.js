const { isValidRole, USER_ROLES } = require('../utils/authUtils');

/**
 * Validation middleware for user registration
 */
function validateRegistration(req, res, next) {
  const { email, password, firstName, lastName, phoneNumber, role } = req.body;
  const errors = [];

  // Email validation
  if (!email) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Invalid email format');
  }

  // Password validation
  if (!password) {
    errors.push('Password is required');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one uppercase letter, one lowercase letter, and one number');
  }

  // Required name validation
  if (!firstName) {
    errors.push('First name is required');
  } else if (firstName.trim().length < 2) {
    errors.push('First name must be at least 2 characters long');
  }

  if (!lastName) {
    errors.push('Last name is required');
  } else if (lastName.trim().length < 2) {
    errors.push('Last name must be at least 2 characters long');
  }

  // Phone number validation
  if (!phoneNumber) {
    errors.push('Phone number is required');
  } else {
    // Remove all non-digit characters for validation
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (!/^[0-9]{10}$/.test(cleanPhone)) {
      errors.push('Phone number must be exactly 10 digits');
    }
  }

  // Role validation (optional, defaults to USER)
  if (role && !isValidRole(role)) {
    errors.push(`Invalid role. Must be one of: ${Object.values(USER_ROLES).join(', ')}`);
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors
    });
  }

  next();
}

/**
 * Validation middleware for user login
 */
function validateLogin(req, res, next) {
  const { email, password } = req.body;
  const errors = [];

  // Email validation
  if (!email) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Invalid email format');
  }

  // Password validation
  if (!password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors
    });
  }

  next();
}

/**
 * Validation middleware for profile update
 */
function validateProfileUpdate(req, res, next) {
  const { firstName, lastName, phoneNumber, role } = req.body;
  const errors = [];

  // Optional name validation
  if (firstName !== undefined) {
    if (typeof firstName !== 'string') {
      errors.push('First name must be a string');
    } else if (firstName.trim().length > 0 && firstName.trim().length < 2) {
      errors.push('First name must be at least 2 characters long');
    }
  }

  if (lastName !== undefined) {
    if (typeof lastName !== 'string') {
      errors.push('Last name must be a string');
    } else if (lastName.trim().length > 0 && lastName.trim().length < 2) {
      errors.push('Last name must be at least 2 characters long');
    }
  }

  // Optional phone number validation
  if (phoneNumber !== undefined) {
    if (phoneNumber !== null && typeof phoneNumber !== 'string') {
      errors.push('Phone number must be a string');
    } else if (phoneNumber) {
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      if (!/^[0-9]{10}$/.test(cleanPhone)) {
        errors.push('Phone number must be exactly 10 digits');
      }
    }
  }

  // Role validation (only allow if user is admin)
  if (role !== undefined) {
    if (!req.user || req.user.role !== USER_ROLES.ADMIN) {
      errors.push('Only admins can change user roles');
    } else if (!isValidRole(role)) {
      errors.push(`Invalid role. Must be one of: ${Object.values(USER_ROLES).join(', ')}`);
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors
    });
  }

  next();
}

/**
 * Validation middleware for admin registration (only admins can create other admins)
 */
function validateAdminRegistration(req, res, next) {
  const { role } = req.body;

  // If trying to create an admin, check if current user is admin
  if (role && role.toUpperCase() === USER_ROLES.ADMIN) {
    if (!req.user || req.user.role !== USER_ROLES.ADMIN) {
      return res.status(403).json({
        status: 'error',
        message: 'Only existing admins can create new admin accounts'
      });
    }
  }

  next();
}

/**
 * Validation middleware for pagination parameters
 */
function validatePagination(req, res, next) {
  const { page = 1, limit = 10 } = req.query;
  const errors = [];

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  if (isNaN(pageNum) || pageNum < 1) {
    errors.push('Page must be a positive integer');
  }

  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    errors.push('Limit must be a positive integer between 1 and 100');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors
    });
  }

  // Add parsed values to request
  req.pagination = {
    page: pageNum,
    limit: limitNum,
    skip: (pageNum - 1) * limitNum
  };

  next();
}

module.exports = {
  validateRegistration,
  validateLogin,
  validateProfileUpdate,
  validateAdminRegistration,
  validatePagination,
}; 