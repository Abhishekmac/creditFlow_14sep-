import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import TransactionsTable from '../components/tables/TransactionsTable';
import PayBillModal from '../components/ui/PayBillModal';
import { MagnifyingGlassIcon, FunnelIcon, CalendarDaysIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import { useToast } from '../hooks/useToast';

// Extended mock data for better pagination demonstration
const allMockTransactions = [
  // Page 1
  {
    id: '1',
    date: '2024-01-15',
    description: 'Swiggy - Food Delivery',
    category: 'Food & Dining',
    amount: -480,
    status: 'completed' as const,
  },
  {
    id: '2',
    date: '2024-01-14',
    description: 'Amazon - Online Shopping',
    category: 'Shopping',
    amount: -2340,
    status: 'completed' as const,
  },
  {
    id: '3',
    date: '2024-01-13',
    description: 'Uber - Ride',
    category: 'Transport',
    amount: -280,
    status: 'pending' as const,
  },
  {
    id: '4',
    date: '2024-01-12',
    description: 'Salary Credit',
    category: 'Others',
    amount: 75000,
    status: 'completed' as const,
  },
  {
    id: '5',
    date: '2024-01-11',
    description: 'Netflix - Subscription',
    category: 'Entertainment',
    amount: -799,
    status: 'failed' as const,
  },
  // Page 2
  {
    id: '6',
    date: '2024-01-10',
    description: 'Flipkart - Electronics',
    category: 'Shopping',
    amount: -15600,
    status: 'completed' as const,
  },
  {
    id: '7',
    date: '2024-01-09',
    description: 'Zomato - Food Order',
    category: 'Food & Dining',
    amount: -850,
    status: 'completed' as const,
  },
  {
    id: '8',
    date: '2024-01-08',
    description: 'Petrol Pump',
    category: 'Transport',
    amount: -3200,
    status: 'completed' as const,
  },
  {
    id: '9',
    date: '2024-01-07',
    description: 'Movie Tickets',
    category: 'Entertainment',
    amount: -600,
    status: 'completed' as const,
  },
  {
    id: '10',
    date: '2024-01-06',
    description: 'Grocery Store',
    category: 'Food & Dining',
    amount: -2400,
    status: 'completed' as const,
  },
  // Page 3
  {
    id: '11',
    date: '2024-01-05',
    description: 'Medical Checkup',
    category: 'Healthcare',
    amount: -5000,
    status: 'completed' as const,
  },
  {
    id: '12',
    date: '2024-01-04',
    description: 'Online Course',
    category: 'Others',
    amount: -2999,
    status: 'completed' as const,
  },
  {
    id: '13',
    date: '2024-01-03',
    description: 'Electricity Bill',
    category: 'Bills',
    amount: -1200,
    status: 'completed' as const,
  },
  {
    id: '14',
    date: '2024-01-02',
    description: 'Gym Membership',
    category: 'Others',
    amount: -3000,
    status: 'completed' as const,
  },
  {
    id: '15',
    date: '2024-01-01',
    description: 'New Year Celebration',
    category: 'Entertainment',
    amount: -8500,
    status: 'completed' as const,
  },
  // Additional transactions for better filtering
  {
    id: '16',
    date: '2023-12-31',
    description: 'Water Bill',
    category: 'Bills',
    amount: -800,
    status: 'completed' as const,
  },
  {
    id: '17',
    date: '2023-12-30',
    description: 'Myntra - Clothing',
    category: 'Shopping',
    amount: -4500,
    status: 'completed' as const,
  },
  {
    id: '18',
    date: '2023-12-29',
    description: 'Hospital Visit',
    category: 'Healthcare',
    amount: -8000,
    status: 'completed' as const,
  },
];

export default function Transactions() {
  const location = useLocation();
  const { showToast } = useToast();
  const [currentPage, setCurrentPage] = useState(() => {
    const saved = sessionStorage.getItem('transactions-page');
    return saved ? parseInt(saved) : 1;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(() => {
    return sessionStorage.getItem('transactions-search') || '';
  });
  const [selectedCategory, setSelectedCategory] = useState(() => {
    return sessionStorage.getItem('transactions-category') || 'all';
  });
  const [dateRange, setDateRange] = useState(() => {
    return sessionStorage.getItem('transactions-date-range') || 'all';
  });
  const [showPayBillModal, setShowPayBillModal] = useState(false);
  const [outstandingBalance, setOutstandingBalance] = useState(() => {
    const saved = localStorage.getItem('outstandingBalance');
    return saved ? parseFloat(saved) : 45320;
  });
  const minimumDue = 2266;

  const transactionsPerPage = 8;

  // Filter transactions based on search and filters
  const getFilteredTransactions = () => {
    let filtered = allMockTransactions;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(transaction => transaction.category === selectedCategory);
    }

    // Date range filter (simplified for demo)
    if (dateRange !== 'all') {
      const now = new Date();
      
      switch (dateRange) {
        case 'today':
          filtered = filtered.filter(t => {
            const tDate = new Date(t.date);
            return tDate.toDateString() === now.toDateString();
          });
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(t => new Date(t.date) >= weekAgo);
          break;
        case 'month':
          filtered = filtered.filter(t => {
            const tDate = new Date(t.date);
            return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
          });
          break;
      }
    }

    return filtered;
  };

  const filteredTransactions = getFilteredTransactions();
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);

  const getCurrentTransactions = () => {
    const startIndex = (currentPage - 1) * transactionsPerPage;
    const endIndex = startIndex + transactionsPerPage;
    return filteredTransactions.slice(startIndex, endIndex);
  };

  // Save filters to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('transactions-search', searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    sessionStorage.setItem('transactions-category', selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    sessionStorage.setItem('transactions-date-range', dateRange);
  }, [dateRange]);

  useEffect(() => {
    sessionStorage.setItem('transactions-page', currentPage.toString());
  }, [currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, dateRange]);

  const handlePageChange = async (page: number) => {
    if (page === currentPage || isLoading || page < 1 || page > totalPages) return;
    
    setIsLoading(true);
    
    // Simulate loading delay for smooth animation
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setCurrentPage(page);
    setIsLoading(false);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setDateRange('all');
  };

  const hasActiveFilters = Boolean(searchTerm || selectedCategory !== 'all' || dateRange !== 'all');

  // Check if coming from dashboard quick action
  React.useEffect(() => {
    if (location.state?.fromQuickAction) {
      showToast({
        type: 'info',
        title: 'Transaction History',
        message: 'Here are all your recent transactions and statements'
      });
    }
  }, [location.state, showToast]);

  const handlePaymentSuccess = (newBalance: number) => {
    setOutstandingBalance(newBalance);
    showToast({
      type: 'success',
      title: 'Payment Successful',
      message: 'Your outstanding balance has been updated'
    });
  };

  const handleExportCSV = () => {
    try {
      // Get filtered transactions
      const filteredTransactions = getFilteredTransactions();
      
      // Create CSV headers
      const headers = ['Date', 'Description', 'Category', 'Amount', 'Status'];
      
      // Convert transactions to CSV format
      const csvContent = [
        headers.join(','),
        ...filteredTransactions.map(transaction => [
          transaction.date,
          `"${transaction.description}"`, // Wrap in quotes to handle commas
          transaction.category,
          transaction.amount,
          transaction.status
        ].join(','))
      ].join('\n');
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showToast({
        type: 'success',
        title: 'Export Successful',
        message: `Exported ${filteredTransactions.length} transactions to CSV`
      });
    } catch (error) {
      console.error('CSV export error:', error);
      showToast({
        type: 'error',
        title: 'Export Failed',
        message: 'Failed to export transactions. Please try again.'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Transactions
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            View and manage your transaction history
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowPayBillModal(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors flex items-center space-x-2 text-sm shadow-sm"
        >
          <BanknotesIcon className="w-4 h-4" />
          <span>Pay Now</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleExportCSV}
          className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center space-x-2 text-sm"
        >
          <CalendarDaysIcon className="w-4 h-4" />
          <span>Export CSV</span>
        </motion.button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-4 sm:p-6 shadow-sm"
      >
        <div className="space-y-4">
          {/* Search and Filter Controls */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
              />
            </div>

            {/* Category Filter */}
            <div className="relative min-w-[200px]">
              <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-8 py-3 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white appearance-none"
              >
                <option value="all">All Categories</option>
                <option value="Food & Dining">Food & Dining</option>
                <option value="Shopping">Shopping</option>
                <option value="Transport">Transport</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Bills">Bills</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Others">Others</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="relative min-w-[180px]">
              <CalendarDaysIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full pl-10 pr-8 py-3 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white appearance-none"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>

          {/* Active Filters & Clear Button */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Active filters:</span>
              {searchTerm && (
                <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/50 text-primary-800 dark:text-primary-300 rounded text-sm">
                  Search: "{searchTerm}"
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/50 text-primary-800 dark:text-primary-300 rounded text-sm">
                  Category: {selectedCategory}
                </span>
              )}
              {dateRange !== 'all' && (
                <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/50 text-primary-800 dark:text-primary-300 rounded text-sm">
                  Date: {dateRange === 'today' ? 'Today' : dateRange === 'week' ? 'This Week' : dateRange === 'month' ? 'This Month' : dateRange}
                </span>
              )}
              <button
                onClick={clearFilters}
                className="px-3 py-1 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 underline"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Results Count */}
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Showing {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
            {hasActiveFilters && ` (filtered from ${allMockTransactions.length} total)`}
          </div>
        </div>
      </motion.div>

      {/* Transactions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <TransactionsTable
          transactions={getCurrentTransactions()}
          onPageChange={handlePageChange}
          totalPages={totalPages}
          currentPage={currentPage}
          loading={isLoading}
          onClearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </motion.div>
      
      {/* Pay Bill Modal */}
      <PayBillModal
        isOpen={showPayBillModal}
        onClose={() => setShowPayBillModal(false)}
        outstandingBalance={outstandingBalance}
        minimumDue={minimumDue}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}