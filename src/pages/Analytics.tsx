
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CreditCardIcon,
  BanknotesIcon,
  GiftIcon,
  CalendarDaysIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  EyeIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

// Mock data for charts
const spendingData = [
  { month: 'Jan', amount: 12500 },
  { month: 'Feb', amount: 15200 },
  { month: 'Mar', amount: 18900 },
  { month: 'Apr', amount: 14300 },
  { month: 'May', amount: 22100 },
  { month: 'Jun', amount: 19800 },
];

const categoryData = [
  { category: 'Food & Dining', amount: 8500, percentage: 35, color: 'bg-orange-500' },
  { category: 'Shopping', amount: 6200, percentage: 26, color: 'bg-purple-500' },
  { category: 'Transport', amount: 3800, percentage: 16, color: 'bg-blue-500' },
  { category: 'Entertainment', amount: 2900, percentage: 12, color: 'bg-pink-500' },
  { category: 'Bills', amount: 2600, percentage: 11, color: 'bg-red-500' },
];

const rewardsData = [
  { month: 'Jan', points: 1250 },
  { month: 'Feb', points: 1520 },
  { month: 'Mar', points: 1890 },
  { month: 'Apr', points: 1430 },
  { month: 'May', points: 2210 },
  { month: 'Jun', points: 1980 },
];

export default function Analytics() {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const maxSpending = Math.max(...spendingData.map(d => d.amount));
  const maxRewards = Math.max(...rewardsData.map(d => d.points));

  const toggleCard = (cardId: string) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  // Detailed breakdown data for each metric
  const detailedData = {
    totalSpent: {
      breakdown: [
        { category: 'Food & Dining', amount: 8500, percentage: 35 },
        { category: 'Shopping', amount: 6200, percentage: 26 },
        { category: 'Transport', amount: 3800, percentage: 16 },
        { category: 'Entertainment', amount: 2900, percentage: 12 },
        { category: 'Bills', amount: 2600, percentage: 11 },
      ],
      insights: [
        'Highest spending month: May (₹22,100)',
        'Lowest spending month: January (₹12,500)',
        'Average daily spending: ₹810',
        'Weekend spending: 65% of total',
      ],
      trends: [
        { period: 'Last 30 days', change: '+12.5%', trend: 'up' },
        { period: 'Last 3 months', change: '+8.2%', trend: 'up' },
        { period: 'Last 6 months', change: '+15.3%', trend: 'up' },
      ],
    },
    avgMonthly: {
      breakdown: [
        { month: 'January', amount: 12500, transactions: 12 },
        { month: 'February', amount: 15200, transactions: 15 },
        { month: 'March', amount: 18900, transactions: 18 },
        { month: 'April', amount: 14300, transactions: 14 },
        { month: 'May', amount: 22100, transactions: 22 },
        { month: 'June', amount: 19800, transactions: 19 },
      ],
      insights: [
        'Monthly average: ₹18,200',
        'Most active month: May (22 transactions)',
        'Consistent spending pattern observed',
        'Budget utilization: 78%',
      ],
      trends: [
        { period: 'vs Last Quarter', change: '+8.2%', trend: 'up' },
        { period: 'vs Last Year', change: '+12.1%', trend: 'up' },
        { period: 'Projected Next Month', change: '+5.3%', trend: 'up' },
      ],
    },
    rewardsEarned: {
      breakdown: [
        { category: 'Dining (5x)', points: 4250, percentage: 35 },
        { category: 'Shopping (2x)', points: 3100, percentage: 26 },
        { category: 'Transport (1x)', points: 1900, percentage: 16 },
        { category: 'Entertainment (3x)', points: 1740, percentage: 12 },
        { category: 'Bills (1x)', points: 1300, percentage: 11 },
      ],
      insights: [
        'Best earning category: Dining (5x multiplier)',
        'Total points earned: 2,180',
        'Points value: ₹218 (1 point = ₹0.10)',
        'Redemption rate: 85%',
      ],
      trends: [
        { period: 'This Month', change: '+15.3%', trend: 'up' },
        { period: 'Last 3 Months', change: '+22.1%', trend: 'up' },
        { period: 'Year to Date', change: '+18.7%', trend: 'up' },
      ],
    },
    transactions: {
      breakdown: [
        { type: 'Completed', count: 42, percentage: 89 },
        { type: 'Pending', count: 3, percentage: 6 },
        { type: 'Failed', count: 2, percentage: 5 },
      ],
      insights: [
        'Total transactions: 47',
        'Success rate: 89%',
        'Average transaction: ₹517',
        'Most common: Food & Dining',
      ],
      trends: [
        { period: 'This Month', change: '-2.1%', trend: 'down' },
        { period: 'Last 3 Months', change: '+5.3%', trend: 'up' },
        { period: 'Year to Date', change: '+12.8%', trend: 'up' },
      ],
    },
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center sm:text-left"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Analytics Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your spending patterns and rewards earnings
        </p>
      </motion.div>

      {/* Interactive Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          {
            id: 'totalSpent',
            title: 'Total Spent',
            value: '₹24,300',
            change: '+12.5%',
            trend: 'up',
            icon: BanknotesIcon,
            color: 'text-red-600 dark:text-red-400',
            bgColor: 'bg-red-50 dark:bg-red-900/20',
          },
          {
            id: 'avgMonthly',
            title: 'Avg Monthly',
            value: '₹18,200',
            change: '+8.2%',
            trend: 'up',
            icon: ChartBarIcon,
            color: 'text-blue-600 dark:text-blue-400',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          },
          {
            id: 'rewardsEarned',
            title: 'Rewards Earned',
            value: '2,180 pts',
            change: '+15.3%',
            trend: 'up',
            icon: GiftIcon,
            color: 'text-green-600 dark:text-green-400',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
          },
          {
            id: 'transactions',
            title: 'Transactions',
            value: '47',
            change: '-2.1%',
            trend: 'down',
            icon: CreditCardIcon,
            color: 'text-purple-600 dark:text-purple-400',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20',
          },
        ].map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl ${
              expandedCard === metric.id ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
            }`}
            onClick={() => toggleCard(metric.id)}
          >
            {/* Main Card Content */}
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <metric.icon className={`w-8 h-8 ${metric.color}`} />
                <div className="flex items-center space-x-2">
                  <div className={`flex items-center text-sm ${
                    metric.trend === 'up' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {metric.trend === 'up' ? (
                      <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                    ) : (
                      <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
                    )}
                    {metric.change}
                  </div>
                  {expandedCard === metric.id ? (
                    <ChevronUpIcon className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {metric.value}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {metric.title}
              </p>
            </div>

            {/* Expanded Content */}
            <AnimatePresence>
              {expandedCard === metric.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className={`${metric.bgColor} border-t border-gray-200/50 dark:border-gray-700/50`}
                >
                  <div className="p-4 sm:p-6 space-y-4">
                    {/* Breakdown Section */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                        <ChartBarIcon className="w-4 h-4 mr-2" />
                        Breakdown
                      </h4>
                      <div className="space-y-2">
                        {detailedData[metric.id as keyof typeof detailedData].breakdown.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              {'category' in item ? item.category : 
                               'month' in item ? item.month : 
                               'type' in item ? item.type : ''}
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {'amount' in item ? `₹${item.amount.toLocaleString()}` : 
                                 'points' in item ? `${item.points} pts` :
                                 'count' in item ? item.count : ''}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                ({'percentage' in item ? item.percentage : 
                                  'transactions' in item ? item.transactions : ''}%)
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Insights Section */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                        <EyeIcon className="w-4 h-4 mr-2" />
                        Key Insights
                      </h4>
                      <div className="space-y-2">
                        {detailedData[metric.id as keyof typeof detailedData].insights.map((insight, idx) => (
                          <div key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                            {insight}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Trends Section */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                        <ClockIcon className="w-4 h-4 mr-2" />
                        Trends
                      </h4>
                      <div className="space-y-2">
                        {detailedData[metric.id as keyof typeof detailedData].trends.map((trend, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">{trend.period}</span>
                            <div className={`flex items-center ${
                              trend.trend === 'up' 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {trend.trend === 'up' ? (
                                <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />
                              ) : (
                                <ArrowTrendingDownIcon className="w-3 h-3 mr-1" />
                              )}
                              {trend.change}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enhanced Spending Trends */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Monthly Spending Trends
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Last 6 months overview
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
              <div className="text-right">
                <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  ₹{spendingData.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {spendingData.map((data, index) => {
              const percentage = (data.amount / maxSpending) * 100;
              const isHighest = data.amount === maxSpending;
              
              return (
                <motion.div
                  key={data.month}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="group cursor-pointer"
                >
                  <div className="flex items-center space-x-4 mb-2">
                    <div className="w-8 text-sm font-medium text-gray-600 dark:text-gray-400">
                      {data.month}
                    </div>
                    <div className="flex-1 relative">
                      <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-4 relative overflow-hidden shadow-inner">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ delay: 0.5 + index * 0.1, duration: 0.8, ease: "easeOut" }}
                          className={`h-full rounded-full relative ${
                            isHighest 
                              ? 'bg-gradient-to-r from-red-500 to-pink-600 shadow-lg' 
                              : 'bg-gradient-to-r from-indigo-500 to-purple-600'
                          }`}
                        >
                          {/* Animated shine effect */}
                          <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            transition={{ 
                              delay: 1 + index * 0.1, 
                              duration: 0.6,
                              ease: "easeInOut"
                            }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          />
                        </motion.div>
                      </div>
                      {/* Percentage label on bar */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 + index * 0.1 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <span className="text-xs font-medium text-white drop-shadow-sm">
                          {percentage.toFixed(0)}%
                        </span>
                      </motion.div>
                    </div>
                    <div className="w-20 text-right">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        ₹{(data.amount / 1000).toFixed(1)}k
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {data.amount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  {/* Hover tooltip */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    className="hidden group-hover:block absolute z-10 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg px-3 py-2 shadow-lg"
                    style={{ transform: 'translateY(-100%)' }}
                  >
                    <div className="font-medium">{data.month} 2024</div>
                    <div>Amount: ₹{data.amount.toLocaleString()}</div>
                    <div>Percentage: {percentage.toFixed(1)}%</div>
                    {isHighest && <div className="text-yellow-300 dark:text-yellow-600">🏆 Highest Month</div>}
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
          
          {/* Summary stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700"
          >
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Average</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  ₹{(spendingData.reduce((sum, item) => sum + item.amount, 0) / spendingData.length / 1000).toFixed(1)}k
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Highest</div>
                <div className="text-sm font-semibold text-red-600 dark:text-red-400">
                  ₹{(maxSpending / 1000).toFixed(1)}k
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Enhanced Rewards Earned */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Rewards Earned
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Points accumulation by month
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <GiftIcon className="w-5 h-5 text-gray-400" />
              <div className="text-right">
                <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {rewardsData.reduce((sum, item) => sum + item.points, 0).toLocaleString()} pts
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {rewardsData.map((data, index) => {
              const percentage = (data.points / maxRewards) * 100;
              const isHighest = data.points === maxRewards;
              
              return (
                <motion.div
                  key={data.month}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="group cursor-pointer"
                >
                  <div className="flex items-center space-x-4 mb-2">
                    <div className="w-8 text-sm font-medium text-gray-600 dark:text-gray-400">
                      {data.month}
                    </div>
                    <div className="flex-1 relative">
                      <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-4 relative overflow-hidden shadow-inner">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ delay: 0.7 + index * 0.1, duration: 0.8, ease: "easeOut" }}
                          className={`h-full rounded-full relative ${
                            isHighest 
                              ? 'bg-gradient-to-r from-emerald-500 to-green-600 shadow-lg' 
                              : 'bg-gradient-to-r from-teal-500 to-green-600'
                          }`}
                        >
                          {/* Animated sparkle effect */}
                          <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            transition={{ 
                              delay: 1.2 + index * 0.1, 
                              duration: 0.6,
                              ease: "easeInOut"
                            }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                          />
                        </motion.div>
                      </div>
                      {/* Points label on bar */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.4 + index * 0.1 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <span className="text-xs font-medium text-white drop-shadow-sm">
                          {data.points}
                        </span>
                      </motion.div>
                    </div>
                    <div className="w-20 text-right">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {data.points.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {percentage.toFixed(0)}%
                      </div>
                    </div>
                  </div>
                  
                  {/* Hover tooltip */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    className="hidden group-hover:block absolute z-10 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg px-3 py-2 shadow-lg"
                    style={{ transform: 'translateY(-100%)' }}
                  >
                    <div className="font-medium">{data.month} 2024</div>
                    <div>Points: {data.points.toLocaleString()}</div>
                    <div>Value: ₹{(data.points * 0.1).toFixed(2)}</div>
                    {isHighest && <div className="text-yellow-300 dark:text-yellow-600">⭐ Best Month</div>}
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
          
          {/* Summary stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.7 }}
            className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700"
          >
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Average</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {Math.round(rewardsData.reduce((sum, item) => sum + item.points, 0) / rewardsData.length).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Best Month</div>
                <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                  {maxRewards.toLocaleString()}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Enhanced Category Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Spending by Category
          </h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <CalendarDaysIcon className="w-4 h-4" />
            <span>Last 30 days</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Enhanced Donut Chart */}
          <div className="flex items-center justify-center relative">
            <div className="relative w-56 h-56 group">
              {/* Background circle with glow effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-700 dark:to-gray-600 opacity-20 blur-sm"></div>
              
              <svg className="w-full h-full transform -rotate-90 relative z-10" viewBox="0 0 100 100">
                {categoryData.map((category, index) => {
                  const offset = categoryData
                    .slice(0, index)
                    .reduce((sum, cat) => sum + cat.percentage, 0);
                  const circumference = 2 * Math.PI * 40;
                  const strokeDasharray = `${(category.percentage / 100) * circumference} ${circumference}`;
                  const strokeDashoffset = -((offset / 100) * circumference);
                  
                  return (
                    <motion.circle
                      key={category.category}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={category.color.replace('bg-', '').replace('-500', '')}
                      strokeWidth="10"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className={`${category.color.replace('bg-', 'stroke-')} transition-all duration-300 hover:stroke-width-12 cursor-pointer`}
                      initial={{ strokeDasharray: `0 ${circumference}` }}
                      animate={{ strokeDasharray }}
                      transition={{ delay: 0.8 + index * 0.2, duration: 1.2, ease: "easeOut" }}
                      whileHover={{ 
                        strokeWidth: 12,
                        filter: "drop-shadow(0 0 8px currentColor)"
                      }}
                    />
                  );
                })}
              </svg>
              
              {/* Center content with enhanced styling */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div 
                  className="text-center"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1.5, duration: 0.5 }}
                >
                  <motion.p 
                    className="text-3xl font-bold text-gray-900 dark:text-white mb-1"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    ₹24.3k
                  </motion.p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    Total Spent
                  </p>
                  <div className="mt-2 flex items-center justify-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                      +12.5% vs last month
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Enhanced Category List */}
          <div className="space-y-3">
            {categoryData.map((category, index) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ 
                  scale: 1.02,
                  x: 5,
                  transition: { duration: 0.2 }
                }}
                className="group relative"
              >
                <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-600/50 hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all duration-300 cursor-pointer border border-transparent hover:border-blue-200 dark:hover:border-blue-700">
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="flex items-center space-x-4 relative z-10">
                    <motion.div 
                      className={`w-5 h-5 rounded-full ${category.color} shadow-lg`}
                      whileHover={{ scale: 1.2, rotate: 180 }}
                      transition={{ duration: 0.3 }}
                    />
                    <div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {category.category}
                      </span>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full ${category.color.replace('bg-', 'bg-')} rounded-full`}
                            initial={{ width: 0 }}
                            animate={{ width: `${category.percentage}%` }}
                            transition={{ delay: 1 + index * 0.1, duration: 0.8 }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                          {category.percentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right relative z-10">
                    <motion.p 
                      className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                      whileHover={{ scale: 1.05 }}
                    >
                      ₹{category.amount.toLocaleString()}
                    </motion.p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {category.percentage > 20 ? 'High' : category.percentage > 10 ? 'Medium' : 'Low'} spending
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* Summary Stats */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/50"
            >
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Top Category</div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {categoryData[0].category}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Categories</div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {categoryData.length}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

    </div>
  );
}