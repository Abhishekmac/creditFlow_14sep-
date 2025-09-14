import { useState, useCallback } from 'react';
import { paymentsAPI } from '../services/api';

interface PaymentData {
  paymentId: string;
  amount: number;
  method: string;
  status: 'pending' | 'success' | 'failed';
  newBalance?: number;
  timestamp: string;
}

interface UsePaymentsReturn {
  isLoading: boolean;
  error: string | null;
  makePayment: (accountId: string | number, amount: number, method: string) => Promise<PaymentData | null>;
  getPaymentHistory: () => Promise<any[]>;
  getReceipt: (paymentId: string) => Promise<any>;
  clearError: () => void;
}

export function usePayments(): UsePaymentsReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const makePayment = useCallback(async (
    accountId: string | number,
    amount: number,
    method: string
  ): Promise<PaymentData | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Additional client-side validation
      if (!accountId || !amount || !method) {
        throw new Error('Missing required payment information');
      }

      if (amount <= 0) {
        throw new Error('Payment amount must be greater than zero');
      }

      if (!['bank', 'card', 'instant'].includes(method)) {
        throw new Error('Invalid payment method selected');
      }

      // Call API (paymentsAPI.createPayment already converts/validates accountId)
      const response = await paymentsAPI.createPayment(accountId, amount, method);

      // Expecting server response shape: { success: true, data: { paymentId, amount, method, status, newBalance, timestamp }, message }
      if (response && (response as any).success) {
        const d = (response as any).data || response;
        // Normalize status to lowercase to match PaymentData type
        const normalized: PaymentData = {
          paymentId: d.paymentId ?? d.id,
          amount: Number(d.amount),
          method: String(d.method),
          status: (String(d.status || 'pending')).toLowerCase() as 'pending' | 'success' | 'failed',
          newBalance: d.newBalance !== undefined ? Number(d.newBalance) : undefined,
          timestamp: d.timestamp ?? d.createdAt ?? new Date().toISOString(),
        };
        return normalized;
      } else {
        // If server returns success:false
        setError((response as any).message || 'Payment failed');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment processing failed';
      setError(errorMessage);
      console.error('Payment error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPaymentHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // IMPORTANT: backend expects authenticated GET /api/payments and uses req.userId.
      // Do NOT call a non-existent /payments/user/:id route.
      const response = await paymentsAPI.getUserPayments();

      if (response && (response as any).success) {
        return (response as any).data;
      } else {
        setError((response as any).message || 'Failed to fetch payment history');
        return [];
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch payment history';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getReceipt = useCallback(async (paymentId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await paymentsAPI.getReceipt(paymentId);

      if (response && (response as any).success) {
        return (response as any).data;
      } else {
        setError((response as any).message || 'Failed to fetch receipt');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch receipt';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    makePayment,
    getPaymentHistory,
    getReceipt,
    clearError,
  };
}
