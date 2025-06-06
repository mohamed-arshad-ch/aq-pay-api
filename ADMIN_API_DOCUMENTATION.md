# Admin API Documentation

This document provides comprehensive documentation for the Admin API endpoints that allow administrators to view all users with their detailed information, accounts, and transactions.

## Base URL
```
/api/admin
```

## Authentication
All endpoints require JWT authentication via Bearer token in the Authorization header with admin role privileges:
```
Authorization: Bearer <your_jwt_token>
```

---

## Admin Dashboard Endpoint

### 1. Get Dashboard Statistics

**Endpoint:** `GET /api/admin/dashboard`

**Description:** Retrieves comprehensive statistics for the admin dashboard including user counts, transaction statistics, and recent transactions.

**Authentication:** Required (Admin)

**Sample Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalUsers": 50,
      "transactions": {
        "completed": {
          "count": 120,
          "amount": 25000.50
        },
        "pending": {
          "count": 15
        },
        "processing": {
          "count": 10
        },
        "rejected": {
          "count": 5
        },
        "addMoney": {
          "completed": 75,
          "pending": 8,
          "processing": 5,
          "rejected": 2,
          "totalAmount": 15000.75
        },
        "transferMoney": {
          "completed": 45,
          "pending": 7,
          "processing": 5,
          "rejected": 3,
          "totalAmount": 9999.75
        }
      }
    },
    "recentTransactions": {
      "addMoney": [
        {
          "id": "add123",
          "amount": 500.00,
          "location": "Bank Transfer",
          "description": "Adding money to wallet",
          "transactionId": "TR123456",
          "status": "COMPLETED",
          "userId": "user123",
          "createdAt": "2024-01-15T11:00:00.000Z",
          "updatedAt": "2024-01-15T11:30:00.000Z",
          "user": {
            "id": "user123",
            "email": "user@example.com",
            "firstName": "John",
            "lastName": "Doe",
            "phoneNumber": "1234567890"
          },
          "allTransaction": {
            "orderId": "OI123ABC"
          }
        },
        // 4 more recent add money transactions...
      ],
      "transferMoney": [
        {
          "id": "transfer123",
          "accountId": "account123",
          "amount": 200.00,
          "description": "Transfer to bank account",
          "status": "COMPLETED",
          "userId": "user123",
          "createdAt": "2024-01-16T10:00:00.000Z",
          "updatedAt": "2024-01-16T10:30:00.000Z",
          "user": {
            "id": "user123",
            "email": "user@example.com",
            "firstName": "John",
            "lastName": "Doe",
            "phoneNumber": "1234567890"
          },
          "account": {
            "accountHolderName": "John Doe",
            "accountNumber": "1234567890",
            "ifscCode": "ABCD0123456"
          },
          "allTransaction": {
            "orderId": "OI124DEF"
          }
        },
        // 4 more recent transfer money transactions...
      ],
      "all": [
        {
          "id": "all123",
          "orderId": "OI123ABC",
          "walletId": "wallet123",
          "userId": "user123",
          "amount": 500.00,
          "transactionType": "DEPOSIT",
          "description": "Added money to wallet",
          "addMoneyTransactionId": "add123",
          "transferMoneyTransactionId": null,
          "createdAt": "2024-01-15T11:30:00.000Z",
          "updatedAt": "2024-01-15T11:30:00.000Z",
          "user": {
            "id": "user123",
            "email": "user@example.com",
            "firstName": "John",
            "lastName": "Doe"
          },
          "addMoneyTransaction": {
            "id": "add123",
            "status": "COMPLETED",
            "amount": 500.00
          },
          "transferMoneyTransaction": null
        },
        // 4 more recent transactions...
      ]
    }
  }
}
```

---

## Admin User Management Endpoints

### 1. Get All Users with Details

**Endpoint:** `GET /api/admin/users`

**Description:** Retrieves a list of all users with their accounts, wallet information, and transaction counts.

**Authentication:** Required (Admin)

**Query Parameters:**
- `page` (number, optional, default: 1): Page number for pagination
- `limit` (number, optional, default: 10): Number of users per page
- `email` (string, optional): Filter users by email (case-insensitive partial match)
- `role` (string, optional): Filter users by role (USER or ADMIN)

**Sample Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user123",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "phoneNumber": "1234567890",
        "role": "USER",
        "isPortalAccess": true,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z",
        "accounts": [
          {
            "id": "account123",
            "accountHolderName": "John Doe",
            "accountNumber": "1234567890",
            "ifscCode": "ABCD0123456",
            "userId": "user123",
            "createdAt": "2024-01-15T10:35:00.000Z",
            "updatedAt": "2024-01-15T10:35:00.000Z"
          }
        ],
        "wallet": {
          "id": "wallet123",
          "userId": "user123",
          "balance": 1000.00,
          "createdAt": "2024-01-15T10:32:00.000Z",
          "updatedAt": "2024-01-15T10:32:00.000Z"
        },
        "_count": {
          "addMoneyTransactions": 5,
          "transferMoneyTransactions": 3,
          "allTransactions": 8
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

---

### 2. Get User Detail by ID

**Endpoint:** `GET /api/admin/users/:userId`

**Description:** Retrieves detailed information about a specific user, including their accounts, wallet information, and recent transactions.

**Authentication:** Required (Admin)

**URL Parameters:**
- `userId` (string, required): The ID of the user to retrieve

**Sample Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phoneNumber": "1234567890",
      "role": "USER",
      "isPortalAccess": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "accounts": [
        {
          "id": "account123",
          "accountHolderName": "John Doe",
          "accountNumber": "1234567890",
          "ifscCode": "ABCD0123456",
          "userId": "user123",
          "createdAt": "2024-01-15T10:35:00.000Z",
          "updatedAt": "2024-01-15T10:35:00.000Z"
        }
      ],
      "wallet": {
        "id": "wallet123",
        "userId": "user123",
        "balance": 1000.00,
        "createdAt": "2024-01-15T10:32:00.000Z",
        "updatedAt": "2024-01-15T10:32:00.000Z"
      },
      "addMoneyTransactions": [
        {
          "id": "add123",
          "amount": 500.00,
          "location": "Bank Transfer",
          "description": "Adding money to wallet",
          "transactionId": "TR123456",
          "status": "COMPLETED",
          "userId": "user123",
          "createdAt": "2024-01-15T11:00:00.000Z",
          "updatedAt": "2024-01-15T11:30:00.000Z"
        }
      ],
      "transferMoneyTransactions": [
        {
          "id": "transfer123",
          "accountId": "account123",
          "amount": 200.00,
          "description": "Transfer to bank account",
          "status": "COMPLETED",
          "userId": "user123",
          "createdAt": "2024-01-16T10:00:00.000Z",
          "updatedAt": "2024-01-16T10:30:00.000Z",
          "account": {
            "id": "account123",
            "accountHolderName": "John Doe",
            "accountNumber": "1234567890",
            "ifscCode": "ABCD0123456",
            "userId": "user123",
            "createdAt": "2024-01-15T10:35:00.000Z",
            "updatedAt": "2024-01-15T10:35:00.000Z"
          }
        }
      ],
      "allTransactions": [
        {
          "id": "all123",
          "orderId": "OI123ABC",
          "walletId": "wallet123",
          "userId": "user123",
          "amount": 500.00,
          "transactionType": "DEPOSIT",
          "description": "Added money to wallet",
          "addMoneyTransactionId": "add123",
          "transferMoneyTransactionId": null,
          "createdAt": "2024-01-15T11:30:00.000Z",
          "updatedAt": "2024-01-15T11:30:00.000Z",
          "addMoneyTransaction": {
            "id": "add123",
            "amount": 500.00,
            "status": "COMPLETED",
            "transactionId": "TR123456"
          },
          "transferMoneyTransaction": null
        },
        {
          "id": "all124",
          "orderId": "OI124DEF",
          "walletId": "wallet123",
          "userId": "user123",
          "amount": 200.00,
          "transactionType": "WITHDRAWAL",
          "description": "Sent to bank account",
          "addMoneyTransactionId": null,
          "transferMoneyTransactionId": "transfer123",
          "createdAt": "2024-01-16T10:30:00.000Z",
          "updatedAt": "2024-01-16T10:30:00.000Z",
          "addMoneyTransaction": null,
          "transferMoneyTransaction": {
            "id": "transfer123",
            "amount": 200.00,
            "status": "COMPLETED",
            "description": "Transfer to bank account",
            "account": {
              "id": "account123",
              "accountHolderName": "John Doe",
              "accountNumber": "1234567890",
              "ifscCode": "ABCD0123456"
            }
          }
        }
      ],
      "_count": {
        "accounts": 1,
        "addMoneyTransactions": 5,
        "transferMoneyTransactions": 3,
        "allTransactions": 8
      }
    }
  }
}
```

**Sample Response (Error - 404):**
```json
{
  "success": false,
  "message": "User not found"
}
```

## Notes

- These endpoints are designed to provide administrators with comprehensive user information for management and monitoring purposes.
- The dashboard endpoint provides a high-level overview of system statistics, including total users, transaction counts, and amounts.
- The first user endpoint gives a high-level overview of all users with their account counts and wallet information.
- The second user endpoint provides detailed transaction history for a specific user.
- All endpoints include proper pagination to handle large datasets efficiently.
- These APIs are protected and can only be accessed by users with ADMIN role. 