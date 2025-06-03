# AQ-PAY API

A robust Express.js REST API with MVC architecture, role-based authentication, and PostgreSQL database integration using Prisma ORM.

## Features

- 🏗️ **MVC Architecture** - Well-organized code structure
- 🔐 **JWT Authentication** - Secure user authentication with role-based access
- 👥 **Role-Based Authorization** - Admin and User roles with different permissions
- 🛡️ **Password Hashing** - bcryptjs for secure password storage
- 🐘 **PostgreSQL Database** - Using Neon cloud database
- 🔍 **Prisma ORM** - Type-safe database operations
- ✅ **Input Validation** - Comprehensive request validation
- 🚦 **Error Handling** - Global error handling middleware
- 🔒 **Security** - Helmet, CORS, and other security measures
- 📝 **Logging** - Morgan for request logging

## User Roles

### USER (Default Role)
- Register and login
- Manage own profile
- Access own user data

### ADMIN
- All USER permissions
- Manage all users (view, update, delete)
- Create new admin accounts
- Access user management endpoints

## Project Structure

```
src/
├── controllers/     # Request handlers with role-based logic
├── models/         # Database models with role support
├── routes/         # API routes with role-based middleware
├── middleware/     # Auth, validation, and role-based middleware
├── utils/          # Utility functions including role helpers
├── config/         # Configuration files
├── app.js          # Express app configuration
└── server.js       # Server entry point
```

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL database (Neon cloud provided)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd API
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Environment variables are already configured in .env
# JWT_SECRET should be changed in production
```

4. Generate Prisma client and push database schema:
```bash
npm run db:generate
npm run db:push
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Health Check
- **GET** `/api/health` - Check API status

### Public Authentication Endpoints

#### Register User
- **POST** `/api/auth/register`
- **Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "USER"
}
```
- **Note**: Role defaults to "USER" for public registration
- **Response:**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "USER",
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    },
    "token": "jwt_token"
  }
}
```

#### Login User
- **POST** `/api/auth/login`
- **Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```
- **Response:** Includes user data, JWT token, and role

### Protected User Endpoints (Require Authentication)

#### Get Profile
- **GET** `/api/auth/profile`
- **Headers:** `Authorization: Bearer <token>`

#### Update Profile
- **PUT** `/api/auth/profile`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith"
}
```

#### Get User Role and Permissions
- **GET** `/api/auth/role`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
```json
{
  "status": "success",
  "data": {
    "role": "USER",
    "permissions": {
      "canManageUsers": false,
      "canCreateAdmin": false,
      "canDeleteUsers": false
    }
  }
}
```

#### Logout
- **POST** `/api/auth/logout`
- **Headers:** `Authorization: Bearer <token>`

### Admin-Only Endpoints (Require ADMIN Role)

#### Get All Users
- **GET** `/api/auth/users?page=1&limit=10&role=USER`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Query Parameters:**
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10, max: 100)
  - `role`: Filter by role (optional)

#### Get User by ID
- **GET** `/api/auth/users/:userId`
- **Headers:** `Authorization: Bearer <token>`
- **Note:** Users can access their own data, admins can access any user

#### Update User by ID (Admin Only)
- **PUT** `/api/auth/users/:userId`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Body:**
```json
{
  "firstName": "Updated Name",
  "lastName": "Updated Last",
  "role": "ADMIN"
}
```

#### Delete User by ID (Admin Only)
- **DELETE** `/api/auth/users/:userId`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Note:** Admins cannot delete themselves

#### Create Admin Account (Admin Only)
- **POST** `/api/auth/admin/register`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Body:**
```json
{
  "email": "admin@example.com",
  "password": "AdminPassword123",
  "firstName": "Admin",
  "lastName": "User",
  "role": "ADMIN"
}
```

## Database Schema

### User Table
```sql
CREATE TABLE users (
  id VARCHAR PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,
  firstName VARCHAR,
  lastName VARCHAR,
  role UserRole DEFAULT 'USER',
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

CREATE TYPE UserRole AS ENUM ('USER', 'ADMIN');
```

## Environment Variables

```env
DATABASE_URL="postgresql://..."  # PostgreSQL connection string
JWT_SECRET="your-secret-key"     # JWT signing secret
JWT_EXPIRES_IN="7d"              # Token expiration
PORT=3000                        # Server port
NODE_ENV=development             # Environment
BCRYPT_SALT_ROUNDS=12           # Password hashing rounds
```

## Authentication & Authorization

### JWT Token Structure
```json
{
  "userId": "user_id",
  "email": "user@example.com",
  "role": "USER",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Role Hierarchy
- **USER**: Basic permissions (level 1)
- **ADMIN**: Full permissions (level 2)

### Permission System
- Users can only access their own data
- Admins can access and modify all user data
- Role changes can only be made by admins
- Admin accounts can only be created by existing admins

## Password Requirements

- Minimum 6 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

## Security Features

- **JWT Authentication** - Stateless authentication with role information
- **Role-Based Access Control** - Granular permissions based on user roles
- **Password Hashing** - bcryptjs with configurable salt rounds
- **Input Validation** - Email format, password strength, and role validation
- **Error Handling** - Secure error messages without sensitive data
- **Token Role Validation** - Ensures token role matches current user role
- **Self-Protection** - Admins cannot delete themselves
- **CORS** - Cross-origin resource sharing configuration
- **Helmet** - Security headers

## Database Commands

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Create and run migrations
npm run db:migrate

# Open Prisma Studio
npm run db:studio
```

## Testing the API

### Creating First Admin (One-time setup)
Since public registration creates USER accounts, you'll need to manually create the first admin:

1. **Register a regular user first**
2. **Manually update the role in database** (using Prisma Studio or SQL)
3. **Or modify the registration temporarily** to allow admin creation

### Using curl

1. **Register a user:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

2. **Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123"
  }'
```

3. **Get profile:**
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer TOKEN"
```

4. **Admin - Get all users:**
```bash
curl -X GET http://localhost:3000/api/auth/users \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

5. **Admin - Create new admin:**
```bash
curl -X POST http://localhost:3000/api/auth/admin/register \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "AdminPassword123",
    "firstName": "Admin",
    "lastName": "User",
    "role": "ADMIN"
  }'
```

## Development Notes

- The API uses JWT tokens with role information for authentication
- Passwords are hashed using bcryptjs
- Database operations use Prisma ORM with role-based queries
- Error handling is centralized with role-aware responses
- Validation middleware ensures data integrity and role permissions
- The MVC pattern separates concerns with role-based logic

## Common Use Cases

### For Frontend Applications
1. **User Registration**: Public endpoint for new users
2. **User Login**: Returns role information for UI customization
3. **Role-Based UI**: Use `/api/auth/role` to show/hide admin features
4. **User Management**: Admin panel using admin-only endpoints

### For Admin Dashboards
1. **User List**: Paginated user listing with role filtering
2. **User Details**: View any user's information
3. **Role Management**: Update user roles
4. **Admin Creation**: Create new administrator accounts

## License

ISC 