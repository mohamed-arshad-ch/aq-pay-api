# Push Token API Documentation

This document provides comprehensive documentation for the Push Token API endpoints used for mobile push notifications.

## Base URL
```
/api/push-tokens
```

## Authentication
All endpoints require JWT authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Push Token Endpoints

### 1. Save Push Token

**Endpoint:** `POST /api/push-tokens`

**Description:** Saves or updates an Expo push notification token for the authenticated user. If the token already exists but belongs to a different user, the old token will be deactivated and a new one created for the current user.

**Authentication:** Required (User/Admin)

**Request Body:**
```json
{
  "token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "deviceInfo": "iPhone 13, iOS 15.4"  // Optional
}
```

**Sample Response (Success - 200):**
```json
{
  "success": true,
  "message": "Push token saved successfully",
  "data": {
    "id": "token123",
    "userId": "user123",
    "token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
    "deviceInfo": "iPhone 13, iOS 15.4",
    "isActive": true,
    "createdAt": "2024-01-15T11:30:00.000Z",
    "updatedAt": "2024-01-15T11:30:00.000Z"
  }
}
```

**Sample Response (Error - 400):**
```json
{
  "success": false,
  "message": "Push token is required"
}
```

---

### 2. Get My Push Tokens

**Endpoint:** `GET /api/push-tokens/my-tokens`

**Description:** Retrieves all active push tokens for the authenticated user.

**Authentication:** Required (User/Admin)

**Sample Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "tokens": [
      {
        "id": "token123",
        "userId": "user123",
        "token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
        "deviceInfo": "iPhone 13, iOS 15.4",
        "isActive": true,
        "createdAt": "2024-01-15T11:30:00.000Z",
        "updatedAt": "2024-01-15T11:30:00.000Z"
      },
      {
        "id": "token456",
        "userId": "user123",
        "token": "ExponentPushToken[yyyyyyyyyyyyyyyyyyyyyy]",
        "deviceInfo": "Samsung Galaxy S21, Android 12",
        "isActive": true,
        "createdAt": "2024-01-16T10:30:00.000Z",
        "updatedAt": "2024-01-16T10:30:00.000Z"
      }
    ],
    "count": 2
  }
}
```

---

### 3. Delete Push Token

**Endpoint:** `DELETE /api/push-tokens`

**Description:** Deactivates a push token. This is typically used when a user logs out or uninstalls the app.

**Authentication:** Required (User/Admin)

**Request Body:**
```json
{
  "token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
}
```

**Sample Response (Success - 200):**
```json
{
  "success": true,
  "message": "Push token deactivated successfully"
}
```

**Sample Response (Error - 404):**
```json
{
  "success": false,
  "message": "Push token not found"
}
```

---

### 4. Get All Push Tokens (Admin Only)

**Endpoint:** `GET /api/push-tokens/admin/all`

**Description:** Retrieves all active push tokens across all users. This is useful for sending mass notifications.

**Authentication:** Required (Admin only)

**Sample Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "tokens": [
      {
        "id": "token123",
        "userId": "user123",
        "token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
        "deviceInfo": "iPhone 13, iOS 15.4",
        "isActive": true,
        "createdAt": "2024-01-15T11:30:00.000Z",
        "updatedAt": "2024-01-15T11:30:00.000Z",
        "user": {
          "id": "user123",
          "email": "user@example.com",
          "firstName": "John",
          "lastName": "Doe",
          "role": "USER"
        }
      },
      {
        "id": "token456",
        "userId": "user789",
        "token": "ExponentPushToken[zzzzzzzzzzzzzzzzzzzzzz]",
        "deviceInfo": "iPad Pro, iOS 16.1",
        "isActive": true,
        "createdAt": "2024-01-17T09:45:00.000Z",
        "updatedAt": "2024-01-17T09:45:00.000Z",
        "user": {
          "id": "user789",
          "email": "jane@example.com",
          "firstName": "Jane",
          "lastName": "Smith",
          "role": "USER"
        }
      }
    ],
    "count": 2
  }
}
```

---

## Usage Notes

### Expo Push Tokens

This API is designed to work with Expo Push Notifications. Expo push tokens follow the format `ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]` for production tokens or `ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]` for developer tokens.

### Multiple User Roles on Same Device

The system supports using the same device token for multiple user accounts. This means:
- A user can log in with different accounts (e.g., User and Admin roles) on the same device
- Each account will have its own token record in the system
- Push notifications can be sent to specific users even when they share the same physical device

### Device Information

The `deviceInfo` field is optional but recommended to help identify which device a token belongs to. This can include information such as:
- Device model
- Operating system and version
- App version

### Token Lifecycle

1. **Creation**: When a user installs the app and grants notification permissions, a push token is generated by Expo and should be saved to the server.
2. **Updates**: If a user reinstalls the app or clears app data, the token might change and should be updated.
3. **Deactivation**: When a user logs out or uninstalls the app, the token should be deactivated to avoid sending unnecessary notifications.

### Security Considerations

- Push tokens should be treated as sensitive information as they can be used to send notifications to a user's device.
- The API ensures that users can only access their own tokens unless they have admin privileges. 