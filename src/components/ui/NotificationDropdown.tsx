import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BellIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
  GiftIcon,
  CalendarDaysIcon,
  InformationCircleIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface Notification {
  id: string;
  type: 'payment' | 'alert' | 'reward' | 'reminder' | 'info';
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'payment',
    title: 'Payment Due Soon',
    description: 'Your credit card payment of ₹45,320 is due on Jan 25',
    timestamp: '2 hours ago',
    isRead: false,
  },
  {
    id: '2',
    type: 'reward',
    title: 'Rewards Earned',
    description: 'You earned 250 reward points from your recent purchase',
    timestamp: '5 hours ago',
    isRead: false,
  },
  {
    id: '3',
    type: 'alert',
    title: 'Credit Limit Alert',
    description: 'You have used 85% of your available credit limit',
    timestamp: '1 day ago',
    isRead: false,
  },
  {
    id: '4',
    type: 'info',
    title: 'New Feature Available',
    description: 'Check out our new spending analytics dashboard',
    timestamp: '2 days ago',
    isRead: true,
  },
  {
    id: '5',
    type: 'reminder',
    title: 'Monthly Statement Ready',
    description: 'Your December statement is now available for download',
    timestamp: '3 days ago',
    isRead: true,
  },
];

const notificationIcons = {
  payment: CreditCardIcon,
  alert: ExclamationTriangleIcon,
  reward: GiftIcon,
  reminder: CalendarDaysIcon,
  info: InformationCircleIcon,
};

const notificationColors = {
  payment: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50',
  alert: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50',
  reward: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50',
  reminder: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/50',
  info: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/50',
};

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('creditflow-notifications');
    return saved ? JSON.parse(saved) : mockNotifications;
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    localStorage.setItem('creditflow-notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
      >
        <BellIcon className="h-5 w-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <BellIcon className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {notifications.map((notification, index) => {
                    const Icon = notificationIcons[notification.type];
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={clsx(
                          'p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors relative',
                          !notification.isRead && 'bg-indigo-50/50 dark:bg-indigo-900/20'
                        )}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={clsx(
                            'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                            notificationColors[notification.type]
                          )}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {notification.description}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                  {notification.timestamp}
                                </p>
                              </div>
                              <div className="flex items-center space-x-1 ml-2">
                                {!notification.isRead && (
                                  <button
                                    onClick={() => markAsRead(notification.id)}
                                    className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    title="Mark as read"
                                  >
                                    <CheckIcon className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                                  </button>
                                )}
                                <button
                                  onClick={() => removeNotification(notification.id)}
                                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                  title="Remove notification"
                                >
                                  <XMarkIcon className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        {!notification.isRead && (
                          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-indigo-500 rounded-full" />
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                <button className="w-full text-center text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium py-1">
                  View all notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}