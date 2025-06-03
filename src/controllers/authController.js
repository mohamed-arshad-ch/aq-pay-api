const User = require('../models/User');
const { comparePassword, generateToken } = require('../utils/authUtils');

/**
 * Register a new user
 */
async function register(req, res, next) {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        status: 'error',
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName
    });

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email
    });

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user,
        token
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

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email
    });

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token
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
    const { firstName, lastName } = req.body;
    const userId = req.user.id;

    // Prepare update data
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName?.trim() || null;
    if (lastName !== undefined) updateData.lastName = lastName?.trim() || null;

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

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  logout,
}; 