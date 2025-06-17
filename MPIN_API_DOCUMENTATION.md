# MPin API Documentation

This document provides comprehensive documentation for all MPin (Mobile PIN) related API endpoints.

## Overview
MPin is a 6-digit security PIN that users can set up to secure their transfer money transactions. Only regular users (not admins) can create and use MPins. Admins do not have access to MPin functionality.

## Base URL
```
/api/mpin
```

## Authentication
All endpoints require JWT authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

**Important**: All MPin endpoints are restricted to USER role only. ADMIN users cannot access these endpoints.

---

## Endpoints

### 1. Create MPin

**Endpoint:** `POST /api/mpin/create`

**Description:** Creates a new 6-digit MPin for the authenticated user

**Authentication:** Required (User only, not Admin)

**Request Body:**
```json
{
  "pin": "123456"
}
```

**Request Body Parameters:**
- `pin` (string, required): Exactly 6 digits (0-9 only)

**Sample Response (Success - 201):**
```json
{
  "success": true,
  "message": "MPin created successfully",
  "data": {
    "id": "mpin123abc456",
    "userId": "user123",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
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
  "message": "PIN must be exactly 6 digits"
}
```

**Sample Response (Error - 400):**
```json
{
  "success": false,
  "message": "MPin already exists. Use update endpoint to change it."
}
```

**Sample Response (Error - 403):**
```json
{
  "success": false,
  "message": "Admins cannot create MPin"
}
```

---

### 2. Update MPin

**Endpoint:** `PUT /api/mpin/update`

**Description:** Updates the existing 6-digit MPin for the authenticated user

**Authentication:** Required (User only, not Admin)

**Request Body:**
```json
{
  "currentPin": "123456",
  "newPin": "654321"
}
```

**Request Body Parameters:**
- `currentPin` (string, required): Current 6-digit PIN for verification
- `newPin` (string, required): New 6-digit PIN (0-9 only)

**Sample Response (Success - 200):**
```json
{
  "success": true,
  "message": "MPin updated successfully",
  "data": {
    "id": "mpin123abc456",
    "userId": "user123",
    "isActive": true,
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
  "message": "Current PIN is incorrect"
}
```

**Sample Response (Error - 404):**
```json
{
  "success": false,
  "message": "MPin not found. Please create MPin first.",
  "action": "CREATE_MPIN"
}
```

---

### 3. Verify MPin

**Endpoint:** `POST /api/mpin/verify`

**Description:** Verifies the 6-digit MPin for the authenticated user. This endpoint is used before performing sensitive operations like transfer money.

**Authentication:** Required (User only, not Admin)

**Request Body:**
```json
{
  "pin": "123456"
}
```

**Request Body Parameters:**
- `pin` (string, required): 6-digit PIN to verify

**Sample Response (Success - 200):**
```json
{
  "success": true,
  "message": "MPin verified successfully",
  "data": {
    "verified": true,
    "timestamp": "2024-01-15T12:00:00.000Z"
  }
}
```

**Sample Response (Error - 400):**
```json
{
  "success": false,
  "message": "Invalid PIN",
  "data": {
    "verified": false
  }
}
```

**Sample Response (Error - 404):**
```json
{
  "success": false,
  "message": "MPin not found. Please create MPin in settings.",
  "action": "CREATE_MPIN_IN_SETTINGS"
}
```

---

### 4. Get MPin Status

**Endpoint:** `GET /api/mpin/status`

**Description:** Retrieves the MPin status for the authenticated user (without revealing the actual PIN)

**Authentication:** Required (User only, not Admin)

**Request Body:** None

**Sample Response (Success - 200) - User has MPin:**
```json
{
  "success": true,
  "message": "MPin status retrieved successfully",
  "data": {
    "hasMPin": true,
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z",
    "lastUsedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

**Sample Response (Success - 200) - User doesn't have MPin:**
```json
{
  "success": true,
  "message": "No MPin found",
  "data": {
    "hasMPin": false,
    "action": "CREATE_MPIN_IN_SETTINGS"
  }
}
```

---

## Integration with Transfer Money

### Updated Transfer Money Creation

**Endpoint:** `POST /api/transfer-money/create`

**Description:** Creates a new transfer money transaction. Now requires MPin verification.

**Request Body:**
```json
{
  "accountId": "acc123abc456",
  "amount": 500.00,
  "description": "Monthly rent payment",
  "mPin": "123456"
}
```

**Additional Request Body Parameters:**
- `mPin` (string, required): 6-digit PIN for verification

**Sample Response (Error - 400) - MPin required:**
```json
{
  "success": false,
  "message": "MPin is required for transfer money transactions"
}
```

**Sample Response (Error - 400) - No MPin found:**
```json
{
  "success": false,
  "message": "MPin not found. Please create MPin in settings.",
  "action": "CREATE_MPIN_IN_SETTINGS"
}
```

**Sample Response (Error - 400) - Invalid MPin:**
```json
{
  "success": false,
  "message": "Invalid MPin. Please enter correct MPin.",
  "action": "INVALID_MPIN"
}
```

---

## Security Features

### PIN Hashing
- All PINs are hashed using bcrypt with salt rounds of 10
- The actual PIN is never stored in plain text
- PIN verification is done by comparing hashed values

### Access Control
- Only USER role can access MPin endpoints
- ADMIN role is explicitly blocked from MPin functionality
- Each user can only manage their own MPin

### Usage Tracking
- `lastUsedAt` timestamp is updated whenever PIN is successfully verified
- Helps track PIN usage patterns and security

### Validation
- PIN must be exactly 6 digits (0-9 only)
- Current PIN verification required for updates
- PIN format validation on all endpoints

---

## Error Codes

- **400 Bad Request**: Invalid PIN format, incorrect PIN, missing required fields
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Admin trying to access MPin endpoints
- **404 Not Found**: MPin not found for user
- **500 Internal Server Error**: Server-side error

---

## Business Logic Notes

### MPin Creation Flow:
1. User must be authenticated with USER role
2. User cannot already have an existing MPin
3. PIN must be exactly 6 digits
4. PIN is hashed before storage
5. MPin is set as active by default

### MPin Update Flow:
1. User must have an existing MPin
2. Current PIN must be verified before update
3. New PIN must be exactly 6 digits
4. New PIN is hashed before storage
5. `lastUsedAt` timestamp is updated during verification

### Transfer Money Integration:
1. Transfer money creation now requires MPin
2. MPin is verified before processing the transfer
3. If user doesn't have MPin, they're directed to create one in settings
4. Invalid MPin prevents transfer creation
5. `lastUsedAt` timestamp is updated when MPin is used for transfers

### Security Considerations:
- PINs are never returned in API responses
- PIN verification updates usage timestamp
- Failed PIN attempts are logged (but not blocked - implement rate limiting if needed)
- Each user can only access their own MPin

---

## Usage Examples

### Complete MPin Setup Flow:
1. **Check Status**: `GET /api/mpin/status` - Check if user has MPin
2. **Create MPin**: `POST /api/mpin/create` - Create 6-digit PIN
3. **Use MPin**: `POST /api/transfer-money/create` - Use PIN for transfers
4. **Update MPin**: `PUT /api/mpin/update` - Change PIN when needed

### Transfer Money with MPin:
1. User attempts transfer: `POST /api/transfer-money/create`
2. If no MPin exists, API returns `CREATE_MPIN_IN_SETTINGS` action
3. User creates MPin: `POST /api/mpin/create`
4. User retries transfer with MPin included in request
5. Transfer proceeds if MPin is valid

---

## Notes

- MPin functionality is designed for mobile applications where users need quick PIN-based authentication
- The 6-digit format follows standard mobile banking PIN conventions
- Integration with transfer money ensures secure transaction authorization
- Admin users are intentionally excluded from MPin functionality as they have different security requirements 