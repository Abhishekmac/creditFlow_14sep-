import prisma from '../prisma';

export interface ActivityData {
  type: string;
  title: string;
  description: string;
  metadata?: any;
  status?: 'SUCCESS' | 'FAILED' | 'PENDING';
}

/**
 * Safely logs user activity without affecting the main operation
 * This function is designed to be fail-safe - if logging fails, it won't break the main functionality
 */
export const logActivity = async (
  userId: number,
  activityData: ActivityData
): Promise<void> => {
  try {
    await prisma.activity.create({
      data: {
        userId,
        type: activityData.type,
        title: activityData.title,
        description: activityData.description,
        metadata: activityData.metadata || {},
        status: activityData.status || 'SUCCESS',
      },
    });
  } catch (error) {
    // Log the error but don't throw it - this ensures the main operation continues
    console.error('Activity logging failed:', {
      userId,
      activityData,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Predefined activity types for consistency
 */
export const ActivityTypes = {
  PAYMENT: 'PAYMENT',
  CARD_BLOCKED: 'CARD_BLOCKED',
  CARD_UNBLOCKED: 'CARD_UNBLOCKED',
  CARD_APPLICATION: 'CARD_APPLICATION',
  PROFILE_UPDATE: 'PROFILE_UPDATE',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  LOGIN: 'LOGIN',
  LOGIN_NEW_DEVICE: 'LOGIN_NEW_DEVICE',
  TWO_FA_ENABLED: 'TWO_FA_ENABLED',
  TWO_FA_DISABLED: 'TWO_FA_DISABLED',
  CONTACT_UPDATE: 'CONTACT_UPDATE',
  TRANSACTION: 'TRANSACTION',
} as const;

/**
 * Helper function to create activity data for common activities
 */
export const createActivityData = {
  payment: (amount: number, method: string, status: 'SUCCESS' | 'FAILED' = 'SUCCESS') => ({
    type: ActivityTypes.PAYMENT,
    title: 'Payment Made',
    description: `Payment of ₹${amount.toLocaleString()} made via ${method}`,
    metadata: { amount, method },
    status,
  }),

  cardBlocked: (cardNumber: string, reason?: string) => ({
    type: ActivityTypes.CARD_BLOCKED,
    title: 'Card Blocked',
    description: `Card ending in ${cardNumber} has been blocked${reason ? ` - ${reason}` : ''}`,
    metadata: { cardNumber, reason },
  }),

  cardUnblocked: (cardNumber: string) => ({
    type: ActivityTypes.CARD_UNBLOCKED,
    title: 'Card Unblocked',
    description: `Card ending in ${cardNumber} has been unblocked`,
    metadata: { cardNumber },
  }),

  cardApplication: (cardType: string, status: 'SUCCESS' | 'FAILED' = 'SUCCESS') => ({
    type: ActivityTypes.CARD_APPLICATION,
    title: 'Card Application',
    description: `${cardType} card application ${status === 'SUCCESS' ? 'submitted' : 'failed'}`,
    metadata: { cardType },
    status,
  }),

  profileUpdate: (field: string) => ({
    type: ActivityTypes.PROFILE_UPDATE,
    title: 'Profile Updated',
    description: `${field} has been updated`,
    metadata: { field },
  }),

  passwordChange: () => ({
    type: ActivityTypes.PASSWORD_CHANGE,
    title: 'Password Changed',
    description: 'Password has been changed successfully',
  }),

  login: (deviceInfo?: string) => ({
    type: ActivityTypes.LOGIN,
    title: 'Login',
    description: deviceInfo ? `Login from ${deviceInfo}` : 'User logged in',
    metadata: { deviceInfo },
  }),

  twoFAEnabled: () => ({
    type: ActivityTypes.TWO_FA_ENABLED,
    title: 'Two-Factor Authentication Enabled',
    description: 'Two-factor authentication has been enabled',
  }),

  twoFADisabled: () => ({
    type: ActivityTypes.TWO_FA_DISABLED,
    title: 'Two-Factor Authentication Disabled',
    description: 'Two-factor authentication has been disabled',
  }),
};
