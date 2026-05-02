# Balochistan Jobs Prep - Backend 🚀

Complete backend solution with Node.js, Firebase, JazzCash payments, and email notifications.

## Features ✨

- ✅ **Node.js + Express API** - RESTful endpoints
- ✅ **Firebase Integration** - Authentication & Firestore
- ✅ **JazzCash Payments** - Pakistani payment gateway
- ✅ **Email Notifications** - Automated emails using Nodemailer
- ✅ **Firebase Cloud Functions** - Serverless automated tasks
- ✅ **Admin Management** - Course and purchase management
- ✅ **Security** - Firebase token verification

## Project Structure 📁

```
backend/
├── server.js              # Express server
├── package.json          # Dependencies
├── .env.example          # Environment template
├── services/
│   ├── jazzcash.js       # JazzCash payment integration
│   └── email.js          # Email service
└── functions/
    └── index.js          # Firebase Cloud Functions
```

## Setup Instructions 🛠️

### 1. Clone Repository
```bash
cd backend
npm install
```

### 2. Firebase Setup
Get your Firebase credentials:
1. Go to Firebase Console: https://console.firebase.google.com
2. Your Project → Settings → Service Accounts
3. Generate new private key
4. Copy the JSON and save it secure

### 3. Configure Environment Variables
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```
FIREBASE_PROJECT_ID=project-f1d80b77-dbe2-481d-84b
FIREBASE_PRIVATE_KEY=your_private_key_here
FIREBASE_CLIENT_EMAIL=your_service_account_email@iam.gserviceaccount.com
JAZZCASH_MERCHANT_ID=your_merchant_id
JAZZCASH_PASSWORD=your_password
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_app_password
```

**Gmail App Password Setup:**
1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" and your device
3. Generate app password
4. Use this in `.env`

**JazzCash Setup:**
1. Register at: https://www.jazzcash.com.pk/merchant
2. Get your Merchant ID and Password
3. Use in `.env`

### 4. Start Development Server
```bash
npm run dev
```

Should print:
```
✅ Backend running on port 5000
📍 http://localhost:5000
🏪 API endpoints ready!
```

### 5. Test API
```bash
curl http://localhost:5000/api/health
```

Response:
```json
{
  "status": "Backend is running! 🚀"
}
```

## API Endpoints 📡

### Public Endpoints

**Get all courses:**
```
GET /api/courses
```

**Health check:**
```
GET /api/health
```

### User Endpoints (Requires Firebase Token)

**Get user profile:**
```
GET /api/users/:uid
Header: Authorization: Bearer {idToken}
```

**Request course purchase:**
```
POST /api/purchases/request
Body: { courseId, courseTitle, price }
```

**Get my purchases:**
```
GET /api/purchases
```

**Initiate JazzCash payment:**
```
POST /api/payment/jazzcash
Body: { purchaseId, amount, phoneNumber }
```

### Admin Endpoints (Requires Admin Role)

**Get all purchases:**
```
GET /api/admin/purchases
```

**Approve purchase:**
```
POST /api/admin/purchases/:id/approve
```

**Create new course:**
```
POST /api/admin/courses
Body: { title, price, description, emoji }
```

## Firebase Cloud Functions 🔥

Deploy functions to Firebase:
```bash
npm run deploy:functions
```

**Automated Functions:**

1. **onPurchaseRequest** - Sends email to admin on new purchase
2. **onPurchaseStatusChange** - Sends payment instructions when approved
3. **sendReminderEmails** - Daily reminder for pending payments (10 AM)
4. **cleanupOldRequests** - Weekly cleanup of 7-day old pending requests
5. **handlePaymentWebhook** - Updates purchase after payment

## JazzCash Payment Flow 💳

1. User clicks "Buy Now"
2. Frontend requests to `/api/payment/jazzcash`
3. Backend generates JazzCash form
4. User redirected to JazzCash payment page
5. JazzCash redirects back with response
6. Backend verifies signature hash
7. Updates purchase status
8. Sends confirmation email

## Email Templates 📧

All emails are HTML-formatted and include:
- Welcome email on registration
- Purchase request notification (admin)
- Payment instructions (user)
- Course access confirmation
- Reminder emails for pending purchases

## Database Schema 🗄️

### Collections in Firestore:

**purchases**
```
{
  userEmail: string
  userUID: string
  courseId: string
  courseTitle: string
  price: number
  status: "pending" | "approved" | "paid" | "failed"
  createdAt: timestamp
  approvedAt: timestamp (optional)
  paidAt: timestamp (optional)
  transactionId: string (optional)
}
```

**courses**
```
{
  title: string
  price: number
  description: string
  emoji: string
  createdAt: timestamp
}
```

**admins**
```
{
  role: "admin"
}
```

## Security Notes 🔒

- Never commit `.env` file
- Keep Firebase private key secret
- Always verify Firebase tokens
- CORS is restricted to frontend URL
- Admin operations require role verification
- JazzCash hash signature is verified

## Deployment Options 🚀

### Option 1: Firebase Cloud Functions (Free tier available)
```bash
npm run deploy:functions
```

### Option 2: Vercel (Serverless)
```bash
vercel
```

### Option 3: Render/Railway (Simple hosting)
- Push to GitHub
- Connect repo to Render
- Automatic deployment

## Troubleshooting 🐛

**"No token provided"**
- Make sure to send `Authorization: Bearer {idToken}` header

**"Firebase initialization fails"**
- Check `.env` file credentials
- Verify Firebase project exists

**"Emails not sending"**
- Enable "Less secure apps" in Gmail settings
- Use app-specific password instead
- Check email address is correct

**"JazzCash payment fails"**
- Check Merchant ID and Password
- Verify sandbox mode setting
- Check transaction amount format

## Support 💬

WhatsApp: 0335 730 0200  
Email: admin@bjobsprep.com

---

**Made with ❤️ for Balochistan Jobs Prep**
