const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get all users with detailed information including accounts and transactions
 * @route GET /api/admin/users
 * @access Private (Admin only)
 */
const getAllUsersWithDetails = async (req, res) => {
  try {
    const { page = 1, limit = 10, email, role } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause for filtering
    const where = {};
    if (email) {
      where.email = { contains: email, mode: 'insensitive' };
    }
    if (role) {
      where.role = role.toUpperCase();
    }

    // Get total count for pagination
    const totalUsers = await prisma.user.count({ where });

    // Get users with their accounts and wallet
    const users = await prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        accounts: true,
        wallet: true,
        _count: {
          select: {
            addMoneyTransactions: true,
            transferMoneyTransactions: true,
            allTransactions: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalUsers,
          totalPages: Math.ceil(totalUsers / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching users with details:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get detailed information for a specific user
 * @route GET /api/admin/users/:userId
 * @access Private (Admin only)
 */
const getUserDetailById = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find user with all related data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        accounts: true,
        wallet: true,
        addMoneyTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        transferMoneyTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            account: true
          }
        },
        allTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            addMoneyTransaction: true,
            transferMoneyTransaction: {
              include: {
                account: true
              }
            }
          }
        },
        _count: {
          select: {
            accounts: true,
            addMoneyTransactions: true,
            transferMoneyTransactions: true,
            allTransactions: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get admin dashboard statistics and recent transactions
 * @route GET /api/admin/dashboard
 * @access Private (Admin only)
 */
const getDashboardStats = async (req, res) => {
  try {
    // Get total counts
    const [
      totalUsers,
      totalCompletedAddMoneyTransactions,
      totalCompletedTransferMoneyTransactions,
      totalPendingAddMoneyTransactions,
      totalPendingTransferMoneyTransactions,
      totalProcessingAddMoneyTransactions,
      totalProcessingTransferMoneyTransactions,
      totalRejectedAddMoneyTransactions, 
      totalRejectedTransferMoneyTransactions
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      
      // Completed transactions
      prisma.addMoneyTransaction.count({
        where: { status: 'COMPLETED' }
      }),
      prisma.transferMoneyTransaction.count({
        where: { status: 'COMPLETED' }
      }),
      
      // Pending transactions
      prisma.addMoneyTransaction.count({
        where: { status: 'PENDING' }
      }),
      prisma.transferMoneyTransaction.count({
        where: { status: 'PENDING' }
      }),
      
      // Processing transactions
      prisma.addMoneyTransaction.count({
        where: { status: 'PROCESSING' }
      }),
      prisma.transferMoneyTransaction.count({
        where: { status: 'PROCESSING' }
      }),
      
      // Rejected transactions
      prisma.addMoneyTransaction.count({
        where: { status: 'REJECTED' }
      }),
      prisma.transferMoneyTransaction.count({
        where: { status: 'REJECTED' }
      })
    ]);

    // Calculate total completed transaction amounts
    const [addMoneyCompletedAmount, transferMoneyCompletedAmount] = await Promise.all([
      prisma.addMoneyTransaction.aggregate({
        _sum: {
          amount: true
        },
        where: { status: 'COMPLETED' }
      }),
      prisma.transferMoneyTransaction.aggregate({
        _sum: {
          amount: true
        },
        where: { status: 'COMPLETED' }
      })
    ]);

    // Get 5 most recent add money transactions
    const recentAddMoneyTransactions = await prisma.addMoneyTransaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phoneNumber: true
          }
        },
        allTransaction: {
          select: {
            orderId: true
          }
        }
      }
    });

    // Get 5 most recent transfer money transactions
    const recentTransferMoneyTransactions = await prisma.transferMoneyTransaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phoneNumber: true
          }
        },
        account: {
          select: {
            accountHolderName: true,
            accountNumber: true,
            ifscCode: true
          }
        },
        allTransaction: {
          select: {
            orderId: true
          }
        }
      }
    });

    // Get 5 most recent all transactions
    const recentAllTransactions = await prisma.allTransaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        addMoneyTransaction: {
          select: {
            id: true,
            status: true,
            amount: true
          }
        },
        transferMoneyTransaction: {
          select: {
            id: true,
            status: true,
            amount: true,
            account: {
              select: {
                accountHolderName: true,
                accountNumber: true
              }
            }
          }
        }
      }
    });

    // Calculate total completed transaction count and amount
    const totalCompletedTransactions = totalCompletedAddMoneyTransactions + totalCompletedTransferMoneyTransactions;
    const totalCompletedAmount = (
      parseFloat(addMoneyCompletedAmount._sum.amount || 0) + 
      parseFloat(transferMoneyCompletedAmount._sum.amount || 0)
    ).toFixed(2);

    // Calculate total pending transaction count
    const totalPendingTransactions = totalPendingAddMoneyTransactions + totalPendingTransferMoneyTransactions;
    
    // Calculate total processing transaction count
    const totalProcessingTransactions = totalProcessingAddMoneyTransactions + totalProcessingTransferMoneyTransactions;
    
    // Calculate total rejected transaction count
    const totalRejectedTransactions = totalRejectedAddMoneyTransactions + totalRejectedTransferMoneyTransactions;

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          transactions: {
            completed: {
              count: totalCompletedTransactions,
              amount: parseFloat(totalCompletedAmount)
            },
            pending: {
              count: totalPendingTransactions
            },
            processing: {
              count: totalProcessingTransactions
            },
            rejected: {
              count: totalRejectedTransactions
            },
            addMoney: {
              completed: totalCompletedAddMoneyTransactions,
              pending: totalPendingAddMoneyTransactions,
              processing: totalProcessingAddMoneyTransactions,
              rejected: totalRejectedAddMoneyTransactions,
              totalAmount: parseFloat(addMoneyCompletedAmount._sum.amount || 0).toFixed(2)
            },
            transferMoney: {
              completed: totalCompletedTransferMoneyTransactions,
              pending: totalPendingTransferMoneyTransactions,
              processing: totalProcessingTransferMoneyTransactions,
              rejected: totalRejectedTransferMoneyTransactions,
              totalAmount: parseFloat(transferMoneyCompletedAmount._sum.amount || 0).toFixed(2)
            }
          }
        },
        recentTransactions: {
          addMoney: recentAddMoneyTransactions,
          transferMoney: recentTransferMoneyTransactions,
          all: recentAllTransactions
        }
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get all accounts for a specific user
 * @route GET /api/admin/users/:userId/accounts
 * @access Private (Admin only)
 */
const getUserAccounts = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // First check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get total count for pagination
    const totalAccounts = await prisma.account.count({
      where: { userId }
    });

    // Get user accounts with pagination
    const accounts = await prisma.account.findMany({
      where: { userId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            transferMoneyTransactions: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        user,
        accounts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalAccounts,
          totalPages: Math.ceil(totalAccounts / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user accounts:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get all add money transactions for a specific user
 * @route GET /api/admin/users/:userId/add-money-transactions
 * @access Private (Admin only)
 */
const getUserAddMoneyTransactions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // First check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Build where clause for filtering
    const where = { userId };
    if (status) {
      where.status = status.toUpperCase();
    }

    // Get total count for pagination
    const totalTransactions = await prisma.addMoneyTransaction.count({
      where
    });

    // Get user add money transactions with pagination
    const transactions = await prisma.addMoneyTransaction.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        allTransaction: {
          select: {
            orderId: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        user,
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalTransactions,
          totalPages: Math.ceil(totalTransactions / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user add money transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get all transfer money transactions for a specific user
 * @route GET /api/admin/users/:userId/transfer-money-transactions
 * @access Private (Admin only)
 */
const getUserTransferMoneyTransactions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // First check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Build where clause for filtering
    const where = { userId };
    if (status) {
      where.status = status.toUpperCase();
    }

    // Get total count for pagination
    const totalTransactions = await prisma.transferMoneyTransaction.count({
      where
    });

    // Get user transfer money transactions with pagination
    const transactions = await prisma.transferMoneyTransaction.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        account: {
          select: {
            accountHolderName: true,
            accountNumber: true,
            ifscCode: true
          }
        },
        allTransaction: {
          select: {
            orderId: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        user,
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalTransactions,
          totalPages: Math.ceil(totalTransactions / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user transfer money transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get all transactions for a specific user
 * @route GET /api/admin/users/:userId/all-transactions
 * @access Private (Admin only)
 */
const getUserAllTransactions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { transactionType, page = 1, limit = 10 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // First check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Build where clause for filtering
    const where = { userId };
    if (transactionType) {
      where.transactionType = transactionType.toUpperCase();
    }

    // Get total count for pagination
    const totalTransactions = await prisma.allTransaction.count({
      where
    });

    // Get user all transactions with pagination
    const transactions = await prisma.allTransaction.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        addMoneyTransaction: {
          select: {
            id: true,
            amount: true,
            status: true,
            transactionId: true,
            location: true,
            description: true
          }
        },
        transferMoneyTransaction: {
          select: {
            id: true,
            amount: true,
            status: true,
            description: true,
            account: {
              select: {
                id: true,
                accountHolderName: true,
                accountNumber: true,
                ifscCode: true
              }
            }
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        user,
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalTransactions,
          totalPages: Math.ceil(totalTransactions / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user all transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  getAllUsersWithDetails,
  getUserDetailById,
  getDashboardStats,
  getUserAccounts,
  getUserAddMoneyTransactions,
  getUserTransferMoneyTransactions,
  getUserAllTransactions
}; 