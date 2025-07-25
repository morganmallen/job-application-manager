# 🚀 Deployment Guide - Job Application Manager

This guide covers both local development deployment and production deployment to Render.

## 📋 Prerequisites

### For Local Development

- **Node.js** (v18 or higher)
- **PostgreSQL** (v12 or higher)
- **Git**

### For Production (Render)

- **Render Account** (free tier available)
- **GitHub Repository** (for automatic deployments)

## 🏠 Local Development Deployment

### Option 1: Automated Script (Recommended)

```bash
# Navigate to server directory
cd server

# Run the automated deployment script
npm run deploy:local
```

This script will:

- ✅ Check PostgreSQL installation
- ✅ Start PostgreSQL service
- ✅ Create database `jobapp_db`
- ✅ Apply database schema
- ✅ Set up environment variables
- ✅ Install dependencies
- ✅ Build the application
- ✅ Start the development server

### Option 2: Manual Setup

```bash
# 1. Install PostgreSQL (if not already installed)
# macOS:
brew install postgresql
brew services start postgresql

# Ubuntu:
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql

# 2. Create database
createdb jobapp_db

# 3. Navigate to server directory
cd server

# 4. Set up environment
cp env.example .env
# Edit .env with your database credentials

# 5. Install dependencies
npm install

# 6. Apply database schema
psql -d jobapp_db -f ../database/complete_schema.sql

# 7. Build and start
npm run build
npm run start:dev
```

### Local Access URLs

- **API Server**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api-docs
- **Health Check**: http://localhost:3001/api/health

## ☁️ Production Deployment (Render)

### Step 1: Prepare Your Repository

1. **Push your code to GitHub**

   ```bash
   git add .
   git commit -m "feat: add deployment configuration"
   git push origin main
   ```

2. **Ensure these files are in your repository**:
   - `render.yaml` (deployment configuration)
   - `server/init-db.js` (database initialization)
   - `database/complete_schema.sql` (database schema)

### Step 2: Deploy to Render

1. **Go to [Render Dashboard](https://dashboard.render.com/)**

2. **Create a new Web Service**:

   - Click "New +"
   - Select "Web Service"
   - Connect your GitHub repository
   - Choose the repository

3. **Configure the service**:

   - **Name**: `jobapp-api`
   - **Environment**: `Node`
   - **Build Command**: `cd server && npm install && npm run build`
   - **Start Command**: `cd server && npm run start:prod`
   - **Plan**: Free

4. **Add Environment Variables**:

   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `JWT_SECRET`: Generate a secure random string
   - `CORS_ORIGIN`: Your frontend URL (if deploying frontend separately)

5. **Create PostgreSQL Database**:

   - Click "New +" → "PostgreSQL"
   - **Name**: `jobapp-db`
   - **Plan**: Free
   - Copy the connection string

6. **Link Database to Service**:
   - Go back to your web service
   - Add environment variable:
     - `DATABASE_URL`: Paste the PostgreSQL connection string

### Step 3: Initialize Database

After the first deployment, initialize the database:

```bash
# Option 1: Use Render's shell
# Go to your service → Shell → Run:
cd server && node init-db.js

# Option 2: Add to build command
# Update build command to:
cd server && npm install && npm run build && node init-db.js
```

### Step 4: Verify Deployment

- **API URL**: `https://your-service-name.onrender.com`
- **API Documentation**: `https://your-service-name.onrender.com/api-docs`
- **Health Check**: `https://your-service-name.onrender.com/api/health`

## 🔧 Environment Variables

### Local Development (.env)

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/jobapp_db"

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Production (Render)

```env
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-production-secret-key
CORS_ORIGIN=https://your-frontend-domain.com
```

## 🚨 Troubleshooting

### Local Development Issues

**PostgreSQL not running**:

```bash
# macOS
brew services start postgresql

# Ubuntu
sudo systemctl start postgresql
```

**Database connection error**:

```bash
# Check if database exists
psql -l | grep jobapp_db

# Create if missing
createdb jobapp_db
```

**Port already in use**:

```bash
# Find process using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>
```

### Production Issues

**Build fails**:

- Check build logs in Render dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript compilation

**Database connection fails**:

- Check `DATABASE_URL` environment variable
- Ensure database is created and accessible
- Verify SSL configuration for production

**JWT errors**:

- Ensure `JWT_SECRET` is set
- Check token expiration settings
- Verify CORS configuration

## 📊 Monitoring

### Health Checks

- **Endpoint**: `/api/health`
- **Expected Response**: `{"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}`

### Logs

- **Local**: Check terminal output
- **Production**: View logs in Render dashboard

### Performance

- **Local**: Use `npm run start:debug` for debugging
- **Production**: Monitor in Render dashboard

## 🔄 Continuous Deployment

### Automatic Deployments

- Render automatically deploys on `main` branch pushes
- Database migrations run automatically via `init-db.js`

### Manual Deployments

```bash
# Trigger manual deployment
git push origin main
```

## 🛡️ Security Considerations

### Production Checklist

- ✅ Use strong `JWT_SECRET`
- ✅ Enable HTTPS (automatic on Render)
- ✅ Set proper CORS origins
- ✅ Use environment variables for secrets
- ✅ Enable rate limiting
- ✅ Regular security updates

### Database Security

- ✅ Use connection pooling
- ✅ Enable SSL in production
- ✅ Regular backups (Render handles this)
- ✅ Monitor connection limits

---

## 📞 Support

If you encounter issues:

1. **Check the logs** (local terminal or Render dashboard)
2. **Verify environment variables**
3. **Test database connectivity**
4. **Review this deployment guide**

For additional help, check the project documentation or create an issue in the repository.
