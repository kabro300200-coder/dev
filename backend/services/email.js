// ════════════ EMAIL SERVICE ════════════
const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD // Use App Password, not your Gmail password
  }
});

// Send Welcome Email
async function sendWelcomeEmail(userEmail, userName) {
  const htmlContent = `
    <h2>Welcome to Balochistan Jobs Prep! 🎓</h2>
    <p>Hi ${userName},</p>
    <p>Thank you for registering with us. We're excited to help you prepare for your government exams!</p>
    <p><strong>Next Steps:</strong></p>
    <ol>
      <li>Browse our courses</li>
      <li>Select the course for your exam</li>
      <li>Submit your purchase request</li>
      <li>Our admin will contact you with payment details</li>
    </ol>
    <p>Need help? Contact us at: ${process.env.ADMIN_EMAIL}</p>
    <p>Best regards,<br>Balochistan Jobs Prep Team 🏔️</p>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: userEmail,
      subject: 'Welcome to Balochistan Jobs Prep!',
      html: htmlContent
    });
    return { success: true };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
}

// Send Purchase Request Notification (to Admin)
async function sendPurchaseRequestEmail(purchaseData) {
  const htmlContent = `
    <h2>New Purchase Request 📨</h2>
    <p><strong>Course:</strong> ${purchaseData.courseTitle}</p>
    <p><strong>User Email:</strong> ${purchaseData.userEmail}</p>
    <p><strong>Amount:</strong> Rs. ${purchaseData.price}</p>
    <p><strong>Requested At:</strong> ${new Date().toLocaleString()}</p>
    <p>
      <a href="${process.env.FRONTEND_URL}/admin/purchases" 
         style="background: #14532d; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        View in Admin Panel
      </a>
    </p>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.ADMIN_EMAIL,
      subject: `New Purchase Request: ${purchaseData.courseTitle}`,
      html: htmlContent
    });
    return { success: true };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
}

// Send Payment Instructions to User
async function sendPaymentInstructionsEmail(userEmail, purchaseData) {
  const htmlContent = `
    <h2>Course Purchase - Payment Instructions 💳</h2>
    <p>Hi ${purchaseData.userName || 'Student'},</p>
    <p>Your request to purchase <strong>${purchaseData.courseTitle}</strong> has been approved!</p>
    
    <h3>Payment Details:</h3>
    <ul>
      <li><strong>Amount:</strong> Rs. ${purchaseData.price}</li>
      <li><strong>Course:</strong> ${purchaseData.courseTitle}</li>
    </ul>

    <h3>Payment Methods:</h3>
    <p>
      <strong>Option 1:</strong> Pay via WhatsApp<br>
      📱 <a href="https://wa.me/92${process.env.ADMIN_WHATSAPP}">Contact Admin on WhatsApp</a>
    </p>
    <p>
      <strong>Option 2:</strong> Pay via JazzCash<br>
      💳 Use your JazzCash account
    </p>

    <p><strong>After Payment:</strong></p>
    <ol>
      <li>Save your payment receipt</li>
      <li>Send receipt to admin via WhatsApp</li>
      <li>Admin will provide access within 24 hours</li>
    </ol>

    <p>Need help? Reply to this email or call us on WhatsApp at ${process.env.ADMIN_WHATSAPP}</p>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: userEmail,
      subject: `Payment Instructions for ${purchaseData.courseTitle}`,
      html: htmlContent
    });
    return { success: true };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
}

// Send Course Access Email
async function sendCourseAccessEmail(userEmail, courseData) {
  const htmlContent = `
    <h2>Course Access Granted! 🎓</h2>
    <p>Congratulations! Your payment has been verified.</p>
    <p><strong>You now have access to:</strong></p>
    <h3>${courseData.courseTitle}</h3>
    
    <h3>How to Access:</h3>
    <ol>
      <li>Log in to your account</li>
      <li>Go to "My Courses"</li>
      <li>Click on "${courseData.courseTitle}"</li>
      <li>Start studying!</li>
    </ol>

    <p><strong>Course Details:</strong></p>
    <ul>
      <li>📚 Complete syllabus coverage</li>
      <li>🎯 Exam-focused material</li>
      <li>💡 Expert-curated notes</li>
      <li>📱 Available on all devices</li>
    </ul>

    <p>Good luck with your exam prep! 🚀</p>
    <p>For any issues, contact: ${process.env.ADMIN_EMAIL}</p>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: userEmail,
      subject: `Access Granted: ${courseData.courseTitle}`,
      html: htmlContent
    });
    return { success: true };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendWelcomeEmail,
  sendPurchaseRequestEmail,
  sendPaymentInstructionsEmail,
  sendCourseAccessEmail
};
