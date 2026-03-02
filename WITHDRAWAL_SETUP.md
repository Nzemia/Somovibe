# M-Pesa B2C Withdrawal Setup Guide

## Overview
This implementation allows both teachers and admins to withdraw their earnings via M-Pesa B2C (Business to Customer) API.

## Features Implemented

### 1. Teacher Withdrawals
- Teachers can withdraw their 75% earnings from material sales
- Minimum withdrawal: KES 10
- Maximum withdrawal: KES 150,000
- Automatic wallet deduction and refund on failure
- Transaction history tracking

### 2. Admin Withdrawals
- Admin can withdraw platform earnings (25% commission + verification fees)
- Same withdrawal limits and safety features
- Separate wallet page at `/admin/wallet`

### 3. Safety Features
- Idempotency: Prevents duplicate withdrawals
- Automatic refund if M-Pesa fails
- Phone number validation (254XXXXXXXXX format)
- Balance verification before processing
- Pending withdrawal check (one at a time)

## Database Setup

### Option 1: Run Manual SQL (Recommended)
Execute the SQL file in your Neon database console:
```bash
# Copy contents of prisma/manual_migration_withdrawal.sql
# Paste and run in Neon SQL Editor
```

### Option 2: Use Prisma (if you can reset)
```bash
npx prisma migrate reset
npx prisma migrate dev
```

## Environment Variables

Add these to your `.env` file:

```env
# M-Pesa B2C Configuration
MPESA_B2C_SHORTCODE=your_b2c_shortcode
MPESA_INITIATOR_NAME=your_initiator_name
MPESA_SECURITY_CREDENTIAL=your_encrypted_security_credential

# For testing without real M-Pesa
DEV_MODE=true
```

## Getting M-Pesa B2C Credentials

### 1. B2C Shortcode
- Login to Daraja Portal: https://developer.safaricom.co.ke
- Go to "My Apps" → Select your app
- Navigate to "B2C" section
- Copy the B2C Shortcode (different from Paybill shortcode)

### 2. Initiator Name
- This is your M-Pesa API username
- Found in Daraja Portal under "Credentials"
- Usually looks like: `testapi` (sandbox) or your business name (production)

### 3. Security Credential
- This is an encrypted password
- Generate it using Safaricom's public certificate
- Steps:
  1. Download certificate from Daraja Portal
  2. Use OpenSSL to encrypt your initiator password:
  ```bash
  openssl pkeyutl -encrypt -in password.txt -out encrypted.txt -inkey cert.cer -pubin -pkeyopt rsa_padding_mode:pkcs1
  base64 encrypted.txt
  ```
  3. Copy the base64 output to `MPESA_SECURITY_CREDENTIAL`

## Testing

### DEV MODE (No Real M-Pesa)
Set `DEV_MODE=true` in `.env`:
- Withdrawals complete instantly
- No M-Pesa API calls
- Perfect for development

### Sandbox Testing
1. Set `MPESA_ENVIRONMENT=sandbox`
2. Use Safaricom test credentials
3. Use test phone numbers: `254708374149`

### Production
1. Set `MPESA_ENVIRONMENT=production`
2. Use production credentials
3. Test with small amounts first

## Callback URLs

Make sure these URLs are accessible:
- Result: `https://your-domain.com/api/mpesa/callback/b2c/result`
- Timeout: `https://your-domain.com/api/mpesa/callback/b2c/timeout`

For local development, use ngrok:
```bash
ngrok http 3000
# Update NEXT_PUBLIC_BASE_URL with ngrok URL
```

## API Endpoints

### POST /api/wallet/withdraw
Request:
```json
{
  "amount": 100,
  "phone": "254712345678"
}
```

Response (Success):
```json
{
  "message": "Withdrawal initiated. You will receive the money shortly.",
  "withdrawal": {
    "id": "...",
    "amount": 100,
    "status": "PROCESSING"
  }
}
```

## UI Pages

### Teacher Wallet
- URL: `/teacher/wallet`
- Features: View balance, withdraw, transaction history
- Access: Teachers only

### Admin Wallet
- URL: `/admin/wallet`
- Features: View platform earnings, withdraw, transaction history
- Access: Admin only

## Troubleshooting

### "Insufficient balance"
- Check wallet balance in database
- Verify transactions are being credited correctly

### "Invalid phone number"
- Must be in format: 254XXXXXXXXX
- No spaces or special characters

### "You have a pending withdrawal"
- Only one withdrawal at a time
- Wait for current withdrawal to complete

### M-Pesa callback not received
- Check ngrok is running (local dev)
- Verify callback URLs in Daraja Portal
- Check server logs for errors

### Withdrawal stuck in PROCESSING
- Check M-Pesa callback logs
- May need to manually update status
- Automatic refund after timeout

## Database Schema

### WithdrawalRequest
```prisma
model WithdrawalRequest {
  id                  String           @id @default(uuid())
  userId              String
  amount              Int
  phone               String
  status              WithdrawalStatus @default(PENDING)
  mpesaReceiptNumber  String?
  mpesaConversationId String?
  mpesaResponseCode   String?
  failureReason       String?
  createdAt           DateTime         @default(now())
  completedAt         DateTime?
  
  user User @relation(fields: [userId], references: [id])
}
```

### WalletTransaction (Updated)
```prisma
model WalletTransaction {
  id        String          @id @default(uuid())
  walletId  String
  amount    Int
  type      TransactionType // Now enum: CREDIT | DEBIT
  createdAt DateTime        @default(now())
  
  wallet Wallet @relation(fields: [walletId], references: [id])
}
```

## Security Notes

1. Never commit real credentials to git
2. Use environment variables for all secrets
3. Validate all inputs on server side
4. Log all withdrawal attempts
5. Monitor for suspicious patterns
6. Set reasonable withdrawal limits

## Next Steps

1. Run the manual SQL migration
2. Add M-Pesa B2C credentials to `.env`
3. Test in DEV_MODE first
4. Test in sandbox with test credentials
5. Deploy to production with real credentials
6. Monitor first few withdrawals closely

## Support

For M-Pesa API issues:
- Daraja Support: https://developer.safaricom.co.ke/support
- Documentation: https://developer.safaricom.co.ke/APIs/BusinessToCustomer

For implementation issues:
- Check server logs
- Review callback payloads
- Test with DEV_MODE enabled
