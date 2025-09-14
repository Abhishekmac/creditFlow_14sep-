import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validateQuery } from '../middleware/validation';
import { logger } from '../config/logger';

const router = Router();

// Validation schemas
const rewardsQuerySchema = z.object({
  cardId: z.string().optional().transform(val => val ? parseInt(val) : undefined),
});

/**
 * @swagger
 * /api/rewards:
 *   get:
 *     summary: Get user's rewards
 *     tags: [Rewards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: cardId
 *         schema:
 *           type: integer
 *         description: Filter by specific card
 *     responses:
 *       200:
 *         description: Rewards retrieved successfully
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
 *                     totalPoints:
 *                       type: number
 *                     redeemedPoints:
 *                       type: number
 *                     availablePoints:
 *                       type: number
 *                     nextMilestone:
 *                       type: number
 *                     pointsToNext:
 *                       type: number
 *                     cardRewards:
 *                       type: array
 *                       items:
 *                         type: object
 *                     recentTransactions:
 *                       type: array
 *                       items:
 *                         type: object
 *                     redeemableOffers:
 *                       type: array
 *                       items:
 *                         type: object
 */
router.get('/', authenticate, validateQuery(rewardsQuerySchema), async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const { cardId } = req.query as any;

    // Build where clause
    const where: any = { userId };
    if (cardId) where.cardId = cardId;

    // Get rewards data
    const rewards = await prisma.reward.findMany({
      where,
      include: {
        card: {
          select: {
            id: true,
            last4: true,
            cardType: true,
          },
        },
      },
    });

    // Calculate totals
    const totalPoints = rewards.reduce((sum, reward) => sum + reward.points, 0);
    
    // Mock redeemed points calculation (in real app, track redemptions)
    const redeemedPoints = Math.floor(totalPoints * 0.2); // Assume 20% redeemed
    const availablePoints = totalPoints - redeemedPoints;

    // Calculate next milestone
    const milestones = [1000, 2500, 5000, 10000, 25000, 50000, 100000];
    const nextMilestone = milestones.find(milestone => milestone > availablePoints) || null;
    const pointsToNext = nextMilestone ? nextMilestone - availablePoints : 0;

    // Get recent reward-earning transactions (mock data for demo)
    const recentTransactions = [
      {
        id: '1',
        transaction_type: 'earning',
        points_earned: 250,
        description: 'Earned from Amazon purchase',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '2',
        transaction_type: 'earning',
        points_earned: 480,
        description: 'Earned from dining at restaurant',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '3',
        transaction_type: 'redemption',
        points_redeemed: 1000,
        description: 'Redeemed for ₹500 cashback',
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    // Generate redeemable offers based on available points
    const redeemableOffers = generateRedeemableOffers(availablePoints);

    res.json({
      success: true,
      data: {
        totalPoints,
        redeemedPoints,
        availablePoints,
        nextMilestone,
        pointsToNext,
        cardRewards: rewards.map(reward => ({
          cardId: reward.cardId,
          points: reward.points,
          card: reward.card,
          updatedAt: reward.updatedAt,
        })),
        recentTransactions,
        redeemableOffers,
      },
    });
  } catch (error) {
    logger.error('Get rewards error:', error);
    next(error);
  }
});

/**
 * @swagger
 * /api/rewards/redeem:
 *   post:
 *     summary: Redeem reward points
 *     tags: [Rewards]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - offerId
 *               - pointsRequired
 *               - rewardType
 *               - rewardValue
 *             properties:
 *               offerId:
 *                 type: string
 *               pointsRequired:
 *                 type: number
 *               rewardType:
 *                 type: string
 *                 enum: [cashback, bill_discount]
 *               rewardValue:
 *                 type: number
 *     responses:
 *       200:
 *         description: Reward redeemed successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/redeem', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const { offerId, pointsRequired, rewardType, rewardValue } = req.body;

    // Get user's total available points
    const rewards = await prisma.reward.findMany({
      where: { userId },
    });

    const totalPoints = rewards.reduce((sum, reward) => sum + reward.points, 0);
    
    if (totalPoints < pointsRequired) {
      return res.status(400).json({
        error: {
          code: 'INSUFFICIENT_POINTS',
          message: `Insufficient points. You have ${totalPoints} points but need ${pointsRequired} points.`,
        },
      });
    }

    // Mock redemption process
    // In a real app, you would:
    // 1. Deduct points from user's rewards
    // 2. Process the reward (cashback, bill discount, etc.)
    // 3. Create a redemption record
    // 4. Send confirmation notification

    logger.info(`Reward redeemed: ${offerId} by user ${userId} for ${pointsRequired} points`);

    res.json({
      success: true,
      data: {
        redemptionId: `RED_${Date.now()}`,
        offerId,
        pointsRedeemed: pointsRequired,
        rewardType,
        rewardValue,
        status: 'SUCCESS',
        processedAt: new Date().toISOString(),
      },
      message: 'Reward redeemed successfully',
    });
  } catch (error) {
    logger.error('Redeem reward error:', error);
    next(error);
  }
});

// Helper function to generate redeemable offers
function generateRedeemableOffers(availablePoints: number) {
  const allOffers = [
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
    {
      id: 'bill-discount-5000',
      title: '₹5000 Bill Discount',
      description: 'Huge discount on your next statement',
      pointsRequired: 50000,
      type: 'bill_discount',
      value: 5000,
    },
    {
      id: 'cashback-250',
      title: '₹250 Cashback',
      description: 'Quick cashback reward',
      pointsRequired: 2500,
      type: 'cashback',
      value: 250,
    },
  ];

  // Return offers that user can afford, sorted by points required
  return allOffers
    .filter(offer => offer.pointsRequired <= availablePoints * 1.2) // Show some offers slightly above current points
    .sort((a, b) => a.pointsRequired - b.pointsRequired);
}

export default router;