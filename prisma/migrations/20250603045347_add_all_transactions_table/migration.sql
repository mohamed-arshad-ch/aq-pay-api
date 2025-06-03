-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('DEPOSIT', 'WITHDRAWAL');

-- CreateTable
CREATE TABLE "all_transactions" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "transactionType" "TransactionType" NOT NULL,
    "description" TEXT,
    "addMoneyTransactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "all_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "all_transactions_orderId_key" ON "all_transactions"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "all_transactions_addMoneyTransactionId_key" ON "all_transactions"("addMoneyTransactionId");

-- AddForeignKey
ALTER TABLE "all_transactions" ADD CONSTRAINT "all_transactions_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "all_transactions" ADD CONSTRAINT "all_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "all_transactions" ADD CONSTRAINT "all_transactions_addMoneyTransactionId_fkey" FOREIGN KEY ("addMoneyTransactionId") REFERENCES "add_money_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
