const { PrismaClient } = require('@prisma/client');
const { generateUniqueOrderId } = require('../utils/orderIdGenerator');
const Notification = require('../models/Notification');
const MPin = require('../models/MPin');
const prisma = new PrismaClient();

// Create a new transfer money transaction
const createTransferMoneyTransaction = async (req, res) => {
  try {
    const { accountId, amount, description, mPin } = req.body;
    const userId = req.user.id;

    // Validation
    if (!accountId || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Account ID and amount are required. Amount must be greater than 0'
      });
    }

    // Validate MPin
    if (!mPin) {
      return res.status(400).json({
        success: false,
        message: 'MPin is required for transfer money transactions'
      });
    }

    // Check if user has MPin
    const hasMPin = await MPin.exists(userId);
    if (!hasMPin) {
      return res.status(400).json({
        success: false,
        message: 'MPin not found. Please create MPin in settings.',
        action: 'CREATE_MPIN_IN_SETTINGS'
      });
    }

    // Verify MPin
    const isMPinValid = await MPin.verify(userId, mPin);
    if (!isMPinValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid MPin. Please enter correct MPin.',
        action: 'INVALID_MPIN'
      });
    }

    // Check if account exists and belongs to the user
    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
        userId: userId
      }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found or does not belong to you'
      });
    }

    // Check if user has a wallet and sufficient balance
    const wallet = await prisma.wallet.findUnique({
      where: { userId: userId }
    });

    if (!wallet) {
      return res.status(400).json({
        success: false,
        message: 'You don\'t have a wallet. Please contact support'
      });
    }

    if (parseFloat(wallet.balance) < parseFloat(amount)) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance in your wallet'
      });
    }

    // Use transaction to create transfer and update wallet balance atomically
    const result = await prisma.$transaction(async (prisma) => {
      // Deduct amount from wallet immediately when transfer is created
      const updatedWallet = await prisma.wallet.update({
        where: { userId: userId },
        data: {
          balance: {
            decrement: parseFloat(amount)
          }
        }
      });

      // Create the transfer transaction
      const transaction = await prisma.transferMoneyTransaction.create({
        data: {
          accountId: accountId,
          amount: parseFloat(amount),
          description: description || null,
          userId: userId,
          status: 'PENDING'
        },
        include: {
          account: {
            select: {
              id: true,
              accountHolderName: true,
              accountNumber: true,
              ifscCode: true
            }
          },
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

      return { transaction, updatedWallet };
    });
    
    // Create notification for pending transaction
    await Notification.createTransferMoneyNotification(
      userId,
      'PENDING',
      parseFloat(amount),
      account.accountNumber,
      result.transaction.id
    );

    res.status(201).json({
      success: true,
      message: 'Transfer money transaction created successfully and amount deducted from wallet',
      data: {
        transaction: result.transaction,
        walletBalance: result.updatedWallet.balance
      }
    });

  } catch (error) {
    console.error('Error creating transfer money transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get user's transfer money transactions
const getUserTransferMoneyTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = { userId };
    if (status) {
      where.status = status.toUpperCase();
    }

    const [transactions, total] = await Promise.all([
      prisma.transferMoneyTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          account: {
            select: {
              id: true,
              accountHolderName: true,
              accountNumber: true,
              ifscCode: true
            }
          },
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          }
        }
      }),
      prisma.transferMoneyTransaction.count({ where })
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
    console.error('Error fetching user transfer transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Admin: Get all transfer money transactions
const getAllTransferMoneyTransactions = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, userId } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (status) {
      where.status = status.toUpperCase();
    }
    if (userId) {
      where.userId = userId;
    }

    const [transactions, total] = await Promise.all([
      prisma.transferMoneyTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          account: {
            select: {
              id: true,
              accountHolderName: true,
              accountNumber: true,
              ifscCode: true
            }
          },
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phoneNumber: true
            }
          }
        }
      }),
      prisma.transferMoneyTransaction.count({ where })
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
    console.error('Error fetching all transfer transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Admin: Update transaction status to processing
const updateToProcessing = async (req, res) => {
  try {
    const { id } = req.params;
    const { transactionId } = req.body;

    // Validate transaction ID
    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID is required'
      });
    }

    // Check if transaction exists and is in PENDING status
    const existingTransaction = await prisma.transferMoneyTransaction.findUnique({
      where: { id },
      include: {
        account: true
      }
    });

    if (!existingTransaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    if (existingTransaction.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Only pending transactions can be moved to processing'
      });
    }

    // Update transaction status to PROCESSING and set the transaction ID
    const updatedTransaction = await prisma.transferMoneyTransaction.update({
      where: { id },
      data: {
        status: 'PROCESSING',
        transactionId: transactionId,
        updatedAt: new Date()
      },
      include: {
        account: {
          select: {
            id: true,
            accountHolderName: true,
            accountNumber: true,
            ifscCode: true
          }
        },
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
    
    // Create notification for processing status
    await Notification.createTransferMoneyNotification(
      updatedTransaction.userId,
      'PROCESSING',
      parseFloat(updatedTransaction.amount),
      existingTransaction.account.accountNumber,
      updatedTransaction.id
    );

    res.status(200).json({
      success: true,
      message: 'Transaction status updated to processing successfully',
      data: updatedTransaction
    });

  } catch (error) {
    console.error('Error updating transaction to processing:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Admin: Approve transfer transaction
const approveTransferTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if transaction exists and is in PROCESSING status
    const existingTransaction = await prisma.transferMoneyTransaction.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            wallet: true
          }
        },
        account: true
      }
    });

    if (!existingTransaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    if (existingTransaction.status !== 'PROCESSING') {
      return res.status(400).json({
        success: false,
        message: 'Only processing transactions can be approved'
      });
    }

    // Generate unique order ID
    const orderId = await generateUniqueOrderId();

    // Use transaction to update transaction status and create all transaction record
    // Note: Wallet balance was already deducted when transfer was created in PENDING status
    const result = await prisma.$transaction(async (prisma) => {
      // Update transaction status to COMPLETED
      const updatedTransaction = await prisma.transferMoneyTransaction.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          updatedAt: new Date()
        },
        include: {
          account: {
            select: {
              id: true,
              accountHolderName: true,
              accountNumber: true,
              ifscCode: true
            }
          },
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

      // Get current wallet for reference (no balance update needed as it was already deducted)
      const currentWallet = await prisma.wallet.findUnique({
        where: { userId: existingTransaction.userId }
      });

      // Create entry in AllTransaction table
      const allTransactionEntry = await prisma.allTransaction.create({
        data: {
          orderId: orderId,
          walletId: existingTransaction.user.wallet.id,
          userId: existingTransaction.userId,
          amount: existingTransaction.amount,
          transactionType: 'WITHDRAWAL',
          description: 'Sent to bank account',
          transferMoneyTransactionId: existingTransaction.id
        },
        include: {
          wallet: true,
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

      return {
        updatedTransaction,
        currentWallet,
        allTransactionEntry
      };
    });
    
    // Create notification for completed status
    await Notification.createTransferMoneyNotification(
      existingTransaction.userId,
      'COMPLETED',
      parseFloat(existingTransaction.amount),
      existingTransaction.account.accountNumber,
      existingTransaction.id
    );

    res.status(200).json({
      success: true,
      message: 'Transfer approved successfully, money sent to bank account',
      data: {
        transaction: result.updatedTransaction,
        walletBalance: result.currentWallet.balance,
        allTransactionEntry: result.allTransactionEntry
      }
    });

  } catch (error) {
    console.error('Error approving transfer transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Admin: Reject transfer transaction
const rejectTransferTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Check if transaction exists and is in PROCESSING status
    const existingTransaction = await prisma.transferMoneyTransaction.findUnique({
      where: { id },
      include: {
        account: true
      }
    });

    if (!existingTransaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    if (existingTransaction.status !== 'PROCESSING' && existingTransaction.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Only pending and processing transactions can be rejected'
      });
    }

    // Use transaction to update status and refund wallet balance atomically
    const result = await prisma.$transaction(async (prisma) => {
      // Update transaction status to REJECTED
      const updatedTransaction = await prisma.transferMoneyTransaction.update({
        where: { id },
        data: {
          status: 'REJECTED',
          description: reason ? `${existingTransaction.description || ''} | Rejection reason: ${reason}` : existingTransaction.description,
          updatedAt: new Date()
        },
        include: {
          account: {
            select: {
              id: true,
              accountHolderName: true,
              accountNumber: true,
              ifscCode: true
            }
          },
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

      // Add the transfer amount back to user's wallet since transfer was rejected
      const updatedWallet = await prisma.wallet.update({
        where: { userId: existingTransaction.userId },
        data: {
          balance: {
            increment: existingTransaction.amount
          }
        }
      });

      return {
        updatedTransaction,
        updatedWallet
      };
    });
    
    // Create notification for rejected status
    await Notification.createTransferMoneyNotification(
      result.updatedTransaction.userId,
      'REJECTED',
      parseFloat(result.updatedTransaction.amount),
      existingTransaction.account.accountNumber,
      result.updatedTransaction.id
    );

    res.status(200).json({
      success: true,
      message: 'Transfer transaction rejected successfully and amount refunded to wallet',
      data: {
        transaction: result.updatedTransaction,
        walletBalance: result.updatedWallet.balance
      }
    });

  } catch (error) {
    console.error('Error rejecting transfer transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get transfer transaction by ID
const getTransferTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const where = { id };
    
    // If user is not admin, only show their own transactions
    if (userRole !== 'ADMIN') {
      where.userId = userId;
    }

    const transaction = await prisma.transferMoneyTransaction.findFirst({
      where,
      include: {
        account: {
          select: {
            id: true,
            accountHolderName: true,
            accountNumber: true,
            ifscCode: true
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phoneNumber: userRole === 'ADMIN' ? true : false
          }
        },
        allTransaction: {
          select: {
            id: true,
            orderId: true,
            amount: true,
            transactionType: true,
            description: true,
            createdAt: true
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

    res.status(200).json({
      success: true,
      data: transaction
    });

  } catch (error) {
    console.error('Error fetching transfer transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  createTransferMoneyTransaction,
  getUserTransferMoneyTransactions,
  getAllTransferMoneyTransactions,
  updateToProcessing,
  approveTransferTransaction,
  rejectTransferTransaction,
  getTransferTransactionById
}; 