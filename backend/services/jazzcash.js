// ════════════ JAZZCASH PAYMENT INTEGRATION ════════════
const crypto = require('crypto');
const axios = require('axios');
require('dotenv').config();

const JAZZCASH_URL = process.env.JAZZCASH_PROCESSING_URL;
const MERCHANT_ID = process.env.JAZZCASH_MERCHANT_ID;
const PASSWORD = process.env.JAZZCASH_PASSWORD;

// Generate Security Hash
function generateSecurityHash(params) {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => params[key])
    .join('');
  
  return crypto
    .createHmac('sha256', PASSWORD)
    .update(sortedParams)
    .digest('base64');
}

// Initiate JazzCash Payment
async function initiateJazzCashPayment(courseData) {
  const referenceNumber = `BJP${Date.now()}`;
  const amount = (courseData.price * 100).toString(); // In paisas

  const params = {
    pp_MerchantID: MERCHANT_ID,
    pp_Language: 'EN',
    pp_Version: '1.1',
    pp_TxnType: 'MWALLET',
    pp_SubMerchantID: '',
    pp_BillReference: courseData.billReference || 'BILL123',
    pp_Description: `Course: ${courseData.courseTitle}`,
    pp_Amount: amount,
    pp_TxnExpiryDateTime: getExpiryDateTime(),
    pp_ReturnURL: `${process.env.FRONTEND_URL}/payment/callback`,
    pp_NotificationURL: `${process.env.BACKEND_URL}/api/payment/jazzcash/callback`,
    pp_CancelURL: `${process.env.FRONTEND_URL}/payment/cancel`,
    pp_IsSandboxMode: '1', // Set to 0 in production
    pp_IsCustomerIdFieldMandatory: '1',
    pp_CustomerID: courseData.userUID || 'CUSTOMER001',
    pp_CustomerEmail: courseData.userEmail,
    pp_CustomerMobile: courseData.phoneNumber,
    pp_ChannelID: 'WEB'
  };

  // Generate hash
  params.pp_SecureHash = generateSecurityHash(params);

  try {
    const response = await axios.post(JAZZCASH_URL, params);
    return {
      success: true,
      redirectUrl: response.data.redirectUrl,
      referenceNumber
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Handle JazzCash Callback
function handleJazzCashCallback(responseParams) {
  const receivedHash = responseParams.pp_SecureHash;
  
  // Verify hash
  const params = { ...responseParams };
  delete params.pp_SecureHash;
  
  const computedHash = generateSecurityHash(params);
  
  if (computedHash !== receivedHash) {
    return {
      success: false,
      error: 'Invalid security hash'
    };
  }

  const txnStatus = responseParams.pp_ResponseCode;
  
  return {
    success: txnStatus === '000', // 000 = Success
    transactionId: responseParams.pp_TxnRefNo,
    amount: responseParams.pp_Amount,
    status: getTxnStatus(txnStatus)
  };
}

// Get Transaction Status
function getTxnStatus(code) {
  const statuses = {
    '000': 'Success',
    '001': 'Failed',
    '002': 'Cancelled',
    '003': 'Pending'
  };
  return statuses[code] || 'Unknown';
}

// Get Expiry DateTime
function getExpiryDateTime() {
  const date = new Date();
  date.setHours(date.getHours() + 1); // 1 hour expiry
  return date.toISOString().replace(/[:-]/g, '').split('.')[0] + 'Z';
}

module.exports = {
  initiateJazzCashPayment,
  handleJazzCashCallback
};
