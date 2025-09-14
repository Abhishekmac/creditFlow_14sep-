import { useState, useCallback } from 'react';
import { profileAPI } from '../services/api';

interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  memberSince: string;
}

interface UseProfileReturn {
  isLoading: boolean;
  error: string | null;
  getProfile: () => Promise<ProfileData | null>;
  updateContact: (phone: string, address: string) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  clearError: () => void;
}

export function useProfile(): UseProfileReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getProfile = useCallback(async (): Promise<ProfileData | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await profileAPI.getProfile();
      
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Failed to fetch profile');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profile';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateContact = useCallback(async (phone: string, address: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await profileAPI.updateContact(phone, address);
      
      if (response.success) {
        return true;
      } else {
        setError(response.message || 'Failed to update contact information');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update contact information';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await profileAPI.changePassword(currentPassword, newPassword);
      
      if (response.success) {
        return true;
      } else {
        setError(response.message || 'Failed to change password');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to change password';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    getProfile,
    updateContact,
    changePassword,
    clearError,
  };
}