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

describe('Payments Routes', () => {
  let authToken: string;

  beforeEach(() => {
    jest.clearAllMocks();
    authToken = createAuthToken(1);
  });

  describe('POST /api/payments', () => {
    it('should create payment successfully', async () => {
      const mockCard = {
        id: 1,
        userId: 1,
        number: '4532123456789012',
        last4: '9012',
        cardType: 'PLATINUM',
        status: 'ACTIVE',
        creditLimit: 500000,
        autopayEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockStatements = [
        {
          id: 1,
          cardId: 1,
          month: 1,
          year: 2024,
          dueDate: new Date(),
          balance: 45320,
          minDue: 2266,
          isPaid: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockPayment = {
        id: 'pay_123',
        cardId: 1,
        userId: 1,
        amount: 5000,
        method: 'bank',
        status: 'PENDING',
        externalId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.card.findFirst.mockResolvedValue(mockCard);
      mockPrisma.statement.findMany.mockResolvedValue(mockStatements);
      mockPrisma.payment.create.mockResolvedValue(mockPayment);

      const response = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          cardId: 1,
          amount: 5000,
          method: 'bank',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.amount).toBe(5000);
      expect(response.body.data.method).toBe('bank');
      expect(response.body.data.status).toBe('PENDING');
    });

    it('should return 404 for non-existent card', async () => {
      mockPrisma.card.findFirst.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          cardId: 999,
          amount: 5000,
          method: 'bank',
        });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 403 for blocked card', async () => {
      const mockCard = {
        id: 1,
        userId: 1,
        number: '4532123456789012',
        last4: '9012',
        cardType: 'PLATINUM',
        status: 'BLOCKED',
        creditLimit: 500000,
        autopayEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.card.findFirst.mockResolvedValue(mockCard);

      const response = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          cardId: 1,
          amount: 5000,
          method: 'bank',
        });

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('should return 400 for amount exceeding outstanding balance', async () => {
      const mockCard = {
        id: 1,
        userId: 1,
        number: '4532123456789012',
        last4: '9012',
        cardType: 'PLATINUM',
        status: 'ACTIVE',
        creditLimit: 500000,
        autopayEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockStatements = [
        {
          id: 1,
          cardId: 1,
          month: 1,
          year: 2024,
          dueDate: new Date(),
          balance: 1000, // Low balance
          minDue: 100,
          isPaid: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.card.findFirst.mockResolvedValue(mockCard);
      mockPrisma.statement.findMany.mockResolvedValue(mockStatements);

      const response = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          cardId: 1,
          amount: 5000, // Exceeds balance
          method: 'bank',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/payments', () => {
    it('should get user payments successfully', async () => {
      const mockPayments = [
        {
          id: 'pay_123',
          cardId: 1,
          userId: 1,
          amount: 5000,
          method: 'bank',
          status: 'SUCCESS',
          externalId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          card: {
            last4: '9012',
            cardType: 'PLATINUM',
          },
        },
      ];

      mockPrisma.payment.findMany.mockResolvedValue(mockPayments as any);
      mockPrisma.payment.count.mockResolvedValue(1);

      const response = await request(app)
        .get('/api/payments')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].amount).toBe(5000);
      expect(response.body.data[0].status).toBe('success');
    });

    it('should filter payments by status', async () => {
      mockPrisma.payment.findMany.mockResolvedValue([]);
      mockPrisma.payment.count.mockResolvedValue(0);

      const response = await request(app)
        .get('/api/payments?status=SUCCESS')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockPrisma.payment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'SUCCESS',
          }),
        })
      );
    });
  });
});