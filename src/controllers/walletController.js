const Wallet = require('../models/Wallet');

/**
 * Get wallet balance for the authenticated user
 * @route GET /api/wallet/balance
 * @access Private (User role only)
 */
async function getWalletBalance(req, res) {
  try {
    const userId = req.user.id;

    // Find user's wallet
    const wallet = await Wallet.findByUserId(userId);
    
    if (!wallet) {
      return res.status(404).json({
        status: 'error',
        message: 'Wallet not found. Please contact administrator.'
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Wallet balance retrieved successfully',
      data: {
        wallet: {
          id: wallet.id,
          balance: parseFloat(wallet.balance),
          createdAt: wallet.createdAt,
          updatedAt: wallet.updatedAt
        },
        user: {
          id: wallet.user.id,
          email: wallet.user.email,
          firstName: wallet.user.firstName,
          lastName: wallet.user.lastName
        }
      }
    });

  } catch (error) {
    console.error('Get wallet balance error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
}

/**
 * Get wallet details for the authenticated user
 * @route GET /api/wallet
 * @access Private (User role only)
 */
async function getWallet(req, res) {
  try {
    const userId = req.user.id;

    // Find user's wallet
    const wallet = await Wallet.findByUserId(userId);
    
    if (!wallet) {
      return res.status(404).json({
        status: 'error',
        message: 'Wallet not found. Please contact administrator.'
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Wallet details retrieved successfully',
      data: {
        wallet
      }
    });

  } catch (error) {
    console.error('Get wallet error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
}

module.exports = {
  getWalletBalance,
  getWallet
}; 