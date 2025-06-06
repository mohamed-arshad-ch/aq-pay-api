# Notification API Documentation

This document provides comprehensive documentation for the Notification API endpoints.

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

**Description:** Retrieves all notifications for the authenticated user with pagination support and unread count.

**Authentication:** Required (User/Admin)

**Query Parameters:**
- `unreadOnly` (boolean, optional, default: false): Filter to show only unread notifications
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
        "relatedId": "transaction123",
        "createdAt": "2024-01-15T11:30:00.000Z",
        "updatedAt": "2024-01-15T11:30:00.000Z"
      },
      {
        "id": "notif124",
        "userId": "user123",
        "title": "Portal Access Approved",
        "message": "Your request for portal access has been approved. You can now login and use the platform.",
        "type": "PORTAL_ACCESS",
        "isRead": true,
        "relatedId": null,
        "createdAt": "2024-01-14T10:30:00.000Z",
        "updatedAt": "2024-01-14T11:00:00.000Z"
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

### 2. Mark Notification as Read

**Endpoint:** `PUT /api/notifications/:id/read`

**Description:** Marks a specific notification as read.

**Authentication:** Required (User/Admin)

**URL Parameters:**
- `id` (string, required): The ID of the notification to mark as read

**Sample Response (Success - 200):**
```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "id": "notif123",
    "userId": "user123",
    "title": "Money Added Successfully",
    "message": "₹500.00 has been successfully added to your wallet.",
    "type": "ADD_MONEY",
    "isRead": true,
    "relatedId": "transaction123",
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

### 3. Mark All Notifications as Read

**Endpoint:** `PUT /api/notifications/mark-all-read`

**Description:** Marks all unread notifications for the authenticated user as read.

**Authentication:** Required (User/Admin)

**Sample Response (Success - 200):**
```json
{
  "success": true,
  "message": "5 notifications marked as read",
  "data": {
    "count": 5
  }
}
```

---

### 4. Delete Notification

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

### 1. Get All Notifications

**Endpoint:** `GET /api/notifications/admin/all`

**Description:** Retrieves all notifications in the system with pagination, filtering, and user information.

**Authentication:** Required (Admin only)

**Query Parameters:**
- `userId` (string, optional): Filter notifications by user ID
- `type` (string, optional): Filter notifications by type (REGISTRATION, PORTAL_ACCESS, ADD_MONEY, TRANSFER_MONEY, SYSTEM)
- `unreadOnly` (boolean, optional, default: false): Filter to show only unread notifications
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
        "relatedId": "transaction123",
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
        "id": "notif124",
        "userId": "user456",
        "title": "Transfer Request Processing",
        "message": "Your request to transfer ₹200.00 to account ending with ****5678 is now being processed.",
        "type": "TRANSFER_MONEY",
        "isRead": true,
        "relatedId": "transfer123",
        "createdAt": "2024-01-14T10:30:00.000Z",
        "updatedAt": "2024-01-14T11:00:00.000Z",
        "user": {
          "id": "user456",
          "email": "jane@example.com",
          "firstName": "Jane",
          "lastName": "Smith",
          "role": "USER"
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

### 2. Get Notification Statistics

**Endpoint:** `GET /api/notifications/admin/stats`

**Description:** Retrieves statistics about notifications in the system for the admin dashboard.

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

### 3. Admin Mark Notification as Read

**Endpoint:** `PUT /api/notifications/admin/:id/read`

**Description:** Allows an admin to mark any notification as read, regardless of the user it belongs to.

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
    "relatedId": "transaction123",
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

### 4. Admin Delete Notification

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

### 5. Get Total Unread Notification Count

**Endpoint:** `GET /api/notifications/admin/unread-count`

**Description:** Gets the total count of unread notifications across all users, broken down by notification type. This is useful for admin dashboards and notification management.

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

## Notification Types

The system automatically generates notifications for the following events:

### 1. Registration (`REGISTRATION`)
- Created when a user registers on the platform
- Contains registration confirmation and information about portal access approval

### 2. Portal Access (`PORTAL_ACCESS`)
- Created when an admin approves or denies a user's portal access
- Contains information about the decision and next steps

### 3. Add Money Transactions (`ADD_MONEY`)
- Created at each stage of an add money transaction (PENDING, PROCESSING, COMPLETED, REJECTED)
- Contains information about the transaction amount and status

### 4. Transfer Money Transactions (`TRANSFER_MONEY`)
- Created at each stage of a transfer money transaction (PENDING, PROCESSING, COMPLETED, REJECTED)
- Contains information about the transaction amount, recipient account (masked), and status

### 5. System Notifications (`SYSTEM`)
- System-generated notifications that don't fit into other categories
- Used for important announcements and system updates

### 6. Get Unread Notification Count

**Endpoint:** `GET /api/notifications/unread-count`

**Description:** Gets only the count of unread notifications for the authenticated user. This is a lightweight endpoint for showing badge counts in user interfaces.

**Authentication:** Required (User/Admin)

**Sample Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "unreadCount": 5
  }
} 