const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const accountRoutes = require('./routes/accountRoutes');
const walletRoutes = require('./routes/walletRoutes');
const addMoneyRoutes = require('./routes/addMoneyRoutes');
const transferMoneyRoutes = require('./routes/transferMoneyRoutes');
const allTransactionRoutes = require('./routes/allTransactionRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/add-money', addMoneyRoutes);
app.use('/api/transfer-money', transferMoneyRoutes);
app.use('/api/transactions', allTransactionRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint for Vercel
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'AQ-PAY API is running on Vercel',
    timestamp: new Date().toISOString(),
    endpoints: {
      // Public endpoints
      health: 'GET /api/health',
      register: 'POST /api/auth/register (requires: email, password, firstName, lastName, phoneNumber)',
      login: 'POST /api/auth/login (requires portal access approval for USER role)',
      
      // User endpoints (protected)
      profile: 'GET /api/auth/profile (protected)',
      updateProfile: 'PUT /api/auth/profile (protected)',
      getUserRole: 'GET /api/auth/role (protected)',
      logout: 'POST /api/auth/logout (protected)',
      
      // Account Management endpoints (user role only)
      createAccount: 'POST /api/accounts (user)',
      getUserAccounts: 'GET /api/accounts?page=1&limit=10 (user)',
      getAccountById: 'GET /api/accounts/:id (user)',
      updateAccount: 'PUT /api/accounts/:id (user)',
      deleteAccount: 'DELETE /api/accounts/:id (user)',
      
      // Wallet Management endpoints (user role only)
      getWallet: 'GET /api/wallet (user)',
      getWalletBalance: 'GET /api/wallet/balance (user)',
      
      // Add Money Transaction endpoints
      createAddMoneyTransaction: 'POST /api/add-money/create (user) - body: {amount, location?, description?}',
      getUserAddMoneyTransactions: 'GET /api/add-money/my-transactions?status=PENDING&page=1&limit=10 (user)',
      
      // Transfer Money Transaction endpoints
      createTransferMoneyTransaction: 'POST /api/transfer-money/create (user) - body: {accountId, amount, description?}',
      getUserTransferMoneyTransactions: 'GET /api/transfer-money/my-transactions?status=PENDING&page=1&limit=10 (user)',
      getTransferTransactionById: 'GET /api/transfer-money/:id (user/admin)',
      
      // All Transactions endpoints
      getUserAllTransactions: 'GET /api/transactions/my-transactions?transactionType=DEPOSIT&page=1&limit=10 (user)',
      getTransactionByOrderId: 'GET /api/transactions/order/:orderId (user/admin)',
      getUserTransactionStats: 'GET /api/transactions/my-stats (user)',
      
      // Admin endpoints (admin only)
      getAllUsers: 'GET /api/auth/users?page=1&limit=10&role=USER (admin)',
      getUserById: 'GET /api/auth/users/:userId (admin or self)',
      updateUser: 'PUT /api/auth/users/:userId (admin)',
      deleteUser: 'DELETE /api/auth/users/:userId (admin)',
      adminRegister: 'POST /api/auth/admin/register (admin)',
      
      // Portal Access Management (admin only)
      getPendingUsers: 'GET /api/auth/pending-portal-access?page=1&limit=10 (admin)',
      approvePortalAccess: 'PUT /api/auth/users/:userId/portal-access (admin)',
      bulkApproveAccess: 'POST /api/auth/bulk-approve-portal-access (admin)',
      
      // Add Money Transaction Management (admin only)
      getAllAddMoneyTransactions: 'GET /api/add-money/admin/all-transactions?status=PENDING&page=1&limit=10&userId=:userId (admin)',
      updateToProcessing: 'PUT /api/add-money/admin/:id/processing (admin) - body: {transactionId}',
      approveTransaction: 'PUT /api/add-money/admin/:id/approve (admin) - updates wallet balance & creates all transaction record',
      rejectTransaction: 'PUT /api/add-money/admin/:id/reject (admin) - body: {reason?}',
      
      // Transfer Money Transaction Management (admin only)
      getAllTransferMoneyTransactions: 'GET /api/transfer-money/admin/all-transactions?status=PENDING&page=1&limit=10&userId=:userId (admin)',
      updateTransferToProcessing: 'PUT /api/transfer-money/admin/:id/processing (admin)',
      approveTransferTransaction: 'PUT /api/transfer-money/admin/:id/approve (admin) - updates wallet balance & creates all transaction record',
      rejectTransferTransaction: 'PUT /api/transfer-money/admin/:id/reject (admin) - body: {reason?}',
      
      // All Transactions Management (admin only)
      getAdminAllTransactions: 'GET /api/transactions/admin/all-transactions?transactionType=DEPOSIT&userId=:userId&page=1&limit=10 (admin)',
    },
    roles: {
      USER: 'Regular user with account management (requires portal access approval)',
      ADMIN: 'Administrator with full access to user management and portal access approval'
    },
    authentication: {
      type: 'JWT Bearer Token',
      header: 'Authorization: Bearer <token>',
      note: 'USER role requires isPortalAccess=true to login. ADMIN role has automatic access.'
    },
    portalAccessFlow: {
      step1: 'User registers with email, password, firstName, lastName, phoneNumber',
      step2: 'User receives registration confirmation but cannot login yet',
      step3: 'Admin views pending users via GET /api/auth/pending-portal-access',
      step4: 'Admin approves access via PUT /api/auth/users/:userId/portal-access',
      step5: 'System automatically creates a wallet with 0.00 balance for approved user',
      step6: 'User can now login and access account management and wallet features'
    },
    addMoneyTransactionFlow: {
      step1: 'User creates add money transaction via POST /api/add-money/create with amount, location, description',
      step2: 'Transaction is created with status PENDING',
      step3: 'Admin views all transactions via GET /api/add-money/admin/all-transactions',
      step4: 'Admin updates transaction to PROCESSING via PUT /api/add-money/admin/:id/processing with transactionId',
      step5: 'Admin approves (COMPLETED) or rejects (REJECTED) transaction',
      step6: 'If approved, wallet balance is automatically updated with the transaction amount',
      step7: 'System creates entry in AllTransactions table with unique Order ID (format: OI123456)',
      step8: 'User can view all transaction history via GET /api/transactions/my-transactions'
    },
    transferMoneyTransactionFlow: {
      step1: 'User creates transfer money transaction via POST /api/transfer-money/create with accountId, amount, description',
      step2: 'System validates user has sufficient wallet balance and account belongs to user',
      step3: 'Transaction is created with status PENDING',
      step4: 'Admin views all transfer transactions via GET /api/transfer-money/admin/all-transactions',
      step5: 'Admin updates transaction to PROCESSING via PUT /api/transfer-money/admin/:id/processing',
      step6: 'Admin approves (COMPLETED) or rejects (REJECTED) transaction',
      step7: 'If approved, wallet balance is automatically debited with the transfer amount',
      step8: 'System creates entry in AllTransactions table with unique Order ID, transaction type WITHDRAWAL, and description "Sent to bank account"',
      step9: 'User can view all transaction history via GET /api/transactions/my-transactions'
    },
    transactionTypes: {
      DEPOSIT: 'Money added to wallet (from add money transactions)',
      WITHDRAWAL: 'Money withdrawn from wallet (from transfer money transactions)'
    },
    orderIdFormat: 'OI + 6 random alphanumeric characters (e.g., OI123ABC, OIXY789Z)'
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler - Fixed the problematic route pattern
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

module.exports = app; 