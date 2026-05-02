# Backend Quick Start Guide 🚀

## Step 1: Install Dependencies
```bash
cd /workspaces/dev/backend
npm install
```

## Step 2: Get Firebase Credentials
1. Visit: https://console.firebase.google.com
2. Select your project: `project-f1d80b77-dbe2-481d-84b`
3. Go to **Settings** → **Service Accounts**
4. Click **Generate new private key**
5. A JSON file will download

## Step 3: Setup Environment Variables
```bash
# Copy template
cp .env.example .env

# Edit .env and add:
FIREBASE_PRIVATE_KEY=paste_your_private_key_here
FIREBASE_CLIENT_EMAIL=copy_from_json_file
```

## Step 4: Start Local Server
```bash
npm run dev
```

You should see:
```
✅ Backend running on port 5000
📍 http://localhost:5000
🏪 API endpoints ready!
```

## Step 5: Test API
```bash
curl http://localhost:5000/api/health
```

Should return:
```json
{
  "status": "Backend is running! 🚀"
}
```

## Next Steps

### Add API to Frontend
Update your `index.html` to call these endpoints:

```javascript
// Get courses from backend instead of hardcoded
async function loadCoursesFromBackend() {
  const response = await fetch('http://localhost:5000/api/courses');
  const courses = await response.json();
  return courses;
}

// Get Firebase token and send with requests
async function submitPurchaseWithBackend(courseId) {
  const token = await currentUser.getIdToken();
  const response = await fetch('http://localhost:5000/api/purchases/request', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      courseId,
      courseTitle: 'Course Name',
      price: 500
    })
  });
  return response.json();
}
```

### Deploy Functions
```bash
firebase deploy --only functions
```

### Deploy to Production
**Option 1: Vercel**
```bash
vercel
```

**Option 2: Render.com**
- Push to GitHub
- Connect repo from https://dashboard.render.com
- Auto-deploy on push

**Option 3: Railway.app**
- Connect GitHub repo
- Set environment variables
- Deploy

## Environment Variables Checklist ✅

- [ ] FIREBASE_PROJECT_ID
- [ ] FIREBASE_PRIVATE_KEY
- [ ] FIREBASE_CLIENT_EMAIL
- [ ] JAZZCASH_MERCHANT_ID (for payments)
- [ ] JAZZCASH_PASSWORD
- [ ] EMAIL_USER (your Gmail)
- [ ] EMAIL_PASSWORD (app password)
- [ ] ADMIN_EMAIL
- [ ] ADMIN_WHATSAPP

## Support 💬

WhatsApp: 0335 730 0200  
Email: admin@bjobsprep.com
