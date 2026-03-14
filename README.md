# 🎮 GamerHub — Full Stack Gaming Community SaaS

A complete full-stack SaaS platform for gaming communities built with React + Node.js.

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, TailwindCSS v3, SCSS, React Router v7 |
| Backend | Node.js, Express.js 5, MongoDB + Mongoose |
| Auth | JWT, bcrypt, Email Verification, Google OAuth 2.0 |
| Payments | Stripe Checkout (Sandbox) |
| Storage | Storj (S3-compatible) for profile images |
| Maps | Google Maps + Places Autocomplete |
| Scheduler | node-cron (plan expiration every minute) |
| Email | Nodemailer (SMTP) |

## 📁 Project Structure

```
Mini_project/
├── backend/
│   ├── src/
│   │   ├── models/        # MongoDB User model
│   │   ├── controllers/   # Auth, User, Payment, Admin
│   │   ├── routes/        # Express routes
│   │   ├── middleware/    # JWT auth + admin guard
│   │   ├── services/      # Email, Stripe, Storj
│   │   ├── cron/          # Plan expiration job
│   │   └── config/        # DB connection
│   └── server.js
└── frontend/
    └── src/
        ├── components/    # Navbar, Sidebar, PlanCard, UserTable, Pagination
        ├── pages/         # Landing, Signup, Login, Dashboard, Profile, Plans, Payment, Admin
        ├── services/      # Axios API, authService, paymentService
        ├── context/       # AuthContext
        ├── hooks/         # useAuth, useDebounce
        ├── utils/         # helpers.js
        └── styles/        # global.scss, variables.scss
```

## ⚙️ Setup

### 1. Backend `.env`
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/gamerhub
JWT_SECRET=your_jwt_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STORJ_ACCESS_KEY=your_storj_key
STORJ_SECRET_KEY=your_storj_secret
STORJ_ENDPOINT=https://gateway.storjshare.io
STORJ_BUCKET=gamerhub-profiles
CLIENT_URL=http://localhost:5173
```

### 2. Frontend `.env`
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 3. Run

```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Start backend (port 5000)
cd backend && npm run dev

# Start frontend (port 5173)
cd frontend && npm run dev
```

## 🔑 API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/signup` | Register user |
| POST | `/api/auth/login` | Login with JWT |
| GET | `/api/auth/verify-email?token=` | Verify email |
| POST | `/api/auth/resend-verification` | Resend verification |
| GET | `/api/auth/google` | Google OAuth |
| GET | `/api/auth/google/callback` | OAuth callback |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | Logout |

### User (Protected)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/user/profile` | Get profile |
| PUT | `/api/user/profile` | Update profile |
| POST | `/api/user/upload-image` | Upload profile image |
| DELETE | `/api/user/profile-image` | Remove image |
| GET | `/api/user/download-profile` | Download as JSON |
| GET | `/api/user/plan-status` | Plan status + time left |

### Payment (Protected)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/payment/plans` | Get all plans |
| POST | `/api/payment/create-checkout` | Create Stripe session |
| GET | `/api/payment/verify?session_id=` | Verify & activate plan |
| POST | `/api/payment/webhook` | Stripe webhook |

### Admin (Admin only)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/admin/stats` | Dashboard stats |
| GET | `/api/admin/users` | List users (search/filter/paginate) |
| GET | `/api/admin/users/:id` | Get user by ID |
| PUT | `/api/admin/users/:id` | Update user |
| PUT | `/api/admin/users/:id/role` | Change role |
| DELETE | `/api/admin/users/:id` | Delete user |

### Games (Protected)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/games` | Get allowed games + daily playtime summary |
| GET | `/api/games/:gameId` | Start a game session (checks plan + time limit) |
| POST | `/api/games/:gameId/stop` | Stop game session and update playtime |

## 💳 Test Stripe

Use card: `4242 4242 4242 4242` | Any future date | Any 3-digit CVC

## 📦 Plans

| Plan | Price | Duration |
|------|-------|----------|
| Free | $0 | Forever |
| Silver | $9.99 | 6 hours |
| Gold | $19.99 | 12 hours |

> Plans auto-expire via node-cron running every minute.

## 🎮 Game Access System

Game access is plan-based with daily playtime limits:

| Plan | Allowed Games | Daily Limit |
|------|---------------|-------------|
| Free | Tic Tac Toe | 30 minutes |
| Silver | Tic Tac Toe, Snake | 6 hours |
| Gold | Tic Tac Toe, Snake, Rock Paper Scissors | 12 hours |

Frontend routes:
- `/games` (library)
- `/games/:gameId` (play)

## 🛡️ Create Admin User

```bash
# In MongoDB shell / Compass
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } })
```
