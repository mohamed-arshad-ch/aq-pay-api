# 💰 Wallet Management API Documentation

## Base URL
```
http://localhost:3000/api/wallet
```

## Authentication
All wallet endpoints require JWT token in the Authorization header and USER role:
```
Authorization: Bearer <your_jwt_token>
```

## Access Control
- **Required Role:** USER
- **Portal Access:** Must be approved by admin
- **Scope:** Users can only access their own wallet
- **Auto-Creation:** Wallets are automatically created when portal access is approved

---

## 📋 **Table of Contents**
1. [Wallet Endpoints](#wallet-endpoints)
2. [Error Responses](#error-responses)
3. [Usage Examples](#usage-examples)
4. [Wallet Operations](#wallet-operations)

---

## 💳 **Wallet Endpoints**

### 1. Get Wallet Details
**GET** `/`

Get complete wallet information for the authenticated user.

**Headers:**
```
Authorization: Bearer <user_token>
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Wallet details retrieved successfully",
  "data": {
    "wallet": {
      "id": "cmbg6a3qj0002chg4lz3u9e9d",
      "userId": "cmbg6a38c0000chg4dzj8ru66",
      "balance": "150.75",
      "createdAt": "2025-06-03T07:03:43.723Z",
      "updatedAt": "2025-06-03T08:15:22.456Z",
      "user": {
        "id": "cmbg6a38c0000chg4dzj8ru66",
        "email": "john@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "phoneNumber": "1234567890",
        "role": "USER",
        "isPortalAccess": true,
        "createdAt": "2025-06-03T07:03:43.069Z",
        "updatedAt": "2025-06-03T07:03:43.069Z"
      }
    }
  }
}
```

**Error Response (404) - Wallet Not Found:**
```json
{
  "status": "error",
  "message": "Wallet not found. Please contact administrator."
}
```

---

### 2. Get Wallet Balance
**GET** `/balance`

Get wallet balance information for the authenticated user (simplified response).

**Headers:**
```
Authorization: Bearer <user_token>
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Wallet balance retrieved successfully",
  "data": {
    "wallet": {
      "id": "cmbg6a3qj0002chg4lz3u9e9d",
      "balance": 150.75,
      "createdAt": "2025-06-03T07:03:43.723Z",
      "updatedAt": "2025-06-03T08:15:22.456Z"
    },
    "user": {
      "id": "cmbg6a38c0000chg4dzj8ru66",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

**Empty Wallet Response (200):**
```json
{
  "status": "success",
  "message": "Wallet balance retrieved successfully",
  "data": {
    "wallet": {
      "id": "cmbg6a3qj0002chg4lz3u9e9d",
      "balance": 0.00,
      "createdAt": "2025-06-03T07:03:43.723Z",
      "updatedAt": "2025-06-03T07:03:43.723Z"
    },
    "user": {
      "id": "cmbg6a38c0000chg4dzj8ru66",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

**Error Response (404) - Wallet Not Found:**
```json
{
  "status": "error",
  "message": "Wallet not found. Please contact administrator."
}
```

---

## ⚠️ **Error Responses**

### Common Error Codes

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

**404 - Wallet Not Found**
```json
{
  "status": "error",
  "message": "Wallet not found. Please contact administrator."
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

### Basic Wallet Operations

1. **Get complete wallet details:**
```bash
curl -X GET http://localhost:3000/api/wallet \
  -H "Authorization: Bearer <user_token>"
```

2. **Get wallet balance only:**
```bash
curl -X GET http://localhost:3000/api/wallet/balance \
  -H "Authorization: Bearer <user_token>"
```

### Using with JavaScript/Fetch

```javascript
// Get wallet details
const getWalletDetails = async (token) => {
  try {
    const response = await fetch('http://localhost:3000/api/wallet', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
      console.log('Wallet balance:', data.data.wallet.balance);
      console.log('Wallet ID:', data.data.wallet.id);
      return data.data.wallet;
    } else {
      console.error('Error:', data.message);
    }
  } catch (error) {
    console.error('Request failed:', error);
  }
};

// Get wallet balance
const getWalletBalance = async (token) => {
  try {
    const response = await fetch('http://localhost:3000/api/wallet/balance', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
      return parseFloat(data.data.wallet.balance);
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Failed to get balance:', error);
    return 0;
  }
};
```

---

## 💼 **Wallet Operations**

### How Wallet Balance Changes

The wallet balance is automatically updated by the system during various operations:

#### **Balance Increases (Deposits):**
1. **Add Money Transactions**: When admin approves add money requests
   - User requests to add money via `/api/add-money/create`
   - Admin approves via `/api/add-money/admin/{id}/approve`
   - System automatically credits wallet balance

#### **Balance Decreases (Withdrawals):**
1. **Transfer Money Transactions**: When admin approves transfer requests
   - User creates transfer via `/api/transfer-money/create`
   - Admin approves via `/api/transfer-money/admin/{id}/approve`
   - System automatically debits wallet balance

### **Important Notes:**
- ❌ **No Direct Balance Updates**: Users cannot directly modify wallet balance
- ✅ **Transaction-Based**: All balance changes happen through approved transactions
- ✅ **Atomic Operations**: Balance updates use database transactions for consistency
- ✅ **Audit Trail**: All changes are recorded in the AllTransactions table

---

## 📊 **Wallet Information Details**

### **Wallet Object Structure:**

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | String | Unique wallet identifier | `"cmbg6a3qj0002chg4lz3u9e9d"` |
| `userId` | String | Owner's user ID | `"cmbg6a38c0000chg4dzj8ru66"` |
| `balance` | String/Number | Current wallet balance | `"150.75"` or `150.75` |
| `createdAt` | DateTime | Wallet creation timestamp | `"2025-06-03T07:03:43.723Z"` |
| `updatedAt` | DateTime | Last modification timestamp | `"2025-06-03T08:15:22.456Z"` |

### **Balance Format:**
- **API Response**: String format `"150.75"` (from database)
- **Balance Endpoint**: Number format `150.75` (parsed)
- **Precision**: 2 decimal places for currency
- **Currency**: Assumed to be in primary currency units (e.g., Rupees, Dollars)

---

## 🔄 **Wallet Lifecycle**

### **Creation Process:**
```
User Registration → Admin Portal Approval → Wallet Auto-Creation
       ↓                    ↓                      ↓
   isPortalAccess:      isPortalAccess:       Wallet created
      false               true               with 0.00 balance
```

### **Usage Flow:**
```
Check Balance → Add Money → Transfer Money → Check Balance
     ↓             ↓           ↓              ↓
Get current → Admin approves → Admin approves → See updated
 balance      add request    transfer request    balance
```

---

## 🔐 **Security Features**

1. **User Isolation**: Users can only access their own wallet
2. **JWT Authentication**: All endpoints require valid JWT token
3. **Role-Based Access**: Only USER role can access wallet endpoints
4. **Read-Only Access**: Users can only view, not modify wallet directly
5. **Admin Controls**: Only admins can approve transactions that affect balance
6. **Automatic Creation**: Wallets are created automatically when portal access is approved

---

## 💡 **Best Practices**

### **For Frontend Development:**
1. **Cache Balance**: Cache wallet balance to reduce API calls
2. **Real-time Updates**: Refresh balance after transaction approvals
3. **Loading States**: Show loading indicators during API calls
4. **Error Handling**: Handle wallet not found scenarios gracefully
5. **Format Currency**: Display balance with proper currency formatting

### **For Users:**
1. **Regular Checks**: Check balance before initiating transfers
2. **Transaction History**: Use transaction APIs to track balance changes
3. **Contact Support**: Contact admin if wallet is not found

---

## 🔗 **Related APIs**

### **Transaction Management:**
- **Add Money**: `/api/add-money/create` - Request to add money to wallet
- **Transfer Money**: `/api/transfer-money/create` - Request to transfer money from wallet
- **All Transactions**: `/api/transactions/my-transactions` - View transaction history

### **Account Management:**
- **Accounts**: `/api/accounts` - Manage bank accounts for transfers
- **Profile**: `/api/auth/profile` - View user profile information

### **Admin Operations:**
- **Approve Add Money**: `/api/add-money/admin/{id}/approve` - Admin approves deposits
- **Approve Transfers**: `/api/transfer-money/admin/{id}/approve` - Admin approves withdrawals

---

## 🎯 **Common Use Cases**

### **1. Dashboard Balance Display**
```javascript
// Quick balance check for dashboard
const balance = await getWalletBalance(userToken);
document.getElementById('balance').textContent = `₹${balance.toFixed(2)}`;
```

### **2. Pre-Transfer Validation**
```javascript
// Check if user has sufficient balance before transfer
const checkSufficientBalance = async (transferAmount, userToken) => {
  const currentBalance = await getWalletBalance(userToken);
  return currentBalance >= transferAmount;
};
```

### **3. Transaction History Context**
```javascript
// Get wallet details with user info for transaction history
const walletInfo = await getWalletDetails(userToken);
console.log(`${walletInfo.user.firstName}'s wallet: ₹${walletInfo.balance}`);
```

---

## 📈 **Monitoring and Analytics**

### **Key Metrics to Track:**
- **Current Balance**: Monitor wallet balance trends
- **Last Updated**: Track when balance was last modified
- **User Activity**: Correlate wallet checks with transaction activity
- **Balance Distribution**: Understand user wallet balance patterns

### **Performance Considerations:**
- **Fast Response**: Wallet endpoints are optimized for quick responses
- **Minimal Data**: Balance endpoint returns only essential information
- **Caching Friendly**: Responses can be cached for short periods

---

## 📞 **Support**

### **Common Issues:**

1. **Wallet Not Found**
   - **Cause**: User portal access not approved by admin
   - **Solution**: Contact admin to approve portal access

2. **Outdated Balance**
   - **Cause**: Recent transaction not yet processed
   - **Solution**: Check transaction status or refresh after a few minutes

3. **Access Denied**
   - **Cause**: Invalid or expired JWT token
   - **Solution**: Login again to get a fresh token

### **Contact Information:**
- **Technical Issues**: Check server logs for detailed error information
- **Balance Discrepancies**: Contact development team with transaction details
- **Portal Access**: Contact administrator for approval requests

---

## 🔍 **API Endpoint Summary**

| Method | Endpoint | Purpose | Response |
|--------|----------|---------|----------|
| `GET` | `/` | Get complete wallet details | Full wallet + user info |
| `GET` | `/balance` | Get wallet balance only | Balance + basic user info |

Both endpoints are **read-only** and require **USER role** authentication. 