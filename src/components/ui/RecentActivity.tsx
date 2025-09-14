import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { activitiesAPI } from '../../services/api';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  ClockIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface Activity {
  id: number;
  type: string;
  title: string;
  description: string;
  metadata?: any;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  createdAt: string;
}

interface RecentActivityProps {
  limit?: number;
  className?: string;
}

const getActivityIcon = (type: string, status: string) => {
  const iconClass = "w-4 h-4";
  
  if (status === 'FAILED') {
    return <ExclamationTriangleIcon className={`${iconClass} text-red-500`} />;
  }
  
  switch (type) {
    case 'PAYMENT':
      return <CheckCircleIcon className={`${iconClass} text-green-500`} />;
    case 'CARD_BLOCKED':
    case 'CARD_UNBLOCKED':
      return <CheckCircleIcon className={`${iconClass} text-orange-500`} />;
    case 'LOGIN':
    case 'LOGIN_NEW_DEVICE':
      return <CheckCircleIcon className={`${iconClass} text-blue-500`} />;
    case 'PROFILE_UPDATE':
    case 'PASSWORD_CHANGE':
    case 'CONTACT_UPDATE':
      return <CheckCircleIcon className={`${iconClass} text-purple-500`} />;
    case 'TWO_FA_ENABLED':
    case 'TWO_FA_DISABLED':
      return <CheckCircleIcon className={`${iconClass} text-indigo-500`} />;
    case 'CARD_APPLICATION':
      return <CheckCircleIcon className={`${iconClass} text-cyan-500`} />;
    default:
      return <CheckCircleIcon className={`${iconClass} text-gray-500`} />;
  }
};

const getActivityColor = (type: string, status: string) => {
  if (status === 'FAILED') return 'bg-red-500';
  
  switch (type) {
    case 'PAYMENT':
      return 'bg-green-500';
    case 'CARD_BLOCKED':
    case 'CARD_UNBLOCKED':
      return 'bg-orange-500';
    case 'LOGIN':
    case 'LOGIN_NEW_DEVICE':
      return 'bg-blue-500';
    case 'PROFILE_UPDATE':
    case 'PASSWORD_CHANGE':
    case 'CONTACT_UPDATE':
      return 'bg-purple-500';
    case 'TWO_FA_ENABLED':
    case 'TWO_FA_DISABLED':
      return 'bg-indigo-500';
    case 'CARD_APPLICATION':
      return 'bg-cyan-500';
    default:
      return 'bg-gray-500';
  }
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  return `${Math.floor(diffInSeconds / 2592000)} months ago`;
};

export default function RecentActivity({ 
  limit = 5, 
  className = '' 
}: RecentActivityProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActivities();
  }, [limit]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const params: any = { limit };
      
      const response = await activitiesAPI.getActivities(params);
      if (response.success) {
        setActivities(response.data.activities);
        setError(null);
      } else {
        setError('Failed to fetch activities');
      }
    } catch (err) {
      setError('Failed to fetch activities');
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 animate-pulse">
              <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
        </div>
        <div className="text-center py-8">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {activities.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No recent activities</p>
            </motion.div>
          ) : (
            activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-3 group"
              >
                <div className={`w-3 h-3 rounded-full ${getActivityColor(activity.type, activity.status)} flex-shrink-0 mt-1.5`}>
                  {getActivityIcon(activity.type, activity.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {activity.title}
                    </p>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                      <ClockIcon className="w-3 h-3 mr-1" />
                      {formatTimeAgo(activity.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {activity.description}
                  </p>
                  {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {activity.type === 'PAYMENT' && activity.metadata.amount && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                          ₹{activity.metadata.amount.toLocaleString()}
                        </span>
                      )}
                      {activity.metadata.cardNumber && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 ml-2">
                          ****{activity.metadata.cardNumber}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {activities.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center space-x-1">
            <EyeIcon className="w-4 h-4" />
            <span>View all activities</span>
          </button>
        </div>
      )}
    </div>
  );
}
