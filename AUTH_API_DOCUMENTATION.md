# 🔐 Authentication API Documentation

## Base URL
```
http://localhost:3000/api/auth
```

## Authentication
Most endpoints require JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 📋 **Table of Contents**
1. [Public Endpoints](#public-endpoints)
2. [Protected User Endpoints](#protected-user-endpoints)
3. [Admin Only Endpoints](#admin-only-endpoints)
4. [Portal Access Management](#portal-access-management)
5. [Error Responses](#error-responses)

---

## 🌍 **Public Endpoints**

### 1. Register User
**POST** `/register`

Register a new user account. User will need admin approval for portal access.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "mypassword123",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "1234567890"
}
```

**Success Response (201):**
```json
{
  "status": "success",
  "message": "User registered successfully. Please wait for administrator approval to access the portal.",
  "data": {
    "user": {
      "id": "cmbg6a38c0000chg4dzj8ru66",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phoneNumber": "1234567890",
      "role": "USER",
      "isPortalAccess": false,
      "createdAt": "2025-06-03T07:03:43.069Z"
    }
  }
}
```

**Validation Rules:**
- Email: Valid email format required
- Password: Minimum 6 characters
- Phone: Exactly 10 digits
- All fields are required

---

### 2. Login
**POST** `/login`

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "mac@admin.com",
  "password": "Mcodev@123"
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "id": "cmbg6a38c0000chg4dzj8ru66",
      "email": "mac@admin.com",
      "firstName": "Mac",
      "lastName": "Hadams",
      "phoneNumber": "9847274569",
      "role": "ADMIN",
      "isPortalAccess": true,
      "createdAt": "2025-06-03T07:03:43.069Z",
      "updatedAt": "2025-06-03T07:03:43.069Z",
      "wallet": {
        "id": "cmbg6a3qj0002chg4lz3u9e9d",
        "balance": "0.00",
        "createdAt": "2025-06-03T07:03:43.723Z",
        "updatedAt": "2025-06-03T07:03:43.723Z"
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "role": "ADMIN"
  }
}
```

**Error Response (403) - Portal Access Required:**
```json
{
  "status": "error",
  "message": "Portal access not approved. Please contact administrator for access approval."
}
```

---

## 🔒 **Protected User Endpoints**

### 3. Get Profile
**GET** `/profile`

Get current user's profile information.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": "cmbg6a38c0000chg4dzj8ru66",
      "email": "mac@admin.com",
      "firstName": "Mac",
      "lastName": "Hadams",
      "phoneNumber": "9847274569",
      "role": "ADMIN",
      "isPortalAccess": true,
      "createdAt": "2025-06-03T07:03:43.069Z",
      "updatedAt": "2025-06-03T07:03:43.069Z"
    }
  }
}
```

---

### 4. Update Profile
**PUT** `/profile`

Update current user's profile information.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "firstName": "Johnny",
  "lastName": "Doe",
  "phoneNumber": "9876543210"
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "cmbg6a38c0000chg4dzj8ru66",
      "email": "john@example.com",
      "firstName": "Johnny",
      "lastName": "Doe",
      "phoneNumber": "9876543210",
      "role": "USER",
      "isPortalAccess": true,
      "createdAt": "2025-06-03T07:03:43.069Z",
      "updatedAt": "2025-06-03T08:15:22.123Z"
    }
  }
}
```

---

### 5. Get User Role
**GET** `/role`

Get current user's role and permissions.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Role retrieved successfully",
  "data": {
    "role": "ADMIN",
    "permissions": {
      "canManageUsers": true,
      "canCreateAdmin": true,
      "canDeleteUsers": true,
      "canApprovePortalAccess": true
    }
  }
}
```

---

### 6. Logout
**POST** `/logout`

Logout user (client-side token invalidation).

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Logout successful. Please remove the token from your client."
}
```

---

## 👑 **Admin Only Endpoints**

### 7. Get All Users
**GET** `/users?page=1&limit=10&role=USER`

Get paginated list of all users with optional role filter.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `role` (optional): Filter by role (USER or ADMIN)

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "id": "user1_id",
        "email": "user1@example.com",
        "firstName": "User",
        "lastName": "One",
        "phoneNumber": "1234567890",
        "role": "USER",
        "isPortalAccess": false,
        "createdAt": "2025-06-03T07:03:43.069Z",
        "updatedAt": "2025-06-03T07:03:43.069Z"
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 10,
      "pages": 3
    }
  }
}
```

---

### 8. Get User by ID
**GET** `/users/:userId`

Get specific user details. Admins can view any user, users can only view themselves.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "User retrieved successfully",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phoneNumber": "1234567890",
      "role": "USER",
      "isPortalAccess": true,
      "createdAt": "2025-06-03T07:03:43.069Z",
      "updatedAt": "2025-06-03T07:03:43.069Z",
      "wallet": {
        "id": "wallet_id",
        "balance": "150.00",
        "createdAt": "2025-06-03T07:05:43.069Z",
        "updatedAt": "2025-06-03T08:15:22.123Z"
      }
    }
  }
}
```

---

### 9. Update User by ID
**PUT** `/users/:userId`

Update any user's information (admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "firstName": "Updated",
  "lastName": "Name",
  "role": "ADMIN"
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "User updated successfully",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "Updated",
      "lastName": "Name",
      "phoneNumber": "1234567890",
      "role": "ADMIN",
      "isPortalAccess": true,
      "createdAt": "2025-06-03T07:03:43.069Z",
      "updatedAt": "2025-06-03T08:20:15.456Z"
    }
  }
}
```

---

### 10. Delete User by ID
**DELETE** `/users/:userId`

Delete a user account (admin only). Admins cannot delete themselves.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "User deleted successfully",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phoneNumber": "1234567890",
      "role": "USER",
      "isPortalAccess": true
    }
  }
}
```

---

### 11. Admin Registration
**POST** `/admin/register`

Create a new admin user (only existing admins can create other admins).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "email": "newadmin@example.com",
  "password": "adminpass123",
  "firstName": "New",
  "lastName": "Admin",
  "phoneNumber": "9876543210",
  "role": "ADMIN"
}
```

**Success Response (201):**
```json
{
  "status": "success",
  "message": "User registered successfully. Please wait for administrator approval to access the portal.",
  "data": {
    "user": {
      "id": "new_admin_id",
      "email": "newadmin@example.com",
      "firstName": "New",
      "lastName": "Admin",
      "phoneNumber": "9876543210",
      "role": "ADMIN",
      "isPortalAccess": false,
      "createdAt": "2025-06-03T08:30:43.069Z"
    }
  }
}
```

---

## 🏢 **Portal Access Management**

### 12. Get Pending Portal Access
**GET** `/pending-portal-access?page=1&limit=10`

Get users waiting for portal access approval.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Pending portal access users retrieved successfully",
  "data": {
    "users": [
      {
        "id": "user_id",
        "email": "pending@example.com",
        "firstName": "Pending",
        "lastName": "User",
        "phoneNumber": "1234567890",
        "role": "USER",
        "isPortalAccess": false,
        "createdAt": "2025-06-03T07:03:43.069Z",
        "updatedAt": "2025-06-03T07:03:43.069Z"
      }
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

---

### 13. Update Portal Access
**PUT** `/users/:userId/portal-access`

Approve or deny portal access for a specific user.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "isPortalAccess": true
}
```

**Success Response (200) - Approved:**
```json
{
  "status": "success",
  "message": "Portal access approved successfully. Wallet has been created.",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phoneNumber": "1234567890",
      "role": "USER",
      "isPortalAccess": true,
      "createdAt": "2025-06-03T07:03:43.069Z",
      "updatedAt": "2025-06-03T08:45:22.789Z"
    }
  }
}
```

**Request Body for Denial:**
```json
{
  "isPortalAccess": false
}
```

---

### 14. Bulk Approve Portal Access
**POST** `/bulk-approve-portal-access`

Approve or deny portal access for multiple users at once.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "userIds": [
    "user_id_1",
    "user_id_2",
    "user_id_3"
  ],
  "isPortalAccess": true
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Bulk portal access approved completed. Wallets have been created for approved users.",
  "data": {
    "updatedUsers": [
      {
        "id": "user_id_1",
        "email": "user1@example.com",
        "firstName": "User",
        "lastName": "One",
        "phoneNumber": "1234567890",
        "role": "USER",
        "isPortalAccess": true,
        "createdAt": "2025-06-03T07:03:43.069Z",
        "updatedAt": "2025-06-03T08:50:15.123Z"
      }
    ],
    "totalUpdated": 3,
    "totalRequested": 3,
    "errors": null
  }
}
```

---

## ⚠️ **Error Responses**

### Common Error Codes

**400 - Bad Request**
```json
{
  "status": "error",
  "message": "Email, password, first name, last name, and phone number are required"
}
```

**401 - Unauthorized**
```json
{
  "status": "error",
  "message": "Invalid or expired token"
}
```

**403 - Forbidden**
```json
{
  "status": "error",
  "message": "Access denied. Admin role required."
}
```

**404 - Not Found**
```json
{
  "status": "error",
  "message": "User not found"
}
```

**409 - Conflict**
```json
{
  "status": "error",
  "message": "User with this email already exists"
}
```

**500 - Internal Server Error**
```json
{
  "status": "error",
  "message": "Internal server error"
}
```

---

## 🔧 **Usage Examples**

### Complete Registration and Login Flow

1. **Register a new user:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123",
    "firstName": "New",
    "lastName": "User",
    "phoneNumber": "1234567890"
  }'
```

2. **Admin approves portal access:**
```bash
curl -X PUT http://localhost:3000/api/auth/users/{userId}/portal-access \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {admin_token}" \
  -d '{
    "isPortalAccess": true
  }'
```

3. **User can now login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123"
  }'
```

### Admin Management Examples

**Get all pending users:**
```bash
curl -X GET "http://localhost:3000/api/auth/pending-portal-access?page=1&limit=10" \
  -H "Authorization: Bearer {admin_token}"
```

**Bulk approve multiple users:**
```bash
curl -X POST http://localhost:3000/api/auth/bulk-approve-portal-access \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {admin_token}" \
  -d '{
    "userIds": ["user1_id", "user2_id", "user3_id"],
    "isPortalAccess": true
  }'
```

---

## 📊 **User Roles and Permissions**

| Role | Description | Portal Access | Permissions |
|------|-------------|---------------|-------------|
| **USER** | Regular user | Requires admin approval | Profile management, wallet operations, transactions |
| **ADMIN** | Administrator | Automatic | All user permissions + user management, portal access approval |

---

## 🔐 **Security Notes**

1. **JWT Tokens**: Include JWT token in Authorization header for protected routes
2. **Password Security**: Passwords are hashed using bcrypt
3. **Role-Based Access**: Admin-only endpoints verify admin role
4. **Portal Access**: Regular users need admin approval before they can login
5. **Input Validation**: All inputs are validated and sanitized
6. **Auto Wallet Creation**: Wallets are automatically created when portal access is approved

---

## 📞 **Support**

For API support or issues, please contact the development team or check the server logs for detailed error information. 