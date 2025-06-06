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

## Notification Endpoints

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