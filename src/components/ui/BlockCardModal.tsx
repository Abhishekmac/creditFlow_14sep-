import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ExclamationTriangleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useCards } from '../../hooks/useCards';
import { useToast } from '../../hooks/useToast';
import CaptchaModal from './CaptchaModal';

interface BlockCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardId: string;
  currentStatus: 'active' | 'blocked' | 'suspended';
  cardType: string;
  cardNumber: string;
  onSuccess: (newStatus: 'active' | 'blocked' | 'suspended') => void;
}

export default function BlockCardModal({ 
  isOpen, 
  onClose, 
  cardId,
  currentStatus,
  cardType,
  cardNumber,
  onSuccess 
}: BlockCardModalProps) {
  const [showCaptcha, setShowCaptcha] = useState(false);
  const { blockCard, isLoading, error, clearError } = useCards();
  const { showToast } = useToast();

  const isBlocked = currentStatus === 'blocked';
  const action = isBlocked ? 'unblock' : 'block';

  useEffect(() => {
    if (isOpen) {
      setShowCaptcha(false);
      clearError();
    }
  }, [isOpen, clearError]);

  const handleCaptchaSuccess = async () => {
    setShowCaptcha(false);
    
    try {
      const success = await blockCard(cardId, action);
      
      if (success) {
        const newStatus = action === 'block' ? 'blocked' : 'active';
        showToast({
          type: 'success',
          title: action === 'block' ? 'Card Blocked' : 'Card Unblocked',
          message: action === 'block' 
            ? 'Your card has been temporarily blocked' 
            : 'Your card is now active and ready to use'
        });
        onSuccess(newStatus);
        onClose();
      }
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Action Failed',
        message: error || `Failed to ${action} card`
      });
    }
  };

  const handleInitialConfirm = () => {
    setShowCaptcha(true);
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const getActionText = () => {
    if (isBlocked) {
      return {
        title: 'Unblock Card',
        description: 'Your card will be reactivated and you can resume using it for transactions and payments.',
        buttonText: 'Unblock Card',
        confirmText: 'Are you sure you want to unblock this card?',
        icon: ShieldCheckIcon,
        iconColor: 'text-green-600 dark:text-green-400',
        iconBg: 'bg-green-100 dark:bg-green-900/50',
        buttonColor: 'bg-green-600 hover:bg-green-700',
        captchaButtonColor: 'bg-green-600 hover:bg-green-700'
      };
    } else {
      return {
        title: 'Block Card',
        description: 'This will temporarily disable your card. You won\'t be able to make payments or transactions until you unblock it.',
        buttonText: 'Block Card',
        confirmText: 'Are you sure you want to block this card?',
        icon: ExclamationTriangleIcon,
        iconColor: 'text-red-600 dark:text-red-400',
        iconBg: 'bg-red-100 dark:bg-red-900/50',
        buttonColor: 'bg-red-600 hover:bg-red-700',
        captchaButtonColor: 'bg-red-600 hover:bg-red-700'
      };
    }
  };

  const actionConfig = getActionText();

  return (
    <>
      <AnimatePresence>
        {isOpen && !showCaptcha && (
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
                    {actionConfig.title}
                  </h3>
                  <button
                    onClick={handleClose}
                    disabled={isLoading}
                    className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                <div className="text-center mb-6">
                  <div className={`w-16 h-16 ${actionConfig.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <actionConfig.icon className={`w-8 h-8 ${actionConfig.iconColor}`} />
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                      {cardType} Card
                    </p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      {cardNumber}
                    </p>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    {actionConfig.description}
                  </p>
                  
                  <p className="text-sm font-medium text-slate-900 dark:text-white mb-4">
                    {actionConfig.confirmText}
                  </p>
                </div>

                {/* General Error */}
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleInitialConfirm}
                    disabled={isLoading}
                    className={`flex-1 px-4 py-2 ${actionConfig.buttonColor} text-white font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {actionConfig.buttonText}
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
      
      {/* CAPTCHA Modal */}
      <CaptchaModal
        isOpen={showCaptcha}
        onClose={() => setShowCaptcha(false)}
        onSuccess={handleCaptchaSuccess}
        title={`Confirm ${actionConfig.title}`}
        description={`Please complete the security verification to ${action} your ${cardType} card (${cardNumber}).`}
        confirmButtonText={`Confirm ${actionConfig.title}`}
        confirmButtonColor={actionConfig.captchaButtonColor}
        isLoading={isLoading}
      />
    </>
  );
}