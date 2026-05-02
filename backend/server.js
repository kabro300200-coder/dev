// ════════════ IMPORTS ════════════
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const admin = require('firebase-admin');

// ════════════ INITIALIZE ════════════
const app = express();

// Firebase Admin SDK
admin.initializeApp({
  projectId: process.env.FIREBASE_PROJECT_ID,
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  })
});

const db = admin.firestore();
const auth = admin.auth();

// ════════════ MIDDLEWARE ════════════
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ════════════ ROUTES ════════════

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running! 🚀' });
});

// ──── USER ROUTES ────
app.get('/api/users/:uid', verifyToken, async (req, res) => {
  try {
    const user = await auth.getUser(req.params.uid);
    const userData = await db.collection('users').doc(req.params.uid).get();
    res.json({ user: user.toJSON(), data: userData.data() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ──── COURSE ROUTES ────
app.get('/api/courses', async (req, res) => {
  try {
    const snapshot = await db.collection('courses').get();
    const courses = [];
    snapshot.forEach(doc => courses.push({ id: doc.id, ...doc.data() }));
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ──── PURCHASE ROUTES ────
app.post('/api/purchases/request', verifyToken, async (req, res) => {
  try {
    const { courseId, courseTitle, price } = req.body;
    const existing = await db.collection('purchases')
      .where('userEmail', '==', req.user.email)
      .where('courseId', '==', courseId)
      .where('status', '==', 'pending')
      .get();
    
    if (!existing.empty) {
      return res.status(400).json({ error: 'Already have a pending request for this course' });
    }

    const purchase = await db.collection('purchases').add({
      userEmail: req.user.email,
      userUID: req.user.uid,
      courseId,
      courseTitle,
      price,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ success: true, purchaseId: purchase.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user's purchases
app.get('/api/purchases', verifyToken, async (req, res) => {
  try {
    const snapshot = await db.collection('purchases')
      .where('userUID', '==', req.user.uid)
      .orderBy('createdAt', 'desc')
      .get();
    
    const purchases = [];
    snapshot.forEach(doc => purchases.push({ id: doc.id, ...doc.data() }));
    res.json(purchases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ──── PAYMENT ROUTES ────
app.post('/api/payment/jazzcash', verifyToken, async (req, res) => {
  try {
    const { purchaseId, amount, phoneNumber } = req.body;
    // JazzCash payment integration here
    res.json({ success: true, message: 'Payment initiated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ──── ADMIN ROUTES ────
app.get('/api/admin/purchases', verifyAdmin, async (req, res) => {
  try {
    const snapshot = await db.collection('purchases')
      .orderBy('createdAt', 'desc')
      .get();
    
    const purchases = [];
    snapshot.forEach(doc => purchases.push({ id: doc.id, ...doc.data() }));
    res.json(purchases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/purchases/:id/approve', verifyAdmin, async (req, res) => {
  try {
    await db.collection('purchases').doc(req.params.id).update({
      status: 'approved',
      approvedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/courses', verifyAdmin, async (req, res) => {
  try {
    const { title, price, description, emoji } = req.body;
    const course = await db.collection('courses').add({
      title,
      price,
      description,
      emoji,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ success: true, courseId: course.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ════════════ MIDDLEWARE ════════════

// Verify Firebase Token
async function verifyToken(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new Error('No token provided');
    
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized: ' + err.message });
  }
}

// Verify Admin
async function verifyAdmin(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new Error('No token provided');
    
    const decoded = await admin.auth().verifyIdToken(token);
    const adminDoc = await db.collection('admins').doc(decoded.uid).get();
    
    if (!adminDoc.exists) {
      throw new Error('Admin access required');
    }
    
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Forbidden: ' + err.message });
  }
}

// ════════════ START SERVER ════════════
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`🏪 API endpoints ready!`);
});
