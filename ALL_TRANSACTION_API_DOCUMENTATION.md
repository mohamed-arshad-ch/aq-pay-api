# All Transaction API Documentation

This document provides comprehensive documentation for all All Transaction related API endpoints.

## Base URL
```
/api/all-transactions
```

## Authentication
All endpoints require JWT authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

Admin endpoints additionally require admin role privileges.

---

## Overview

The All Transaction API provides a unified view of all wallet transactions across the platform. This includes:
- **DEPOSIT** transactions (from Add Money operations)
- **WITHDRAWAL** transactions (from Transfer Money operations)

Each transaction record contains a unique order ID and links back to the original transaction source.

---

## User Endpoints

### 1. Get User's All Transactions

**Endpoint:** `GET /api/all-transactions/my-transactions`

**Description:** Retrieves the authenticated user's complete transaction history with pagination and filtering

**Authentication:** Required (User)

**Query Parameters:**
- `transactionType` (string, optional): Filter by transaction type (DEPOSIT, WITHDRAWAL)
- `page` (number, optional, default: 1): Page number for pagination
- `limit` (number, optional, default: 10): Number of records per page

**Sample Request:**
```
GET /api/all-transactions/my-transactions?transactionType=DEPOSIT&page=1&limit=5
```

**Sample Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "alltxn123",
        "orderId": "ORD_1734567890123",
        "walletId": "wallet123",
        "userId": "user123",
        "amount": 100.50,
        "transactionType": "DEPOSIT",
        "description": "Added money to wallet - Add Money Transaction ID: cm123abc456",
        "addMoneyTransactionId": "cm123abc456",
        "transferMoneyTransactionId": null,
        "createdAt": "2024-01-15T11:30:00.000Z",
        "user": {
          "id": "user123",
          "email": "user@example.com",
          "firstName": "John",
          "lastName": "Doe"
        },
        "wallet": {
          "id": "wallet123",
          "balance": 150.50
        },
        "addMoneyTransaction": {
          "id": "cm123abc456",
          "amount": 100.50,
          "status": "COMPLETED",
          "transactionId": "TXN_20240115_001"
        }
      },
      {
        "id": "alltxn124",
        "orderId": "ORD_1734567890124",
        "walletId": "wallet123",
        "userId": "user123",
        "amount": 50.00,
        "transactionType": "WITHDRAWAL",
        "description": "Sent to bank account",
        "addMoneyTransactionId": null,
        "transferMoneyTransactionId": "tm123abc456",
        "createdAt": "2024-01-15T12:00:00.000Z",
        "user": {
          "id": "user123",
          "email": "user@example.com",
          "firstName": "John",
          "lastName": "Doe"
        },
        "wallet": {
          "id": "wallet123",
          "balance": 100.50
        },
        "addMoneyTransaction": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 5,
      "total": 2,
      "totalPages": 1
    }
  }
}
```

---

### 2. Get Transaction by Order ID

**Endpoint:** `GET /api/all-transactions/order/:orderId`

**Description:** Retrieves a specific transaction by its unique order ID (users can only see their own transactions)

**Authentication:** Required (User/Admin)

**URL Parameters:**
- `orderId` (string, required): The unique order ID of the transaction

**Sample Request:**
```
GET /api/all-transactions/order/ORD_1734567890123
```

**Sample Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "id": "alltxn123",
    "orderId": "ORD_1734567890123",
    "walletId": "wallet123",
    "userId": "user123",
    "amount": 100.50,
    "transactionType": "DEPOSIT",
    "description": "Added money to wallet - Add Money Transaction ID: cm123abc456",
    "addMoneyTransactionId": "cm123abc456",
    "transferMoneyTransactionId": null,
    "createdAt": "2024-01-15T11:30:00.000Z",
    "user": {
      "id": "user123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "wallet": {
      "id": "wallet123",
      "balance": 150.50
    },
    "addMoneyTransaction": {
      "id": "cm123abc456",
      "amount": 100.50,
      "status": "COMPLETED",
      "transactionId": "TXN_20240115_001",
      "location": "Bank Transfer - Chase Bank",
      "description": "Adding money to wallet for shopping"
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

**Sample Response (Error - 403):**
```json
{
  "success": false,
  "message": "Access denied"
}
```

---

### 3. Get User's Transaction Statistics

**Endpoint:** `GET /api/all-transactions/my-stats`

**Description:** Retrieves statistical summary of the authenticated user's transaction history

**Authentication:** Required (User)

**Query Parameters:** None

**Sample Request:**
```
GET /api/all-transactions/my-stats
```

**Sample Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "totalTransactions": 15,
    "deposits": {
      "count": 8,
      "totalAmount": 2500.75
    },
    "withdrawals": {
      "count": 7,
      "totalAmount": 1800.25
    }
  }
}
```

---

## Admin Endpoints

### 4. Get All Transactions (Admin)

**Endpoint:** `GET /api/all-transactions/admin/all-transactions`

**Description:** Retrieves all transaction records across all users (Admin only)

**Authentication:** Required (Admin)

**Query Parameters:**
- `transactionType` (string, optional): Filter by transaction type (DEPOSIT, WITHDRAWAL)
- `userId` (string, optional): Filter by specific user ID
- `page` (number, optional, default: 1): Page number for pagination
- `limit` (number, optional, default: 10): Number of records per page

**Sample Request:**
```
GET /api/all-transactions/admin/all-transactions?transactionType=WITHDRAWAL&page=1&limit=10
```

**Sample Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "alltxn124",
        "orderId": "ORD_1734567890124",
        "walletId": "wallet123",
        "userId": "user123",
        "amount": 500.00,
        "transactionType": "WITHDRAWAL",
        "description": "Sent to bank account",
        "addMoneyTransactionId": null,
        "transferMoneyTransactionId": "tm123abc456",
        "createdAt": "2024-01-15T12:00:00.000Z",
        "user": {
          "id": "user123",
          "email": "user@example.com",
          "firstName": "John",
          "lastName": "Doe",
          "phoneNumber": "+1234567890"
        },
        "wallet": {
          "id": "wallet123",
          "balance": 250.00
        },
        "addMoneyTransaction": null
      },
      {
        "id": "alltxn125",
        "orderId": "ORD_1734567890125",
        "walletId": "wallet456",
        "userId": "user456",
        "amount": 300.00,
        "transactionType": "WITHDRAWAL",
        "description": "Sent to bank account",
        "addMoneyTransactionId": null,
        "transferMoneyTransactionId": "tm456def789",
        "createdAt": "2024-01-15T13:00:00.000Z",
        "user": {
          "id": "user456",
          "email": "jane@example.com",
          "firstName": "Jane",
          "lastName": "Smith",
          "phoneNumber": "+9876543210"
        },
        "wallet": {
          "id": "wallet456",
          "balance": 700.00
        },
        "addMoneyTransaction": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 2,
      "totalPages": 1
    }
  }
}
```

---

## Transaction Types

### DEPOSIT Transactions
- **Source:** Add Money transactions that have been approved
- **Effect:** Increases wallet balance
- **Links to:** `addMoneyTransaction` record
- **Description:** Typically "Added money to wallet - Add Money Transaction ID: {id}"

### WITHDRAWAL Transactions
- **Source:** Transfer Money transactions that have been approved
- **Effect:** Decreases wallet balance
- **Links to:** `transferMoneyTransaction` record
- **Description:** Typically "Sent to bank account"

---

## Data Relationships

Each All Transaction record contains:
- **Unique Order ID:** Generated automatically (format: ORD_timestamp)
- **Transaction Type:** Either DEPOSIT or WITHDRAWAL
- **Source Transaction Link:** Either `addMoneyTransactionId` or `transferMoneyTransactionId`
- **Wallet Reference:** Links to the user's wallet
- **User Reference:** Links to the transaction owner

---

## Error Codes

- **400 Bad Request**: Invalid query parameters
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Insufficient permissions or access denied
- **404 Not Found**: Transaction not found
- **500 Internal Server Error**: Server-side error

## Security & Access Control

### User Access:
- Users can only view their own transaction records
- All endpoints require valid JWT authentication
- Phone numbers are not exposed to regular users

### Admin Access:
- Admins can view all transactions across all users
- Phone numbers are included in admin responses
- Additional filtering capabilities by user ID

## Business Logic Notes

### Transaction Creation:
- All Transaction records are automatically created when:
  - An Add Money transaction is approved (creates DEPOSIT)
  - A Transfer Money transaction is approved (creates WITHDRAWAL)
- Each transaction gets a unique order ID for tracking
- Transactions are immutable once created

### Order ID Format:
- Format: `ORD_{timestamp}`
- Generated using the `generateUniqueOrderId()` utility
- Provides unique tracking across the entire system

### Data Consistency:
- All Transaction records maintain referential integrity
- Links back to source transactions (Add Money or Transfer Money)
- Wallet balance at time of transaction is not stored (current balance shown)

## Notes

- All amounts are handled as floating-point numbers
- Timestamps are in ISO 8601 format (UTC)
- Transaction records are read-only through this API
- Statistics endpoint provides aggregated data for quick insights
- Order IDs can be used for customer support and transaction tracking
- The API provides a complete audit trail of all wallet activities 