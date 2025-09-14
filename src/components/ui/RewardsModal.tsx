import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, GiftIcon, StarIcon, TrophyIcon } from '@heroicons/react/24/outline';
import { useRewards } from '../../hooks/useRewards';
import { useToast } from '../../hooks/useToast';
import clsx from 'clsx';

interface RewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RewardsModal({ isOpen, onClose }: RewardsModalProps) {
  const [rewardsData, setRewardsData] = useState<any>(null);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const { getRewards, redeemReward, isLoading, error, clearError } = useRewards();
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadRewards();
      clearError();
    }
  }, [isOpen]);

  const loadRewards = async () => {
    const data = await getRewards();
    if (data) {
      setRewardsData(data);
    }
  };

  const handleRedeem = async (offer: any) => {
    if (rewardsData.availablePoints < offer.pointsRequired) {
      showToast({
        type: 'error',
        title: 'Insufficient Points',
        message: `You need ${offer.pointsRequired} points but only have ${rewardsData.availablePoints} points.`
      });
      return;
    }

    setSelectedOffer(offer);
    setIsRedeeming(true);

    try {
      const success = await redeemReward(offer);
      
      if (success) {
        showToast({
          type: 'success',
          title: 'Reward Redeemed!',
          message: `Successfully redeemed ${offer.title}`,
          duration: 6000
        });
        
        // Refresh rewards data
        await loadRewards();
        setSelectedOffer(null);
      }
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Redemption Failed',
        message: error || 'Failed to redeem reward'
      });
    } finally {
      setIsRedeeming(false);
    }
  };

  const getMilestoneProgress = () => {
    if (!rewardsData?.nextMilestone) return 100;
    const currentPoints = rewardsData.availablePoints;
    const nextMilestone = rewardsData.nextMilestone;
    const previousMilestone = [0, 1000, 2500, 5000, 10000, 25000].find(m => m < nextMilestone) || 0;
    return ((currentPoints - previousMilestone) / (nextMilestone - previousMilestone)) * 100;
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
              onClick={onClose}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <GiftIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                      Rewards Center
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Redeem your points for exciting rewards
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                {isLoading && !rewardsData ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400">Loading rewards...</p>
                  </div>
                ) : rewardsData ? (
                  <div className="p-6 space-y-6">
                    {/* Points Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
                        <div className="flex items-center justify-between mb-2">
                          <StarIcon className="w-8 h-8" />
                          <span className="text-2xl font-bold">{rewardsData.availablePoints?.toLocaleString() || '0'}</span>
                        </div>
                        <p className="text-blue-100">Available Points</p>
                      </div>
                      
                      <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-xl p-6 text-white">
                        <div className="flex items-center justify-between mb-2">
                          <TrophyIcon className="w-8 h-8" />
                          <span className="text-2xl font-bold">{rewardsData.totalPoints?.toLocaleString() || '0'}</span>
                        </div>
                        <p className="text-green-100">Total Earned</p>
                      </div>
                      
                      <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-6 text-white">
                        <div className="flex items-center justify-between mb-2">
                          <GiftIcon className="w-8 h-8" />
                          <span className="text-2xl font-bold">{rewardsData.redeemedPoints?.toLocaleString() || '0'}</span>
                        </div>
                        <p className="text-orange-100">Redeemed</p>
                      </div>
                    </div>

                    {/* Milestone Progress */}
                    {rewardsData.nextMilestone && (
                      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                            Next Milestone
                          </h4>
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            {rewardsData.pointsToNext} points to go
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-3 mb-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${getMilestoneProgress()}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full"
                          />
                        </div>
                        <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                          <span>{rewardsData.availablePoints} points</span>
                          <span>{rewardsData.nextMilestone} points</span>
                        </div>
                      </div>
                    )}

                    {/* Redeemable Offers */}
                    <div>
                      <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                        Redeemable Offers
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {rewardsData.redeemableOffers?.map((offer: any) => {
                          const canRedeem = rewardsData.availablePoints >= offer.pointsRequired;
                          return (
                            <motion.div
                              key={offer.id}
                              whileHover={{ scale: canRedeem ? 1.02 : 1 }}
                              className={clsx(
                                'border-2 rounded-xl p-4 transition-all duration-200',
                                canRedeem
                                  ? 'border-primary-200 dark:border-primary-700 bg-white dark:bg-slate-800 hover:border-primary-300 dark:hover:border-primary-600 cursor-pointer'
                                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 opacity-60'
                              )}
                              onClick={() => canRedeem && handleRedeem(offer)}
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className={clsx(
                                  'w-10 h-10 rounded-lg flex items-center justify-center',
                                  offer.type === 'cashback' 
                                    ? 'bg-green-100 dark:bg-green-900/50' 
                                    : 'bg-blue-100 dark:bg-blue-900/50'
                                )}>
                                  <GiftIcon className={clsx(
                                    'w-5 h-5',
                                    offer.type === 'cashback' 
                                      ? 'text-green-600 dark:text-green-400' 
                                      : 'text-blue-600 dark:text-blue-400'
                                  )} />
                                </div>
                                <span className={clsx(
                                  'text-xs font-medium px-2 py-1 rounded',
                                  canRedeem 
                                    ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300'
                                    : 'bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-400'
                                )}>
                                  {offer.pointsRequired} pts
                                </span>
                              </div>
                              
                              <h5 className="font-semibold text-slate-900 dark:text-white mb-2">
                                {offer.title}
                              </h5>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                {offer.description}
                              </p>
                              
                              <button
                                disabled={!canRedeem || isRedeeming}
                                className={clsx(
                                  'w-full py-2 px-4 rounded-lg font-medium text-sm transition-colors',
                                  canRedeem
                                    ? 'bg-primary-600 hover:bg-primary-700 text-white'
                                    : 'bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                                )}
                              >
                                {isRedeeming && selectedOffer?.id === offer.id ? 'Redeeming...' : 'Redeem Now'}
                              </button>
                            </motion.div>
                          );
                        }) || (
                          <div className="col-span-full text-center py-8 text-slate-500 dark:text-slate-400">
                            <p>No offers available</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Recent Transactions */}
                    <div>
                      <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                        Recent Activity
                      </h4>
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {rewardsData.recentTransactions?.map((transaction: any) => (
                          <div
                            key={transaction.id}
                            className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              <div className={clsx(
                                'w-8 h-8 rounded-full flex items-center justify-center',
                                transaction.transaction_type === 'earning'
                                  ? 'bg-green-100 dark:bg-green-900/50'
                                  : 'bg-red-100 dark:bg-red-900/50'
                              )}>
                                {transaction.transaction_type === 'earning' ? (
                                  <StarIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                                ) : (
                                  <GiftIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                  {transaction.description}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {new Date(transaction.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className={clsx(
                              'text-sm font-semibold',
                              transaction.transaction_type === 'earning'
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            )}>
                              {transaction.transaction_type === 'earning' ? '+' : '-'}
                              {transaction.points_earned || transaction.points_redeemed} pts
                            </div>
                          </div>
                        )) || (
                          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                            <p>No recent transactions</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-slate-600 dark:text-slate-400">Failed to load rewards data</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}