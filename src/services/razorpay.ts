// Razorpay service for handling payments
declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayOptions {
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color: string;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

class RazorpayService {
  private keyId: string;

  constructor() {
    // Get key from environment or use the provided key
    this.keyId = 'rzp_test_RHNsVb8W8YBFo5'; // Your test key
  }

  async createOrder(amount: number, currency: string = 'INR') {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:4000/api/payments/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          amount: amount * 100, // Razorpay expects amount in paise
          currency,
        }),
      });

      if (!response.ok) {
        // If authentication fails, create a mock order for testing
        if (response.status === 401) {
          console.warn('Authentication failed, using mock order for testing');
          return {
            success: true,
            order: {
              id: `order_${Date.now()}_mock`,
              amount: amount * 100,
              currency,
              receipt: `receipt_${Date.now()}_mock`,
              status: 'created',
            },
          };
        }
        throw new Error('Failed to create order');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      // Fallback to mock order for testing
      console.warn('Using mock order for testing');
      return {
        success: true,
        order: {
          id: `order_${Date.now()}_mock`,
          amount: amount * 100,
          currency,
          receipt: `receipt_${Date.now()}_mock`,
          status: 'created',
        },
      };
    }
  }

  async verifyPayment(paymentData: RazorpayResponse) {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:4000/api/payments/razorpay/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        console.error(`Payment verification failed with status: ${response.status}`);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Payment verification failed: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error; // Re-throw the error instead of falling back to mock
    }
  }

  openCheckout(options: RazorpayOptions) {
    return new Promise((resolve, reject) => {
      console.log('🔍 [Razorpay Debug] Starting openCheckout method');
      console.log('🔍 [Razorpay Debug] Options received:', options);
      
      if (!window.Razorpay) {
        console.error('❌ [Razorpay Debug] Razorpay SDK not loaded. Please ensure https://checkout.razorpay.com/v1/checkout.js is loaded.');
        reject(new Error('Razorpay SDK not loaded'));
        return;
      }

      console.log('✅ [Razorpay Debug] Razorpay SDK is loaded');
      console.log('🔍 [Razorpay Debug] Available Razorpay methods:', Object.keys(window.Razorpay.prototype || {}));

      const razorpayOptions = {
        ...options,
        key: this.keyId,
        handler: (response: RazorpayResponse) => {
          console.log('🎉 [Razorpay Debug] Payment success handler called:', response);
          resolve(response);
        },
        modal: {
          ondismiss: () => {
            console.warn('⚠️ [Razorpay Debug] Payment modal dismissed by user');
            reject(new Error('Payment cancelled'));
          },
        },
      };

      console.log('🔍 [Razorpay Debug] Final Razorpay options:', razorpayOptions);

      try {
        console.log('🚀 [Razorpay Debug] Creating new Razorpay instance...');
        const razorpay = new window.Razorpay(razorpayOptions);
        console.log('✅ [Razorpay Debug] Razorpay instance created successfully');
        
        console.log('🚀 [Razorpay Debug] Attempting to open Razorpay checkout...');
        razorpay.open();
        console.log('✅ [Razorpay Debug] rzp.open() called successfully - UI should now be visible');
        
      } catch (error: any) {
        console.error('❌ [Razorpay Debug] Error during Razorpay initialization or opening:', error);
        reject(new Error(`Failed to initialize or open Razorpay checkout: ${error.message}`));
      }
    });
  }
}

export const razorpayService = new RazorpayService();
