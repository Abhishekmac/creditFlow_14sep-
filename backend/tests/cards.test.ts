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

describe('Cards Routes', () => {
  let authToken: string;

  beforeEach(() => {
    jest.clearAllMocks();
    authToken = createAuthToken(1);
  });

  describe('POST /api/cards/apply', () => {
    it('should submit card application successfully', async () => {
      mockPrisma.cardApplication.findFirst.mockResolvedValue(null);
      mockPrisma.cardApplication.create.mockResolvedValue({
        id: 1,
        userId: 1,
        fullName: 'Test User',
        email: 'test@example.com',
        pan: 'ABCDE1234F',
        income: 500000,
        product: 'Gold',
        document: null,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app)
        .post('/api/cards/apply')
        .set('Authorization', `Bearer ${authToken}`)
        .field('fullName', 'Test User')
        .field('email', 'test@example.com')
        .field('pan', 'ABCDE1234F')
        .field('income', '500000')
        .field('product', 'Gold');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.applicationId).toBe(1);
      expect(response.body.data.status).toBe('PENDING');
    });

    it('should return 400 for invalid PAN format', async () => {
      const response = await request(app)
        .post('/api/cards/apply')
        .set('Authorization', `Bearer ${authToken}`)
        .field('fullName', 'Test User')
        .field('email', 'test@example.com')
        .field('pan', 'INVALID-PAN')
        .field('income', '500000')
        .field('product', 'Gold');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/cards/apply')
        .field('fullName', 'Test User')
        .field('email', 'test@example.com')
        .field('pan', 'ABCDE1234F')
        .field('income', '500000')
        .field('product', 'Gold');

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('GET /api/cards', () => {
    it('should get user cards successfully', async () => {
      const mockCards = [
        {
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
          rewards: [{ points: 12580 }],
          _count: {
            transactions: 25,
            payments: 5,
          },
        },
      ];

      mockPrisma.card.findMany.mockResolvedValue(mockCards as any);

      const response = await request(app)
        .get('/api/cards')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].number).toBe('****-****-****-9012');
      expect(response.body.data[0].last4).toBe('9012');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app).get('/api/cards');

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('PATCH /api/cards/:id/status', () => {
    it('should update card status successfully', async () => {
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

      mockPrisma.card.findFirst.mockResolvedValue(mockCard);
      mockPrisma.card.update.mockResolvedValue({
        ...mockCard,
        status: 'BLOCKED',
      });

      const response = await request(app)
        .patch('/api/cards/1/status')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'BLOCKED' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('BLOCKED');
    });

    it('should return 404 for non-existent card', async () => {
      mockPrisma.card.findFirst.mockResolvedValue(null);

      const response = await request(app)
        .patch('/api/cards/999/status')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'BLOCKED' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });
});