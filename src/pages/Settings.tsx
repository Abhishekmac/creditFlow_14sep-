import React, { useState } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../hooks/useToast';
import EditContactModal from '../components/ui/EditContactModal';
import ChangePasswordModal from '../components/ui/ChangePasswordModal';
import BlockCardModal from '../components/ui/BlockCardModal';
import {
  UserIcon,
  LockClosedIcon,
  BellIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  
  // Modal states
  const [showEditContactModal, setShowEditContactModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showBlockCardModal, setShowBlockCardModal] = useState(false);
  
  // Profile data state
  const [profileData, setProfileData] = useState({
    phone: '+91 98765 43210',
    address: '123 Main Street, City, State 12345'
  });
  
  // Card data state
  const [cardData, setCardData] = useState({
    id: '660e8400-e29b-41d4-a716-446655440000',
    status: 'active' as 'active' | 'blocked' | 'suspended',
    cardType: 'Platinum',
    cardNumber: '****-****-****-9012'
  });
  
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    marketing: false,
  });

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleContactUpdate = (phone: string, address: string) => {
    setProfileData({ phone, address });
  };

  const handlePasswordChange = () => {
    // Password changed successfully - could trigger additional actions if needed
  };

  const handleCardStatusChange = (newStatus: 'active' | 'blocked' | 'suspended') => {
    setCardData(prev => ({ ...prev, status: newStatus }));
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center sm:text-left"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account preferences and security settings
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Profile Management Section */}
          <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-4 sm:p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center">
              <UserIcon className="w-5 h-5 mr-2" />
              Profile Management
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <button 
                onClick={() => setShowChangePasswordModal(true)}
                className="p-4 text-left rounded border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center mb-2">
                  <LockClosedIcon className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2" />
                  <span className="font-medium text-slate-900 dark:text-white">Change Password</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Update your account password</p>
              </button>
              
              <button 
                onClick={() => setShowEditContactModal(true)}
                className="p-4 text-left rounded border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center mb-2">
                  <UserIcon className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2" />
                  <span className="font-medium text-slate-900 dark:text-white">Edit Contact Info</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Update phone and address</p>
              </button>
              
              <button className="p-4 text-left rounded border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <div className="flex items-center mb-2">
                  <CreditCardIcon className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2" />
                  <span className="font-medium text-slate-900 dark:text-white">Linked Accounts</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Manage connected accounts</p>
              </button>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-4 sm:p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
              <UserIcon className="w-5 h-5 mr-2" />
              Account Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  defaultValue="John Doe"
                  className="w-full px-4 py-3 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  defaultValue="john.doe@example.com"
                  className="w-full px-4 py-3 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profileData.phone}
                  readOnly
                  className="w-full px-4 py-3 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  defaultValue="1990-01-15"
                  className="w-full px-4 py-3 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Address
                </label>
                <textarea
                  rows={2}
                  value={profileData.address}
                  readOnly
                  className="w-full px-4 py-3 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white resize-none"
                />
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-4 sm:p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
              <LockClosedIcon className="w-5 h-5 mr-2" />
              Security Settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded">
                <div className="flex items-center">
                  <LockClosedIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      Password
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Change your account password
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowChangePasswordModal(true)}
                  className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors text-sm"
                >
                  Change
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded">
                <div className="flex items-center">
                  <ShieldCheckIcon className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      Two-Factor Authentication
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Add an extra layer of security
                    </p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors text-sm">
                  Enable
                </button>
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-4 sm:p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
              <BellIcon className="w-5 h-5 mr-2" />
              Notification Preferences
            </h3>
            <div className="space-y-4">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white capitalize">
                      {key === 'sms' ? 'SMS' : key} Notifications
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {key === 'email' && 'Receive notifications via email'}
                      {key === 'sms' && 'Receive notifications via SMS'}
                      {key === 'push' && 'Receive push notifications'}
                      {key === 'marketing' && 'Receive marketing communications'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange(key as keyof typeof notifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      value ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Quick Settings Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Theme Settings */}
          <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-4 sm:p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
              <GlobeAltIcon className="w-5 h-5 mr-2" />
              Appearance
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    Dark Mode
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Switch between light and dark themes
                  </p>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    theme === 'dark' ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Card Management */}
          <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-4 sm:p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
              <CreditCardIcon className="w-5 h-5 mr-2" />
              Card Management
            </h3>
            
            {/* Card Status Display */}
            <div className="mb-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {cardData.cardType} Card
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {cardData.cardNumber}
                  </p>
                </div>
                <span className={clsx(
                  'px-2 py-1 rounded text-xs font-medium',
                  cardData.status === 'active' 
                    ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300'
                    : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'
                )}>
                  {cardData.status === 'active' ? 'Active' : 'Blocked'}
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <button 
                onClick={() => setShowBlockCardModal(true)}
                className={clsx(
                  'w-full text-left p-3 rounded transition-colors',
                  cardData.status === 'active'
                    ? 'hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800'
                    : 'hover:bg-green-50 dark:hover:bg-green-900/20 border border-green-200 dark:border-green-800'
                )}
              >
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {cardData.status === 'active' ? 'Block Card' : 'Unblock Card'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {cardData.status === 'active' 
                    ? 'Temporarily disable your card (requires security verification)'
                    : 'Reactivate your card for transactions (requires security verification)'
                  }
                </p>
              </button>
              
              <button className="w-full text-left p-3 rounded hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  Change PIN
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Update your card PIN
                </p>
              </button>
              <button className="w-full text-left p-3 rounded hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  Set Limits
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Manage spending limits
                </p>
              </button>
            </div>
          </div>

          {/* Save Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded shadow-sm hover:shadow transition-all duration-200"
          >
            Save Changes
          </motion.button>
        </motion.div>
      </div>
      
      {/* Modals */}
      <EditContactModal
        isOpen={showEditContactModal}
        onClose={() => setShowEditContactModal(false)}
        currentPhone={profileData.phone}
        currentAddress={profileData.address}
        onSuccess={handleContactUpdate}
      />
      
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        onSuccess={handlePasswordChange}
      />
      
      <BlockCardModal
        isOpen={showBlockCardModal}
        onClose={() => setShowBlockCardModal(false)}
        cardId={cardData.id}
        currentStatus={cardData.status}
        cardType={cardData.cardType}
        cardNumber={cardData.cardNumber}
        onSuccess={handleCardStatusChange}
      />
    </div>
  );
}