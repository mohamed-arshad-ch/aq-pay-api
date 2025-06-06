const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get recent transactions with location data for map display
 * @route GET /api/dashboard/map-transactions
 * @access Private (User/Admin)
 */
const getRecentMapTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = 5; // Fixed to 5 recent transactions
    
    // Get recent add money transactions with location data
    const addMoneyTransactions = await prisma.addMoneyTransaction.findMany({
      where: {
        userId,
        location: { not: null } // Only get transactions with location data
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        amount: true,
        location: true,
        status: true,
        description: true,
        createdAt: true,
        transactionId: true,
        // Include user data
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
    
    // Format add money transactions
    const formattedAddMoneyTransactions = addMoneyTransactions.map(tx => ({
      id: tx.id,
      type: 'ADD_MONEY',
      amount: tx.amount,
      location: tx.location,
      status: tx.status,
      description: tx.description || 'Add Money Transaction',
      createdAt: tx.createdAt,
      transactionId: tx.transactionId,
      userName: `${tx.user.firstName || ''} ${tx.user.lastName || ''}`.trim(),
      userId: tx.user.id
    }));
    
    // Get recent transfer money transactions
    // Note: Transfer transactions may not have location data by default,
    // but we include them in case they have some location-related information in the future
    const transferMoneyTransactions = await prisma.transferMoneyTransaction.findMany({
      where: {
        userId
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        amount: true,
        status: true,
        description: true,
        createdAt: true,
        // Include account data
        account: {
          select: {
            accountHolderName: true,
            accountNumber: true
          }
        },
        // Include user data
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
    
    // Format transfer money transactions
    const formattedTransferTransactions = transferMoneyTransactions.map(tx => ({
      id: tx.id,
      type: 'TRANSFER_MONEY',
      amount: tx.amount,
      location: null, // Transfer transactions typically don't have location
      status: tx.status,
      description: tx.description || `Transfer to ${tx.account.accountHolderName || 'account ending with ' + tx.account.accountNumber.slice(-4)}`,
      createdAt: tx.createdAt,
      accountHolder: tx.account.accountHolderName,
      accountNumber: tx.account.accountNumber.slice(-4).padStart(tx.account.accountNumber.length, '*'), // Masked account number
      userName: `${tx.user.firstName || ''} ${tx.user.lastName || ''}`.trim(),
      userId: tx.user.id
    }));
    
    // Combine both types of transactions
    const allTransactions = [...formattedAddMoneyTransactions, ...formattedTransferTransactions]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort by date (newest first)
      .slice(0, limit); // Take only the most recent 5
    
    res.status(200).json({
      success: true,
      data: {
        transactions: allTransactions,
        count: allTransactions.length
      }
    });
  } catch (error) {
    console.error('Error fetching map transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  getRecentMapTransactions
}; 