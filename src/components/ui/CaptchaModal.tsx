import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ArrowPathIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface CaptchaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title: string;
  description: string;
  confirmButtonText: string;
  confirmButtonColor?: string;
  isLoading?: boolean;
}

export default function CaptchaModal({
  isOpen,
  onClose,
  onSuccess,
  title,
  description,
  confirmButtonText,
  confirmButtonColor = 'bg-red-600 hover:bg-red-700',
  isLoading = false
}: CaptchaModalProps) {
  const [captcha, setCaptcha] = useState('');
  const [userInput, setUserInput] = useState('');
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  // Generate random CAPTCHA string
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    const length = 5 + Math.floor(Math.random() * 3); // 5-7 characters
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  };

  // Initialize CAPTCHA when modal opens
  useEffect(() => {
    if (isOpen) {
      setCaptcha(generateCaptcha());
      setUserInput('');
      setError('');
    }
  }, [isOpen]);

  const handleRegenerateCaptcha = () => {
    setCaptcha(generateCaptcha());
    setUserInput('');
    setError('');
  };

  const handleInputChange = (value: string) => {
    setUserInput(value);
    if (error) {
      setError('');
    }
  };

  const validateCaptcha = () => {
    return userInput.toLowerCase() === captcha.toLowerCase();
  };

  const handleConfirm = async () => {
    if (!userInput.trim()) {
      setError('Please enter the CAPTCHA');
      return;
    }

    setIsValidating(true);
    
    // Add a small delay to show validation state
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (validateCaptcha()) {
      setError('');
      onSuccess();
    } else {
      setError('CAPTCHA does not match. Please try again.');
      handleRegenerateCaptcha();
    }
    
    setIsValidating(false);
  };

  const handleClose = () => {
    if (!isLoading && !isValidating) {
      onClose();
    }
  };

  const isConfirmDisabled = !userInput.trim() || isLoading || isValidating;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm"
              onClick={handleClose}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {title}
                </h3>
                <button
                  onClick={handleClose}
                  disabled={isLoading || isValidating}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="text-center mb-6">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                  {description}
                </p>

                {/* CAPTCHA Display */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Security Verification
                  </label>
                  
                  {/* CAPTCHA Box */}
                  <div className="bg-slate-100 dark:bg-slate-700 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-4 mb-4 relative">
                    <div className="flex items-center justify-center space-x-2">
                      <div 
                        className="font-mono text-2xl font-bold text-slate-800 dark:text-slate-200 tracking-widest select-none bg-white dark:bg-slate-800 px-4 py-2 rounded border border-slate-300 dark:border-slate-600 shadow-sm"
                        style={{
                          textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                          letterSpacing: '0.2em'
                        }}
                      >
                        {captcha}
                      </div>
                      <button
                        type="button"
                        onClick={handleRegenerateCaptcha}
                        disabled={isLoading || isValidating}
                        className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors disabled:opacity-50"
                        title="Regenerate CAPTCHA"
                      >
                        <ArrowPathIcon className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      Enter the characters shown above (case insensitive)
                    </p>
                  </div>

                  {/* CAPTCHA Input */}
                  <div className="relative">
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => handleInputChange(e.target.value)}
                      placeholder="Enter CAPTCHA"
                      disabled={isLoading || isValidating}
                      className={clsx(
                        'w-full px-4 py-3 rounded-lg border transition-all duration-200',
                        'bg-white dark:bg-slate-900 text-slate-900 dark:text-white',
                        'placeholder-slate-400 dark:placeholder-slate-500',
                        'font-mono tracking-wider text-center text-lg',
                        error
                          ? 'border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-2 focus:ring-red-500'
                          : userInput && validateCaptcha()
                          ? 'border-green-300 dark:border-green-600 focus:border-green-500 focus:ring-2 focus:ring-green-500'
                          : 'border-slate-300 dark:border-slate-600 focus:border-primary-500 focus:ring-2 focus:ring-primary-500'
                      )}
                    />
                    
                    {/* Validation Icon */}
                    {userInput && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {validateCaptcha() ? (
                          <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        ) : (
                          <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                    >
                      <div className="flex items-center text-red-600 dark:text-red-400">
                        <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">{error}</span>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading || isValidating}
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isConfirmDisabled}
                  className={clsx(
                    'flex-1 px-4 py-2 text-white font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                    confirmButtonColor
                  )}
                >
                  {isValidating ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </div>
                  ) : isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    confirmButtonText
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}