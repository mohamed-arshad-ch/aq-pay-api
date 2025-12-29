const { PrismaClient } = require('@prisma/client');
const { generateUniqueOrderId, generateTransactionRefId } = require('../utils/orderIdGenerator');
const Notification = require('../models/Notification');
const prisma = new PrismaClient();

// Create a new add money transaction
const createAddMoneyTransaction = async (req, res) => {
  try {
    const { amount, location, description } = req.body;
    const userId = req.user.id;

    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required and must be greater than 0'
      });
    }

    // Generate unique 12-digit transaction reference ID
    const transactionRefId = await generateTransactionRefId('addMoneyTransaction');

    // Create the transaction
    const transaction = await prisma.addMoneyTransaction.create({
      data: {
        amount: parseFloat(amount),
        location: location || null,
        description: description || null,
        transactionRefId: transactionRefId,
        userId: userId,
        status: 'PENDING'
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

    // Create notification for pending transaction
    await Notification.createAddMoneyNotification(
      userId,
      'PENDING',
      parseFloat(amount),
      transaction.id
    );

    res.status(201).json({
      success: true,
      message: 'Add money transaction created successfully',
      data: transaction
    });

  } catch (error) {
    console.error('Error creating add money transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get user's add money transactions
const getUserAddMoneyTransactions = async (req, res) => {
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
      prisma.addMoneyTransaction.findMany({
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
          }
        }
      }),
      prisma.addMoneyTransaction.count({ where })
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
    console.error('Error fetching user transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Admin: Get all add money transactions
const getAllAddMoneyTransactions = async (req, res) => {
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
      prisma.addMoneyTransaction.findMany({
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
          }
        }
      }),
      prisma.addMoneyTransaction.count({ where })
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
    console.error('Error fetching all transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Admin: Update transaction status to processing with transaction ID
const updateToProcessing = async (req, res) => {
  try {
    const { id } = req.params;
    const { transactionRefId } = req.body;

    if (!transactionRefId) {
      return res.status(400).json({
        success: false,
        message: 'Transaction Reference ID is required'
      });
    }

    // Validate if it's 12 digits (if provided by admin, otherwise we might have already generated it)
    if (!/^\d{12}$/.test(transactionRefId)) {
      return res.status(400).json({
        success: false,
        message: 'Transaction Reference ID must be exactly 12 digits'
      });
    }

    // Check if transaction exists and is in PENDING status
    const existingTransaction = await prisma.addMoneyTransaction.findUnique({
      where: { id }
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

    // Update transaction to processing with transaction ID
    const updatedTransaction = await prisma.addMoneyTransaction.update({
      where: { id },
      data: {
        status: 'PROCESSING',
        transactionRefId: transactionRefId,
        updatedAt: new Date()
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

    // Create notification for processing status
    await Notification.createAddMoneyNotification(
      updatedTransaction.userId,
      'PROCESSING',
      parseFloat(updatedTransaction.amount),
      updatedTransaction.id
    );

    res.status(200).json({
      success: true,
      message: 'Transaction updated to processing successfully',
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

// Admin: Approve transaction (Complete)
const approveTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if transaction exists and is in PROCESSING status
    const existingTransaction = await prisma.addMoneyTransaction.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            wallet: true
          }
        }
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

    // Use transaction to update transaction status, wallet balance, and create all transaction record
    const result = await prisma.$transaction(async (prisma) => {
      // Update transaction status to COMPLETED
      const updatedTransaction = await prisma.addMoneyTransaction.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          updatedAt: new Date()
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

      let walletId;

      // Create wallet if it doesn't exist
      if (!existingTransaction.user.wallet) {
        const newWallet = await prisma.wallet.create({
          data: {
            userId: existingTransaction.userId,
            balance: existingTransaction.amount
          }
        });
        walletId = newWallet.id;
      } else {
        // Update wallet balance
        await prisma.wallet.update({
          where: { userId: existingTransaction.userId },
          data: {
            balance: {
              increment: existingTransaction.amount
            }
          }
        });
        walletId = existingTransaction.user.wallet.id;
      }

      // Create entry in AllTransaction table
      const allTransactionEntry = await prisma.allTransaction.create({
        data: {
          orderId: orderId,
          walletId: walletId,
          userId: existingTransaction.userId,
          amount: existingTransaction.amount,
          transactionType: 'DEPOSIT',
          transactionRefId: existingTransaction.transactionRefId,
          description: `Added money to wallet`,
          addMoneyTransactionId: existingTransaction.id
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
        allTransactionEntry
      };
    });

    // Create notification for completed status
    await Notification.createAddMoneyNotification(
      existingTransaction.userId,
      'COMPLETED',
      parseFloat(existingTransaction.amount),
      existingTransaction.id
    );

    res.status(200).json({
      success: true,
      message: 'Transaction approved successfully and wallet balance updated',
      data: result
    });

  } catch (error) {
    console.error('Error approving transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Admin: Reject transaction
const rejectTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Check if transaction exists and is in PROCESSING status
    const existingTransaction = await prisma.addMoneyTransaction.findUnique({
      where: { id }
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
        message: 'Only processing transactions can be rejected'
      });
    }

    // Update transaction status to REJECTED
    const updatedTransaction = await prisma.addMoneyTransaction.update({
      where: { id },
      data: {
        status: 'REJECTED',
        description: reason ? `${existingTransaction.description || ''} | Rejection reason: ${reason}` : existingTransaction.description,
        updatedAt: new Date()
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

    // Create notification for rejected status
    await Notification.createAddMoneyNotification(
      updatedTransaction.userId,
      'REJECTED',
      parseFloat(updatedTransaction.amount),
      updatedTransaction.id
    );

    res.status(200).json({
      success: true,
      message: 'Transaction rejected successfully',
      data: updatedTransaction
    });

  } catch (error) {
    console.error('Error rejecting transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  createAddMoneyTransaction,
  getUserAddMoneyTransactions,
  getAllAddMoneyTransactions,
  updateToProcessing,
  approveTransaction,
  rejectTransaction
}; 