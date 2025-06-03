const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get user's all transactions
const getUserAllTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { transactionType, page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = { userId };
    if (transactionType) {
      where.transactionType = transactionType.toUpperCase();
    }

    const [transactions, total] = await Promise.all([
      prisma.allTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          },
          wallet: {
            select: {
              id: true,
              balance: true
            }
          },
          addMoneyTransaction: {
            select: {
              id: true,
              amount: true,
              status: true,
              transactionId: true
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
      }),
      prisma.allTransaction.count({ where })
    ]);

    res.status(200).json({
      success: true,
      data: {
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
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

// Admin: Get all transactions from all users
const getAdminAllTransactions = async (req, res) => {
  try {
    const { transactionType, userId, page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (transactionType) {
      where.transactionType = transactionType.toUpperCase();
    }
    if (userId) {
      where.userId = userId;
    }

    const [transactions, total] = await Promise.all([
      prisma.allTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
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
          wallet: {
            select: {
              id: true,
              balance: true
            }
          },
          addMoneyTransaction: {
            select: {
              id: true,
              amount: true,
              status: true,
              transactionId: true,
              location: true
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
      }),
      prisma.allTransaction.count({ where })
    ]);

    res.status(200).json({
      success: true,
      data: {
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Error fetching admin all transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get transaction by order ID
const getTransactionByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const where = { orderId };
    
    // If user is not admin, only show their own transactions
    if (userRole !== 'ADMIN') {
      where.userId = userId;
    }

    const transaction = await prisma.allTransaction.findUnique({
      where: { orderId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phoneNumber: userRole === 'ADMIN'
          }
        },
        wallet: {
          select: {
            id: true,
            balance: true
          }
        },
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

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Check if user has access to this transaction
    if (userRole !== 'ADMIN' && transaction.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: transaction
    });

  } catch (error) {
    console.error('Error fetching transaction by order ID:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get transaction statistics for user
const getUserTransactionStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [depositStats, withdrawalStats, totalTransactions] = await Promise.all([
      prisma.allTransaction.aggregate({
        where: {
          userId: userId,
          transactionType: 'DEPOSIT'
        },
        _sum: {
          amount: true
        },
        _count: true
      }),
      prisma.allTransaction.aggregate({
        where: {
          userId: userId,
          transactionType: 'WITHDRAWAL'
        },
        _sum: {
          amount: true
        },
        _count: true
      }),
      prisma.allTransaction.count({
        where: { userId: userId }
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalTransactions,
        deposits: {
          count: depositStats._count,
          totalAmount: depositStats._sum.amount || 0
        },
        withdrawals: {
          count: withdrawalStats._count,
          totalAmount: withdrawalStats._sum.amount || 0
        }
      }
    });

  } catch (error) {
    console.error('Error fetching user transaction stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  getUserAllTransactions,
  getAdminAllTransactions,
  getTransactionByOrderId,
  getUserTransactionStats
}; 