import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validateQuery, validateParams, validateBody } from '../middleware/validation';
import { logger } from '../config/logger';
import { NotFoundError, ForbiddenError } from '../middleware/errorHandler';
import { createDisputeCreatedNotification } from '../utils/notifications';

const router = Router();

// Validation schemas
const transactionQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  sortBy: z.enum(['date', 'amount']).optional().default('date'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  startDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  endDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  minAmount: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  maxAmount: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  merchant: z.string().optional(),
  cardId: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  status: z.enum(['SUCCESS', 'PENDING', 'FAILED']).optional(),
  q: z.string().optional(), // Search query
});

const idParamSchema = z.object({
  id: z.string().transform(val => parseInt(val)),
});

const createDisputeSchema = z.object({
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(500),
});

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Get transactions with filters
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [date, amount]
 *           default: date
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: minAmount
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxAmount
 *         schema:
 *           type: number
 *       - in: query
 *         name: merchant
 *         schema:
 *           type: string
 *       - in: query
 *         name: cardId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [SUCCESS, PENDING, FAILED]
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query for merchant name or card last4
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transaction'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 */
router.get('/', authenticate, validateQuery(transactionQuerySchema), async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const {
      page,
      limit,
      sortBy,
      order,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      merchant,
      cardId,
      status,
      q
    } = req.query as any;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      userId,
    };

    // Card filter
    if (cardId) {
      where.cardId = cardId;
    }

    // Date range filter
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    // Amount range filter
    if (minAmount !== undefined || maxAmount !== undefined) {
      where.amount = {};
      if (minAmount !== undefined) where.amount.gte = minAmount;
      if (maxAmount !== undefined) where.amount.lte = maxAmount;
    }

    // Merchant filter
    if (merchant) {
      where.merchant = {
        contains: merchant,
        mode: 'insensitive',
      };
    }

    // Status filter
    if (status) {
      where.status = status;
    }

    // Search query (merchant or card last4)
    if (q) {
      where.OR = [
        {
          merchant: {
            contains: q,
            mode: 'insensitive',
          },
        },
        {
          card: {
            last4: {
              contains: q,
              mode: 'insensitive',
            },
          },
        },
      ];
    }

    // Build order by
    const orderBy: any = {};
    orderBy[sortBy] = order;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
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
        orderBy,
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    res.json({
      success: true,
      data: transactions.map(transaction => ({
        id: transaction.id,
        date: transaction.date,
        description: transaction.description || transaction.merchant,
        merchant: transaction.merchant,
        category: transaction.category,
        amount: transaction.amount,
        status: transaction.status.toLowerCase(),
        card: {
          id: transaction.card.id,
          last4: transaction.card.last4,
          cardType: transaction.card.cardType,
        },
        createdAt: transaction.createdAt,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Get transactions error:', error);
    next(error);
  }
});

/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     summary: Get specific transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Transaction retrieved successfully
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id', authenticate, validateParams(idParamSchema), async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const { id } = req.params as any;

    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        card: {
          select: {
            id: true,
            last4: true,
            cardType: true,
          },
        },
        disputes: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundError('Transaction not found');
    }

    res.json({
      success: true,
      data: {
        id: transaction.id,
        date: transaction.date,
        description: transaction.description || transaction.merchant,
        merchant: transaction.merchant,
        category: transaction.category,
        amount: transaction.amount,
        status: transaction.status.toLowerCase(),
        card: {
          id: transaction.card.id,
          last4: transaction.card.last4,
          cardType: transaction.card.cardType,
        },
        disputes: transaction.disputes,
        createdAt: transaction.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/transactions/{id}/dispute:
 *   post:
 *     summary: Create a dispute for a transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 500
 *     responses:
 *       201:
 *         description: Dispute created successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post('/:id/dispute', authenticate, validateParams(idParamSchema), validateBody(createDisputeSchema), async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const { id } = req.params as any;
    const { reason } = req.body;

    // Check if transaction exists and belongs to user
    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!transaction) {
      throw new NotFoundError('Transaction not found');
    }

    // Check if dispute already exists for this transaction
    const existingDispute = await prisma.dispute.findFirst({
      where: {
        transactionId: id,
        userId,
        status: {
          in: ['OPEN', 'INVESTIGATING'],
        },
      },
    });

    if (existingDispute) {
      throw new ForbiddenError('A dispute is already open for this transaction');
    }

    // Create dispute
    const dispute = await prisma.dispute.create({
      data: {
        transactionId: id,
        userId,
        reason,
        status: 'OPEN',
      },
    });

    // Send notification
    await createDisputeCreatedNotification(
      userId,
      id,
      Math.abs(transaction.amount)
    );

    logger.info(`Dispute created: ${dispute.id} for transaction ${id} by user ${userId}`);

    res.status(201).json({
      success: true,
      data: dispute,
      message: 'Dispute created successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;