import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ApplyCardForm from '../components/forms/ApplyCardForm';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { cardsAPI } from '../services/api';

const ctaMessages = {
  "primary_cta": "Submit Application",
  "secondary_cta": "Save & Continue Later",
  "success_title": "Application Submitted Successfully!",
  "success_description": "Your application is being processed. We'll notify you within 24 hours with the decision.",
  "error_title": "Submission Failed",
  "error_description": "Please check your details and try again."
};

export default function ApplyCard() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { markUserAsExisting } = useAuth();

  const handleSubmit = async (data: any) => {
  setIsSubmitting(true);
  setSubmitStatus('idle');

  try {
    // Build FormData (handles optional file)
    const fd = new FormData();
    fd.append('fullName', data.fullName);
    fd.append('email', data.email);
    fd.append('pan', data.pan);
    fd.append('income', String(data.income || 0));
    fd.append('product', String(data.product || ''));

    if (data.document && (data.document as any).length > 0) {
      fd.append('document', (data.document as any)[0]);
    }

    console.log('[ApplyCardPage] calling cardsAPI.submitApplication -> POST');
    const resp = await cardsAPI.submitApplication(fd);
    console.log('[ApplyCardPage] submit response:', resp);

    // Optional: if backend returns success flag, use it
    if ((resp as any)?.success === false) {
      throw new Error((resp as any)?.message || 'Submission rejected');
    }

    // Indicate verification phase (optional UX)
    setIsVerifying(true);

    // If you want to keep the small simulated verification delay for UX:
    await new Promise((r) => setTimeout(r, 2000 + Math.random() * 2000));

    setSubmitStatus('success');
    showToast({
      type: 'success',
      title: ctaMessages.success_title,
      message: ctaMessages.success_description,
    });
  } catch (error) {
    console.error('[ApplyCardPage] submit error:', error);
    setSubmitStatus('error');
    showToast({
      type: 'error',
      title: ctaMessages.error_title,
      message: (error as any)?.message || ctaMessages.error_description,
    });
  } finally {
    setIsSubmitting(false);
    setIsVerifying(false);
  }
};


  const handleGoToDashboard = async () => {
    setIsRedirecting(true);
    
    // Mark user as existing to prevent redirect loop
    markUserAsExisting();
    
    showToast({
      type: 'info',
      title: 'Redirecting to Dashboard',
      message: 'Taking you to your dashboard...'
    });
    
    // Brief delay for smooth transition
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    navigate('/dashboard', { 
      replace: true,
      state: { 
        fromApplication: true,
        applicationSuccess: true 
      }
    });
  };

  const handleSubmitAnother = () => {
    setSubmitStatus('idle');
    setIsSubmitting(false);
    setIsVerifying(false);
    setIsRedirecting(false);
  };
  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Apply for Your Credit Card
        </h1>
        <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Join thousands of satisfied customers and get instant approval for your new credit card
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {(submitStatus === 'idle' || isVerifying) && (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {isVerifying ? (
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-12 shadow-lg border border-gray-200/50 dark:border-gray-700/50 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="w-20 h-20 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Verifying Your Application
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Please wait while we verify your information and process your application...
                </p>
                <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    ✓ Application received<br/>
                    ✓ Documents validated<br/>
                    🔄 Credit assessment in progress...
                  </p>
                </div>
              </div>
            ) : (
              <ApplyCardForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
            )}
          </motion.div>
        )}

        {submitStatus === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-12 shadow-lg border border-gray-200/50 dark:border-gray-700/50 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircleIcon className="w-10 h-10 text-green-600 dark:text-green-400" />
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Application Approved!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
              Your application has been submitted successfully and verified. Your new credit card will be activated shortly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleSubmitAnother}
                disabled={isRedirecting}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded hover:shadow transition-all duration-200"
              >
                Submit Another Application
              </button>
              <button 
                onClick={handleGoToDashboard}
                disabled={isRedirecting}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRedirecting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                    Redirecting...
                  </div>
                ) : (
                  'Go to Dashboard'
                )}
              </button>
            </div>
          </motion.div>
        )}

        {submitStatus === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-12 shadow-lg border border-gray-200/50 dark:border-gray-700/50 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <XCircleIcon className="w-10 h-10 text-red-600 dark:text-red-400" />
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {ctaMessages.error_title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
              We encountered an issue processing your application. Please check your details and try again.
            </p>
            <button
              onClick={handleSubmitAnother}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded hover:shadow transition-all duration-200"
            >
              Try Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}