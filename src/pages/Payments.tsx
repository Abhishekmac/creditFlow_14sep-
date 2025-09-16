// src/pages/Payments.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCardIcon,
  BoltIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { usePayments } from '../hooks/usePayments';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import { useCards } from '../hooks/useCards';
import { accountsAPI, getUserOutstandingBalance, setUserOutstandingBalance } from '../services/api';
import { razorpayService } from '../services/razorpay';
import clsx from 'clsx';

export default function Payments() {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [errors, setErrors] = useState<{ amount?: string; method?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmissionTime, setLastSubmissionTime] = useState(0);
  const [cardStatus, setCardStatus] = useState<'active' | 'blocked' | 'suspended'>('active');
  const { makePayment, isLoading, error, clearError } = usePayments();
  const { getCardStatus } = useCards();
  const { showToast } = useToast();
  const { user } = useAuth();

  // Account data (load from API)
  const [outstandingBalance, setOutstandingBalance] = useState<number>(() => {
    // Load from user-specific localStorage or use default
    return getUserOutstandingBalance();
  });
  const minimumDue = 2266; // keep default; you can compute this after fetching statements if backend returns it
  const [accountId, setAccountId] = useState<number | null>(null);
  const [accountsLoading, setAccountsLoading] = useState<boolean>(true);

  // Helper that returns true only when accountId is a positive finite number
  const hasValidAccountId = (() => {
    if (typeof accountId === 'number' && Number.isFinite(accountId) && accountId > 0) return true;
    if (typeof accountId === 'string') {
      const n = Number(accountId);
      return Number.isFinite(n) && n > 0;
    }
    return false;
  })();

  // Load user cards / choose first card as default (defensive parsing)
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setAccountsLoading(true);
        const resp: any = await accountsAPI.getAccounts(user?.id);
        console.debug('[Payments] accountsAPI.getAccounts response:', resp);

        // accountsAPI may return { success: true, data: [...] } or just the array; handle both
        const cards = resp?.data ?? resp;

        if (!mounted) return;

        if (!Array.isArray(cards) || cards.length === 0) {
          console.warn('[Payments] No cards returned from accounts API');
          setAccountId(null);
          return;
        }

        const first = cards[0];
        console.debug('[Payments] first card object:', first);

        // Try common field names, then fallback to scanning properties for a numeric value
        const possibleIdFields = [
          'id',
          'cardId',
          'accountId',
          'card_id',
          'account_id',
          'userId',
          'user_id',
        ];

        let parsedId: number | null = null;

        for (const key of possibleIdFields) {
          const val = (first as any)[key];
          if (val !== undefined && val !== null) {
            const n = Number(val);
            if (Number.isFinite(n) && n > 0) {
              parsedId = n;
              break;
            }
          }
        }

        // Fallback: attempt to find any numeric property in object
        if (parsedId === null) {
          for (const k of Object.keys(first)) {
            const v = (first as any)[k];
            if (typeof v === 'number' && Number.isFinite(v) && v > 0) {
              parsedId = v;
              break;
            }
            if (typeof v === 'string' && /^\d+$/.test(v)) {
              const n = Number(v);
              if (Number.isFinite(n) && n > 0) {
                parsedId = n;
                break;
              }
            }
          }
        }

        if (parsedId === null) {
          console.warn('[Payments] Could not determine numeric account id from first card item:', first);
          setAccountId(null);
        } else {
          setAccountId(parsedId);
        }

        // Don't override user-specific balance with API data
        // The balance should come from user-specific localStorage, not from accounts API
      } catch (err) {
        console.error('Failed to load accounts:', err);
        setAccountId(null);
      } finally {
        if (mounted) setAccountsLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [user?.id]);

  // Check card status whenever accountId changes
  useEffect(() => {
    if (!hasValidAccountId) return;
    const checkCardStatus = async () => {
      try {
        // use string because hook expects string param
        const status = await getCardStatus(String(accountId));
        if (status) {
          // normalize to lower-case mapping used in UI state
          const st = status.status?.toLowerCase();
          if (st === 'active' || st === 'blocked' || st === 'suspended') {
            setCardStatus(st);
          } else {
            // fallback
            setCardStatus('active');
          }
        }
      } catch (err) {
        console.error('Failed to fetch card status:', err);
      }
    };
    checkCardStatus();
  }, [getCardStatus, accountId, hasValidAccountId]);

  // Update balance when user loads
  useEffect(() => {
    if (user?.id) {
      const userBalance = getUserOutstandingBalance(user.id);
      setOutstandingBalance(userBalance);
    }
  }, [user?.id]);

  // debug — put inside Payments() component
  useEffect(() => {
    const dbg = {
      isSubmitting,
      isLoading,
      cardStatus,
      accountsLoading,
      accountId,
      hasValidAccountId,
    };
    console.debug('[Payments debug]', dbg);
    // expose values for manual checks in console
    (window as any).__PAYMENTS_DEBUG__ = dbg;
  }, [isSubmitting, isLoading, cardStatus, accountsLoading, accountId, hasValidAccountId]);

  const paymentMethods = [
    {
      id: 'instant',
      name: 'Instant Payment',
      description: 'UPI/Net Banking instant transfer',
      icon: BoltIcon,
      processingTime: 'Instant'
    },
    {
      id: 'razorpay',
      name: 'Razorpay',
      description: 'Pay with cards, UPI, wallets and more',
      icon: CreditCardIcon,
      processingTime: 'Instant',
      badge: 'Popular'
    }
  ];

  const validateAmount = (value: string) => {
    const numValue = parseFloat(value);
    if (!value || value.trim() === '') {
      return 'Please enter an amount';
    }
    if (isNaN(numValue) || numValue <= 0) {
      return 'Please enter a valid amount greater than 0';
    }
    if (numValue > outstandingBalance) {
      return `Amount cannot exceed outstanding balance of ₹${outstandingBalance.toLocaleString()}`;
    }
    return '';
  };

  const validateMethod = () => {
    if (!paymentMethod) {
      return 'Please select a payment method';
    }
    return '';
  };

  const handleAmountChange = (value: string) => {
    // Allow only numbers and decimal point
    let sanitizedValue = value.replace(/[^0-9.]/g, '');

    // Prevent multiple decimal points
    const parts = sanitizedValue.split('.');
    if (parts.length > 2) {
      sanitizedValue = parts[0] + '.' + parts.slice(1).join('.');
    }

    if (!/^\d*\.?\d*$/.test(sanitizedValue)) {
      return;
    }

    if (sanitizedValue.length > 1 && sanitizedValue[0] === '0' && sanitizedValue[1] !== '.') {
      sanitizedValue = sanitizedValue.substring(1);
    }

    setAmount(sanitizedValue);

    if (errors.amount) {
      setErrors(prev => ({ ...prev, amount: '' }));
    }
    if (error) {
      clearError();
    }
  };

  const handleMethodChange = (method: string) => {
    setPaymentMethod(method);

    if (errors.method) {
      setErrors(prev => ({ ...prev, method: '' }));
    }
    if (error) {
      clearError();
    }
  };

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
    if (errors.amount) {
      setErrors(prev => ({ ...prev, amount: '' }));
    }
    if (error) {
      clearError();
    }
  };

  const validateForm = () => {
    const amountError = validateAmount(amount);
    const methodError = validateMethod();

    setErrors({
      amount: amountError,
      method: methodError
    });

    return !amountError && !methodError;
  };

  const isFormValid = () => {
    const amountError = validateAmount(amount);
    const methodError = validateMethod();
    return !amountError && !methodError;
  };

  const getMethodDisplayName = (method: string) => {
    const methodObj = paymentMethods.find(m => m.id === method);
    return methodObj ? methodObj.name : method;
  };

  const handleRazorpayPayment = async (amount: number) => {
    try {
      console.log('Starting Razorpay payment for amount:', amount);
      
      // Create Razorpay order
      const orderData = await razorpayService.createOrder(amount);
      console.log('Order data received:', orderData);
      
      // Check if we're using a mock order (for testing when auth fails)
      const isMockOrder = orderData.order.id.includes('_mock');
      console.log('Is mock order?', isMockOrder);
      
      if (isMockOrder) {
        console.log('Entering mock payment flow');
        // For mock orders, simulate payment success directly
        console.log('Showing demo payment toast');
        showToast({
          type: 'info',
          title: 'Demo Payment',
          message: 'This is a demo payment. In production, Razorpay checkout would open here.',
          duration: 4000
        });
        console.log('Demo payment toast shown');
        
        // Simulate successful payment after a delay
        console.log('Setting up 2-second delay for demo payment completion');
        setTimeout(() => {
          console.log('Demo payment timeout triggered - updating balance');
          const newBalance = Math.max(0, outstandingBalance - amount);
          console.log('New balance calculated:', newBalance);
          setOutstandingBalance(newBalance);
          if (user?.id) {
            setUserOutstandingBalance(user.id, newBalance);
          }

          console.log('Showing success toast');
          showToast({
            type: 'success',
            title: 'Demo Payment Successful',
            message: `₹${amount.toLocaleString()} demo payment completed. New balance: ₹${newBalance.toLocaleString()}`,
            duration: 6000
          });
          console.log('Success toast shown');

          // Reset form
          console.log('Resetting form');
          setAmount('');
          setPaymentMethod('');
          setErrors({});
          console.log('Form reset complete');
        }, 2000);
        
        return;
      }
      
      // Open Razorpay checkout for real orders
      console.log('🚀 [Payments Debug] About to call razorpayService.openCheckout');
      const response = await razorpayService.openCheckout({
        amount: amount * 100, // Convert to paise
        currency: 'INR',
        name: 'CreditFlow',
        description: `Payment for credit card bill - ₹${amount.toLocaleString()}`,
        order_id: orderData.order.id,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#3B82F6',
        },
      });
      
      console.log('🎉 [Payments Debug] Razorpay payment completed successfully:', response);
      
      try {
        // Verify payment
        console.log('🔍 [Payments Debug] Starting payment verification...');
        const verificationResult = await razorpayService.verifyPayment(response as any);
        console.log('✅ [Payments Debug] Payment verification result:', verificationResult);
        
        if (verificationResult.success) {
          // Update outstanding balance
          const newBalance = Math.max(0, outstandingBalance - amount);
          setOutstandingBalance(newBalance);
          if (user?.id) {
            setUserOutstandingBalance(user.id, newBalance);
          }

          showToast({
            type: 'success',
            title: 'Payment Successful',
            message: `₹${amount.toLocaleString()} paid successfully via Razorpay. New balance: ₹${newBalance.toLocaleString()}`,
            duration: 6000
          });

          // Reset form
          setAmount('');
          setPaymentMethod('');
          setErrors({});
        } else {
          showToast({
            type: 'error',
            title: 'Payment Failed',
            message: 'Payment verification failed. Please try again.',
            duration: 6000
          });
        }
      } catch (verifyError) {
        console.error('❌ [Payments Debug] Payment verification error:', verifyError);
        showToast({
          type: 'error',
          title: 'Payment Verification Failed',
          message: 'Payment was made but verification failed. Please contact support.',
          duration: 8000
        });
      } finally {
        // Always clear the processing state
        setIsSubmitting(false);
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'Payment cancelled') {
        showToast({
          type: 'info',
          title: 'Payment Cancelled',
          message: 'Payment was cancelled by user',
          duration: 4000
        });
      } else {
        throw error;
      }
    }
  };

  // Prevent duplicate submissions
  const canSubmit = () => {
    const now = Date.now();
    return !isSubmitting && !isLoading && (now - lastSubmissionTime > 2000) && cardStatus === 'active';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if card is blocked
    if (cardStatus === 'blocked') {
      showToast({
        type: 'error',
        title: 'Card Blocked',
        message: 'Your card is temporarily blocked. Please unblock it to make payments.'
      });
      return;
    }

    // Prevent duplicate submissions
    if (!canSubmit()) {
      return;
    }

    if (!validateForm()) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fix the errors and try again'
      });
      return;
    }

    if (!user) {
      showToast({
        type: 'error',
        title: 'Authentication Required',
        message: 'Please log in to make a payment'
      });
      return;
    }

    if (!hasValidAccountId) {
      showToast({
        type: 'error',
        title: 'No Card Found',
        message: 'No active card found. Please add a card first.'
      });
      return;
    }

    setIsSubmitting(true);
    setLastSubmissionTime(Date.now());
    clearError();

    try {
      const paymentAmount = parseFloat(amount);

      // Validate amount one more time before submission
      if (paymentAmount > outstandingBalance) {
        throw new Error(`Amount ₹${paymentAmount.toLocaleString()} exceeds outstanding balance of ₹${outstandingBalance.toLocaleString()}`);
      }

      if (paymentMethod === 'razorpay') {
        // Handle Razorpay payment
        await handleRazorpayPayment(paymentAmount);
      } else {
        // Handle other payment methods (instant payment)
        const accountIdStr = typeof accountId === 'number' ? String(accountId) : (accountId ?? '');
        const result = await makePayment(accountIdStr, paymentAmount, paymentMethod);

        if (result) {
          // Update outstanding balance locally
          const newBalance = Math.max(0, outstandingBalance - paymentAmount);
          setOutstandingBalance(newBalance);
          if (user?.id) {
            setUserOutstandingBalance(user.id, newBalance);
          }

          showToast({
            type: 'success',
            title: 'Payment Successful',
            message: `₹${result.amount.toLocaleString()} paid successfully via ${getMethodDisplayName(paymentMethod)}. New balance: ₹${newBalance.toLocaleString()}`,
            duration: 6000
          });

          // Reset form only after success
          setAmount('');
          setPaymentMethod('');
          setErrors({});
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : (error || 'Payment processing failed. Please try again.');
      showToast({
        type: 'error',
        title: 'Payment Failed',
        message: errorMessage,
        duration: 8000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Real-time validation feedback
  const getAmountInputClass = () => {
    const baseClass = 'w-full pl-10 pr-4 py-4 rounded border transition-all duration-200 bg-white dark:bg-slate-900 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white text-lg';

    if (errors.amount) {
      return `${baseClass} border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-2 focus:ring-red-500`;
    }

    if (amount && !validateAmount(amount)) {
      return `${baseClass} border-green-300 dark:border-green-600 focus:border-green-500 focus:ring-2 focus:ring-green-500`;
    }

    return `${baseClass} border-slate-300 dark:border-slate-600 focus:border-primary-500 focus:ring-2 focus:ring-primary-500`;
  };

  // Get button state and styling
  const getButtonState = () => {
    const isValid = isFormValid();
    const canSubmitNow = canSubmit();
    const isProcessing = isSubmitting || isLoading;
    const isCardBlocked = cardStatus === 'blocked';

    return {
      disabled: !isValid || !canSubmitNow || isProcessing || isCardBlocked || !hasValidAccountId || accountsLoading,
      className: clsx(
        'w-full px-6 py-4 sm:py-5 font-semibold rounded shadow-sm transition-all duration-200 text-lg',
        isValid && canSubmitNow && !isProcessing && !isCardBlocked && hasValidAccountId && !accountsLoading
          ? 'bg-primary-600 hover:bg-primary-700 text-white hover:shadow-lg cursor-pointer'
          : 'bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed'
      ),
      text: isCardBlocked
        ? 'Card Blocked - Cannot Process Payment'
        : isProcessing
        ? 'Processing Payment...'
        : amount
          ? `Pay ₹${parseFloat(amount || '0').toLocaleString()}`
          : 'Enter Amount to Pay'
    };
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Make a Payment
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg">
          Pay your credit card bill quickly and securely
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded p-6 sm:p-8 lg:p-10 shadow-sm border border-slate-200 dark:border-slate-700 max-w-2xl mx-auto"
      >
        {/* Account loading notice */}
        {accountsLoading && (
          <div className="mb-4 text-sm text-slate-500">Loading your card information…</div>
        )}

        {/* Card Status Alert */}
        {cardStatus === 'blocked' && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-300">
                  Your card is temporarily blocked
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  Please unblock your card in Settings to make payments
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Outstanding Balance */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-3">
            Outstanding Balance
          </h2>
          <p className="text-3xl sm:text-4xl font-bold text-red-600 dark:text-red-400">
            ₹{outstandingBalance.toLocaleString()}
          </p>
          <p className="text-base text-slate-500 dark:text-slate-400 mt-2">
            Due on January 25, 2024
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Payment Amount */}
          <div>
            <label className="block text-base font-medium text-slate-700 dark:text-slate-300 mb-3">
              Payment Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 text-lg">
                ₹
              </span>
              <input
                type="text"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0.00"
                className={getAmountInputClass()}
                // allow typing & preparing payment even while accounts load — submission remains guarded
                disabled={isSubmitting || isLoading || cardStatus === 'blocked'}
              />
              {amount && !errors.amount && validateAmount(amount) === '' && (
                <CheckCircleIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
              )}
            </div>

            {/* Amount Error */}
            {errors.amount && (
              <div className="mt-2 flex items-center text-red-600 dark:text-red-400">
                <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                <span className="text-sm">{errors.amount}</span>
              </div>
            )}

            {/* Quick Amount Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-3">
              <button
                type="button"
                onClick={() => handleQuickAmount(outstandingBalance)}
                disabled={isSubmitting || isLoading || cardStatus === 'blocked'}
                className="px-4 py-2 text-sm bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors"
              >
                Full Amount (₹{outstandingBalance.toLocaleString()})
              </button>
              <button
                type="button"
                onClick={() => handleQuickAmount(minimumDue)}
                disabled={isSubmitting || isLoading || cardStatus === 'blocked'}
                className="px-4 py-2 text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Minimum Due (₹{minimumDue.toLocaleString()})
              </button>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-base font-medium text-slate-700 dark:text-slate-300 mb-4">
              Payment Method
            </label>

            <div className="space-y-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                const isSelected = paymentMethod === method.id;
                const isDisabled = isSubmitting || isLoading || cardStatus === 'blocked';

                return (
                  <motion.label
                    key={method.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={clsx(
                      'flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200',
                      isDisabled && 'opacity-50 cursor-not-allowed',
                      isSelected
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/50'
                        : 'border-slate-300 dark:border-slate-600 hover:border-primary-300 dark:hover:border-primary-700'
                    )}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={isSelected}
                      onChange={(e) => handleMethodChange(e.target.value)}
                      disabled={isDisabled}
                      className="sr-only"
                    />

                    <div className="flex items-center flex-1">
                      <div className={clsx(
                        'w-12 h-12 rounded-lg flex items-center justify-center mr-4',
                        isSelected
                          ? 'bg-primary-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                      )}>
                        <Icon className="w-6 h-6" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {method.name}
                          </p>
                          {method.badge && (
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full">
                              {method.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {method.description}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                          Processing: {method.processingTime}
                        </p>
                      </div>

                      <div className={clsx(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                        isSelected
                          ? 'border-primary-500 bg-primary-500'
                          : 'border-slate-300 dark:border-slate-600'
                      )}>
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                  </motion.label>
                );
              })}
            </div>

            {/* Method Error */}
            {errors.method && (
              <div className="mt-2 flex items-center text-red-600 dark:text-red-400">
                <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                <span className="text-sm">{errors.method}</span>
              </div>
            )}
          </div>

          {/* General Error Display */}
          {error && !errors.amount && !errors.method && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center text-red-600 dark:text-red-400">
                <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          )}
          {/* Submit Button */}
          {(() => {
            const buttonState = getButtonState();
            return (
              <motion.button
                whileHover={!buttonState.disabled ? { scale: 1.02 } : {}}
                whileTap={!buttonState.disabled ? { scale: 0.98 } : {}}
                type="submit"
                disabled={buttonState.disabled}
                className={buttonState.className}
              >
                {(isSubmitting || isLoading) ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {buttonState.text}
                  </div>
                ) : (
                  buttonState.text
                )}
              </motion.button>
            );
          })()}
        </form>
      </motion.div>
    </div>
  );
}
