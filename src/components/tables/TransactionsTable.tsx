import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
}

interface TransactionsTableProps {
  transactions: Transaction[];
  onPageChange: (page: number) => void;
  totalPages: number;
  currentPage?: number;
  loading?: boolean;
  hideHeader?: boolean;
  onClearFilters?: () => void;
  hasActiveFilters?: boolean;
}

const categoryColors: Record<string, string> = {
  'Food & Dining': 'bg-orange-500 text-white',
  'Shopping': 'bg-purple-500 text-white',
  'Transport': 'bg-blue-500 text-white',
  'Entertainment': 'bg-pink-500 text-white',
  'Bills': 'bg-red-500 text-white',
  'Healthcare': 'bg-green-500 text-white',
  'Others': 'bg-slate-500 text-white',
};

const statusIcons = {
  completed: CheckCircleIcon,
  pending: ClockIcon,
  failed: XCircleIcon,
};

const statusColors = {
  completed: 'text-green-600 dark:text-green-400',
  pending: 'text-yellow-600 dark:text-yellow-400',
  failed: 'text-red-600 dark:text-red-400',
};

function SkeletonRow() {
  return (
    <tr className="animate-pulse border-b border-slate-200 dark:border-slate-700 h-16">
      <td className="px-6 py-4" style={{ width: '12%' }}>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
      </td>
      <td className="px-6 py-4" style={{ width: '48%' }}>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-40"></div>
      </td>
      <td className="px-6 py-4 text-center hidden lg:table-cell" style={{ width: '18%' }}>
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-20 mx-auto"></div>
      </td>
      <td className="px-6 py-4 text-right" style={{ width: '14%' }}>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16 ml-auto"></div>
      </td>
      <td className="px-6 py-4 text-center hidden sm:table-cell" style={{ width: '8%' }}>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-4 mx-auto"></div>
      </td>
    </tr>
  );
}

function EmptyStateRow({ onClearFilters, hasActiveFilters }: { onClearFilters?: () => void; hasActiveFilters?: boolean }) {
  return (
    <tr>
      <td colSpan={5} className="px-6 py-12 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 text-slate-400 dark:text-slate-600 mb-2">
            {hasActiveFilters ? (
              <FunnelIcon className="w-full h-full" />
            ) : (
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-full h-full">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400">
              {hasActiveFilters ? 'No transactions match your filters' : 'No transactions yet'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-500 max-w-sm">
              {hasActiveFilters 
                ? 'Try adjusting your search criteria or date range to see more results.'
                : 'Your transaction history will appear here once you start using your card.'
              }
            </p>
          </div>
          {hasActiveFilters && onClearFilters && (
            <button
              onClick={onClearFilters}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              Clear filters
            </button>
          )}
          {!hasActiveFilters && (
            <button className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm font-medium">
              Make your first transaction
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

function TransactionCard({ transaction, index }: { transaction: Transaction; index: number }) {
  const StatusIcon = statusIcons[transaction.status];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
      className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 space-y-3 shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-slate-900 dark:text-white truncate" title={transaction.description}>
            {transaction.description}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {new Date(transaction.date).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </p>
        </div>
        <div className="flex items-center space-x-2 ml-3">
          <StatusIcon className={clsx('w-4 h-4', statusColors[transaction.status])} />
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <span className={clsx(
          'inline-flex items-center px-2 py-1 text-xs font-medium rounded',
          'white-space-nowrap overflow-hidden text-ellipsis max-w-24',
          categoryColors[transaction.category] || categoryColors['Others']
        )}>
          {transaction.category}
        </span>
        <div className={clsx(
          'text-sm font-semibold tabular-nums',
          transaction.amount < 0 
            ? 'text-red-600 dark:text-red-400' 
            : 'text-green-600 dark:text-green-400'
        )}>
          {transaction.amount < 0 ? '-' : '+'}₹{Math.abs(transaction.amount).toLocaleString()}
        </div>
      </div>
    </motion.div>
  );
}

export function PaginationControls({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  loading 
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading: boolean;
}) {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
      <div className="text-sm text-slate-700 dark:text-slate-300">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center space-x-1">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || loading}
          className="p-2 rounded border border-slate-300 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </motion.button>
        
        {getVisiblePages().map((pageNum, index) => (
          pageNum === '...' ? (
            <span key={`dots-${index}`} className="px-3 py-2 text-slate-500">
              ...
            </span>
          ) : (
            <motion.button
              key={pageNum}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPageChange(pageNum as number)}
              disabled={loading}
              className={clsx(
                'px-3 py-2 rounded text-sm font-medium transition-colors min-w-[40px]',
                pageNum === currentPage
                  ? 'bg-primary-600 text-white'
                  : 'border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              )}
            >
              {pageNum}
            </motion.button>
          )
        ))}
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || loading}
          className="p-2 rounded border border-slate-300 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
}

export default function TransactionsTable({ 
  transactions, 
  onPageChange, 
  totalPages, 
  currentPage = 1,
  loading = false,
  hideHeader = false,
  onClearFilters,
  hasActiveFilters = false
}: TransactionsTableProps) {
  const isEmpty = !loading && transactions.length === 0;

  // Mobile card layout
  const MobileLayout = () => (
    <div className="lg:hidden space-y-4">
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={`skeleton-${i}`} className="animate-pulse bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 space-y-3">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
                </div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-4"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      ) : isEmpty ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 text-slate-400 dark:text-slate-600">
              {hasActiveFilters ? (
                <FunnelIcon className="w-full h-full" />
              ) : (
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-full h-full">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400">
                {hasActiveFilters ? 'No transactions match your filters' : 'No transactions yet'}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-500">
                {hasActiveFilters 
                  ? 'Try adjusting your search criteria or date range to see more results.'
                  : 'Your transaction history will appear here once you start using your card.'
                }
              </p>
            </div>
            {hasActiveFilters && onClearFilters && (
              <button
                onClick={onClearFilters}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`mobile-page-${currentPage}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="space-y-4"
          >
            {transactions.map((transaction, index) => (
              <TransactionCard key={transaction.id} transaction={transaction} index={index} />
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );

  // Desktop table layout
  const DesktopLayout = () => (
    <div className="hidden lg:block bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      {!hideHeader && (
        <div className="px-4 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Recent Transactions
          </h3>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full" style={{ tableLayout: 'fixed' }}>
          <thead className="bg-slate-50 dark:bg-slate-900/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider" style={{ width: '12%' }}>
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider" style={{ width: '48%' }}>
                Description
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider" style={{ width: '18%' }}>
                Category
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider" style={{ width: '14%' }}>
                Amount
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider" style={{ width: '8%' }}>
                Status
              </th>
            </tr>
          </thead>
          <AnimatePresence mode="wait">
            <motion.tbody
              key={loading ? 'loading' : `page-${currentPage}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="divide-y divide-slate-200 dark:divide-slate-700"
            >
              {loading ? (
                Array.from({ length: 5 }, (_, i) => <SkeletonRow key={`skeleton-${i}`} />)
              ) : isEmpty ? (
                <EmptyStateRow onClearFilters={onClearFilters} hasActiveFilters={hasActiveFilters} />
              ) : (
                transactions.map((transaction, index) => {
                  const StatusIcon = statusIcons[transaction.status];
                  return (
                    <motion.tr
                      key={transaction.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.2 }}
                      className="h-16 transition-colors duration-200 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    >
                      <td className="px-6 py-4 text-left align-middle" style={{ width: '12%' }}>
                        <div className="text-sm font-medium text-slate-900 dark:text-white whitespace-nowrap">
                          {new Date(transaction.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 align-middle" style={{ width: '48%' }}>
                        <div 
                          className="text-sm font-medium text-slate-900 dark:text-white truncate" 
                          title={transaction.description}
                          style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                        >
                          {transaction.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center align-middle" style={{ width: '18%' }}>
                        <div className="flex justify-center">
                          <span 
                            className={clsx(
                              'inline-block px-2.5 py-1 text-xs font-medium rounded h-6 leading-4',
                              categoryColors[transaction.category] || categoryColors['Others']
                            )}
                            style={{ 
                              whiteSpace: 'nowrap', 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis',
                              maxWidth: '120px'
                            }}
                            title={transaction.category}
                          >
                            {transaction.category}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right align-middle" style={{ width: '14%' }}>
                        <div 
                          className={clsx(
                            'text-sm font-semibold tabular-nums',
                            transaction.amount < 0 
                              ? 'text-red-600 dark:text-red-400' 
                              : 'text-green-600 dark:text-green-400'
                          )}
                          style={{ whiteSpace: 'nowrap' }}
                        >
                          {transaction.amount < 0 ? '-' : '+'}₹{Math.abs(transaction.amount).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center align-middle" style={{ width: '8%' }}>
                        <div className="flex items-center justify-center">
                          <StatusIcon 
                            className={clsx('w-5 h-5', statusColors[transaction.status])} 
                          />
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </motion.tbody>
          </AnimatePresence>
        </table>
      </div>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        loading={loading}
      />
    </div>
  );

  return (
    <>
      <MobileLayout />
      <DesktopLayout />
    </>
  );
}