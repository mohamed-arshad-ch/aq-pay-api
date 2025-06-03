/*
  Warnings:

  - A unique constraint covering the columns `[transferMoneyTransactionId]` on the table `all_transactions` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "all_transactions" ADD COLUMN     "transferMoneyTransactionId" TEXT;

-- CreateTable
CREATE TABLE "transfer_money_transactions" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "description" TEXT,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transfer_money_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "all_transactions_transferMoneyTransactionId_key" ON "all_transactions"("transferMoneyTransactionId");

-- AddForeignKey
ALTER TABLE "transfer_money_transactions" ADD CONSTRAINT "transfer_money_transactions_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_money_transactions" ADD CONSTRAINT "transfer_money_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "all_transactions" ADD CONSTRAINT "all_transactions_transferMoneyTransactionId_fkey" FOREIGN KEY ("transferMoneyTransactionId") REFERENCES "transfer_money_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
