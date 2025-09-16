const API_BASE_URL =
  (import.meta.env.VITE_API_URL?.replace(/\/$/, '') as string) ||
  'http://localhost:4000/api';

console.log(
  'VITE_API_URL(import.meta.env):',
  import.meta.env.VITE_API_URL,
  'computed API_BASE_URL:',
  API_BASE_URL
);

const ACCESS_TOKEN_KEY = 'accessToken'; // primary key we’ll use going forward
const LEGACY_TOKEN_KEY = 'auth_token';  // read & write for backward compat
const USER_KEY = 'user';

const getAuthToken = () =>
  localStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY);

const setAuthToken = (token: string) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
  localStorage.setItem(LEGACY_TOKEN_KEY, token); // keep both to avoid breakage
};

// Utility function to get user-specific outstanding balance key
const getUserBalanceKey = (userId?: string): string => {
  if (!userId) {
    // Fallback to global key if no user ID (shouldn't happen in normal flow)
    return 'outstandingBalance';
  }
  return `outstandingBalance_${userId}`;
};

// Utility function to get user-specific outstanding balance
const getUserOutstandingBalance = (userId?: string): number => {
  const balanceKey = getUserBalanceKey(userId);
  const saved = localStorage.getItem(balanceKey);
  return saved ? parseFloat(saved) : 45345; // Default value
};

// Utility function to set user-specific outstanding balance
const setUserOutstandingBalance = (userId: string, balance: number): void => {
  const balanceKey = getUserBalanceKey(userId);
  localStorage.setItem(balanceKey, balance.toString());
};

// Helper to decide mock mode (no backend URL = use mocks)
const isMockMode = () => !API_BASE_URL;

// API request helper with authentication
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  // In mock mode, short-circuit to mock responder
  if (isMockMode()) {
    return getMockResponse(endpoint, options);
  }

  const token = getAuthToken();

  const headers: Record<string, string> = {};
  // Only set JSON header when not sending FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const finalUrl = `${API_BASE_URL}${endpoint}`;
  console.log('[apiRequest] finalUrl=', finalUrl, 'options=', options);

  const res = await fetch(finalUrl, {
    ...options,
    credentials: 'include', // <— important
    headers: {
      ...headers,
      ...(options.headers as any),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API error ${res.status}: ${text || res.statusText}`);
  }

  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    return res.json();
  }
  return res.text();
};

// Mock response generator (UI dev)
const getMockResponse = (endpoint: string, options: RequestInit = {}) => {
  if (endpoint.includes('/cards/') && endpoint.includes('/status')) {
    return {
      success: true,
      data: {
        cardId: '660e8400-e29b-41d4-a716-446655440000',
        status: 'active',
        cardType: 'Platinum',
        cardNumber: '****-****-****-9012',
        lastUpdated: new Date().toISOString(),
      },
    };
  }

  if (endpoint.includes('/cards/') && endpoint.includes('/block')) {
    const bodyStr = (options.body as string) || '{}';
    let body: any = {};
    try {
      body = JSON.parse(bodyStr);
    } catch {}
    return {
      success: true,
      message: `Card ${body.action === 'block' ? 'blocked' : 'unblocked'} successfully`,
      data: {
        cardId: '660e8400-e29b-41d4-a716-446655440000',
        status: body.action === 'block' ? 'blocked' : 'active',
        lastUpdated: new Date().toISOString(),
      },
    };
  }

  if (endpoint.includes('/cards/applications') && options.method === 'POST') {
    // Simulate successful application submit
    return {
      success: true,
      data: {
        applicationId: `APP_${Date.now()}`,
        status: 'submitted',
        submittedAt: new Date().toISOString(),
      },
      message: 'Application submitted (MOCK)',
    };
  }

  if (endpoint.includes('/rewards')) {
    return {
      success: true,
      data: {
        totalPoints: 15750,
        redeemedPoints: 3170,
        availablePoints: 12580,
        nextMilestone: 25000,
        pointsToNext: 12420,
        recentTransactions: [
          {
            id: '1',
            transaction_type: 'earning',
            points_earned: 250,
            description: 'Earned from Amazon purchase',
            created_at: '2024-01-15T10:30:00Z',
          },
          {
            id: '2',
            transaction_type: 'earning',
            points_earned: 480,
            description: 'Earned from dining at restaurant',
            created_at: '2024-01-14T19:45:00Z',
          },
        ],
        redeemableOffers: [
          {
            id: 'cashback-500',
            title: '₹500 Cashback',
            description: 'Direct cashback to your account',
            pointsRequired: 5000,
            type: 'cashback',
            value: 500,
          },
          {
            id: 'bill-discount-1000',
            title: '₹1000 Bill Discount',
            description: 'Apply as discount to your next bill',
            pointsRequired: 10000,
            type: 'bill_discount',
            value: 1000,
          },
          {
            id: 'cashback-2500',
            title: '₹2500 Cashback',
            description: 'Premium cashback reward',
            pointsRequired: 25000,
            type: 'cashback',
            value: 2500,
          },
        ],
      },
    };
  }

  // Default mock response
  return { success: true, data: {}, message: 'Mock response' };
};

// -------------------- APIs -------------------- //

// Authentication API
export const authAPI = {
  login: async (email: string, password: string) => {
    if (isMockMode()) {
      const mockResponse = {
        success: true,
        data: {
          accessToken: 'demo_jwt_token_' + Date.now(),
          user: { id: '550e8400-e29b-41d4-a716-446655440000', name: 'John Doe', email },
        },
      };
      setAuthToken(mockResponse.data.accessToken);
      localStorage.setItem(USER_KEY, JSON.stringify(mockResponse.data.user));
      return mockResponse;
    }

    const resp = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Support all shapes: {data:{accessToken,user}} OR {accessToken,user} OR {token}
    const token =
      (resp as any)?.data?.accessToken ??
      (resp as any)?.accessToken ??
      (resp as any)?.token;

    const user =
      (resp as any)?.data?.user ??
      (resp as any)?.user ??
      { id: 'unknown', name: 'User', email };

    if (!token) throw new Error('No token from server');

    setAuthToken(token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    return { success: true, data: { token, user } };
  },

  register: async (name: string, email: string, password: string) => {
    if (isMockMode()) {
      const mockResponse = {
        success: true,
        data: {
          accessToken: 'demo_jwt_token_' + Date.now(),
          user: { id: 'new_user_' + Date.now(), name, email, isNewUser: true },
        },
      };
      setAuthToken(mockResponse.data.accessToken);
      localStorage.setItem(USER_KEY, JSON.stringify(mockResponse.data.user));
      return mockResponse;
    }

    const resp = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });

    const token =
      (resp as any)?.data?.accessToken ??
      (resp as any)?.accessToken ??
      (resp as any)?.token;

    const user =
      (resp as any)?.data?.user ??
      (resp as any)?.user ??
      { id: (resp as any)?.id || 'unknown', name, email };

    if (!token) throw new Error('No token from server');

    setAuthToken(token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    return { success: true, data: { token, user } };
  },

  logout: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

// Accounts API
export const accountsAPI = {
  getAccounts: async (userId?: string) => {
    try {
      return await apiRequest('/accounts');
    } catch (error) {
      console.error('Get accounts error:', error);
      // Get the current balance from user-specific localStorage or use default
      const currentBalance = getUserOutstandingBalance(userId);
      const availableCredit = 500000 - currentBalance;
      
      return {
        success: true,
        data: [
          {
            // use a numeric id that matches backend/prisma (1) or explicit cardId
            id: 1,
            cardId: 1, // include both for safety
            cardNumber: '****-****-****-9012',
            cardType: 'Platinum',
            creditLimit: 500000,
            outstandingBalance: currentBalance,
            availableCredit: availableCredit,
          },
        ],
      };
    }
  },

  getAccount: async (accountId: string, userId?: string) => {
    try {
      return await apiRequest(`/accounts/${accountId}`);
    } catch (error) {
      console.error('Get account error:', error);
      // Get the current balance from user-specific localStorage or use default
      const currentBalance = getUserOutstandingBalance(userId);
      const availableCredit = 500000 - currentBalance;
      
      return {
        success: true,
        data: {
          id: accountId,
          cardNumber: '****-****-****-9012',
          cardType: 'Platinum',
          creditLimit: 500000,
          outstandingBalance: currentBalance,
          availableCredit: availableCredit,
          status: 'active',
        },
      };
    }
  },
};

// Payments API (demo behaviors kept)
export const paymentsAPI = {
  createPayment: async (accountId: string | number, amount: number, method: string) => {
    try {
      if (!accountId) throw new Error('Missing accountId');
      if (!amount || amount <= 0) throw new Error('Invalid amount');
      if (!['bank', 'card', 'instant'].includes(method)) throw new Error('Invalid payment method');

      // Ensure numeric cardId for backend
      const cardId = Number(accountId);
      if (Number.isNaN(cardId)) throw new Error('Invalid accountId. Must be a numeric card id.');

      // Idempotency key to avoid duplicate payments in retries
      const idempotencyKey = `idemp_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;

      const resp = await apiRequest('/payments', {
        method: 'POST',
        headers: {
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          cardId,
          amount,
          method,
        }),
      });

      return resp;
    } catch (error) {
      console.error('createPayment error:', error);

      
      // Mock payment response when backend fails
      console.log('Using mock payment response due to backend error');
      return {
        success: true,
        data: {
          paymentId: `PAY_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
          amount: amount,
          method: method,
          status: 'success',
          timestamp: new Date().toISOString(),
        },
        message: 'Payment processed successfully (mock mode)'
      };
    }
  },

  getPayment: async (paymentId: string) => apiRequest(`/payments/${paymentId}`),
  getUserPayments: async () => apiRequest('/payments'),
  getReceipt: async (paymentId: string) => apiRequest(`/payments/${paymentId}/receipt`),
  webhook: async (paymentId: string, status: string, externalId?: string) =>
    apiRequest('/payments/webhook', { method: 'POST', body: JSON.stringify({ paymentId, status, externalId }) }),
};

// Health check
export const healthAPI = {
  check: async () => {
    try {
      // if API_BASE_URL ends with /api, hit /api/health; otherwise just /health
      const url = API_BASE_URL ? `${API_BASE_URL}/health`.replace('//health', '/health') : '/api/health';
      return fetch(url).then((res) => res.json());
    } catch (error) {
      console.error('Health check error:', error);
      return { success: false, message: 'Service unavailable' };
    }
  },
};

// Profile API
export const profileAPI = {
  getProfile: async () => apiRequest('/profile'),
  updateContact: async (phone: string, address: string) =>
    apiRequest('/profile/contact', { method: 'PUT', body: JSON.stringify({ phone, address }) }),
  changePassword: async (currentPassword: string, newPassword: string) =>
    apiRequest('/profile/password', { method: 'PUT', body: JSON.stringify({ currentPassword, newPassword }) }),
};

// Cards API (includes submitApplication for Apply flow)
export const cardsAPI = {
  blockCard: async (cardId: string, action: 'block' | 'unblock') =>
    apiRequest(`/cards/${cardId}/block`, { method: 'PUT', body: JSON.stringify({ action }) }),

  getCardStatus: async (cardId: string) => apiRequest(`/cards/${cardId}/status`),

  // For Apply Card page (expects backend route POST /cards/applications with multipart/form-data)
  submitApplication: async (formData: FormData) =>
    apiRequest('/cards/apply', { method: 'POST', body: formData }),
};

// Rewards API (named export because hooks import it as { rewardsAPI })
export const rewardsAPI = {
  getRewards: async () => {
    try {
      return await apiRequest('/rewards');
    } catch (error) {
      console.error('Get rewards error:', error);
      // Mock fallback so UI works without backend
      return {
        success: true,
        data: {
          totalPoints: 15750,
          redeemedPoints: 3170,
          availablePoints: 12580,
          nextMilestone: 25000,
          pointsToNext: 12420,
          recentTransactions: [
            {
              id: '1',
              transaction_type: 'earning',
              points_earned: 250,
              description: 'Earned from Amazon purchase',
              created_at: '2024-01-15T10:30:00Z',
            },
            {
              id: '2',
              transaction_type: 'earning',
              points_earned: 480,
              description: 'Earned from dining at restaurant',
              created_at: '2024-01-14T19:45:00Z',
            },
          ],
          redeemableOffers: [
            {
              id: 'cashback-500',
              title: '₹500 Cashback',
              description: 'Direct cashback to your account',
              pointsRequired: 5000,
              type: 'cashback',
              value: 500,
            },
            {
              id: 'bill-discount-1000',
              title: '₹1000 Bill Discount',
              description: 'Apply as discount to your next bill',
              pointsRequired: 10000,
              type: 'bill_discount',
              value: 1000,
            },
            {
              id: 'cashback-2500',
              title: '₹2500 Cashback',
              description: 'Premium cashback reward',
              pointsRequired: 25000,
              type: 'cashback',
              value: 2500,
            },
          ],
        },
      };
    }
  },

  redeemReward: async (
    offerId: string,
    pointsRequired: number,
    rewardType: string,
    rewardValue: number
  ) => {
    try {
      return await apiRequest('/rewards/redeem', {
        method: 'POST',
        body: JSON.stringify({ offerId, pointsRequired, rewardType, rewardValue }),
      });
    } catch (error) {
      console.error('Redeem reward error:', error);
      // Keep the UI flowing in mock mode
      return { success: true };
    }
  },
};

// Analytics API (MVP)
export const analyticsAPI = {
  getSummary: async () => {
    try {
      return await apiRequest('/analytics/summary');
    } catch (error) {
      console.error('Analytics summary error:', error);
      // Mock fallback mirroring backend mock
      return {
        success: true,
        data: {
          totalSpent: 24300,
          avgMonthly: 18200,
          rewardsEarned: 243,
          transactions: 47,
          byMonth: [
            { month: 'Jan', spent: 12500 },
            { month: 'Feb', spent: 15200 },
            { month: 'Mar', spent: 18900 },
            { month: 'Apr', spent: 14300 },
            { month: 'May', spent: 22100 },
            { month: 'Jun', spent: 19800 },
          ],
          byCategory: [
            { category: 'Food & Dining', amount: 8500, percent: 35 },
            { category: 'Shopping', amount: 6200, percent: 26 },
            { category: 'Transport', amount: 3800, percent: 16 },
            { category: 'Entertainment', amount: 2900, percent: 12 },
            { category: 'Bills', amount: 2600, percent: 11 },
          ],
        },
        message: 'Mock analytics data',
      };
    }
  },
};

// Activities API
export const activitiesAPI = {
  getActivities: async (params?: { limit?: number; offset?: number; type?: string }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());
      if (params?.type) queryParams.append('type', params.type);

      const response = await apiRequest(`/activities?${queryParams.toString()}`);
      return response;
    } catch (error) {
      console.error('Error fetching activities:', error);
      // Return mock data for development
      return {
        success: true,
        data: {
          activities: [
            {
              id: 1,
              type: 'PAYMENT',
              title: 'Payment Made',
              description: 'Payment of ₹5,000 made via bank transfer',
              metadata: { amount: 5000, method: 'bank' },
              status: 'SUCCESS',
              createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            },
            {
              id: 2,
              type: 'CARD_BLOCKED',
              title: 'Card Blocked',
              description: 'Card ending in 9012 has been blocked - User requested',
              metadata: { cardNumber: '9012', reason: 'User requested' },
              status: 'SUCCESS',
              createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            },
            {
              id: 3,
              type: 'LOGIN',
              title: 'Login',
              description: 'Login from new device',
              metadata: { deviceInfo: 'Chrome on macOS' },
              status: 'SUCCESS',
              createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
            },
            {
              id: 4,
              type: 'PROFILE_UPDATE',
              title: 'Profile Updated',
              description: 'Contact information has been updated',
              metadata: { field: 'Contact information' },
              status: 'SUCCESS',
              createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
            },
            {
              id: 5,
              type: 'TWO_FA_ENABLED',
              title: 'Two-Factor Authentication Enabled',
              description: 'Two-factor authentication has been enabled',
              metadata: {},
              status: 'SUCCESS',
              createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks ago
            },
          ],
          pagination: {
            total: 5,
            limit: 10,
            offset: 0,
            hasMore: false,
          },
        },
      };
    }
  },

  getActivityTypes: async () => {
    try {
      const response = await apiRequest('/activities/types');
      return response;
    } catch (error) {
      console.error('Error fetching activity types:', error);
      return {
        success: true,
        data: {
          types: ['PAYMENT', 'CARD_BLOCKED', 'CARD_UNBLOCKED', 'LOGIN', 'PROFILE_UPDATE', 'TWO_FA_ENABLED'],
        },
      };
    }
  },

  getActivityStats: async (period?: number) => {
    try {
      const queryParams = period ? `?period=${period}` : '';
      const response = await apiRequest(`/activities/stats${queryParams}`);
      return response;
    } catch (error) {
      console.error('Error fetching activity stats:', error);
      return {
        success: true,
        data: {
          period: '30 days',
          totalActivities: 5,
          activityStats: [
            { type: 'PAYMENT', count: 2 },
            { type: 'CARD_BLOCKED', count: 1 },
            { type: 'LOGIN', count: 1 },
            { type: 'PROFILE_UPDATE', count: 1 },
          ],
          mostRecent: {
            type: 'PAYMENT',
            title: 'Payment Made',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          },
        },
      };
    }
  },
};

// Export utility functions individually
export { getUserOutstandingBalance, setUserOutstandingBalance, getUserBalanceKey };

// Single default export (kept for existing imports)
export default {
  auth: authAPI,
  accounts: accountsAPI,
  payments: paymentsAPI,
  profile: profileAPI,
  cards: cardsAPI,
  rewards: rewardsAPI, // <-- important: also expose in default export
  health: healthAPI,
  analytics: analyticsAPI,
  activities: activitiesAPI,
  // Utility functions for user-specific balance management
  getUserOutstandingBalance,
  setUserOutstandingBalance,
  getUserBalanceKey,
};
