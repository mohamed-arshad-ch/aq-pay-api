# Transfer Money API Documentation

This document provides comprehensive documentation for all Transfer Money related API endpoints.

## Base URL
```
/api/transfer-money
```

## Authentication
All endpoints require JWT authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

Admin endpoints additionally require admin role privileges.

---

## User Endpoints

### 1. Create Transfer Money Transaction

**Endpoint:** `POST /api/transfer-money/create`

**Description:** Creates a new transfer money transaction request to send money from wallet to bank account

**Authentication:** Required (User)

**Request Body:**
```json
{
  "accountId": "acc123abc456",
  "amount": 500.00,
  "description": "Monthly rent payment"
}
```

**Request Body Parameters:**
- `accountId` (string, required): ID of the bank account to transfer money to (must belong to the user)
- `amount` (number, required): Amount to transfer (must be > 0)
- `description` (string, optional): Description for the transfer

**Sample Response (Success - 201):**
```json
{
  "success": true,
  "message": "Transfer money transaction created successfully",
  "data": {
    "id": "tm123abc456",
    "accountId": "acc123abc456",
    "amount": 500.00,
    "description": "Monthly rent payment",
    "userId": "user123",
    "status": "PENDING",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "account": {
      "id": "acc123abc456",
      "accountHolderName": "John Doe",
      "accountNumber": "1234567890",
      "ifscCode": "SBIN0001234"
    },
    "user": {
      "id": "user123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

**Sample Response (Error - 400):**
```json
{
  "success": false,
  "message": "Insufficient wallet balance"
}
```

**Sample Response (Error - 404):**
```json
{
  "success": false,
  "message": "Account not found or does not belong to you"
}
```

---

### 2. Get User's Transfer Money Transactions

**Endpoint:** `GET /api/transfer-money/my-transactions`

**Description:** Retrieves the authenticated user's transfer money transactions with pagination and filtering

**Authentication:** Required (User)

**Query Parameters:**
- `status` (string, optional): Filter by status (PENDING, PROCESSING, COMPLETED, REJECTED)
- `page` (number, optional, default: 1): Page number for pagination
- `limit` (number, optional, default: 10): Number of records per page

**Sample Request:**
```
GET /api/transfer-money/my-transactions?status=COMPLETED&page=1&limit=5
```

**Sample Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "tm123abc456",
        "accountId": "acc123abc456",
        "amount": 500.00,
        "description": "Monthly rent payment",
        "transactionId": "TXN1234567890",
        "userId": "user123",
        "status": "COMPLETED",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T12:00:00.000Z",
        "account": {
          "id": "acc123abc456",
          "accountHolderName": "John Doe",
          "accountNumber": "1234567890",
          "ifscCode": "SBIN0001234"
        },
        "user": {
          "id": "user123",
          "email": "user@example.com",
          "firstName": "John",
          "lastName": "Doe"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 5,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

---

### 3. Get Transfer Transaction by ID

**Endpoint:** `GET /api/transfer-money/:id`

**Description:** Retrieves a specific transfer transaction by ID (users can only see their own transactions)

**Authentication:** Required (User/Admin)

**URL Parameters:**
- `id` (string, required): The transfer money transaction ID

**Sample Request:**
```
GET /api/transfer-money/tm123abc456
```

**Sample Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "id": "tm123abc456",
    "accountId": "acc123abc456",
    "amount": 500.00,
    "description": "Monthly rent payment",
    "transactionId": "TXN1234567890",
    "userId": "user123",
    "status": "COMPLETED",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T12:00:00.000Z",
    "account": {
      "id": "acc123abc456",
      "accountHolderName": "John Doe",
      "accountNumber": "1234567890",
      "ifscCode": "SBIN0001234"
    },
    "user": {
      "id": "user123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "allTransaction": {
      "id": "alltxn123",
      "orderId": "ORD_1734567890123",
      "amount": 500.00,
      "transactionType": "WITHDRAWAL",
      "description": "Sent to bank account",
      "createdAt": "2024-01-15T12:00:00.000Z"
    }
  }
}
```

**Sample Response (Error - 404):**
```json
{
  "success": false,
  "message": "Transaction not found"
}
```

---

## Admin Endpoints

### 4. Get All Transfer Money Transactions (Admin)

**Endpoint:** `GET /api/transfer-money/admin/all-transactions`

**Description:** Retrieves all transfer money transactions across all users (Admin only)

**Authentication:** Required (Admin)

**Query Parameters:**
- `status` (string, optional): Filter by status (PENDING, PROCESSING, COMPLETED, REJECTED)
- `page` (number, optional, default: 1): Page number for pagination
- `limit` (number, optional, default: 10): Number of records per page
- `userId` (string, optional): Filter by specific user ID

**Sample Request:**
```
GET /api/transfer-money/admin/all-transactions?status=PENDING&page=1&limit=10
```

**Sample Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "tm123abc456",
        "accountId": "acc123abc456",
        "amount": 500.00,
        "description": "Monthly rent payment",
        "transactionId": "TXN1234567890",
        "userId": "user123",
        "status": "PENDING",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z",
        "account": {
          "id": "acc123abc456",
          "accountHolderName": "John Doe",
          "accountNumber": "1234567890",
          "ifscCode": "SBIN0001234"
        },
        "user": {
          "id": "user123",
          "email": "user@example.com",
          "firstName": "John",
          "lastName": "Doe",
          "phoneNumber": "+1234567890"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

---

### 5. Update Transaction Status to Processing (Admin)

**Endpoint:** `PUT /api/transfer-money/admin/:id/processing`

**Description:** Updates a transfer money transaction status from PENDING to PROCESSING and assigns a transaction ID

**Authentication:** Required (Admin)

**URL Parameters:**
- `id` (string, required): The transfer money transaction ID

**Request Body:**
```json
{
  "transactionId": "TXN1234567890"
}
```

**Request Body Parameters:**
- `transactionId` (string, required): A unique transaction ID for tracking the transaction

**Sample Response (Success - 200):**
```json
{
  "success": true,
  "message": "Transaction status updated to processing successfully",
  "data": {
    "id": "tm123abc456",
    "accountId": "acc123abc456",
    "amount": 500.00,
    "description": "Monthly rent payment",
    "transactionId": "TXN1234567890",
    "userId": "user123",
    "status": "PROCESSING",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z",
    "account": {
      "id": "acc123abc456",
      "accountHolderName": "John Doe",
      "accountNumber": "1234567890",
      "ifscCode": "SBIN0001234"
    },
    "user": {
      "id": "user123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

**Sample Response (Error - 400):**
```json
{
  "success": false,
  "message": "Transaction ID is required"
}
```

**Sample Response (Error - 400):**
```json
{
  "success": false,
  "message": "Only pending transactions can be moved to processing"
}
```

**Sample Response (Error - 404):**
```json
{
  "success": false,
  "message": "Transaction not found"
}
```

---

### 6. Approve Transfer Transaction (Admin)

**Endpoint:** `PUT /api/transfer-money/admin/:id/approve`

**Description:** Approves a processing transfer transaction, deducts wallet balance, and creates transaction record

**Authentication:** Required (Admin)

**URL Parameters:**
- `id` (string, required): The transfer money transaction ID

**Request Body:** None required

**Sample Response (Success - 200):**
```json
{
  "success": true,
  "message": "Transfer transaction approved, wallet updated, and transaction recorded successfully",
  "data": {
    "updatedTransaction": {
      "id": "tm123abc456",
      "accountId": "acc123abc456",
      "amount": 500.00,
      "description": "Monthly rent payment",
      "userId": "user123",
      "status": "COMPLETED",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T12:00:00.000Z",
      "account": {
        "id": "acc123abc456",
        "accountHolderName": "John Doe",
        "accountNumber": "1234567890",
        "ifscCode": "SBIN0001234"
      },
      "user": {
        "id": "user123",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe"
      }
    },
    "updatedWallet": {
      "id": "wallet123",
      "userId": "user123",
      "balance": 250.00,
      "createdAt": "2024-01-10T09:00:00.000Z",
      "updatedAt": "2024-01-15T12:00:00.000Z"
    },
    "allTransactionEntry": {
      "id": "alltxn123",
      "orderId": "ORD_1734567890123",
      "walletId": "wallet123",
      "userId": "user123",
      "amount": 500.00,
      "transactionType": "WITHDRAWAL",
      "description": "Sent to bank account",
      "transferMoneyTransactionId": "tm123abc456",
      "createdAt": "2024-01-15T12:00:00.000Z",
      "wallet": {
        "id": "wallet123",
        "userId": "user123",
        "balance": 250.00,
        "createdAt": "2024-01-10T09:00:00.000Z",
        "updatedAt": "2024-01-15T12:00:00.000Z"
      },
      "user": {
        "id": "user123",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe"
      }
    }
  }
}
```

**Sample Response (Error - 400):**
```json
{
  "success": false,
  "message": "Insufficient wallet balance for this transaction"
}
```

---

### 7. Reject Transfer Transaction (Admin)

**Endpoint:** `PUT /api/transfer-money/admin/:id/reject`

**Description:** Rejects a processing transfer transaction with optional reason

**Authentication:** Required (Admin)

**URL Parameters:**
- `id` (string, required): The transfer money transaction ID

**Request Body:**
```json
{
  "reason": "Bank account details verification failed"
}
```

**Request Body Parameters:**
- `reason` (string, optional): Reason for rejection

**Sample Response (Success - 200):**
```json
{
  "success": true,
  "message": "Transfer transaction rejected successfully",
  "data": {
    "id": "tm123abc456",
    "accountId": "acc123abc456",
    "amount": 500.00,
    "description": "Monthly rent payment | Rejection reason: Bank account details verification failed",
    "userId": "user123",
    "status": "REJECTED",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T13:00:00.000Z",
    "account": {
      "id": "acc123abc456",
      "accountHolderName": "John Doe",
      "accountNumber": "1234567890",
      "ifscCode": "SBIN0001234"
    },
    "user": {
      "id": "user123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

**Sample Response (Error - 400):**
```json
{
  "success": false,
  "message": "Only processing transactions can be rejected"
}
```

---

## Transaction Status Flow

1. **PENDING** → Initial status when transfer transaction is created
2. **PROCESSING** → Admin moves transaction to processing status
3. **COMPLETED** → Admin approves transaction (wallet balance deducted, transaction recorded)
4. **REJECTED** → Admin rejects transaction (with optional reason)

## Error Codes

- **400 Bad Request**: Invalid input data, insufficient balance, or business logic error
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Insufficient permissions (admin required)
- **404 Not Found**: Transaction or account not found
- **500 Internal Server Error**: Server-side error

## Business Logic Notes

### Transfer Money Creation:
- User must have a valid bank account that belongs to them
- User must have sufficient wallet balance to cover the transfer amount
- Transfer amount must be greater than 0
- Account validation ensures the account belongs to the requesting user

### Transfer Money Approval Process:
- Only PENDING transactions can be moved to PROCESSING
- Only PROCESSING transactions can be APPROVED or REJECTED
- When approved:
  - User's wallet balance is automatically decremented by the transfer amount
  - A new WITHDRAWAL entry is created in the AllTransaction table
  - The transaction status is updated to COMPLETED
- Wallet balance is checked again during approval to ensure sufficient funds

### Security & Access Control:
- Users can only see and create transactions for their own accounts
- Users can only view their own transfer transactions
- Admin users can view and manage all transfer transactions
- Phone numbers are only shown to admin users in responses

## Notes

- All amounts are handled as floating-point numbers
- Timestamps are in ISO 8601 format (UTC)
- Bank account details (account number, IFSC code, holder name) are included in responses
- Rejection reasons are appended to the transaction description
- Transfer transactions are linked to AllTransaction records for comprehensive tracking
- The system automatically generates unique order IDs for approved transactions 