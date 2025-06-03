const prisma = require('../config/database');

/**
 * Create a new account
 * @route POST /api/accounts
 * @access Private (User role only)
 */
async function createAccount(req, res) {
  try {
    const { accountHolderName, accountNumber, ifscCode } = req.body;
    const userId = req.user.id;

    // Validation
    if (!accountHolderName || !accountNumber || !ifscCode) {
      return res.status(400).json({
        status: 'error',
        message: 'Account holder name, account number, and IFSC code are required'
      });
    }

    // Validate IFSC code format (basic validation)
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(ifscCode.toUpperCase())) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid IFSC code format'
      });
    }

    // Validate account number (basic validation - should be numeric and reasonable length)
    if (!/^\d{9,18}$/.test(accountNumber)) {
      return res.status(400).json({
        status: 'error',
        message: 'Account number should be numeric and between 9-18 digits'
      });
    }

    // Check if account number already exists
    const existingAccount = await prisma.account.findUnique({
      where: { accountNumber }
    });

    if (existingAccount) {
      return res.status(409).json({
        status: 'error',
        message: 'Account number already exists'
      });
    }

    // Create the account
    const account = await prisma.account.create({
      data: {
        accountHolderName: accountHolderName.trim(),
        accountNumber,
        ifscCode: ifscCode.toUpperCase(),
        userId
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    return res.status(201).json({
      status: 'success',
      message: 'Account created successfully',
      data: {
        account
      }
    });

  } catch (error) {
    console.error('Create account error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
}

/**
 * Get all accounts for the authenticated user
 * @route GET /api/accounts
 * @access Private (User role only)
 */
async function getUserAccounts(req, res) {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalAccounts = await prisma.account.count({
      where: { userId }
    });

    // Get accounts with pagination
    const accounts = await prisma.account.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    const totalPages = Math.ceil(totalAccounts / limit);

    return res.status(200).json({
      status: 'success',
      data: {
        accounts,
        pagination: {
          currentPage: page,
          totalPages,
          totalAccounts,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get user accounts error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
}

/**
 * Get account by ID (only if it belongs to the authenticated user)
 * @route GET /api/accounts/:id
 * @access Private (User role only)
 */
async function getAccountById(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const account = await prisma.account.findFirst({
      where: {
        id,
        userId // Ensure user can only access their own accounts
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!account) {
      return res.status(404).json({
        status: 'error',
        message: 'Account not found'
      });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        account
      }
    });

  } catch (error) {
    console.error('Get account by ID error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
}

/**
 * Update account by ID (only if it belongs to the authenticated user)
 * @route PUT /api/accounts/:id
 * @access Private (User role only)
 */
async function updateAccount(req, res) {
  try {
    const { id } = req.params;
    const { accountHolderName, accountNumber, ifscCode } = req.body;
    const userId = req.user.id;

    // Check if account exists and belongs to user
    const existingAccount = await prisma.account.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!existingAccount) {
      return res.status(404).json({
        status: 'error',
        message: 'Account not found'
      });
    }

    // Prepare update data
    const updateData = {};

    if (accountHolderName !== undefined) {
      if (!accountHolderName.trim()) {
        return res.status(400).json({
          status: 'error',
          message: 'Account holder name cannot be empty'
        });
      }
      updateData.accountHolderName = accountHolderName.trim();
    }

    if (accountNumber !== undefined) {
      // Validate account number
      if (!/^\d{9,18}$/.test(accountNumber)) {
        return res.status(400).json({
          status: 'error',
          message: 'Account number should be numeric and between 9-18 digits'
        });
      }

      // Check if new account number already exists (excluding current account)
      const accountWithSameNumber = await prisma.account.findFirst({
        where: {
          accountNumber,
          NOT: { id }
        }
      });

      if (accountWithSameNumber) {
        return res.status(409).json({
          status: 'error',
          message: 'Account number already exists'
        });
      }

      updateData.accountNumber = accountNumber;
    }

    if (ifscCode !== undefined) {
      // Validate IFSC code format
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
      if (!ifscRegex.test(ifscCode.toUpperCase())) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid IFSC code format'
        });
      }
      updateData.ifscCode = ifscCode.toUpperCase();
    }

    // If no fields to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'At least one field is required to update'
      });
    }

    // Update the account
    const updatedAccount = await prisma.account.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    return res.status(200).json({
      status: 'success',
      message: 'Account updated successfully',
      data: {
        account: updatedAccount
      }
    });

  } catch (error) {
    console.error('Update account error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
}

/**
 * Delete account by ID (only if it belongs to the authenticated user)
 * @route DELETE /api/accounts/:id
 * @access Private (User role only)
 */
async function deleteAccount(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if account exists and belongs to user
    const existingAccount = await prisma.account.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!existingAccount) {
      return res.status(404).json({
        status: 'error',
        message: 'Account not found'
      });
    }

    // Delete the account
    await prisma.account.delete({
      where: { id }
    });

    return res.status(200).json({
      status: 'success',
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
}

module.exports = {
  createAccount,
  getUserAccounts,
  getAccountById,
  updateAccount,
  deleteAccount
}; 