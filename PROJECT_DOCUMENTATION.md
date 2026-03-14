# 🎮 GamerHub - Complete Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Folder Structure](#folder-structure)
4. [Environment Variables](#environment-variables)
5. [API Endpoints](#api-endpoints)
6. [Features](#features)
7. [Third-Party Services Setup](#third-party-services-setup)
8. [Running the Project](#running-the-project)

---

## Project Overview

GamerHub is a full-stack SaaS gaming community platform with:
- User authentication (Email + Google OAuth)
- Email verification system
- Subscription plans (Free, Silver, Gold)
- Stripe payment integration
- Profile image upload to Storj
- Google Maps location picker
- Admin dashboard with user management
- Auto plan expiration (cron job)

---

## Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js + Express 5 | Server framework |
| MongoDB + Mongoose | Database |
| JWT (jsonwebtoken) | Authentication tokens |
| bcryptjs | Password hashing |
| Passport.js | Google OAuth 2.0 |
| Nodemailer | Email service (currently console mode) |
| Stripe | Payment processing |
| AWS SDK (S3) | Storj file upload |
| multer | File upload handling |
| node-cron | Scheduled tasks |

### Frontend
| Technology | Purpose |
|------------|---------|
| React 19 + Vite | UI framework |
| React Router v7 | Routing |
| Axios | API calls |
| TailwindCSS v3 | Styling |
| SCSS | Custom styles |
| @stripe/stripe-js | Stripe checkout |

---

## Folder Structure

```
Mini_project/
├── backend/
│   ├── .env                    # Environment variables
│   ├── server.js               # Main entry point
│   ├── package.json
│   └── src/
│       ├── config/
│       │   └── db.js           # MongoDB connection
│       ├── models/
│       │   └── User.js         # User schema
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── userController.js
│       │   ├── paymentController.js
│       │   └── adminController.js
│       ├── routes/
│       │   ├── authRoutes.js
│       │   ├── userRoutes.js
│       │   ├── paymentRoutes.js
│       │   └── adminRoutes.js
│       ├── middleware/
│       │   ├── authMiddleware.js
│       │   └── adminMiddleware.js
│       ├── services/
│       │   ├── emailService.js    # Console mode (dev)
│       │   ├── stripeService.js
│       │   └── storjService.js
│       └── cron/
│           └── planExpirationCron.js
│
└── frontend/
    ├── .env
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx              # Routes
        ├── context/
        │   └── AuthContext.jsx
        ├── hooks/
        │   ├── useAuth.js
        │   └── useDebounce.js
        ├── services/
        │   ├── api.js
        │   ├── authService.js
        │   └── paymentService.js
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Sidebar.jsx
        │   ├── PlanCard.jsx
        │   ├── UserTable.jsx
        │   ├── Pagination.jsx
        │   ├── ProtectedRoute.jsx
        │   └── DashboardLayout.jsx
        ├── pages/
        │   ├── Landing.jsx
        │   ├── Signup.jsx
        │   ├── Login.jsx
        │   ├── VerifyEmail.jsx
        │   ├── AuthCallback.jsx
        │   ├── Dashboard.jsx
        │   ├── Profile.jsx
        │   ├── Plans.jsx
        │   ├── Payment.jsx
        │   ├── AdminDashboard.jsx
        │   └── UserManagement.jsx
        ├── styles/
        │   ├── variables.scss
        │   └── global.scss
        └── utils/
            └── helpers.js
```

---

## Environment Variables

### Backend (`backend/.env`)

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB Atlas
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/gamerhub?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Email (Currently console mode - update for production)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=GamerHub <noreply@gamerhub.com>

# Google OAuth 2.0
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxx

# Storj (S3-compatible storage)
STORJ_ACCESS_KEY=your_storj_access_key
STORJ_SECRET_KEY=your_storj_secret_key
STORJ_ENDPOINT=https://gateway.storjshare.io
STORJ_BUCKET=your_bucket_name

# Frontend URL
CLIENT_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxx
```

---

## API Endpoints

### Auth Routes (`/api/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/signup` | Register new user | ❌ |
| GET | `/verify-email?token=xxx` | Verify email | ❌ |
| POST | `/resend-verification` | Resend verification email | ❌ |
| POST | `/login` | Login user | ❌ |
| GET | `/google` | Initiate Google OAuth | ❌ |
| GET | `/google/callback` | Google OAuth callback | ❌ |
| GET | `/me` | Get current user | ✅ |
| POST | `/logout` | Logout user | ✅ |

### User Routes (`/api/user`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/profile` | Get user profile | ✅ |
| PUT | `/profile` | Update profile | ✅ |
| POST | `/upload-image` | Upload profile image | ✅ |
| DELETE | `/profile-image` | Delete profile image | ✅ |
| GET | `/download-profile` | Download profile JSON | ✅ |
| GET | `/plan-status` | Get plan status | ✅ |

### Payment Routes (`/api/payment`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/plans` | Get available plans | ❌ |
| POST | `/create-checkout` | Create Stripe checkout | ✅ |
| GET | `/verify?session_id=xxx` | Verify payment | ✅ |
| POST | `/webhook` | Stripe webhook | ❌ |

### Admin Routes (`/api/admin`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/users` | Get all users (paginated) | 🔐 Admin |
| GET | `/users/:id` | Get user by ID | 🔐 Admin |
| PUT | `/users/:id` | Update user | 🔐 Admin |
| DELETE | `/users/:id` | Delete user | 🔐 Admin |
| GET | `/stats` | Get dashboard stats | 🔐 Admin |
| PUT | `/users/:id/role` | Update user role | 🔐 Admin |

---

## Features

### ✅ Implemented

1. **Authentication**
   - Email/password signup with verification
   - Google OAuth 2.0 login
   - JWT token-based authentication
   - Protected routes

2. **User Management**
   - Profile update (name, address, location)
   - Profile image upload to Storj
   - Google Maps location picker
   - Download profile as JSON

3. **Subscription Plans**
   - Free (default)
   - Silver ($9.99/6 hours) - for testing
   - Gold ($19.99/12 hours) - for testing
   - Stripe checkout integration
   - Auto-expiration via cron job

4. **Admin Dashboard**
   - User listing with search/filter/pagination
   - Edit/delete users
   - Dashboard statistics
   - Role management

5. **Email System**
   - Currently in **console mode** (logs to terminal)
   - Ready for production email service

---

## Third-Party Services Setup

### 1. MongoDB Atlas (Database)

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free M0 cluster
3. Create database user with password
4. Whitelist IP: `0.0.0.0/0` (for development)
5. Get connection string and add to `MONGO_URI`

### 2. Google OAuth 2.0 (Social Login)

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project
3. Enable **Google+ API**
4. Go to **Credentials** → **Create OAuth Client ID**
5. Application type: **Web application**
6. Add authorized redirect URI:
   - `http://localhost:5000/api/auth/google/callback`
7. Copy **Client ID** and **Client Secret** to `.env`

### 3. Google Maps API (Location Picker)

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Enable these APIs:
   - Maps JavaScript API
   - Places API
3. Create API Key
4. Add to `VITE_GOOGLE_MAPS_API_KEY`

### 4. Stripe (Payments)

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Get **Test API keys**:
   - Secret key → `STRIPE_SECRET_KEY`
   - Publishable key → `VITE_STRIPE_PUBLISHABLE_KEY`
3. For webhooks (production):
   - Create endpoint: `https://yourdomain.com/api/payment/webhook`
   - Events: `checkout.session.completed`
   - Copy webhook secret → `STRIPE_WEBHOOK_SECRET`

**Test Card:** `4242 4242 4242 4242` | Any future date | Any CVC

### 5. Storj (Image Storage)

1. Go to [storj.io](https://storj.io) and create account
2. Create a new **bucket** (e.g., `gamerhub-profiles`)
3. Go to **Access** → **Create S3 Credentials**
4. Copy:
   - Access Key → `STORJ_ACCESS_KEY`
   - Secret Key → `STORJ_SECRET_KEY`
   - Endpoint → `https://gateway.storjshare.io`
   - Bucket name → `STORJ_BUCKET`

**Note:** Images use presigned URLs (valid for 1 hour) for security.

### 6. Email Service (Production)

Current: Console mode (verification links printed to terminal)

**For Production with Gmail:**
1. Enable 2-Step Verification on Google Account
2. Generate App Password: Google Account → Security → App passwords
3. Update `.env`:
   ```
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_gmail@gmail.com
   EMAIL_PASS=your_16_char_app_password
   ```

**For Production with SendGrid/Mailgun:**
Replace `emailService.js` with proper service integration.

---

## Running the Project

### Prerequisites
- Node.js v18+
- npm or yarn
- MongoDB Atlas account

### Installation

```bash
# Clone the repo
git clone <your-repo-url>
cd Mini_project

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Configuration

1. Copy `.env.example` to `.env` in both `backend/` and `frontend/`
2. Fill in all the required API keys

### Development

```bash
# Terminal 1 - Backend
cd backend
npm run dev
# Runs on http://localhost:5000

# Terminal 2 - Frontend
cd frontend
npm run dev
# Runs on http://localhost:5173
```

### Production Build

```bash
# Build frontend
cd frontend
npm run build

# The dist/ folder can be served with any static server
```

### Create Admin User

After first signup, promote a user to admin:

```bash
# MongoDB Shell or Compass
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
```

---

## Subscription Plans

| Plan | Price | Duration (Test) | Features |
|------|-------|-----------------|----------|
| Free | $0 | Forever | Basic access |
| Silver | $9.99 | 6 hours | Premium features |
| Gold | $19.99 | 12 hours | All features + Priority |

**Note:** Durations are set to hours for testing. Change in `stripeService.js` for production.

---

## Common Issues

### Image not showing
- Make sure Storj credentials are correct
- Images use presigned URLs (expire in 1 hour)
- Re-login to refresh the URL

### Email verification not working
- Check backend console for verification link
- Currently in console mode for development

### Google OAuth failing
- Check callback URL matches exactly
- Ensure Google+ API is enabled

### Stripe payment failing
- Use test card: `4242 4242 4242 4242`
- Check Stripe dashboard for errors

---

## Support

Created by GamerHub Team 🎮

For issues, check the console logs or open a GitHub issue.
