# Vercel Deployment Guide

This guide will help you deploy your AQ-PAY API to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI** (optional): `npm install -g vercel`
3. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, or Bitbucket)

## Project Structure for Vercel

```
├── api/
│   └── index.js        # Vercel serverless function entry point
├── src/
│   ├── app.js          # Express application
│   ├── server.js       # Development server (ignored by Vercel)
│   └── ...             # Other source files
├── vercel.json         # Vercel configuration
└── .vercelignore       # Files to exclude from deployment
```

## Step 1: Prepare Your Environment Variables

You'll need to set up the following environment variables in Vercel:

```env
DATABASE_URL=postgresql://neondb_owner:npg_HtCgZuPmW1Y5@ep-crimson-snowflake-a1ixoegc-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-make-it-long-and-random
JWT_EXPIRES_IN=7d
NODE_ENV=production
BCRYPT_SALT_ROUNDS=12
```

**Important**: Generate a strong JWT_SECRET for production!

## Step 2: Deploy via Vercel Dashboard (Recommended)

1. **Connect Repository**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your Git repository

2. **Configure Project**:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (default)
   - **Build Command**: Leave empty (auto-detected)
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

3. **Add Environment Variables**:
   - Go to "Environment Variables" section
   - Add each environment variable from Step 1
   - Make sure to add them for all environments (Production, Preview, Development)

4. **Deploy**:
   - Click "Deploy"
   - Wait for the build to complete

## Step 3: Deploy via Vercel CLI (Alternative)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Set Environment Variables**:
   ```bash
   vercel env add DATABASE_URL
   vercel env add JWT_SECRET
   vercel env add JWT_EXPIRES_IN
   vercel env add NODE_ENV
   vercel env add BCRYPT_SALT_ROUNDS
   ```

5. **Deploy for Production**:
   ```bash
   vercel --prod
   ```

## Step 4: Verify Deployment

After deployment, test your API:

1. **Health Check**:
   ```bash
   curl https://your-deployment-url.vercel.app/api/health
   ```

2. **Root Endpoint**:
   ```bash
   curl https://your-deployment-url.vercel.app/
   ```

3. **Register a User**:
   ```bash
   curl -X POST https://your-deployment-url.vercel.app/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "Password123",
       "firstName": "Test",
       "lastName": "User"
     }'
   ```

4. **Login**:
   ```bash
   curl -X POST https://your-deployment-url.vercel.app/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "Password123"
     }'
   ```

## Configuration Files Explained

### `api/index.js`
- Vercel serverless function entry point
- Imports and exports the Express app
- Follows Vercel's convention for serverless functions

### `vercel.json`
- Simplified configuration
- Routes all requests to the `/api` serverless function
- Auto-detects Node.js runtime

### `.vercelignore`
- Excludes files from deployment
- Includes development server file since it's not needed in serverless
- Keeps the deployment package small and secure

### Updated `package.json`
- Added build scripts for Vercel
- Moved Prisma to dependencies for production builds
- Added postinstall script to generate Prisma client

## Database Considerations

### Prisma with Serverless
- Prisma works well with serverless functions
- Database connections are handled automatically
- Connection pooling is recommended for production (already configured in your Neon URL)

### Environment-Specific Behavior
- In development: Server runs normally with persistent connections
- In production (Vercel): Functions are stateless and handle connections per request

## Troubleshooting

### Build Errors
1. **Prisma Client Generation**: Make sure `postinstall` script runs
2. **Environment Variables**: Ensure all required env vars are set
3. **Node Version**: Vercel uses Node.js 18+ by default

### Runtime Errors
1. **Database Connection**: Check DATABASE_URL is correct
2. **JWT Secret**: Ensure JWT_SECRET is set and secure
3. **CORS Issues**: Configure CORS for your frontend domain

### Function Timeouts
- Vercel has a 30-second timeout for hobby plans
- Consider upgrading for longer timeouts if needed

### Common Deployment Issues
1. **"Functions pattern doesn't match"**: Fixed by using `api/index.js`
2. **"Cannot use functions with builds"**: Fixed by simplifying `vercel.json`
3. **Database connection errors**: Check environment variables

## Security Best Practices

1. **JWT Secret**: Use a strong, random secret (at least 32 characters)
2. **Environment Variables**: Never commit secrets to Git
3. **Database**: Use connection pooling (already configured)
4. **CORS**: Configure for specific domains in production

## Monitoring and Logs

1. **Vercel Dashboard**: View function logs and analytics
2. **Real-time Logs**: Use `vercel logs` CLI command
3. **Performance**: Monitor function execution times

## Custom Domain (Optional)

1. Go to your project settings in Vercel dashboard
2. Navigate to "Domains"
3. Add your custom domain
4. Configure DNS according to Vercel's instructions

## Continuous Deployment

Once connected to Git:
- Every push to main branch triggers production deployment
- Pull requests create preview deployments
- Automatic HTTPS certificates
- Global CDN distribution

Your API is now ready for production use! 🚀

## API Endpoints After Deployment

Once deployed, your API will be available at:
- `GET /` - API information and endpoints list
- `GET /api/health` - Health check
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update profile (protected)
- `POST /api/auth/logout` - Logout (protected) 