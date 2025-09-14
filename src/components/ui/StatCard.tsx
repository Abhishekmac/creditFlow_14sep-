import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { useAnimatedCounter } from '../../hooks/useAnimatedCounter';

interface StatCardProps {
  title: string;
  value: number;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  format?: 'currency' | 'number' | 'percentage';
}

const colorVariants = {
  blue: 'bg-blue-600',
  green: 'bg-green-600',
  purple: 'bg-purple-600',
  orange: 'bg-orange-600',
  red: 'bg-red-600',
};

export default function StatCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color = 'blue',
  format = 'currency'
}: StatCardProps) {
  const animatedValue = useAnimatedCounter(value);

  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return `₹${val.toLocaleString()}`;
      case 'percentage':
        return `${val}%`;
      default:
        return val.toLocaleString();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="bg-white dark:bg-slate-800 rounded p-6 sm:p-8 shadow-sm hover:shadow border border-slate-200 dark:border-slate-700 transition-all duration-150"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-base font-medium text-slate-600 dark:text-slate-400 mb-2">
            {title}
          </p>
          <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">
            {formatValue(animatedValue)}
          </p>
          {change !== undefined && (
            <div className="flex items-center mt-3">
              <span className={clsx(
                'text-base font-medium',
                change >= 0 
                  ? 'text-success-600 dark:text-success-400' 
                  : 'text-error-600 dark:text-error-400'
              )}>
                {change >= 0 ? '+' : ''}{change}%
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">
                from last month
              </span>
            </div>
          )}
        </div>
        <div className={clsx(
          'w-12 sm:w-14 lg:w-16 h-12 sm:h-14 lg:h-16 rounded flex items-center justify-center flex-shrink-0',
          colorVariants[color]
        )}>
          <Icon className="w-6 sm:w-7 lg:w-8 h-6 sm:h-7 lg:h-8 text-white" />
        </div>
      </div>
    </motion.div>
  );
}