# Add Money API Documentation

This document provides comprehensive documentation for all Add Money related API endpoints.

## Base URL
```
/api/add-money
```

## Authentication
All endpoints require JWT authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

Admin endpoints additionally require admin role privileges.

---

## User Endpoints

### 1. Create Add Money Transaction

**Endpoint:** `POST /api/add-money/create`

**Description:** Creates a new add money transaction request

**Authentication:** Required (User)

**Request Body:**
```json
{
  "amount": 100.50,
  "location": "Bank Transfer - Chase Bank",
  "description": "Adding money to wallet for shopping"
}
```

**Request Body Parameters:**
- `amount` (number, required): Amount to add (must be > 0)
- `location` (string, optional): Location or method of payment
- `description` (string, optional): Description for the transaction

**Sample Response (Success - 201):**
```json
{
  "success": true,
  "message": "Add money transaction created successfully",
  "data": {
    "id": "cm123abc456",
    "amount": 100.50,
    "location": "Bank Transfer - Chase Bank",
    "description": "Adding money to wallet for shopping",
    "userId": "user123",
    "status": "PENDING",
    "transactionId": null,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
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
  "message": "Amount is required and must be greater than 0"
}
```

---

### 2. Get User's Add Money Transactions

**Endpoint:** `GET /api/add-money/my-transactions`

**Description:** Retrieves the authenticated user's add money transactions with pagination and filtering

**Authentication:** Required (User)

**Query Parameters:**
- `status` (string, optional): Filter by status (PENDING, PROCESSING, COMPLETED, REJECTED)
- `page` (number, optional, default: 1): Page number for pagination
- `limit` (number, optional, default: 10): Number of records per page

**Sample Request:**
```
GET /api/add-money/my-transactions?status=PENDING&page=1&limit=5
```

**Sample Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "cm123abc456",
        "amount": 100.50,
        "location": "Bank Transfer - Chase Bank",
        "description": "Adding money to wallet for shopping",
        "userId": "user123",
        "status": "PENDING",
        "transactionId": null,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z",
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

## Admin Endpoints

### 3. Get All Add Money Transactions (Admin)

**Endpoint:** `GET /api/add-money/admin/all-transactions`

**Description:** Retrieves all add money transactions across all users (Admin only)

**Authentication:** Required (Admin)

**Query Parameters:**
- `status` (string, optional): Filter by status (PENDING, PROCESSING, COMPLETED, REJECTED)
- `page` (number, optional, default: 1): Page number for pagination
- `limit` (number, optional, default: 10): Number of records per page
- `userId` (string, optional): Filter by specific user ID

**Sample Request:**
```
GET /api/add-money/admin/all-transactions?status=PROCESSING&page=1&limit=10
```

**Sample Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "cm123abc456",
        "amount": 100.50,
        "location": "Bank Transfer - Chase Bank",
        "description": "Adding money to wallet for shopping",
        "userId": "user123",
        "status": "PROCESSING",
        "transactionId": "TXN_20240115_001",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T11:00:00.000Z",
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

### 4. Update Transaction to Processing (Admin)

**Endpoint:** `PUT /api/add-money/admin/:id/processing`

**Description:** Updates a pending transaction to processing status with a transaction ID

**Authentication:** Required (Admin)

**URL Parameters:**
- `id` (string, required): The add money transaction ID

**Request Body:**
```json
{
  "transactionId": "TXN_20240115_001"
}
```

**Request Body Parameters:**
- `transactionId` (string, required): External transaction ID for tracking

**Sample Response (Success - 200):**
```json
{
  "success": true,
  "message": "Transaction updated to processing successfully",
  "data": {
    "id": "cm123abc456",
    "amount": 100.50,
    "location": "Bank Transfer - Chase Bank",
    "description": "Adding money to wallet for shopping",
    "userId": "user123",
    "status": "PROCESSING",
    "transactionId": "TXN_20240115_001",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z",
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

### 5. Approve Transaction (Admin)

**Endpoint:** `PUT /api/add-money/admin/:id/approve`

**Description:** Approves a processing transaction, updates user wallet balance, and creates transaction record

**Authentication:** Required (Admin)

**URL Parameters:**
- `id` (string, required): The add money transaction ID

**Request Body:** None required

**Sample Response (Success - 200):**
```json
{
  "success": true,
  "message": "Transaction approved, wallet updated, and transaction recorded successfully",
  "data": {
    "updatedTransaction": {
      "id": "cm123abc456",
      "amount": 100.50,
      "location": "Bank Transfer - Chase Bank",
      "description": "Adding money to wallet for shopping",
      "userId": "user123",
      "status": "COMPLETED",
      "transactionId": "TXN_20240115_001",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T11:30:00.000Z",
      "user": {
        "id": "user123",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe"
      }
    },
    "allTransactionEntry": {
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
      "wallet": {
        "id": "wallet123",
        "userId": "user123",
        "balance": 150.50,
        "createdAt": "2024-01-10T09:00:00.000Z",
        "updatedAt": "2024-01-15T11:30:00.000Z"
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
  "message": "Only processing transactions can be approved"
}
```

---

### 6. Reject Transaction (Admin)

**Endpoint:** `PUT /api/add-money/admin/:id/reject`

**Description:** Rejects a processing transaction with optional reason

**Authentication:** Required (Admin)

**URL Parameters:**
- `id` (string, required): The add money transaction ID

**Request Body:**
```json
{
  "reason": "Insufficient verification documents provided"
}
```

**Request Body Parameters:**
- `reason` (string, optional): Reason for rejection

**Sample Response (Success - 200):**
```json
{
  "success": true,
  "message": "Transaction rejected successfully",
  "data": {
    "id": "cm123abc456",
    "amount": 100.50,
    "location": "Bank Transfer - Chase Bank",
    "description": "Adding money to wallet for shopping | Rejection reason: Insufficient verification documents provided",
    "userId": "user123",
    "status": "REJECTED",
    "transactionId": "TXN_20240115_001",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T12:00:00.000Z",
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

1. **PENDING** → Initial status when transaction is created
2. **PROCESSING** → Admin moves transaction to processing with transaction ID
3. **COMPLETED** → Admin approves transaction (wallet updated, transaction recorded)
4. **REJECTED** → Admin rejects transaction (with optional reason)

## Error Codes

- **400 Bad Request**: Invalid input data or business logic error
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Insufficient permissions (admin required)
- **404 Not Found**: Transaction not found
- **500 Internal Server Error**: Server-side error

## Notes

- All amounts are handled as floating-point numbers
- Timestamps are in ISO 8601 format (UTC)
- When a transaction is approved:
  - User's wallet balance is automatically updated
  - A new entry is created in the AllTransaction table
  - If user doesn't have a wallet, one is created automatically
- Rejection reasons are appended to the transaction description
- Only PENDING transactions can be moved to PROCESSING
- Only PROCESSING transactions can be APPROVED or REJECTED 