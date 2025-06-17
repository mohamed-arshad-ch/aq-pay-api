const MPin = require('../models/MPin');

/**
 * Create MPin for authenticated user
 * @route POST /api/mpin/create
 * @access Private (User only, not Admin)
 */
const createMPin = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { pin } = req.body;

    // Check if user is not admin
    if (userRole === 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admins cannot create MPin'
      });
    }

    // Validate PIN
    if (!pin) {
      return res.status(400).json({
        success: false,
        message: 'PIN is required'
      });
    }

    if (!/^\d{6}$/.test(pin)) {
      return res.status(400).json({
        success: false,
        message: 'PIN must be exactly 6 digits'
      });
    }

    // Check if user already has an MPin
    const existingMPin = await MPin.exists(userId);
    if (existingMPin) {
      return res.status(400).json({
        success: false,
        message: 'MPin already exists. Use update endpoint to change it.'
      });
    }

    // Create MPin
    const mPin = await MPin.create(userId, pin);

    res.status(201).json({
      success: true,
      message: 'MPin created successfully',
      data: {
        id: mPin.id,
        userId: mPin.userId,
        isActive: mPin.isActive,
        createdAt: mPin.createdAt,
        user: mPin.user
      }
    });

  } catch (error) {
    console.error('Error creating MPin:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

/**
 * Update MPin for authenticated user
 * @route PUT /api/mpin/update
 * @access Private (User only, not Admin)
 */
const updateMPin = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { currentPin, newPin } = req.body;

    // Check if user is not admin
    if (userRole === 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admins cannot update MPin'
      });
    }

    // Validate inputs
    if (!currentPin || !newPin) {
      return res.status(400).json({
        success: false,
        message: 'Current PIN and new PIN are required'
      });
    }

    if (!/^\d{6}$/.test(newPin)) {
      return res.status(400).json({
        success: false,
        message: 'New PIN must be exactly 6 digits'
      });
    }

    // Check if user has an MPin
    const hasMPin = await MPin.exists(userId);
    if (!hasMPin) {
      return res.status(404).json({
        success: false,
        message: 'MPin not found. Please create MPin first.',
        action: 'CREATE_MPIN'
      });
    }

    // Verify current PIN
    const isCurrentPinValid = await MPin.verify(userId, currentPin);
    if (!isCurrentPinValid) {
      return res.status(400).json({
        success: false,
        message: 'Current PIN is incorrect'
      });
    }

    // Update MPin
    const updatedMPin = await MPin.update(userId, newPin);

    res.status(200).json({
      success: true,
      message: 'MPin updated successfully',
      data: {
        id: updatedMPin.id,
        userId: updatedMPin.userId,
        isActive: updatedMPin.isActive,
        updatedAt: updatedMPin.updatedAt,
        user: updatedMPin.user
      }
    });

  } catch (error) {
    console.error('Error updating MPin:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

/**
 * Verify MPin for authenticated user
 * @route POST /api/mpin/verify
 * @access Private (User only, not Admin)
 */
const verifyMPin = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { pin } = req.body;

    // Check if user is not admin
    if (userRole === 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admins cannot use MPin verification'
      });
    }

    // Validate PIN
    if (!pin) {
      return res.status(400).json({
        success: false,
        message: 'PIN is required'
      });
    }

    // Check if user has an MPin
    const hasMPin = await MPin.exists(userId);
    if (!hasMPin) {
      return res.status(404).json({
        success: false,
        message: 'MPin not found. Please create MPin in settings.',
        action: 'CREATE_MPIN_IN_SETTINGS'
      });
    }

    // Verify PIN
    const isValid = await MPin.verify(userId, pin);

    if (isValid) {
      res.status(200).json({
        success: true,
        message: 'MPin verified successfully',
        data: {
          verified: true,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid PIN',
        data: {
          verified: false
        }
      });
    }

  } catch (error) {
    console.error('Error verifying MPin:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get MPin status for authenticated user
 * @route GET /api/mpin/status
 * @access Private (User only, not Admin)
 */
const getMPinStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if user is not admin
    if (userRole === 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admins cannot access MPin status'
      });
    }

    // Get MPin details
    const mPin = await MPin.getByUserId(userId);

    if (mPin) {
      res.status(200).json({
        success: true,
        message: 'MPin status retrieved successfully',
        data: {
          hasMPin: true,
          isActive: mPin.isActive,
          createdAt: mPin.createdAt,
          updatedAt: mPin.updatedAt,
          lastUsedAt: mPin.lastUsedAt
        }
      });
    } else {
      res.status(200).json({
        success: true,
        message: 'No MPin found',
        data: {
          hasMPin: false,
          action: 'CREATE_MPIN_IN_SETTINGS'
        }
      });
    }

  } catch (error) {
    console.error('Error getting MPin status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  createMPin,
  updateMPin,
  verifyMPin,
  getMPinStatus
}; 