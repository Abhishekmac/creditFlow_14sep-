import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validateQuery, validateParams } from '../middleware/validation';
import { logger } from '../config/logger';
import { NotFoundError } from '../middleware/errorHandler';

const router = Router();

// Validation schemas
const statementQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  cardId: z.string().optional().transform(val => val ? parseInt(val) : undefined),
});

const idParamSchema = z.object({
  id: z.string().transform(val => parseInt(val)),
});

/**
 * @swagger
 * /api/statements:
 *   get:
 *     summary: Get user's statements
 *     tags: [Statements]
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
 *         name: cardId
 *         schema:
 *           type: integer
 *         description: Filter by specific card
 *     responses:
 *       200:
 *         description: Statements retrieved successfully
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
 *                     $ref: '#/components/schemas/Statement'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 */
router.get('/', authenticate, validateQuery(statementQuerySchema), async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const { page, limit, cardId } = req.query as any;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      card: {
        userId,
      },
    };

    if (cardId) {
      where.cardId = cardId;
    }

    const [statements, total] = await Promise.all([
      prisma.statement.findMany({
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
        orderBy: [
          { year: 'desc' },
          { month: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.statement.count({ where }),
    ]);

    res.json({
      success: true,
      data: statements.map(statement => ({
        id: statement.id,
        cardId: statement.cardId,
        month: statement.month,
        year: statement.year,
        dueDate: statement.dueDate,
        balance: statement.balance,
        minDue: statement.minDue,
        isPaid: statement.isPaid,
        card: statement.card,
        createdAt: statement.createdAt,
        updatedAt: statement.updatedAt,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Get statements error:', error);
    next(error);
  }
});

/**
 * @swagger
 * /api/statements/{id}:
 *   get:
 *     summary: Get specific statement details
 *     tags: [Statements]
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
 *         description: Statement retrieved successfully
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id', authenticate, validateParams(idParamSchema), async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const { id } = req.params as any;

    const statement = await prisma.statement.findFirst({
      where: {
        id,
        card: {
          userId,
        },
      },
      include: {
        card: {
          select: {
            id: true,
            last4: true,
            cardType: true,
            creditLimit: true,
          },
        },
      },
    });

    if (!statement) {
      throw new NotFoundError('Statement not found');
    }

    // Get transactions for this statement period
    const startDate = new Date(statement.year, statement.month - 1, 1);
    const endDate = new Date(statement.year, statement.month, 0, 23, 59, 59);

    const transactions = await prisma.transaction.findMany({
      where: {
        cardId: statement.cardId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    res.json({
      success: true,
      data: {
        ...statement,
        transactions: transactions.map(transaction => ({
          id: transaction.id,
          date: transaction.date,
          description: transaction.description || transaction.merchant,
          merchant: transaction.merchant,
          category: transaction.category,
          amount: transaction.amount,
          status: transaction.status.toLowerCase(),
        })),
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;