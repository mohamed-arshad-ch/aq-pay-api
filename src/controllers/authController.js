const User = require('../models/User');
const Wallet = require('../models/Wallet');
const { comparePassword, generateToken, USER_ROLES, isAdmin } = require('../utils/authUtils');

/**
 * Register a new user
 */
async function register(req, res, next) {
  try {
    const { email, password, firstName, lastName, phoneNumber, role } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !phoneNumber) {
      return res.status(400).json({
        status: 'error',
        message: 'Email, password, first name, last name, and phone number are required'
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a valid email address'
      });
    }

    // Basic phone number validation (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\D/g, ''))) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a valid 10-digit phone number'
      });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        status: 'error',
        message: 'User with this email already exists'
      });
    }

    // Default role to USER if not provided or if non-admin tries to set role
    let userRole = USER_ROLES.USER;
    if (role) {
      // Only allow setting role if current user is admin (for admin-created accounts)
      if (req.user && isAdmin(req.user.role)) {
        userRole = role.toUpperCase();
      } else if (!req.user) {
        // Public registration defaults to USER
        userRole = USER_ROLES.USER;
      }
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      role: userRole
    });

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully. Please wait for administrator approval to access the portal.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          role: user.role,
          isPortalAccess: user.isPortalAccess,
          createdAt: user.createdAt
        }
      }
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Login user
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and password are required'
      });
    }

    // Find user by email (include password for verification)
    const user = await User.findByEmail(email, true);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Check if user has portal access (only for USER role)
    if (user.role === USER_ROLES.USER && !user.isPortalAccess) {
      return res.status(403).json({
        status: 'error',
        message: 'Portal access not approved. Please contact administrator for access approval.'
      });
    }

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;

    // Generate JWT token with role
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token,
        role: user.role // Include role in response for frontend
      }
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Get user profile (protected route)
 */
async function getProfile(req, res, next) {
  try {
    // User is already attached to req by auth middleware
    res.status(200).json({
      status: 'success',
      message: 'Profile retrieved successfully',
      data: {
        user: req.user
      }
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Update user profile (protected route)
 */
async function updateProfile(req, res, next) {
  try {
    const { firstName, lastName, phoneNumber, role } = req.body;
    const userId = req.user.id;

    // Prepare update data
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName?.trim() || null;
    if (lastName !== undefined) updateData.lastName = lastName?.trim() || null;
    
    // Phone number validation and update
    if (phoneNumber !== undefined) {
      if (phoneNumber) {
        const cleanPhone = phoneNumber.replace(/\D/g, '');
        if (!/^[0-9]{10}$/.test(cleanPhone)) {
          return res.status(400).json({
            status: 'error',
            message: 'Phone number must be exactly 10 digits'
          });
        }
        updateData.phoneNumber = phoneNumber.trim();
      } else {
        updateData.phoneNumber = null;
      }
    }
    
    // Only admins can update roles
    if (role !== undefined && isAdmin(req.user.role)) {
      updateData.role = role.toUpperCase();
    }

    // Update user
    const updatedUser = await User.updateById(userId, updateData);

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        user: updatedUser
      }
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Get all users (admin only)
 */
async function getAllUsers(req, res, next) {
  try {
    const { role } = req.query;
    const { skip, limit } = req.pagination;

    // Get users with optional role filter
    const users = await User.findAll(role, skip, limit);
    const totalUsers = await User.count(role);

    res.status(200).json({
      status: 'success',
      message: 'Users retrieved successfully',
      data: {
        users,
        pagination: {
          total: totalUsers,
          page: req.pagination.page,
          limit: req.pagination.limit,
          pages: Math.ceil(totalUsers / limit)
        }
      }
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Get user by ID (admin only or self)
 */
async function getUserById(req, res, next) {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'User retrieved successfully',
      data: {
        user
      }
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Update user by ID (admin only)
 */
async function updateUserById(req, res, next) {
  try {
    const { userId } = req.params;
    const { firstName, lastName, role } = req.body;

    // Check if user exists
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Prepare update data
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName?.trim() || null;
    if (lastName !== undefined) updateData.lastName = lastName?.trim() || null;
    if (role !== undefined) updateData.role = role.toUpperCase();

    // Update user
    const updatedUser = await User.updateById(userId, updateData);

    res.status(200).json({
      status: 'success',
      message: 'User updated successfully',
      data: {
        user: updatedUser
      }
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Delete user by ID (admin only)
 */
async function deleteUserById(req, res, next) {
  try {
    const { userId } = req.params;

    // Check if user exists
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (userId === req.user.id) {
      return res.status(400).json({
        status: 'error',
        message: 'You cannot delete your own account'
      });
    }

    // Delete user
    const deletedUser = await User.deleteById(userId);

    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully',
      data: {
        user: deletedUser
      }
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Logout user (client-side token invalidation)
 */
async function logout(req, res, next) {
  try {
    // In a JWT-based auth system, logout is typically handled client-side
    // by removing the token from storage. Server-side logout would require
    // token blacklisting, which can be implemented if needed.
    
    res.status(200).json({
      status: 'success',
      message: 'Logout successful. Please remove the token from your client.'
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Get current user role and permissions
 */
async function getRole(req, res, next) {
  try {
    res.status(200).json({
      status: 'success',
      message: 'Role retrieved successfully',
      data: {
        role: req.user.role,
        permissions: {
          canManageUsers: isAdmin(req.user.role),
          canCreateAdmin: isAdmin(req.user.role),
          canDeleteUsers: isAdmin(req.user.role),
          canApprovePortalAccess: isAdmin(req.user.role)
        }
      }
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Get users with pending portal access (admin only)
 */
async function getPendingPortalAccess(req, res, next) {
  try {
    const { skip, limit } = req.pagination;

    // Get users with pending portal access
    const users = await User.findPendingPortalAccess(skip, limit);
    const totalUsers = await User.countPendingPortalAccess();

    res.status(200).json({
      status: 'success',
      message: 'Pending portal access users retrieved successfully',
      data: {
        users,
        pagination: {
          total: totalUsers,
          page: req.pagination.page,
          limit: req.pagination.limit,
          pages: Math.ceil(totalUsers / limit)
        }
      }
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Approve or deny portal access for a user (admin only)
 */
async function updatePortalAccess(req, res, next) {
  try {
    const { userId } = req.params;
    const { isPortalAccess } = req.body;

    // Validate input
    if (typeof isPortalAccess !== 'boolean') {
      return res.status(400).json({
        status: 'error',
        message: 'isPortalAccess must be a boolean value'
      });
    }

    // Check if user exists
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Check if user is a regular user (not admin)
    if (existingUser.role !== USER_ROLES.USER) {
      return res.status(400).json({
        status: 'error',
        message: 'Portal access can only be managed for users with USER role'
      });
    }

    // Update portal access
    const updatedUser = await User.updatePortalAccess(userId, isPortalAccess);

    // If portal access is approved and user doesn't have a wallet, create one
    if (isPortalAccess) {
      const walletExists = await Wallet.exists(userId);
      if (!walletExists) {
        try {
          await Wallet.create(userId);
          console.log(`Wallet created for user ${userId} after portal access approval`);
        } catch (walletError) {
          console.error('Error creating wallet:', walletError);
          // Don't fail the portal access approval if wallet creation fails
          // Just log the error and continue
        }
      }
    }

    const action = isPortalAccess ? 'approved' : 'denied';
    res.status(200).json({
      status: 'success',
      message: `Portal access ${action} successfully${isPortalAccess ? '. Wallet has been created.' : ''}`,
      data: {
        user: updatedUser
      }
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Bulk approve portal access for multiple users (admin only)
 */
async function bulkApprovePortalAccess(req, res, next) {
  try {
    const { userIds, isPortalAccess = true } = req.body;

    // Validate input
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'userIds must be a non-empty array'
      });
    }

    if (typeof isPortalAccess !== 'boolean') {
      return res.status(400).json({
        status: 'error',
        message: 'isPortalAccess must be a boolean value'
      });
    }

    const updatedUsers = [];
    const errors = [];

    // Process each user
    for (const userId of userIds) {
      try {
        const existingUser = await User.findById(userId);
        if (!existingUser) {
          errors.push(`User with ID ${userId} not found`);
          continue;
        }

        if (existingUser.role !== USER_ROLES.USER) {
          errors.push(`User ${existingUser.email} is not a regular user`);
          continue;
        }

        const updatedUser = await User.updatePortalAccess(userId, isPortalAccess);
        
        // If portal access is approved, create wallet if it doesn't exist
        if (isPortalAccess) {
          const walletExists = await Wallet.exists(userId);
          if (!walletExists) {
            try {
              await Wallet.create(userId);
              console.log(`Wallet created for user ${userId} during bulk approval`);
            } catch (walletError) {
              console.error(`Error creating wallet for user ${userId}:`, walletError);
              // Don't fail the approval, just log the error
            }
          }
        }
        
        updatedUsers.push(updatedUser);
      } catch (error) {
        errors.push(`Error updating user ${userId}: ${error.message}`);
      }
    }

    const action = isPortalAccess ? 'approved' : 'denied';
    res.status(200).json({
      status: 'success',
      message: `Bulk portal access ${action} completed${isPortalAccess ? '. Wallets have been created for approved users.' : ''}`,
      data: {
        updatedUsers,
        totalUpdated: updatedUsers.length,
        totalRequested: userIds.length,
        errors: errors.length > 0 ? errors : null
      }
    });

  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  logout,
  getRole,
  getPendingPortalAccess,
  updatePortalAccess,
  bulkApprovePortalAccess,
}; 