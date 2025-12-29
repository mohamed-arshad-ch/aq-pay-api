const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Generate random alphanumeric string
const generateRandomString = (length) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Generate unique order ID with format OI123456 (8 characters total)
const generateUniqueOrderId = async () => {
  let orderId;
  let isUnique = false;

  while (!isUnique) {
    // Generate 6 random characters after 'OI' prefix
    const randomPart = generateRandomString(6);
    orderId = `OI${randomPart}`;

    // Check if this order ID already exists
    const existingTransaction = await prisma.allTransaction.findUnique({
      where: { orderId }
    });

    if (!existingTransaction) {
      isUnique = true;
    }
  }

  return orderId;
};

// Generate unique 12-digit transaction reference ID
const generateTransactionRefId = async (modelName) => {
  let refId;
  let isUnique = false;

  while (!isUnique) {
    // Generate 12 random digits
    refId = '';
    for (let i = 0; i < 12; i++) {
      refId += Math.floor(Math.random() * 10).toString();
    }

    // Check if this ref ID already exists in the specific model
    // Note: modelName should be 'addMoneyTransaction' or 'transferMoneyTransaction'
    const existing = await prisma[modelName].findUnique({
      where: { transactionRefId: refId }
    });

    if (!existing) {
      isUnique = true;
    }
  }

  return refId;
};

module.exports = {
  generateUniqueOrderId,
  generateTransactionRefId
}; 