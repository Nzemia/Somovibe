-- CreateIndex (if not exists - safe to run on existing DB)
CREATE INDEX IF NOT EXISTS "Purchase_userId_pdfId_idx" ON "Purchase"("userId", "pdfId");
