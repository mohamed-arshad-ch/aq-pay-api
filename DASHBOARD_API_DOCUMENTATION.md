# Dashboard API Documentation

This document provides comprehensive documentation for the Dashboard API endpoints used in the AQ-PAY application.

## Base URL
```
/api/dashboard
```

## Authentication
All endpoints require JWT authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Dashboard Endpoints

### 1. Get Recent Map Transactions

**Endpoint:** `GET /api/dashboard/map-transactions`

**Description:** Retrieves the 5 most recent transactions (both add money and transfer money) for the authenticated user, with a focus on transactions with location data for map display.

**Authentication:** Required (User/Admin)

**Sample Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "clv6g2tz500003b6i0z8jkn2f",
        "type": "ADD_MONEY",
        "amount": 500.00,
        "location": "22.5726,88.3639",
        "status": "COMPLETED",
        "description": "Added money from salary",
        "createdAt": "2024-07-01T11:30:00.000Z",
        "transactionId": "TRX12345",
        "userName": "John Doe",
        "userId": "clv6g1tz500003b6i0z8jkn2e"
      },
      {
        "id": "clv6g3tz500003b6i0z8jkn2g",
        "type": "TRANSFER_MONEY",
        "amount": 200.00,
        "location": null,
        "status": "COMPLETED",
        "description": "Transfer to family",
        "createdAt": "2024-06-30T15:45:00.000Z",
        "accountHolder": "Jane Doe",
        "accountNumber": "******1234",
        "userName": "John Doe",
        "userId": "clv6g1tz500003b6i0z8jkn2e"
      },
      {
        "id": "clv6g4tz500003b6i0z8jkn2h",
        "type": "ADD_MONEY",
        "amount": 1000.00,
        "location": "22.5726,88.3639",
        "status": "COMPLETED",
        "description": "Added money from investment",
        "createdAt": "2024-06-29T09:15:00.000Z",
        "transactionId": "TRX12346",
        "userName": "John Doe",
        "userId": "clv6g1tz500003b6i0z8jkn2e"
      }
    ],
    "count": 3
  }
}
```

## Transaction Object Structure

### Add Money Transaction
```json
{
  "id": "transaction_id",
  "type": "ADD_MONEY",
  "amount": 500.00,
  "location": "latitude,longitude",
  "status": "PENDING|PROCESSING|COMPLETED|REJECTED",
  "description": "Transaction description",
  "createdAt": "2024-07-01T11:30:00.000Z",
  "transactionId": "TRX12345",
  "userName": "User's full name",
  "userId": "user_id"
}
```

### Transfer Money Transaction
```json
{
  "id": "transaction_id",
  "type": "TRANSFER_MONEY",
  "amount": 200.00,
  "location": null,
  "status": "PENDING|PROCESSING|COMPLETED|REJECTED",
  "description": "Transaction description",
  "createdAt": "2024-06-30T15:45:00.000Z",
  "transactionId": "TXN1234567890",
  "accountHolder": "Recipient's name",
  "accountNumber": "******1234",
  "userName": "User's full name",
  "userId": "user_id"
}
```

## Usage Notes

### Location Data Format
- Location data is stored as a string in the format `"latitude,longitude"`
- For add money transactions, this is typically the location where the transaction was initiated
- Transfer money transactions typically don't have location data by default

### Transaction Types
- `ADD_MONEY`: Money added to wallet
- `TRANSFER_MONEY`: Money transferred from wallet to a bank account

### Transaction Status
- `PENDING`: Transaction has been created but not processed by admin yet
- `PROCESSING`: Transaction is being processed by admin
- `COMPLETED`: Transaction has been successfully completed
- `REJECTED`: Transaction has been rejected

### Map Display Considerations
1. Filter transactions with location data (mainly ADD_MONEY transactions)
2. Parse the location string into latitude and longitude components
3. Use appropriate markers for different transaction types and statuses
4. Consider clustering markers if multiple transactions occurred at the same location 