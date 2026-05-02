// ════════════ FIREBASE CLOUD FUNCTIONS ════════════
// Deploy: firebase deploy --only functions

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
require('dotenv').config();

admin.initializeApp();
const db = admin.firestore();

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// ──── TRIGGER ON NEW PURCHASE REQUEST ────
exports.onPurchaseRequest = functions.firestore
  .document('purchases/{purchaseId}')
  .onCreate(async (snap, context) => {
    const purchase = snap.data();
    
    // Send email to admin
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: process.env.ADMIN_EMAIL,
        subject: `New Purchase Request: ${purchase.courseTitle}`,
        html: `
          <h2>New Course Purchase Request</h2>
          <p><strong>Course:</strong> ${purchase.courseTitle}</p>
          <p><strong>User:</strong> ${purchase.userEmail}</p>
          <p><strong>Amount:</strong> Rs. ${purchase.price}</p>
          <p><a href="https://console.firebase.google.com/project/${process.env.FIREBASE_PROJECT_ID}/firestore/data/purchases/${context.params.purchaseId}">View in Firebase</a></p>
        `
      });
    } catch (err) {
      console.error('Error sending email:', err);
    }
  });

// ──── TRIGGER ON PURCHASE STATUS CHANGE ────
exports.onPurchaseStatusChange = functions.firestore
  .document('purchases/{purchaseId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // If status changed to approved
    if (before.status !== after.status && after.status === 'approved') {
      try {
        // Send payment instructions to user
        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: after.userEmail,
          subject: `Payment Instructions for ${after.courseTitle}`,
          html: `
            <h2>Your course purchase request approved! 🎉</h2>
            <p>Course: ${after.courseTitle}</p>
            <p>Amount: Rs. ${after.price}</p>
            <h3>Payment Methods:</h3>
            <p>1. <strong>WhatsApp:</strong> <a href="https://wa.me/92${process.env.ADMIN_WHATSAPP}">Contact Admin</a></p>
            <p>2. <strong>Bank Transfer:</strong> Details in admin panel</p>
            <p>After payment, send receipt to admin!</p>
          `
        });
      } catch (err) {
        console.error('Error sending approval email:', err);
      }
    }
  });

// ──── SCHEDULED: SEND INACTIVE USER REMINDERS ────
exports.sendReminderEmails = functions.pubsub
  .schedule('0 10 * * *') // Every day at 10 AM
  .onRun(async (context) => {
    try {
      const usersSnapshot = await db.collection('purchases')
        .where('status', '==', 'pending')
        .where('createdAt', '<', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)) // 3 days old
        .get();

      let remindersSent = 0;
      
      usersSnapshot.forEach(async (doc) => {
        const purchase = doc.data();
        
        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: purchase.userEmail,
          subject: `Reminder: ${purchase.courseTitle} Purchase`,
          html: `
            <h2>Your purchase request is pending!</h2>
            <p>Hi ${purchase.userEmail},</p>
            <p>It's been a few days since you requested to buy ${purchase.courseTitle}.</p>
            <p>Have you paid yet? If yes, please share your payment receipt with admin.</p>
            <p><a href="https://wa.me/92${process.env.ADMIN_WHATSAPP}">Contact Admin on WhatsApp</a></p>
          `
        });
        
        remindersSent++;
      });

      console.log(`✅ Sent ${remindersSent} reminder emails`);
      return { success: true, remindersSent };
    } catch (error) {
      console.error('Error:', error);
      return { success: false, error: error.message };
    }
  });

// ──── SCHEDULED: CLEAN UP OLD PENDING REQUESTS ────
exports.cleanupOldRequests = functions.pubsub
  .schedule('0 0 * * 0') // Every Sunday at midnight
  .onRun(async (context) => {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const snapshot = await db.collection('purchases')
        .where('status', '==', 'pending')
        .where('createdAt', '<', sevenDaysAgo)
        .get();

      let deleted = 0;
      snapshot.forEach(async (doc) => {
        await doc.ref.delete();
        deleted++;
      });

      console.log(`🗑️ Cleaned up ${deleted} old requests`);
      return { success: true, deleted };
    } catch (error) {
      console.error('Error:', error);
      return { success: false, error: error.message };
    }
  });

// ──── HTTP FUNCTION: PAYMENT WEBHOOK ────
exports.handlePaymentWebhook = functions.https.onRequest(async (req, res) => {
  try {
    const { purchaseId, status, transactionId } = req.body;

    // Update purchase in Firestore
    await db.collection('purchases').doc(purchaseId).update({
      status: status === 'success' ? 'paid' : 'failed',
      transactionId,
      paidAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
