import { useState, useCallback } from 'react';
import { cardsAPI } from '../services/api';

interface CardStatus {
  cardId: string;
  status: 'active' | 'blocked' | 'suspended';
  cardType: string;
  cardNumber: string;
  lastUpdated: string;
}

interface UseCardsReturn {
  isLoading: boolean;
  error: string | null;
  blockCard: (cardId: string, action: 'block' | 'unblock') => Promise<boolean>;
  getCardStatus: (cardId: string) => Promise<CardStatus | null>;
  clearError: () => void;
}

export function useCards(): UseCardsReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const blockCard = useCallback(async (cardId: string, action: 'block' | 'unblock'): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await cardsAPI.blockCard(cardId, action);
      
      if (response.success) {
        return true;
      } else {
        setError(response.message || `Failed to ${action} card`);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to ${action} card`;
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCardStatus = useCallback(async (cardId: string): Promise<CardStatus | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await cardsAPI.getCardStatus(cardId);
      
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Failed to fetch card status');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch card status';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    blockCard,
    getCardStatus,
    clearError,
  };
}