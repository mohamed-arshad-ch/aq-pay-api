# Transaction Status API Documentation

This document provides comprehensive documentation for all Transaction Status related API endpoints that combine data from both Add Money and Transfer Money transactions.

## Base URL
```
/api/transaction-status
```

## Authentication
All endpoints require JWT authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

Admin endpoints additionally require admin role privileges.

---

## Overview

The Transaction Status API provides a unified way to view transactions from both Add Money and Transfer Money tables filtered by their status (pending, processing, completed, rejected). The API:

- Combines data from both transaction types
- Sorts results by creation date (newest first)
- Handles pagination properly across the combined data
- Identifies each transaction with a `transactionType` field (`ADD_MONEY` or `TRANSFER_MONEY`)
- Returns proper account details for transfer money transactions

---

## User Endpoints

### 1. Get User's Pending Transactions

**Endpoint:** `GET /api/transaction-status/user/pending`

**Description:** Retrieves the authenticated user's pending transactions from both Add Money and Transfer Money tables

**Authentication:** Required (User)

**Query Parameters:**
- `page` (number, optional, default: 1): Page number for pagination
- `limit` (number, optional, default: 10): Number of records per page

**Sample Request:**
```
GET /api/transaction-status/user/pending?page=1&limit=5
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
        "userId": "user123",
        "status": "PENDING",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z",
        "transactionType": "TRANSFER_MONEY",
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
      {
        "id": "cm123abc456",
        "amount": 100.50,
        "location": "Bank Transfer - Chase Bank",
        "description": "Adding money to wallet for shopping",
        "userId": "user123",
        "status": "PENDING",
        "transactionId": null,
        "createdAt": "2024-01-14T15:30:00.000Z",
        "updatedAt": "2024-01-14T15:30:00.000Z",
        "transactionType": "ADD_MONEY",
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
      "total": 2,
      "totalPages": 1
    }
  }
}
```

---

### 2. Get User's Processing Transactions

**Endpoint:** `GET /api/transaction-status/user/processing`

**Description:** Retrieves the authenticated user's processing transactions from both Add Money and Transfer Money tables

**Authentication:** Required (User)

**Query Parameters:**
- `page` (number, optional, default: 1): Page number for pagination
- `limit` (number, optional, default: 10): Number of records per page

**Sample Request:**
```
GET /api/transaction-status/user/processing?page=1&limit=5
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
        "userId": "user123",
        "status": "PROCESSING",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T11:00:00.000Z",
        "transactionType": "TRANSFER_MONEY",
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
      {
        "id": "cm123abc456",
        "amount": 100.50,
        "location": "Bank Transfer - Chase Bank",
        "description": "Adding money to wallet for shopping",
        "userId": "user123",
        "status": "PROCESSING",
        "transactionId": "TXN_20240115_001",
        "createdAt": "2024-01-14T15:30:00.000Z",
        "updatedAt": "2024-01-14T16:00:00.000Z",
        "transactionType": "ADD_MONEY",
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
      "total": 2,
      "totalPages": 1
    }
  }
}
```

---

### 3. Get User's Completed Transactions

**Endpoint:** `GET /api/transaction-status/user/completed`

**Description:** Retrieves the authenticated user's completed transactions from both Add Money and Transfer Money tables

**Authentication:** Required (User)

**Query Parameters:**
- `page` (number, optional, default: 1): Page number for pagination
- `limit` (number, optional, default: 10): Number of records per page

**Sample Request:**
```
GET /api/transaction-status/user/completed?page=1&limit=5
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
        "userId": "user123",
        "status": "COMPLETED",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T12:00:00.000Z",
        "transactionType": "TRANSFER_MONEY",
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
          "id": "alltxn124",
          "orderId": "ORD_1734567890124"
        }
      },
      {
        "id": "cm123abc456",
        "amount": 100.50,
        "location": "Bank Transfer - Chase Bank",
        "description": "Adding money to wallet for shopping",
        "userId": "user123",
        "status": "COMPLETED",
        "transactionId": "TXN_20240115_001",
        "createdAt": "2024-01-14T15:30:00.000Z",
        "updatedAt": "2024-01-14T17:00:00.000Z",
        "transactionType": "ADD_MONEY",
        "user": {
          "id": "user123",
          "email": "user@example.com",
          "firstName": "John",
          "lastName": "Doe"
        },
        "allTransaction": {
          "id": "alltxn123",
          "orderId": "ORD_1734567890123"
        }
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

### 4. Get User's Rejected Transactions

**Endpoint:** `GET /api/transaction-status/user/rejected`

**Description:** Retrieves the authenticated user's rejected transactions from both Add Money and Transfer Money tables

**Authentication:** Required (User)

**Query Parameters:**
- `page` (number, optional, default: 1): Page number for pagination
- `limit` (number, optional, default: 10): Number of records per page

**Sample Request:**
```
GET /api/transaction-status/user/rejected?page=1&limit=5
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
        "description": "Monthly rent payment | Rejection reason: Bank account details verification failed",
        "userId": "user123",
        "status": "REJECTED",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T13:00:00.000Z",
        "transactionType": "TRANSFER_MONEY",
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
      {
        "id": "cm123abc456",
        "amount": 100.50,
        "location": "Bank Transfer - Chase Bank",
        "description": "Adding money to wallet for shopping | Rejection reason: Insufficient verification documents provided",
        "userId": "user123",
        "status": "REJECTED",
        "transactionId": "TXN_20240115_001",
        "createdAt": "2024-01-14T15:30:00.000Z",
        "updatedAt": "2024-01-14T18:00:00.000Z",
        "transactionType": "ADD_MONEY",
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
      "total": 2,
      "totalPages": 1
    }
  }
}
```

---

## Admin Endpoints

### 5. Get All Pending Transactions (Admin)

**Endpoint:** `GET /api/transaction-status/admin/pending`

**Description:** Retrieves all pending transactions from both Add Money and Transfer Money tables (Admin only)

**Authentication:** Required (Admin)

**Query Parameters:**
- `page` (number, optional, default: 1): Page number for pagination
- `limit` (number, optional, default: 10): Number of records per page
- `userId` (string, optional): Filter by specific user ID

**Sample Request:**
```
GET /api/transaction-status/admin/pending?userId=user123&page=1&limit=10
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
        "userId": "user123",
        "status": "PENDING",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z",
        "transactionType": "TRANSFER_MONEY",
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
      },
      {
        "id": "cm123abc456",
        "amount": 100.50,
        "location": "Bank Transfer - Chase Bank",
        "description": "Adding money to wallet for shopping",
        "userId": "user123",
        "status": "PENDING",
        "transactionId": null,
        "createdAt": "2024-01-14T15:30:00.000Z",
        "updatedAt": "2024-01-14T15:30:00.000Z",
        "transactionType": "ADD_MONEY",
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
      "total": 2,
      "totalPages": 1
    }
  }
}
```

---

### 6. Get All Processing Transactions (Admin)

**Endpoint:** `GET /api/transaction-status/admin/processing`

**Description:** Retrieves all processing transactions from both Add Money and Transfer Money tables (Admin only)

**Authentication:** Required (Admin)

**Query Parameters:**
- `page` (number, optional, default: 1): Page number for pagination
- `limit` (number, optional, default: 10): Number of records per page
- `userId` (string, optional): Filter by specific user ID

**Sample Request:**
```
GET /api/transaction-status/admin/processing?userId=user123&page=1&limit=10
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
        "userId": "user123",
        "status": "PROCESSING",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T11:00:00.000Z",
        "transactionType": "TRANSFER_MONEY",
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
      },
      {
        "id": "cm123abc456",
        "amount": 100.50,
        "location": "Bank Transfer - Chase Bank",
        "description": "Adding money to wallet for shopping",
        "userId": "user123",
        "status": "PROCESSING",
        "transactionId": "TXN_20240115_001",
        "createdAt": "2024-01-14T15:30:00.000Z",
        "updatedAt": "2024-01-14T16:00:00.000Z",
        "transactionType": "ADD_MONEY",
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
      "total": 2,
      "totalPages": 1
    }
  }
}
```

---

### 7. Get All Completed Transactions (Admin)

**Endpoint:** `GET /api/transaction-status/admin/completed`

**Description:** Retrieves all completed transactions from both Add Money and Transfer Money tables (Admin only)

**Authentication:** Required (Admin)

**Query Parameters:**
- `page` (number, optional, default: 1): Page number for pagination
- `limit` (number, optional, default: 10): Number of records per page
- `userId` (string, optional): Filter by specific user ID

**Sample Request:**
```
GET /api/transaction-status/admin/completed?userId=user123&page=1&limit=10
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
        "userId": "user123",
        "status": "COMPLETED",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T12:00:00.000Z",
        "transactionType": "TRANSFER_MONEY",
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
        },
        "allTransaction": {
          "id": "alltxn124",
          "orderId": "ORD_1734567890124"
        }
      },
      {
        "id": "cm123abc456",
        "amount": 100.50,
        "location": "Bank Transfer - Chase Bank",
        "description": "Adding money to wallet for shopping",
        "userId": "user123",
        "status": "COMPLETED",
        "transactionId": "TXN_20240115_001",
        "createdAt": "2024-01-14T15:30:00.000Z",
        "updatedAt": "2024-01-14T17:00:00.000Z",
        "transactionType": "ADD_MONEY",
        "user": {
          "id": "user123",
          "email": "user@example.com",
          "firstName": "John",
          "lastName": "Doe",
          "phoneNumber": "+1234567890"
        },
        "allTransaction": {
          "id": "alltxn123",
          "orderId": "ORD_1734567890123"
        }
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

### 8. Get All Rejected Transactions (Admin)

**Endpoint:** `GET /api/transaction-status/admin/rejected`

**Description:** Retrieves all rejected transactions from both Add Money and Transfer Money tables (Admin only)

**Authentication:** Required (Admin)

**Query Parameters:**
- `page` (number, optional, default: 1): Page number for pagination
- `limit` (number, optional, default: 10): Number of records per page
- `userId` (string, optional): Filter by specific user ID

**Sample Request:**
```
GET /api/transaction-status/admin/rejected?userId=user123&page=1&limit=10
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
        "description": "Monthly rent payment | Rejection reason: Bank account details verification failed",
        "userId": "user123",
        "status": "REJECTED",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T13:00:00.000Z",
        "transactionType": "TRANSFER_MONEY",
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
      },
      {
        "id": "cm123abc456",
        "amount": 100.50,
        "location": "Bank Transfer - Chase Bank",
        "description": "Adding money to wallet for shopping | Rejection reason: Insufficient verification documents provided",
        "userId": "user123",
        "status": "REJECTED",
        "transactionId": "TXN_20240115_001",
        "createdAt": "2024-01-14T15:30:00.000Z",
        "updatedAt": "2024-01-14T18:00:00.000Z",
        "transactionType": "ADD_MONEY",
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
      "total": 2,
      "totalPages": 1
    }
  }
}
```

---

## Technical Implementation Details

### Transaction Types

- **ADD_MONEY:** Transactions from the Add Money table
- **TRANSFER_MONEY:** Transactions from the Transfer Money table

Each transaction in the combined response will have a `transactionType` field to identify its source.

### Pagination

The API handles pagination across both tables:
1. Gets total counts from both tables for the given status
2. Retrieves all matching records from both tables
3. Combines and sorts them by creation date (newest first)
4. Applies pagination to the combined results

### Sorting

All transactions are sorted by `createdAt` in descending order (newest first).

### User Data Security

- Regular users can only see their own transactions
- Phone numbers are only exposed in admin endpoints
- Each transaction includes user details for reference

### Error Codes

- **400 Bad Request**: Invalid query parameters
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Insufficient permissions (admin required)
- **404 Not Found**: Transaction not found
- **500 Internal Server Error**: Server-side error

## Business Logic Notes

This API provides a convenient way to view transactions by status without having to make separate API calls to different endpoints. It's especially useful for:

1. **Users:**
   - Monitoring transactions at different stages of processing
   - Viewing a unified transaction history across different transaction types
   - Getting quick access to completed or rejected transactions

2. **Admins:**
   - Managing transactions by workflow stage (pending → processing → completed/rejected)
   - Reviewing all transactions requiring action in a single view
   - Filtering by specific users when handling customer support requests

## Notes

- The transaction status workflow remains the same for both transaction types
- Completed transactions include links to their corresponding AllTransaction records
- Rejected transactions typically include rejection reasons in their descriptions
- Precise timestamps are maintained for all transaction status changes
- For Transfer Money transactions, full account details are included 