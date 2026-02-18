-- Manual migration for withdrawal requests
-- Run this SQL directly in your database

-- Step 1: Create enums if they don't exist
DO $$ BEGIN
    CREATE TYPE "TransactionType" AS ENUM ('CREDIT', 'DEBIT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "WithdrawalStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 2: Update existing WalletTransaction data
UPDATE "WalletTransaction" SET type = 'CREDIT' WHERE type = 'credit';
UPDATE "WalletTransaction" SET type = 'DEBIT' WHERE type = 'debit';

-- Step 3: Alter WalletTransaction table
ALTER TABLE "WalletTransaction" ALTER COLUMN "type" TYPE "TransactionType" USING type::"TransactionType";

-- Step 4: Create WithdrawalRequest table
CREATE TABLE IF NOT EXISTS "WithdrawalRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "phone" TEXT NOT NULL,
    "status" "WithdrawalStatus" NOT NULL DEFAULT 'PENDING',
    "mpesaReceiptNumber" TEXT,
    "mpesaConversationId" TEXT,
    "mpesaResponseCode" TEXT,
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "WithdrawalRequest_pkey" PRIMARY KEY ("id")
);

-- Step 5: Create indexes
CREATE INDEX IF NOT EXISTS "WithdrawalRequest_userId_idx" ON "WithdrawalRequest"("userId");
CREATE INDEX IF NOT EXISTS "WithdrawalRequest_status_idx" ON "WithdrawalRequest"("status");

-- Step 6: Add foreign key
ALTER TABLE "WithdrawalRequest" 
ADD CONSTRAINT "WithdrawalRequest_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "User"("id") 
ON DELETE RESTRICT ON UPDATE CASCADE;
