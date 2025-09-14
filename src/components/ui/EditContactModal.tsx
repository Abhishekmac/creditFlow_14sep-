import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { useProfile } from '../../hooks/useProfile';
import { useToast } from '../../hooks/useToast';
import clsx from 'clsx';

interface EditContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPhone: string;
  currentAddress: string;
  onSuccess: (phone: string, address: string) => void;
}

export default function EditContactModal({ 
  isOpen, 
  onClose, 
  currentPhone, 
  currentAddress, 
  onSuccess 
}: EditContactModalProps) {
  const [phone, setPhone] = useState(currentPhone);
  const [address, setAddress] = useState(currentAddress);
  const [errors, setErrors] = useState<{ phone?: string; address?: string }>({});
  const { updateContact, isLoading, error, clearError } = useProfile();
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setPhone(currentPhone);
      setAddress(currentAddress);
      setErrors({});
      clearError();
    }
  }, [isOpen, currentPhone, currentAddress, clearError]);

  const validatePhone = (phoneValue: string) => {
    const phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/;
    const cleanPhone = phoneValue.replace(/[\s\-]/g, '');
    
    if (!phoneValue.trim()) {
      return 'Phone number is required';
    }
    
    if (!phoneRegex.test(cleanPhone)) {
      return 'Please enter a valid Indian phone number';
    }
    
    return '';
  };

  const validateAddress = (addressValue: string) => {
    if (!addressValue.trim()) {
      return 'Address is required';
    }
    
    if (addressValue.trim().length < 10) {
      return 'Address must be at least 10 characters long';
    }
    
    return '';
  };

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: '' }));
    }
    if (error) {
      clearError();
    }
  };

  const handleAddressChange = (value: string) => {
    setAddress(value);
    if (errors.address) {
      setErrors(prev => ({ ...prev, address: '' }));
    }
    if (error) {
      clearError();
    }
  };

  const validateForm = () => {
    const phoneError = validatePhone(phone);
    const addressError = validateAddress(address);
    
    setErrors({
      phone: phoneError,
      address: addressError
    });
    
    return !phoneError && !addressError;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const success = await updateContact(phone.trim(), address.trim());
      
      if (success) {
        showToast({
          type: 'success',
          title: 'Contact Updated',
          message: 'Your contact information has been updated successfully'
        });
        onSuccess(phone.trim(), address.trim());
        onClose();
      }
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: error || 'Failed to update contact information'
      });
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

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
                  Edit Contact Information
                </h3>
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <PhoneIcon className="w-4 h-4 inline mr-2" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="+91 98765 43210"
                    disabled={isLoading}
                    className={clsx(
                      'w-full px-3 py-2 rounded border transition-colors',
                      'bg-white dark:bg-slate-900 text-slate-900 dark:text-white',
                      'placeholder-slate-400 dark:placeholder-slate-500',
                      errors.phone
                        ? 'border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-2 focus:ring-red-500'
                        : 'border-slate-300 dark:border-slate-600 focus:border-primary-500 focus:ring-2 focus:ring-primary-500'
                    )}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <MapPinIcon className="w-4 h-4 inline mr-2" />
                    Address
                  </label>
                  <textarea
                    rows={3}
                    value={address}
                    onChange={(e) => handleAddressChange(e.target.value)}
                    placeholder="Enter your complete address"
                    disabled={isLoading}
                    className={clsx(
                      'w-full px-3 py-2 rounded border transition-colors resize-none',
                      'bg-white dark:bg-slate-900 text-slate-900 dark:text-white',
                      'placeholder-slate-400 dark:placeholder-slate-500',
                      errors.address
                        ? 'border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-2 focus:ring-red-500'
                        : 'border-slate-300 dark:border-slate-600 focus:border-primary-500 focus:ring-2 focus:ring-primary-500'
                    )}
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.address}
                    </p>
                  )}
                </div>

                {/* General Error */}
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </div>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}