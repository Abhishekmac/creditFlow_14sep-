import request from 'supertest';
import app from '../src/index';
import prisma from '../src/config/database';
import jwt from 'jsonwebtoken';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const createAuthToken = (userId: number) => {
  return jwt.sign(
    { userId, email: 'test@example.com', name: 'Test User', isAdmin: false },
    process.env.JWT_SECRET || 'test-secret'
  );
};

describe('Transactions Routes', () => {
  let authToken: string;

  beforeEach(() => {
    jest.clearAllMocks();
    authToken = createAuthToken(1);
  });

  describe('GET /api/transactions', () => {
    it('should get transactions successfully', async () => {
      const mockTransactions = [
        {
          id: 1,
          cardId: 1,
          userId: 1,
          amount: -480,
          merchant: 'Swiggy - Food Delivery',
          category: 'Food & Dining',
          description: 'Food order',
          date: new Date(),
          status: 'SUCCESS',
          createdAt: new Date(),
          card: {
            id: 1,
            last4: '9012',
            cardType: 'PLATINUM',
          },
        },
      ];

      mockPrisma.transaction.findMany.mockResolvedValue(mockTransactions as any);
      mockPrisma.transaction.count.mockResolvedValue(1);

      const response = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].merchant).toBe('Swiggy - Food Delivery');
      expect(response.body.data[0].status).toBe('success');
    });

    it('should filter transactions by date range', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([]);
      mockPrisma.transaction.count.mockResolvedValue(0);

      const startDate = '2024-01-01';
      const endDate = '2024-01-31';

      const response = await request(app)
        .get(`/api/transactions?startDate=${startDate}&endDate=${endDate}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            date: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          }),
        })
      );
    });

    it('should filter transactions by amount range', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([]);
      mockPrisma.transaction.count.mockResolvedValue(0);

      const response = await request(app)
        .get('/api/transactions?minAmount=100&maxAmount=1000')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            amount: {
              gte: 100,
              lte: 1000,
            },
          }),
        })
      );
    });

    it('should search transactions by merchant', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([]);
      mockPrisma.transaction.count.mockResolvedValue(0);

      const response = await request(app)
        .get('/api/transactions?q=swiggy')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              {
                merchant: {
                  contains: 'swiggy',
                  mode: 'insensitive',
                },
              },
            ]),
          }),
        })
      );
    });

    it('should sort transactions by amount', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([]);
      mockPrisma.transaction.count.mockResolvedValue(0);

      const response = await request(app)
        .get('/api/transactions?sortBy=amount&order=asc')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: {
            amount: 'asc',
          },
        })
      );
    });
  });

  describe('GET /api/transactions/:id', () => {
    it('should get specific transaction successfully', async () => {
      const mockTransaction = {
        id: 1,
        cardId: 1,
        userId: 1,
        amount: -480,
        merchant: 'Swiggy - Food Delivery',
        category: 'Food & Dining',
        description: 'Food order',
        date: new Date(),
        status: 'SUCCESS',
        createdAt: new Date(),
        card: {
          id: 1,
          last4: '9012',
          cardType: 'PLATINUM',
        },
        disputes: [],
      };

      mockPrisma.transaction.findFirst.mockResolvedValue(mockTransaction as any);

      const response = await request(app)
        .get('/api/transactions/1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(1);
      expect(response.body.data.merchant).toBe('Swiggy - Food Delivery');
    });

    it('should return 404 for non-existent transaction', async () => {
      mockPrisma.transaction.findFirst.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/transactions/999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('POST /api/transactions/:id/dispute', () => {
    it('should create dispute successfully', async () => {
      const mockTransaction = {
        id: 1,
        cardId: 1,
        userId: 1,
        amount: -480,
        merchant: 'Swiggy - Food Delivery',
        category: 'Food & Dining',
        description: 'Food order',
        date: new Date(),
        status: 'SUCCESS',
        createdAt: new Date(),
      };

      const mockDispute = {
        id: 1,
        transactionId: 1,
        userId: 1,
        reason: 'Unauthorized transaction',
        status: 'OPEN',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.transaction.findFirst.mockResolvedValue(mockTransaction);
      mockPrisma.dispute.findFirst.mockResolvedValue(null);
      mockPrisma.dispute.create.mockResolvedValue(mockDispute);

      const response = await request(app)
        .post('/api/transactions/1/dispute')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reason: 'Unauthorized transaction',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.reason).toBe('Unauthorized transaction');
      expect(response.body.data.status).toBe('OPEN');
    });

    it('should return 403 if dispute already exists', async () => {
      const mockTransaction = {
        id: 1,
        cardId: 1,
        userId: 1,
        amount: -480,
        merchant: 'Swiggy - Food Delivery',
        category: 'Food & Dining',
        description: 'Food order',
        date: new Date(),
        status: 'SUCCESS',
        createdAt: new Date(),
      };

      const existingDispute = {
        id: 1,
        transactionId: 1,
        userId: 1,
        reason: 'Previous dispute',
        status: 'OPEN',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.transaction.findFirst.mockResolvedValue(mockTransaction);
      mockPrisma.dispute.findFirst.mockResolvedValue(existingDispute);

      const response = await request(app)
        .post('/api/transactions/1/dispute')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reason: 'Another dispute reason',
        });

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('should return 400 for short reason', async () => {
      const response = await request(app)
        .post('/api/transactions/1/dispute')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reason: 'Short', // Too short
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});