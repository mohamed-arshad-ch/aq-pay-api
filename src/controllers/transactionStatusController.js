const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper function to format combined transactions
const formatCombinedTransactions = (addMoneyTransactions, transferMoneyTransactions) => {
  const formattedAddMoneyTransactions = addMoneyTransactions.map(transaction => ({
    ...transaction,
    transactionType: 'ADD_MONEY'
  }));

  const formattedTransferMoneyTransactions = transferMoneyTransactions.map(transaction => ({
    ...transaction,
    transactionType: 'TRANSFER_MONEY'
  }));

  // Combine both types and sort by createdAt (most recent first)
  return [...formattedAddMoneyTransactions, ...formattedTransferMoneyTransactions]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

// User: Get Pending Transactions
const getUserPendingTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Get total counts first for pagination
    const [addMoneyTotal, transferMoneyTotal] = await Promise.all([
      prisma.addMoneyTransaction.count({
        where: {
          userId,
          status: 'PENDING'
        }
      }),
      prisma.transferMoneyTransaction.count({
        where: {
          userId,
          status: 'PENDING'
        }
      })
    ]);

    const total = addMoneyTotal + transferMoneyTotal;
    const totalPages = Math.ceil(total / take);

    // We need to handle pagination across two tables
    // Strategy: get up to 'limit' items from each table, then combine and slice
    const [addMoneyTransactions, transferMoneyTransactions] = await Promise.all([
      prisma.addMoneyTransaction.findMany({
        where: {
          userId,
          status: 'PENDING'
        },
        orderBy: {
          createdAt: 'desc'
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
      }),
      prisma.transferMoneyTransaction.findMany({
        where: {
          userId,
          status: 'PENDING'
        },
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          },
          account: {
            select: {
              id: true,
              accountHolderName: true,
              accountNumber: true,
              ifscCode: true
            }
          }
        }
      })
    ]);

    // Combine and sort the transactions
    const allTransactions = formatCombinedTransactions(
      addMoneyTransactions, 
      transferMoneyTransactions
    );

    // Apply pagination to the combined result
    const paginatedTransactions = allTransactions.slice(skip, skip + take);

    res.status(200).json({
      success: true,
      data: {
        transactions: paginatedTransactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user pending transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// User: Get Processing Transactions
const getUserProcessingTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Get total counts first for pagination
    const [addMoneyTotal, transferMoneyTotal] = await Promise.all([
      prisma.addMoneyTransaction.count({
        where: {
          userId,
          status: 'PROCESSING'
        }
      }),
      prisma.transferMoneyTransaction.count({
        where: {
          userId,
          status: 'PROCESSING'
        }
      })
    ]);

    const total = addMoneyTotal + transferMoneyTotal;
    const totalPages = Math.ceil(total / take);

    const [addMoneyTransactions, transferMoneyTransactions] = await Promise.all([
      prisma.addMoneyTransaction.findMany({
        where: {
          userId,
          status: 'PROCESSING'
        },
        orderBy: {
          createdAt: 'desc'
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
      }),
      prisma.transferMoneyTransaction.findMany({
        where: {
          userId,
          status: 'PROCESSING'
        },
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          },
          account: {
            select: {
              id: true,
              accountHolderName: true,
              accountNumber: true,
              ifscCode: true
            }
          }
        }
      })
    ]);

    // Combine and sort the transactions
    const allTransactions = formatCombinedTransactions(
      addMoneyTransactions, 
      transferMoneyTransactions
    );

    // Apply pagination to the combined result
    const paginatedTransactions = allTransactions.slice(skip, skip + take);

    res.status(200).json({
      success: true,
      data: {
        transactions: paginatedTransactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user processing transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// User: Get Completed Transactions
const getUserCompletedTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Get total counts first for pagination
    const [addMoneyTotal, transferMoneyTotal] = await Promise.all([
      prisma.addMoneyTransaction.count({
        where: {
          userId,
          status: 'COMPLETED'
        }
      }),
      prisma.transferMoneyTransaction.count({
        where: {
          userId,
          status: 'COMPLETED'
        }
      })
    ]);

    const total = addMoneyTotal + transferMoneyTotal;
    const totalPages = Math.ceil(total / take);

    const [addMoneyTransactions, transferMoneyTransactions] = await Promise.all([
      prisma.addMoneyTransaction.findMany({
        where: {
          userId,
          status: 'COMPLETED'
        },
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          },
          allTransaction: {
            select: {
              id: true,
              orderId: true
            }
          }
        }
      }),
      prisma.transferMoneyTransaction.findMany({
        where: {
          userId,
          status: 'COMPLETED'
        },
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          },
          account: {
            select: {
              id: true,
              accountHolderName: true,
              accountNumber: true,
              ifscCode: true
            }
          },
          allTransaction: {
            select: {
              id: true,
              orderId: true
            }
          }
        }
      })
    ]);

    // Combine and sort the transactions
    const allTransactions = formatCombinedTransactions(
      addMoneyTransactions, 
      transferMoneyTransactions
    );

    // Apply pagination to the combined result
    const paginatedTransactions = allTransactions.slice(skip, skip + take);

    res.status(200).json({
      success: true,
      data: {
        transactions: paginatedTransactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user completed transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// User: Get Rejected Transactions
const getUserRejectedTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Get total counts first for pagination
    const [addMoneyTotal, transferMoneyTotal] = await Promise.all([
      prisma.addMoneyTransaction.count({
        where: {
          userId,
          status: 'REJECTED'
        }
      }),
      prisma.transferMoneyTransaction.count({
        where: {
          userId,
          status: 'REJECTED'
        }
      })
    ]);

    const total = addMoneyTotal + transferMoneyTotal;
    const totalPages = Math.ceil(total / take);

    const [addMoneyTransactions, transferMoneyTransactions] = await Promise.all([
      prisma.addMoneyTransaction.findMany({
        where: {
          userId,
          status: 'REJECTED'
        },
        orderBy: {
          createdAt: 'desc'
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
      }),
      prisma.transferMoneyTransaction.findMany({
        where: {
          userId,
          status: 'REJECTED'
        },
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          },
          account: {
            select: {
              id: true,
              accountHolderName: true,
              accountNumber: true,
              ifscCode: true
            }
          }
        }
      })
    ]);

    // Combine and sort the transactions
    const allTransactions = formatCombinedTransactions(
      addMoneyTransactions, 
      transferMoneyTransactions
    );

    // Apply pagination to the combined result
    const paginatedTransactions = allTransactions.slice(skip, skip + take);

    res.status(200).json({
      success: true,
      data: {
        transactions: paginatedTransactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user rejected transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Admin: Get All Pending Transactions
const getAdminPendingTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10, userId } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Prepare where clause
    const addMoneyWhere = { status: 'PENDING' };
    const transferMoneyWhere = { status: 'PENDING' };
    
    // Add userId filter if provided
    if (userId) {
      addMoneyWhere.userId = userId;
      transferMoneyWhere.userId = userId;
    }

    // Get total counts first for pagination
    const [addMoneyTotal, transferMoneyTotal] = await Promise.all([
      prisma.addMoneyTransaction.count({ where: addMoneyWhere }),
      prisma.transferMoneyTransaction.count({ where: transferMoneyWhere })
    ]);

    const total = addMoneyTotal + transferMoneyTotal;
    const totalPages = Math.ceil(total / take);

    const [addMoneyTransactions, transferMoneyTransactions] = await Promise.all([
      prisma.addMoneyTransaction.findMany({
        where: addMoneyWhere,
        orderBy: {
          createdAt: 'desc'
        },
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
      prisma.transferMoneyTransaction.findMany({
        where: transferMoneyWhere,
        orderBy: {
          createdAt: 'desc'
        },
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
              id: true,
              accountHolderName: true,
              accountNumber: true,
              ifscCode: true
            }
          }
        }
      })
    ]);

    // Combine and sort the transactions
    const allTransactions = formatCombinedTransactions(
      addMoneyTransactions, 
      transferMoneyTransactions
    );

    // Apply pagination to the combined result
    const paginatedTransactions = allTransactions.slice(skip, skip + take);

    res.status(200).json({
      success: true,
      data: {
        transactions: paginatedTransactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Error fetching admin pending transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Admin: Get All Processing Transactions
const getAdminProcessingTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10, userId } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Prepare where clause
    const addMoneyWhere = { status: 'PROCESSING' };
    const transferMoneyWhere = { status: 'PROCESSING' };
    
    // Add userId filter if provided
    if (userId) {
      addMoneyWhere.userId = userId;
      transferMoneyWhere.userId = userId;
    }

    // Get total counts first for pagination
    const [addMoneyTotal, transferMoneyTotal] = await Promise.all([
      prisma.addMoneyTransaction.count({ where: addMoneyWhere }),
      prisma.transferMoneyTransaction.count({ where: transferMoneyWhere })
    ]);

    const total = addMoneyTotal + transferMoneyTotal;
    const totalPages = Math.ceil(total / take);

    const [addMoneyTransactions, transferMoneyTransactions] = await Promise.all([
      prisma.addMoneyTransaction.findMany({
        where: addMoneyWhere,
        orderBy: {
          createdAt: 'desc'
        },
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
      prisma.transferMoneyTransaction.findMany({
        where: transferMoneyWhere,
        orderBy: {
          createdAt: 'desc'
        },
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
              id: true,
              accountHolderName: true,
              accountNumber: true,
              ifscCode: true
            }
          }
        }
      })
    ]);

    // Combine and sort the transactions
    const allTransactions = formatCombinedTransactions(
      addMoneyTransactions, 
      transferMoneyTransactions
    );

    // Apply pagination to the combined result
    const paginatedTransactions = allTransactions.slice(skip, skip + take);

    res.status(200).json({
      success: true,
      data: {
        transactions: paginatedTransactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Error fetching admin processing transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Admin: Get All Completed Transactions
const getAdminCompletedTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10, userId } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Prepare where clause
    const addMoneyWhere = { status: 'COMPLETED' };
    const transferMoneyWhere = { status: 'COMPLETED' };
    
    // Add userId filter if provided
    if (userId) {
      addMoneyWhere.userId = userId;
      transferMoneyWhere.userId = userId;
    }

    // Get total counts first for pagination
    const [addMoneyTotal, transferMoneyTotal] = await Promise.all([
      prisma.addMoneyTransaction.count({ where: addMoneyWhere }),
      prisma.transferMoneyTransaction.count({ where: transferMoneyWhere })
    ]);

    const total = addMoneyTotal + transferMoneyTotal;
    const totalPages = Math.ceil(total / take);

    const [addMoneyTransactions, transferMoneyTransactions] = await Promise.all([
      prisma.addMoneyTransaction.findMany({
        where: addMoneyWhere,
        orderBy: {
          createdAt: 'desc'
        },
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
              id: true,
              orderId: true
            }
          }
        }
      }),
      prisma.transferMoneyTransaction.findMany({
        where: transferMoneyWhere,
        orderBy: {
          createdAt: 'desc'
        },
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
              id: true,
              accountHolderName: true,
              accountNumber: true,
              ifscCode: true
            }
          },
          allTransaction: {
            select: {
              id: true,
              orderId: true
            }
          }
        }
      })
    ]);

    // Combine and sort the transactions
    const allTransactions = formatCombinedTransactions(
      addMoneyTransactions, 
      transferMoneyTransactions
    );

    // Apply pagination to the combined result
    const paginatedTransactions = allTransactions.slice(skip, skip + take);

    res.status(200).json({
      success: true,
      data: {
        transactions: paginatedTransactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Error fetching admin completed transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Admin: Get All Rejected Transactions
const getAdminRejectedTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10, userId } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Prepare where clause
    const addMoneyWhere = { status: 'REJECTED' };
    const transferMoneyWhere = { status: 'REJECTED' };
    
    // Add userId filter if provided
    if (userId) {
      addMoneyWhere.userId = userId;
      transferMoneyWhere.userId = userId;
    }

    // Get total counts first for pagination
    const [addMoneyTotal, transferMoneyTotal] = await Promise.all([
      prisma.addMoneyTransaction.count({ where: addMoneyWhere }),
      prisma.transferMoneyTransaction.count({ where: transferMoneyWhere })
    ]);

    const total = addMoneyTotal + transferMoneyTotal;
    const totalPages = Math.ceil(total / take);

    const [addMoneyTransactions, transferMoneyTransactions] = await Promise.all([
      prisma.addMoneyTransaction.findMany({
        where: addMoneyWhere,
        orderBy: {
          createdAt: 'desc'
        },
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
      prisma.transferMoneyTransaction.findMany({
        where: transferMoneyWhere,
        orderBy: {
          createdAt: 'desc'
        },
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
              id: true,
              accountHolderName: true,
              accountNumber: true,
              ifscCode: true
            }
          }
        }
      })
    ]);

    // Combine and sort the transactions
    const allTransactions = formatCombinedTransactions(
      addMoneyTransactions, 
      transferMoneyTransactions
    );

    // Apply pagination to the combined result
    const paginatedTransactions = allTransactions.slice(skip, skip + take);

    res.status(200).json({
      success: true,
      data: {
        transactions: paginatedTransactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Error fetching admin rejected transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  // User endpoints
  getUserPendingTransactions,
  getUserProcessingTransactions,
  getUserCompletedTransactions,
  getUserRejectedTransactions,
  
  // Admin endpoints
  getAdminPendingTransactions,
  getAdminProcessingTransactions,
  getAdminCompletedTransactions,
  getAdminRejectedTransactions
}; 