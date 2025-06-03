# 🏦 Account Management API Documentation

## Base URL
```
http://localhost:3000/api/accounts
```

## Authentication
All account endpoints require JWT token in the Authorization header and USER role:
```
Authorization: Bearer <your_jwt_token>
```

## Access Control
- **Required Role:** USER
- **Portal Access:** Must be approved by admin
- **Scope:** Users can only manage their own accounts

---

## 📋 **Table of Contents**
1. [Account Endpoints](#account-endpoints)
2. [Validation Rules](#validation-rules)
3. [Error Responses](#error-responses)
4. [Usage Examples](#usage-examples)

---

## 🏦 **Account Endpoints**

### 1. Create Account
**POST** `/`

Create a new bank account for the authenticated user.

**Headers:**
```
Authorization: Bearer <user_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "accountHolderName": "John Doe",
  "accountNumber": "1234567890123456",
  "ifscCode": "HDFC0000123"
}
```

**Success Response (201):**
```json
{
  "status": "success",
  "message": "Account created successfully",
  "data": {
    "account": {
      "id": "cmbg6a38c0000chg4dzj8ru66",
      "accountHolderName": "John Doe",
      "accountNumber": "1234567890123456",
      "ifscCode": "HDFC0000123",
      "userId": "user_id_123",
      "createdAt": "2025-06-03T07:03:43.069Z",
      "updatedAt": "2025-06-03T07:03:43.069Z",
      "user": {
        "id": "user_id_123",
        "email": "john@example.com",
        "firstName": "John",
        "lastName": "Doe"
      }
    }
  }
}
```

**Validation Rules:**
- **Account Holder Name**: Required, non-empty string
- **Account Number**: Required, 9-18 digits, numeric only, must be unique
- **IFSC Code**: Required, format: 4 letters + 0 + 6 alphanumeric characters

**Error Response (400) - Validation:**
```json
{
  "status": "error",
  "message": "Account holder name, account number, and IFSC code are required"
}
```

**Error Response (409) - Duplicate:**
```json
{
  "status": "error",
  "message": "Account number already exists"
}
```

---

### 2. Get User Accounts
**GET** `/?page=1&limit=10`

Get paginated list of all accounts belonging to the authenticated user.

**Headers:**
```
Authorization: Bearer <user_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max recommended: 50)

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "accounts": [
      {
        "id": "account_id_1",
        "accountHolderName": "John Doe",
        "accountNumber": "1234567890123456",
        "ifscCode": "HDFC0000123",
        "userId": "user_id_123",
        "createdAt": "2025-06-03T07:03:43.069Z",
        "updatedAt": "2025-06-03T07:03:43.069Z",
        "user": {
          "id": "user_id_123",
          "email": "john@example.com",
          "firstName": "John",
          "lastName": "Doe"
        }
      },
      {
        "id": "account_id_2",
        "accountHolderName": "John Doe Business",
        "accountNumber": "9876543210987654",
        "ifscCode": "ICIC0000456",
        "userId": "user_id_123",
        "createdAt": "2025-06-02T07:03:43.069Z",
        "updatedAt": "2025-06-02T07:03:43.069Z",
        "user": {
          "id": "user_id_123",
          "email": "john@example.com",
          "firstName": "John",
          "lastName": "Doe"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalAccounts": 2,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

**Empty Response (200):**
```json
{
  "status": "success",
  "data": {
    "accounts": [],
    "pagination": {
      "currentPage": 1,
      "totalPages": 0,
      "totalAccounts": 0,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

---

### 3. Get Account by ID
**GET** `/:id`

Get specific account details by ID. Users can only access their own accounts.

**Headers:**
```
Authorization: Bearer <user_token>
```

**URL Parameters:**
- `id`: Account ID (required)

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "account": {
      "id": "cmbg6a38c0000chg4dzj8ru66",
      "accountHolderName": "John Doe",
      "accountNumber": "1234567890123456",
      "ifscCode": "HDFC0000123",
      "userId": "user_id_123",
      "createdAt": "2025-06-03T07:03:43.069Z",
      "updatedAt": "2025-06-03T07:03:43.069Z",
      "user": {
        "id": "user_id_123",
        "email": "john@example.com",
        "firstName": "John",
        "lastName": "Doe"
      }
    }
  }
}
```

**Error Response (404):**
```json
{
  "status": "error",
  "message": "Account not found"
}
```

---

### 4. Update Account
**PUT** `/:id`

Update account details. Users can only update their own accounts.

**Headers:**
```
Authorization: Bearer <user_token>
Content-Type: application/json
```

**URL Parameters:**
- `id`: Account ID (required)

**Request Body (Partial Update):**
```json
{
  "accountHolderName": "John Doe Updated",
  "accountNumber": "1111222233334444",
  "ifscCode": "SBIN0000789"
}
```

**Request Body (Single Field Update):**
```json
{
  "accountHolderName": "Johnny Doe"
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Account updated successfully",
  "data": {
    "account": {
      "id": "cmbg6a38c0000chg4dzj8ru66",
      "accountHolderName": "John Doe Updated",
      "accountNumber": "1111222233334444",
      "ifscCode": "SBIN0000789",
      "userId": "user_id_123",
      "createdAt": "2025-06-03T07:03:43.069Z",
      "updatedAt": "2025-06-03T08:15:22.456Z",
      "user": {
        "id": "user_id_123",
        "email": "john@example.com",
        "firstName": "John",
        "lastName": "Doe"
      }
    }
  }
}
```

**Error Response (400) - No Fields:**
```json
{
  "status": "error",
  "message": "At least one field is required to update"
}
```

**Error Response (409) - Duplicate Account Number:**
```json
{
  "status": "error",
  "message": "Account number already exists"
}
```

---

### 5. Delete Account
**DELETE** `/:id`

Delete an account permanently. Users can only delete their own accounts.

**Headers:**
```
Authorization: Bearer <user_token>
```

**URL Parameters:**
- `id`: Account ID (required)

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Account deleted successfully"
}
```

**Error Response (404):**
```json
{
  "status": "error",
  "message": "Account not found"
}
```

---

## ✅ **Validation Rules**

### Account Holder Name
- **Required**: Yes
- **Type**: String
- **Rules**: Non-empty after trimming whitespace
- **Example**: `"John Doe"`, `"ABC Corporation Ltd."`

### Account Number
- **Required**: Yes
- **Type**: String (numeric)
- **Format**: 9-18 digits only
- **Uniqueness**: Must be unique across all accounts
- **Examples**: 
  - ✅ `"1234567890"` (10 digits)
  - ✅ `"123456789012345678"` (18 digits)
  - ❌ `"12345678"` (8 digits - too short)
  - ❌ `"1234567890123456789"` (19 digits - too long)
  - ❌ `"12345ABC67890"` (contains letters)

### IFSC Code
- **Required**: Yes
- **Type**: String
- **Format**: Exactly 11 characters
- **Pattern**: `[A-Z]{4}0[A-Z0-9]{6}`
- **Examples**:
  - ✅ `"HDFC0000123"`
  - ✅ `"ICIC0001234"`
  - ✅ `"SBIN0005678"`
  - ❌ `"HDFC1000123"` (5th character must be 0)
  - ❌ `"hdfc0000123"` (must be uppercase)
  - ❌ `"HDFC000123"` (wrong length)

---

## ⚠️ **Error Responses**

### Common Error Codes

**400 - Bad Request**
```json
{
  "status": "error",
  "message": "Account holder name, account number, and IFSC code are required"
}
```

**401 - Unauthorized**
```json
{
  "status": "error",
  "message": "Access token required"
}
```

**403 - Forbidden**
```json
{
  "status": "error",
  "message": "Access denied. USER role required."
}
```

**404 - Not Found**
```json
{
  "status": "error",
  "message": "Account not found"
}
```

**409 - Conflict**
```json
{
  "status": "error",
  "message": "Account number already exists"
}
```

**500 - Internal Server Error**
```json
{
  "status": "error",
  "message": "Internal server error"
}
```

### Validation Error Examples

**Invalid IFSC Code:**
```json
{
  "status": "error",
  "message": "Invalid IFSC code format"
}
```

**Invalid Account Number:**
```json
{
  "status": "error",
  "message": "Account number should be numeric and between 9-18 digits"
}
```

**Empty Account Holder Name:**
```json
{
  "status": "error",
  "message": "Account holder name cannot be empty"
}
```

---

## 🔧 **Usage Examples**

### Complete Account Management Flow

1. **Create a new account:**
```bash
curl -X POST http://localhost:3000/api/accounts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <user_token>" \
  -d '{
    "accountHolderName": "John Doe",
    "accountNumber": "1234567890123456",
    "ifscCode": "HDFC0000123"
  }'
```

2. **Get all user accounts:**
```bash
curl -X GET "http://localhost:3000/api/accounts?page=1&limit=10" \
  -H "Authorization: Bearer <user_token>"
```

3. **Get specific account:**
```bash
curl -X GET "http://localhost:3000/api/accounts/{account_id}" \
  -H "Authorization: Bearer <user_token>"
```

4. **Update account holder name:**
```bash
curl -X PUT http://localhost:3000/api/accounts/{account_id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <user_token>" \
  -d '{
    "accountHolderName": "Johnny Doe"
  }'
```

5. **Update multiple fields:**
```bash
curl -X PUT http://localhost:3000/api/accounts/{account_id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <user_token>" \
  -d '{
    "accountHolderName": "John Doe Business",
    "accountNumber": "9876543210123456",
    "ifscCode": "ICIC0001234"
  }'
```

6. **Delete account:**
```bash
curl -X DELETE "http://localhost:3000/api/accounts/{account_id}" \
  -H "Authorization: Bearer <user_token>"
```

---

## 📊 **Account Management Workflow**

### Prerequisites
1. **User Registration**: User must be registered
2. **Portal Access**: Admin must approve portal access
3. **Authentication**: User must login and obtain JWT token
4. **Role Verification**: Only USER role can manage accounts

### Typical Flow
```
User Login → Get JWT Token → Create Account → Use for Transfers
     ↓              ↓             ↓              ↓
Portal Access → Authenticate → Validate Data → Transfer Money
   Required      Each Request     IFSC/Account    to Account
```

---

## 🏪 **Popular Bank IFSC Codes (Examples)**

| Bank Name | IFSC Code Format | Example |
|-----------|------------------|---------|
| HDFC Bank | HDFC0000XXX | HDFC0000123 |
| ICICI Bank | ICIC0000XXX | ICIC0001234 |
| State Bank of India | SBIN0000XXX | SBIN0005678 |
| Axis Bank | UTIB0000XXX | UTIB0001234 |
| Kotak Mahindra Bank | KKBK0000XXX | KKBK0001234 |
| Punjab National Bank | PUNB0000XXX | PUNB0005678 |

---

## 🔐 **Security Features**

1. **User Isolation**: Users can only access their own accounts
2. **JWT Authentication**: All endpoints require valid JWT token
3. **Role-Based Access**: Only USER role can manage accounts
4. **Input Validation**: Strict validation for all account details
5. **Unique Constraints**: Account numbers must be unique system-wide
6. **Data Sanitization**: Input data is trimmed and formatted

---

## 💡 **Best Practices**

### For Frontend/Client Development
1. **Validate inputs** client-side before sending requests
2. **Handle pagination** for account lists
3. **Implement confirmation** dialogs for account deletion
4. **Cache account data** to reduce API calls
5. **Show loading states** during API operations

### For Account Data
1. **Verify IFSC codes** with official bank databases when possible
2. **Format account numbers** consistently (remove spaces/special chars)
3. **Use proper account holder names** matching bank records
4. **Keep account information** up-to-date

---

## 🔗 **Related APIs**

After creating accounts, you can use them with:
- **Transfer Money API**: `/api/transfer-money/create` - Transfer money to your accounts
- **Wallet API**: `/api/wallet` - Check wallet balance before transfers
- **Transactions API**: `/api/transactions` - View transfer history

---

## 📞 **Support**

For API support or issues:
1. Check server logs for detailed error information
2. Verify JWT token validity and user permissions
3. Validate account data format before submission
4. Contact development team for technical assistance 