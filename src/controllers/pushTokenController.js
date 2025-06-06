const PushToken = require('../models/PushToken');

/**
 * Save or update a push token for the authenticated user
 * @route POST /api/push-tokens
 * @access Private (User/Admin)
 */
const savePushToken = async (req, res) => {
  try {
    const { token, deviceInfo } = req.body;
    const userId = req.user.id;
    
    // Validate token
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Push token is required'
      });
    }
    
    // Save or update token
    const savedToken = await PushToken.saveToken(userId, token, deviceInfo);
    
    res.status(200).json({
      success: true,
      message: 'Push token saved successfully',
      data: savedToken
    });
  } catch (error) {
    console.error('Error saving push token:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get all push tokens for the authenticated user
 * @route GET /api/push-tokens/my-tokens
 * @access Private (User/Admin)
 */
const getMyPushTokens = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user tokens
    const tokens = await PushToken.getUserTokens(userId);
    
    res.status(200).json({
      success: true,
      data: {
        tokens,
        count: tokens.length
      }
    });
  } catch (error) {
    console.error('Error fetching push tokens:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Delete a push token (deactivate it)
 * @route DELETE /api/push-tokens
 * @access Private (User/Admin)
 */
const deletePushToken = async (req, res) => {
  try {
    const { token } = req.body;
    
    // Validate token
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Push token is required'
      });
    }
    
    // Deactivate token
    const deactivatedToken = await PushToken.deactivateToken(token);
    
    if (!deactivatedToken) {
      return res.status(404).json({
        success: false,
        message: 'Push token not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Push token deactivated successfully'
    });
  } catch (error) {
    console.error('Error deactivating push token:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get all active push tokens (Admin only)
 * @route GET /api/push-tokens/admin/all
 * @access Private (Admin only)
 */
const getAllPushTokens = async (req, res) => {
  try {
    // Get all active tokens
    const tokens = await PushToken.getAllActiveTokens();
    
    res.status(200).json({
      success: true,
      data: {
        tokens,
        count: tokens.length
      }
    });
  } catch (error) {
    console.error('Error fetching all push tokens:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  savePushToken,
  getMyPushTokens,
  deletePushToken,
  getAllPushTokens
}; 