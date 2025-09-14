import Razorpay from 'razorpay';
import crypto from 'crypto';

// Razorpay configuration
const razorpayConfig = {
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_RHNsVb8W8YBFo5',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'xNbOKyqPFqjCobCb1eat51tG',
};

// Initialize Razorpay instance
export const razorpay = new Razorpay({
  key_id: razorpayConfig.key_id,
  key_secret: razorpayConfig.key_secret,
});

// Helper function to verify Razorpay signature
export const verifyRazorpaySignature = (
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): boolean => {
  const body = razorpayOrderId + '|' + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac('sha256', razorpayConfig.key_secret)
    .update(body.toString())
    .digest('hex');

  return expectedSignature === razorpaySignature;
};

export default razorpay;
