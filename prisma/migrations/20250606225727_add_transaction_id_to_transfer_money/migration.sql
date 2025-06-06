-- DropIndex
DROP INDEX "push_tokens_token_key";

-- AlterTable
ALTER TABLE "transfer_money_transactions" ADD COLUMN     "transactionId" TEXT;
