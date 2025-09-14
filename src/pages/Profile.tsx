import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../hooks/useToast';
import EditContactModal from '../components/ui/EditContactModal';
import BlockCardModal from '../components/ui/BlockCardModal';
import RecentActivity from '../components/ui/RecentActivity';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  BellIcon,
  DocumentTextIcon,
  CogIcon,
  StarIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import clsx from 'clsx';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showEditContactModal, setShowEditContactModal] = useState(false);
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
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSelectedImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePhoto = async () => {
    if (selectedImage) {
      setIsUploading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateUser({ avatar: selectedImage });
      setSelectedImage(null);
      setIsUploading(false);
      showToast({
        type: 'success',
        title: 'Photo Updated',
        message: 'Your profile photo has been updated successfully'
      });
    }
  };

  const handleCancelPhoto = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleContactUpdate = (phone: string, address: string) => {
    setProfileData({ phone, address });
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
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Profile Settings
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Manage your account information and preferences
        </p>
      </motion.div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6">
        
        {/* Profile Card - Spans 2 columns on larger screens */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-1 lg:col-span-2 xl:col-span-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-6 shadow-sm"
        >
          <div className="text-center">
            <div className="relative inline-block mb-4">
              <img
                className="w-20 h-20 rounded-full mx-auto ring-4 ring-slate-200 dark:ring-slate-600"
                src={selectedImage || user?.avatar || "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2"}
                alt="Profile"
              />
              {selectedImage && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">Preview</span>
                </div>
              )}
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
              {user?.name || "John Doe"}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm">Premium Member</p>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            
            {!selectedImage ? (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors text-sm"
              >
                Change Photo
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={handleSavePhoto}
                  disabled={isUploading}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
                >
                  {isUploading ? 'Saving...' : 'Save Photo'}
                </button>
                <button
                  onClick={handleCancelPhoto}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Account Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-1 lg:col-span-1 xl:col-span-1 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <ShieldCheckIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 rounded text-xs font-medium">
              Active
            </span>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Account Status</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Verified & Secure</p>
        </motion.div>

        {/* Credit Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="md:col-span-1 lg:col-span-1 xl:col-span-1 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <ChartBarIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <StarIcon className="w-5 h-5 text-yellow-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Credit Score</h3>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">785</p>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Excellent</p>
        </motion.div>

        {/* Personal Information Form - Spans 2 columns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="md:col-span-2 lg:col-span-4 xl:col-span-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
            Personal Information
          </h3>
          <form className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <UserIcon className="w-4 h-4 inline mr-2" />
                  Full Name
                </label>
                <input
                  type="text"
                  defaultValue={user?.name || "John Doe"}
                  className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <EnvelopeIcon className="w-4 h-4 inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  defaultValue={user?.email}
                  className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <PhoneIcon className="w-4 h-4 inline mr-2" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profileData.phone}
                  readOnly
                  className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  defaultValue="1990-01-15"
                  className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <MapPinIcon className="w-4 h-4 inline mr-2" />
                Address
              </label>
              <textarea
                rows={2}
                value={profileData.address}
                readOnly
                className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white resize-none text-sm"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowEditContactModal(true)}
                type="submit"
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded transition-colors text-sm"
              >
                Edit Contact Info
              </button>
            </div>
          </form>
        </motion.div>

        {/* Member Since Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="md:col-span-1 lg:col-span-1 xl:col-span-1 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <CalendarDaysIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Member Since</h3>
          <p className="text-xl font-bold text-slate-900 dark:text-white">Jan 2020</p>
          <p className="text-slate-600 dark:text-slate-400 text-sm">4+ years</p>
        </motion.div>

        {/* Reward Points Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="md:col-span-1 lg:col-span-1 xl:col-span-1 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <StarIcon className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Reward Points</h3>
          <p className="text-xl font-bold text-slate-900 dark:text-white">12,580</p>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Available</p>
        </motion.div>

        {/* Quick Actions Grid - Spans 4 columns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="md:col-span-2 lg:col-span-4 xl:col-span-4 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
            Quick Actions
          </h3>
          
          {/* Card Status Alert */}
          {cardData.status === 'blocked' && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                <p className="text-sm font-medium text-red-800 dark:text-red-300">
                  Your {cardData.cardType} card ({cardData.cardNumber}) is temporarily blocked
                </p>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <button className="p-4 text-center rounded border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
              <div className="w-10 h-10 bg-primary-600 rounded mx-auto mb-3 flex items-center justify-center group-hover:bg-primary-700 transition-colors">
                <CogIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-900 dark:text-white">Change PIN</span>
            </button>
            
            <button className="p-4 text-center rounded border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
              <div className="w-10 h-10 bg-green-600 rounded mx-auto mb-3 flex items-center justify-center group-hover:bg-green-700 transition-colors">
                <ShieldCheckIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-900 dark:text-white">Verify Identity</span>
            </button>
            
            <button className="p-4 text-center rounded border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
              <div className="w-10 h-10 bg-orange-600 rounded mx-auto mb-3 flex items-center justify-center group-hover:bg-orange-700 transition-colors">
                <DocumentTextIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-900 dark:text-white">View Reports</span>
            </button>
            
            <button 
              onClick={() => setShowBlockCardModal(true)}
              className={clsx(
                'p-4 text-center rounded border transition-colors group',
                cardData.status === 'active'
                  ? 'border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20'
                  : 'border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20'
              )}
            >
              <div className={clsx(
                'w-10 h-10 rounded mx-auto mb-3 flex items-center justify-center transition-colors',
                cardData.status === 'active'
                  ? 'bg-red-600 group-hover:bg-red-700'
                  : 'bg-green-600 group-hover:bg-green-700'
              )}>
                <CreditCardIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {cardData.status === 'active' ? 'Block Card' : 'Unblock Card'}
              </span>
            </button>
          </div>
        </motion.div>

        {/* Notification Preferences - Spans 2 columns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="md:col-span-2 lg:col-span-2 xl:col-span-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-6 shadow-sm"
        >
          <div className="flex items-center mb-6">
            <BellIcon className="w-6 h-6 text-slate-600 dark:text-slate-400 mr-3" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Notification Preferences
            </h3>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Email Notifications', enabled: true },
              { label: 'SMS Alerts', enabled: false },
              { label: 'Push Notifications', enabled: true },
              { label: 'Marketing Communications', enabled: false }
            ].map((pref, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  {pref.label}
                </span>
                <button
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    pref.enabled ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      pref.enabled ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity - Spans 4 columns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="md:col-span-2 lg:col-span-4 xl:col-span-4"
        >
          <RecentActivity limit={5} />
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