import { useState, useCallback } from 'react';
import { rewardsAPI } from '../services/api';

interface RewardOffer {
  id: string;
  title: string;
  description: string;
  pointsRequired: number;
  type: 'cashback' | 'bill_discount';
  value: number;
}

interface RewardTransaction {
  id: string;
  transaction_type: 'earning' | 'redemption';
  points_earned?: number;
  points_redeemed?: number;
  description: string;
  created_at: string;
}

interface RewardsData {
  totalPoints: number;
  redeemedPoints: number;
  availablePoints: number;
  nextMilestone: number | null;
  pointsToNext: number;
  recentTransactions: RewardTransaction[];
  redeemableOffers: RewardOffer[];
}

interface UseRewardsReturn {
  isLoading: boolean;
  error: string | null;
  getRewards: () => Promise<RewardsData | null>;
  redeemReward: (offer: RewardOffer) => Promise<boolean>;
  clearError: () => void;
}

export function useRewards(): UseRewardsReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getRewards = useCallback(async (): Promise<RewardsData | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await rewardsAPI.getRewards();
      
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Failed to fetch rewards');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch rewards';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const redeemReward = useCallback(async (offer: RewardOffer): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await rewardsAPI.redeemReward(
        offer.id,
        offer.pointsRequired,
        offer.type,
        offer.value
      );
      
      if (response.success) {
        return true;
      } else {
        setError(response.message || 'Failed to redeem reward');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to redeem reward';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    getRewards,
    redeemReward,
    clearError,
  };
}