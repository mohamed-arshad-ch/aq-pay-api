# Notification API Documentation

This document provides comprehensive documentation for the Notification API endpoints with **separate read status tracking** for admin and users.

## Overview

The notification system now supports **independent read status tracking** for admin and users:
- **User Read Status**: Tracked via `isReadByUser` field
- **Admin Read Status**: Tracked via `isReadByAdmin` field  
- **Backward Compatibility**: Original `isRead` field maintained

This means a notification can be read by a user but still show as unread for admin, and vice versa.

## Base URL
```
/api/notifications
```

## Authentication
All endpoints require JWT authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## User Notification Endpoints

### 1. Get My Notifications

**Endpoint:** `GET /api/notifications`

**Description:** Retrieves all notifications for the authenticated user with enhanced transaction details, pagination support, and user-specific unread count.

**Authentication:** Required (User/Admin)

**Query Parameters:**
- `unreadOnly` (boolean, optional, default: false): Filter to show only notifications unread by user
- `page` (number, optional, default: 1): Page number for pagination
- `limit` (number, optional, default: 10): Number of notifications per page

**Sample Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif123",
        "userId": "user123",
        "title": "Money Added Successfully",
        "message": "₹500.00 has been successfully added to your wallet.",
        "type": "ADD_MONEY",
        "isRead": false,
        "isReadByUser": false,
        "isReadByAdmin": true,
        "relatedId": "transaction123",
        "registrationUserId": null,
        "portalAccessUserId": null,
        "addMoneyTransactionId": "addmoney456",
        "transferMoneyTransactionId": null,
        "createdAt": "2024-01-15T11:30:00.000Z",
        "updatedAt": "2024-01-15T11:30:00.000Z",
        "addMoneyTransactionDetails": {
          "id": "addmoney456",
          "amount": "500.00",
          "location": "Mumbai",
          "description": "Emergency funds",
          "transactionId": "PAY123456789",
          "status": "COMPLETED",
          "userId": "user123",
          "createdAt": "2024-01-15T11:00:00.000Z",
          "updatedAt": "2024-01-15T11:30:00.000Z",
          "user": {
            "id": "user123",
            "email": "user@example.com",
            "firstName": "John",
            "lastName": "Doe",
            "phoneNumber": "+919876543210"
          }
        }
      },
      {
        "id": "notif124",
        "userId": "user123",
        "title": "Transfer Request Processing",
        "message": "Your request to transfer ₹200.00 to account ending with 5678 is now being processed.",
        "type": "TRANSFER_MONEY",
        "isRead": true,
        "isReadByUser": true,
        "isReadByAdmin": false,
        "relatedId": "transfer123",
        "registrationUserId": null,
        "portalAccessUserId": null,
        "addMoneyTransactionId": null,
        "transferMoneyTransactionId": "transfer789",
        "createdAt": "2024-01-14T10:30:00.000Z",
        "updatedAt": "2024-01-14T11:00:00.000Z",
        "transferMoneyTransactionDetails": {
          "id": "transfer789",
          "accountId": "acc123",
          "amount": "200.00",
          "description": "Payment to vendor",
          "transactionId": "TXN987654321",
          "status": "PROCESSING",
          "userId": "user123",
          "createdAt": "2024-01-14T10:00:00.000Z",
          "updatedAt": "2024-01-14T10:30:00.000Z",
          "user": {
            "id": "user123",
            "email": "user@example.com",
            "firstName": "John",
            "lastName": "Doe",
            "phoneNumber": "+919876543210"
          },
          "account": {
            "id": "acc123",
            "accountHolderName": "ABC Vendor",
            "accountNumber": "1234567890125678",
            "ifscCode": "HDFC0001234"
          }
        }
      }
    ],
    "unreadCount": 1,
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

### 2. Mark Notification as Read by User

**Endpoint:** `PUT /api/notifications/:id/read`

**Description:** Marks a specific notification as read by the user. This only updates the user read status (`isReadByUser`), not the admin read status.

**Authentication:** Required (User/Admin)

**URL Parameters:**
- `id` (string, required): The ID of the notification to mark as read

**Sample Response (Success - 200):**
```json
{
  "success": true,
  "message": "Notification marked as read by user",
  "data": {
    "id": "notif123",
    "userId": "user123",
    "title": "Money Added Successfully",
    "message": "₹500.00 has been successfully added to your wallet.",
    "type": "ADD_MONEY",
    "isRead": true,
    "isReadByUser": true,
    "isReadByAdmin": false,
    "relatedId": "transaction123",
    "registrationUserId": null,
    "portalAccessUserId": null,
    "addMoneyTransactionId": "addmoney456",
    "transferMoneyTransactionId": null,
    "createdAt": "2024-01-15T11:30:00.000Z",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

**Sample Response (Error - 404):**
```json
{
  "success": false,
  "message": "Notification not found or does not belong to you"
}
```

---

### 3. Mark All Notifications as Read by User

**Endpoint:** `PUT /api/notifications/mark-all-read`

**Description:** Marks all unread notifications for the authenticated user as read by user. This only updates the user read status (`isReadByUser`), not the admin read status.

**Authentication:** Required (User/Admin)

**Sample Response (Success - 200):**
```json
{
  "success": true,
  "message": "5 notifications marked as read by user",
  "data": {
    "count": 5
  }
}
```

---

### 4. Get Unread Notification Count for User

**Endpoint:** `GET /api/notifications/unread-count`

**Description:** Gets only the count of notifications unread by the authenticated user (`isReadByUser = false`). This is a lightweight endpoint for showing badge counts in user interfaces.

**Authentication:** Required (User/Admin)

**Sample Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "unreadCount": 5
  }
}
```

---

### 5. Delete Notification

**Endpoint:** `DELETE /api/notifications/:id`

**Description:** Deletes a specific notification.

**Authentication:** Required (User/Admin)

**URL Parameters:**
- `id` (string, required): The ID of the notification to delete

**Sample Response (Success - 200):**
```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

**Sample Response (Error - 404):**
```json
{
  "success": false,
  "message": "Notification not found or does not belong to you"
}
```

---

## Admin Notification Endpoints

### 1. Get All Notifications (Admin)

**Endpoint:** `GET /api/notifications/admin/all`

**Description:** Retrieves all notifications in the system with pagination, filtering by admin read status, and enhanced transaction details.

**Authentication:** Required (Admin only)

**Query Parameters:**
- `userId` (string, optional): Filter notifications by user ID
- `type` (string, optional): Filter notifications by type (REGISTRATION, PORTAL_ACCESS, ADD_MONEY, TRANSFER_MONEY, SYSTEM)
- `unreadOnly` (boolean, optional, default: false): Filter to show only notifications unread by admin (`isReadByAdmin = false`)
- `page` (number, optional, default: 1): Page number for pagination
- `limit` (number, optional, default: 10): Number of notifications per page

**Sample Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif123",
        "userId": "user123",
        "title": "Money Added Successfully",
        "message": "₹500.00 has been successfully added to your wallet.",
        "type": "ADD_MONEY",
        "isRead": false,
        "isReadByUser": true,
        "isReadByAdmin": false,
        "relatedId": "transaction123",
        "registrationUserId": null,
        "portalAccessUserId": null,
        "addMoneyTransactionId": "addmoney456",
        "transferMoneyTransactionId": null,
        "createdAt": "2024-01-15T11:30:00.000Z",
        "updatedAt": "2024-01-15T11:30:00.000Z",
        "user": {
          "id": "user123",
          "email": "user@example.com",
          "firstName": "John",
          "lastName": "Doe",
          "role": "USER"
        },
        "addMoneyTransactionDetails": {
          "id": "addmoney456",
          "amount": "500.00",
          "location": "Mumbai",
          "description": "Emergency funds",
          "transactionId": "PAY123456789",
          "status": "COMPLETED",
          "userId": "user123",
          "createdAt": "2024-01-15T11:00:00.000Z",
          "updatedAt": "2024-01-15T11:30:00.000Z",
          "user": {
            "id": "user123",
            "email": "user@example.com",
            "firstName": "John",
            "lastName": "Doe",
            "phoneNumber": "+919876543210"
          }
        }
      },
      {
        "id": "notif125",
        "userId": "user789",
        "title": "Registration Successful",
        "message": "Your registration was successful. Please wait for admin approval to access the portal.",
        "type": "REGISTRATION",
        "isRead": false,
        "isReadByUser": false,
        "isReadByAdmin": false,
        "relatedId": null,
        "registrationUserId": "user789",
        "portalAccessUserId": null,
        "addMoneyTransactionId": null,
        "transferMoneyTransactionId": null,
        "createdAt": "2024-01-13T09:30:00.000Z",
        "updatedAt": "2024-01-13T09:30:00.000Z",
        "user": {
          "id": "user789",
          "email": "newuser@example.com",
          "firstName": "New",
          "lastName": "User",
          "role": "USER"
        },
        "registrationDetails": {
          "id": "user789",
          "email": "newuser@example.com",
          "firstName": "New",
          "lastName": "User",
          "phoneNumber": "+919876543212",
          "role": "USER",
          "isPortalAccess": false,
          "createdAt": "2024-01-13T09:30:00.000Z"
        }
      }
    ],
    "totalUnreadCount": 45,
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 125,
      "totalPages": 13
    }
  }
}
```

---

### 2. Get Notification Statistics (Admin)

**Endpoint:** `GET /api/notifications/admin/stats`

**Description:** Retrieves statistics about notifications in the system for the admin dashboard, using admin read status for unread counts.

**Authentication:** Required (Admin only)

**Sample Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "counts": {
      "total": 125,
      "unread": 45,
      "byType": {
        "registration": 15,
        "portalAccess": 10,
        "addMoney": 50,
        "transferMoney": 45,
        "system": 5
      }
    },
    "topUsers": [
      {
        "user": {
          "id": "user123",
          "email": "user@example.com",
          "firstName": "John",
          "lastName": "Doe"
        },
        "notificationCount": 25
      },
      {
        "user": {
          "id": "user456",
          "email": "jane@example.com",
          "firstName": "Jane",
          "lastName": "Smith"
        },
        "notificationCount": 18
      }
    ]
  }
}
```

---

### 3. Mark Notification as Read by Admin

**Endpoint:** `PUT /api/notifications/admin/:id/read`

**Description:** Marks a specific notification as read by admin. This only updates the admin read status (`isReadByAdmin`), not the user read status.

**Authentication:** Required (Admin only)

**URL Parameters:**
- `id` (string, required): The ID of the notification to mark as read

**Sample Response (Success - 200):**
```json
{
  "success": true,
  "message": "Notification marked as read by admin",
  "data": {
    "id": "notif123",
    "userId": "user123",
    "title": "Money Added Successfully",
    "message": "₹500.00 has been successfully added to your wallet.",
    "type": "ADD_MONEY",
    "isRead": true,
    "isReadByUser": false,
    "isReadByAdmin": true,
    "relatedId": "transaction123",
    "registrationUserId": null,
    "portalAccessUserId": null,
    "addMoneyTransactionId": "addmoney456",
    "transferMoneyTransactionId": null,
    "createdAt": "2024-01-15T11:30:00.000Z",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

**Sample Response (Error - 404):**
```json
{
  "success": false,
  "message": "Notification not found"
}
```

---

### 4. Mark All Notifications as Read by Admin

**Endpoint:** `PUT /api/notifications/admin/mark-all-read`

**Description:** Marks all notifications in the system as read by admin. This only updates the admin read status (`isReadByAdmin`), not the user read status.

**Authentication:** Required (Admin only)

**Sample Response (Success - 200):**
```json
{
  "success": true,
  "message": "125 notifications marked as read by admin",
  "data": {
    "count": 125
  }
}
```

---

### 5. Get Total Unread Notification Count for Admin

**Endpoint:** `GET /api/notifications/admin/unread-count`

**Description:** Gets the total count of notifications unread by admin (`isReadByAdmin = false`) across all users, broken down by notification type.

**Authentication:** Required (Admin only)

**Sample Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "totalUnreadCount": 45,
    "byType": {
      "registration": 5,
      "portalAccess": 8,
      "addMoney": 12,
      "transferMoney": 15,
      "system": 5
    }
  }
}
```

---

### 6. Admin Delete Notification

**Endpoint:** `DELETE /api/notifications/admin/:id`

**Description:** Allows an admin to delete any notification, regardless of the user it belongs to.

**Authentication:** Required (Admin only)

**URL Parameters:**
- `id` (string, required): The ID of the notification to delete

**Sample Response (Success - 200):**
```json
{
  "success": true,
  "message": "Notification deleted by admin"
}
```

**Sample Response (Error - 404):**
```json
{
  "success": false,
  "message": "Notification not found"
}
```

---

## Separate Read Status Behavior

### Key Features:

1. **Independent Read Status**:
   - User reads notification → Only `isReadByUser` becomes `true`
   - Admin reads notification → Only `isReadByAdmin` becomes `true`
   - Each role maintains separate unread counts

2. **User Experience**:
   - User sees notifications filtered by `isReadByUser = false`
   - User's "mark as read" only affects their own read status
   - User's unread count is independent of admin's read status

3. **Admin Experience**:
   - Admin sees notifications filtered by `isReadByAdmin = false`
   - Admin's "mark as read" only affects admin read status
   - Admin's unread count is independent of users' read status

4. **Backward Compatibility**:
   - Original `isRead` field is still updated for compatibility
   - Existing integrations continue to work

### Example Scenarios:

**Scenario 1**: User reads notification, Admin hasn't
```json
{
  "isRead": true,
  "isReadByUser": true,
  "isReadByAdmin": false
}
```
- User won't see it in unread notifications
- Admin will still see it as unread

**Scenario 2**: Admin reads notification, User hasn't
```json
{
  "isRead": true,
  "isReadByUser": false,
  "isReadByAdmin": true
}
```
- Admin won't see it in unread notifications
- User will still see it as unread

**Scenario 3**: Both have read the notification
```json
{
  "isRead": true,
  "isReadByUser": true,
  "isReadByAdmin": true
}
```
- Neither user nor admin see it as unread

---

## Notification Types

The system automatically generates notifications for the following events:

### 1. Registration (`REGISTRATION`)
- Created when a user registers on the platform
- Contains registration confirmation and information about portal access approval
- **Enhanced Field**: `registrationDetails` - Complete user details

### 2. Portal Access (`PORTAL_ACCESS`)
- Created when an admin approves or denies a user's portal access
- Contains information about the decision and next steps
- **Enhanced Field**: `portalAccessDetails` - User details with portal access status

### 3. Add Money Transactions (`ADD_MONEY`)
- Created at each stage of an add money transaction (PENDING, PROCESSING, COMPLETED, REJECTED)
- Contains information about the transaction amount and status
- **Enhanced Field**: `addMoneyTransactionDetails` - Complete transaction with user info

### 4. Transfer Money Transactions (`TRANSFER_MONEY`)
- Created at each stage of a transfer money transaction (PENDING, PROCESSING, COMPLETED, REJECTED)
- Contains information about the transaction amount, recipient account, and status
- **Enhanced Field**: `transferMoneyTransactionDetails` - Complete transaction with user and account info

### 5. System Notifications (`SYSTEM`)
- System-generated notifications that don't fit into other categories
- Used for important announcements and system updates
- **Enhanced Field**: None

---

## Notification Schema Fields

Each notification in the system contains the following fields:

### Core Fields
- `id`: Unique notification identifier
- `userId`: ID of the user who receives the notification
- `title`: Notification title
- `message`: Notification message content
- `type`: Notification type (REGISTRATION, PORTAL_ACCESS, ADD_MONEY, TRANSFER_MONEY, SYSTEM)
- `createdAt`: Timestamp when notification was created
- `updatedAt`: Timestamp when notification was last updated

### Read Status Fields
- `isRead`: Boolean for backward compatibility (updated when either user or admin reads)
- `isReadByUser`: Boolean indicating if the user has read the notification
- `isReadByAdmin`: Boolean indicating if admin has read the notification

### Legacy Field
- `relatedId`: Generic ID field for backward compatibility (deprecated)

### Type-Specific ID Fields
These fields store specific IDs based on the notification type:

- `registrationUserId`: For REGISTRATION notifications - stores the registered user's ID
- `portalAccessUserId`: For PORTAL_ACCESS notifications - stores the user ID whose portal access was approved/denied
- `addMoneyTransactionId`: For ADD_MONEY notifications - stores the add money transaction ID
- `transferMoneyTransactionId`: For TRANSFER_MONEY notifications - stores the transfer money transaction ID

### Enhanced Details Fields
Based on notification type, additional transaction/user details are included:

| Notification Type | Enhanced Field | Contains |
|-------------------|----------------|----------|
| `REGISTRATION` | `registrationDetails` | Complete user details of the registered user |
| `PORTAL_ACCESS` | `portalAccessDetails` | User details including current portal access status |
| `ADD_MONEY` | `addMoneyTransactionDetails` | Complete add money transaction with user info |
| `TRANSFER_MONEY` | `transferMoneyTransactionDetails` | Complete transfer transaction with user and account info |
| `SYSTEM` | None | No additional details for system notifications |

---

## Error Codes

- **400 Bad Request**: Invalid request parameters
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Insufficient permissions (admin required)
- **404 Not Found**: Notification not found or doesn't belong to user
- **500 Internal Server Error**: Server-side error

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- Pagination is available on all list endpoints
- Enhanced transaction details are automatically included based on notification type
- Read status is now tracked separately for admin and users for better notification management
- The system maintains backward compatibility with the original `isRead` field 