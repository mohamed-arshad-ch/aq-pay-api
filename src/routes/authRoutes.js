const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { 
  validateRegistration, 
  validateLogin, 
  validateProfileUpdate,
  validateAdminRegistration,
  validatePagination 
} = require('../middleware/validation');
const { 
  authenticateToken, 
  requireAdmin, 
  requireSelfOrAdmin,
  optionalAuth 
} = require('../middleware/auth');

// Public routes
router.post('/register', validateRegistration, authController.register);
router.post('/login', validateLogin, authController.login);

// Protected routes (require authentication)
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, validateProfileUpdate, authController.updateProfile);
router.post('/logout', authenticateToken, authController.logout);
router.get('/role', authenticateToken, authController.getRole);

// Admin-only routes for user management
router.get('/users', 
  authenticateToken, 
  requireAdmin, 
  validatePagination, 
  authController.getAllUsers
);

router.get('/users/:userId', 
  authenticateToken, 
  requireSelfOrAdmin('userId'), 
  authController.getUserById
);

router.put('/users/:userId', 
  authenticateToken, 
  requireAdmin, 
  validateProfileUpdate, 
  authController.updateUserById
);

router.delete('/users/:userId', 
  authenticateToken, 
  requireAdmin, 
  authController.deleteUserById
);

// Admin registration route (only admins can create other admins)
router.post('/admin/register', 
  authenticateToken, 
  requireAdmin, 
  validateRegistration, 
  validateAdminRegistration, 
  authController.register
);

// Portal access management routes (admin only)
router.get('/pending-portal-access', 
  authenticateToken, 
  requireAdmin, 
  validatePagination, 
  authController.getPendingPortalAccess
);

router.put('/users/:userId/portal-access', 
  authenticateToken, 
  requireAdmin, 
  authController.updatePortalAccess
);

router.post('/bulk-approve-portal-access', 
  authenticateToken, 
  requireAdmin, 
  authController.bulkApprovePortalAccess
);

module.exports = router; 