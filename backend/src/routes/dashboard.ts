import { Router } from 'express';
import prisma from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { logger } from '../config/logger';

const router = Router();

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Get dashboard data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     outstandingBalance:
 *                       type: number
 *                     totalCreditLimit:
 *                       type: number
 *                     availableCredit:
 *                       type: number
 *                     totalRewards:
 *                       type: number
 *                     cards:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Card'
 *                     recentTransactions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Transaction'
 *                     upcomingStatements:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Statement'
 */
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;

    // Get user's cards with their details
    const cards = await prisma.card.findMany({
      where: { userId },
      select: {
        id: true,
        number: true,
        last4: true,
        cardType: true,
        status: true,
        creditLimit: true,
        autopayEnabled: true,
        createdAt: true,
      },
    });

    // Calculate totals
    const totalCreditLimit = cards.reduce((sum, card) => sum + card.creditLimit, 0);

    // Get outstanding balances from statements
    const statements = await prisma.statement.findMany({
      where: {
        card: {
          userId,
        },
        isPaid: false,
      },
      include: {
        card: {
          select: {
            id: true,
            last4: true,
            cardType: true,
          },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    });

    const outstandingBalance = statements.reduce((sum, statement) => sum + statement.balance, 0);
    const availableCredit = totalCreditLimit - outstandingBalance;

    // Get total rewards
    const rewardsData = await prisma.reward.findMany({
      where: { userId },
    });
    const totalRewards = rewardsData.reduce((sum, reward) => sum + reward.points, 0);

    // Get recent transactions (last 10)
    const recentTransactions = await prisma.transaction.findMany({
      where: { userId },
      include: {
        card: {
          select: {
            last4: true,
            cardType: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
      take: 10,
    });

    // Get upcoming statements (due within 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const upcomingStatements = statements.filter(
      statement => statement.dueDate <= thirtyDaysFromNow
    );

    res.json({
      success: true,
      data: {
        outstandingBalance,
        totalCreditLimit,
        availableCredit,
        totalRewards,
        cards: cards.map(card => ({
          ...card,
          number: `****-****-****-${card.last4}`,
        })),
        recentTransactions: recentTransactions.map(transaction => ({
          id: transaction.id,
          date: transaction.date,
          description: transaction.description || transaction.merchant,
          category: transaction.category,
          amount: transaction.amount,
          status: transaction.status.toLowerCase(),
          card: {
            last4: transaction.card.last4,
            cardType: transaction.card.cardType,
          },
        })),
        upcomingStatements: upcomingStatements.map(statement => ({
          id: statement.id,
          cardId: statement.cardId,
          dueDate: statement.dueDate,
          balance: statement.balance,
          minDue: statement.minDue,
          card: statement.card,
        })),
      },
    });
  } catch (error) {
    logger.error('Dashboard error:', error);
    next(error);
  }
});

export default router;