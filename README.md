# Job Application Manager

Complete job application management system with robust JWT authentication, refresh tokens, and session management.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
cd server && npm install
```

### 2. Configure Database

```bash
# Create PostgreSQL database
createdb job_application_manager

# Initialize schema
cd server && npm run init:db
```

### 3. Configure Environment Variables

```bash
cd server
cp env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/job_application_manager"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3001
```

### 4. Start Server

```bash
cd server
npm run start:dev
```

The server will be available at: `http://localhost:3001`

## ✅ Verified Features

### 🔐 Complete Authentication

- ✅ User registration
- ✅ Login with JWT tokens
- ✅ Refresh tokens (7 days)
- ✅ Logout with revocation
- ✅ Token blacklist
- ✅ Multiple session management

### 📊 Data Management

- ✅ Create/edit/delete companies
- ✅ Create/edit/delete applications
- ✅ Create/edit/delete interview events
- ✅ Create/edit/delete notes
- ✅ Entity relationships
- ✅ Application analytics and statistics

### 🛡️ Security

- ✅ 15-minute JWT tokens
- ✅ Refresh tokens stored in DB
- ✅ Individual and bulk revocation
- ✅ Automatic cleanup of expired tokens

## 🧪 Testing the API

### Using the test file

```bash
# In VS Code: Open API_TESTING.http
# Tokens are already configured for testing
```

### Main endpoints

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout
- `GET /api/health` - Check status
- `GET /api/analytics/applications` - Get application statistics

## 📊 Analytics and Statistics

### Analytics Features

- **Metrics Dashboard**: Visualization of key statistics

  - Total applications
  - Success rate (Accepted + Job Offers)
  - Response rate (Applications with response)
  - Active applications (In progress)

- **Status Distribution**: Bar chart showing:

  - Applied
  - In progress
  - Rejected
  - Accepted
  - Job offers
  - Withdrawn

- **Monthly Trends**: Line chart with data from the last 6 months
  - Temporal evolution of applications
  - Status comparison by month

### Frontend Components

- `src/pages/analytics/index.tsx` - Main analytics page
- `src/components/analytics/AnalyticsCard.tsx` - Individual metric cards
- `src/components/analytics/StatusChart.tsx` - Status distribution chart
- `src/components/analytics/TimelineChart.tsx` - Timeline trends chart

### Backend Endpoint

- `GET /api/analytics/applications` - Returns statistics and monthly data

## 📋 Project Structure

```
├── server/                 # Backend NestJS
│   ├── src/
│   │   ├── auth/          # JWT Authentication
│   │   ├── controllers/   # API Endpoints
│   │   │   └── analytics/ # Analytics Controllers
│   │   ├── services/      # Business Logic
│   │   │   └── analytics/ # Analytics Services
│   │   └── entities/      # Database Models
│   └── database/          # SQL Schemas
├── src/                   # Frontend React
│   ├── pages/            # Application Pages
│   │   └── analytics/    # Analytics Pages
│   ├── components/       # Reusable Components
│   │   └── analytics/    # Analytics Components
│   └── assets/          # Static Resources
└── API_TESTING.http       # API Tests
```

## 🔧 Useful Commands

```bash
# Development
npm run start:dev          # Server with hot reload
npm run build             # Build for production
npm run seed              # Populate database

# Database
npm run init:db           # Initialize schema
npm run deploy:local      # Complete local deployment
```

## 📝 Important Notes

- **JWT Tokens**: Expire in 15 minutes
- **Refresh Tokens**: Expire in 7 days
- **Database**: PostgreSQL required
- **Port**: 3001 (configurable in .env)

## 🚨 Troubleshooting

### Port in use

```bash
lsof -ti:3001 | xargs kill -9
```

### Database connection issues

```bash
# Check PostgreSQL
brew services start postgresql  # macOS
sudo systemctl start postgresql # Linux
```

### Enum errors

Application status values are:

- `Applied`
- `In progress`
- `Rejected`
- `Accepted`
- `Job Offered`
- `Withdraw`
