# AQ-PAY API

A robust Express.js REST API with MVC architecture, authentication, and PostgreSQL database integration using Prisma ORM.

## Features

- 🏗️ **MVC Architecture** - Well-organized code structure
- 🔐 **JWT Authentication** - Secure user authentication
- 🛡️ **Password Hashing** - bcryptjs for secure password storage
- 🐘 **PostgreSQL Database** - Using Neon cloud database
- 🔍 **Prisma ORM** - Type-safe database operations
- ✅ **Input Validation** - Comprehensive request validation
- 🚦 **Error Handling** - Global error handling middleware
- 🔒 **Security** - Helmet, CORS, and other security measures
- 📝 **Logging** - Morgan for request logging

## Project Structure

```
src/
├── controllers/     # Request handlers
├── models/         # Database models
├── routes/         # API routes
├── middleware/     # Custom middleware
├── utils/          # Utility functions
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

### Authentication

#### Register User
- **POST** `/api/auth/register`
- **Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123",
  "firstName": "John",
  "lastName": "Doe"
}
```
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

#### Get Profile (Protected)
- **GET** `/api/auth/profile`
- **Headers:** `Authorization: Bearer <token>`

#### Update Profile (Protected)
- **PUT** `/api/auth/profile`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith"
}
```

#### Logout (Protected)
- **POST** `/api/auth/logout`
- **Headers:** `Authorization: Bearer <token>`

## Database Schema

### User Table
```sql
CREATE TABLE users (
  id VARCHAR PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,
  firstName VARCHAR,
  lastName VARCHAR,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
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

## Password Requirements

- Minimum 6 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

## Security Features

- **JWT Authentication** - Stateless authentication
- **Password Hashing** - bcryptjs with configurable salt rounds
- **Input Validation** - Email format and password strength validation
- **Error Handling** - Secure error messages without sensitive data
- **CORS** - Cross-origin resource sharing configuration
- **Helmet** - Security headers
- **Rate Limiting** - Can be easily added

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

3. **Get profile (replace TOKEN with actual token):**
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer TOKEN"
```

## Development Notes

- The API uses JWT tokens for authentication
- Passwords are hashed using bcryptjs
- Database operations use Prisma ORM
- Error handling is centralized
- Validation middleware ensures data integrity
- The MVC pattern separates concerns effectively

## License

ISC 