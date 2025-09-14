import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { z } from 'zod';
import prisma from '../config/database';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import { logger } from '../config/logger';
import { NotFoundError, ValidationError, ForbiddenError } from '../middleware/errorHandler';
import { 
  createApplicationApprovedNotification, 
  createApplicationRejectedNotification,
  createCardBlockedNotification,
  createCardUnblockedNotification 
} from '../utils/notifications';
import { logActivity, createActivityData } from '../utils/activityLogger';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOADS_DIR || './uploads';
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `document-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and PDF files are allowed.'));
    }
  },
});

// Validation schemas
const applyCardSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format'),
  income: z.number().min(50000).max(10000000),
  product: z.enum(['Silver', 'Gold', 'Platinum']),
});

const updateApplicationStatusSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  reason: z.string().optional(),
});

const updateCardStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'BLOCKED']),
});

const updateAutopaySchema = z.object({
  enabled: z.boolean(),
});

const paginationSchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
});

const idParamSchema = z.object({
  id: z.string().transform(val => parseInt(val)),
});

/**
 * @swagger
 * /api/cards/apply:
 *   post:
 *     summary: Apply for a new credit card
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - pan
 *               - income
 *               - product
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               pan:
 *                 type: string
 *                 pattern: '^[A-Z]{5}[0-9]{4}[A-Z]{1}$'
 *               income:
 *                 type: number
 *                 minimum: 50000
 *                 maximum: 10000000
 *               product:
 *                 type: string
 *                 enum: [Silver, Gold, Platinum]
 *               document:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Application submitted successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/apply', authenticate, upload.single('document'), async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    
    // Parse and validate form data
    const formData = {
      fullName: req.body.fullName,
      email: req.body.email,
      pan: req.body.pan?.toUpperCase(),
      income: parseInt(req.body.income),
      product: req.body.product,
    };

    const validatedData = applyCardSchema.parse(formData);
    
    // Check for existing pending application
    const existingApplication = await prisma.cardApplication.findFirst({
      where: {
        userId,
        status: 'PENDING',
      },
    });

    if (existingApplication) {
      throw new ValidationError('You already have a pending application');
    }

    // Create application
    const application = await prisma.cardApplication.create({
      data: {
        userId,
        fullName: validatedData.fullName,
        email: validatedData.email,
        pan: validatedData.pan,
        income: validatedData.income,
        product: validatedData.product,
        document: req.file?.filename,
      },
    });

    logger.info(`Card application created: ${application.id} for user ${userId}`);

    // Log card application activity
    await logActivity(userId, createActivityData.cardApplication(validatedData.product, 'SUCCESS'));

    res.status(201).json({
      success: true,
      data: {
        applicationId: application.id,
        status: application.status,
        submittedAt: application.createdAt,
      },
      message: 'Application submitted successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/cards/apply:
 *   get:
 *     summary: Get user's card applications
 *     tags: [Cards]
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
 *     responses:
 *       200:
 *         description: Applications retrieved successfully
 */
router.get('/apply', authenticate, validateQuery(paginationSchema), async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const { page, limit } = req.query as any;
    
    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      prisma.cardApplication.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          fullName: true,
          email: true,
          product: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.cardApplication.count({
        where: { userId },
      }),
    ]);

    res.json({
      success: true,
      data: applications,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/cards/apply/{id}:
 *   get:
 *     summary: Get specific card application
 *     tags: [Cards]
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
 *         description: Application retrieved successfully
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/apply/:id', authenticate, validateParams(idParamSchema), async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const { id } = req.params as any;

    const application = await prisma.cardApplication.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!application) {
      throw new NotFoundError('Application not found');
    }

    res.json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/cards/apply/{id}/status:
 *   patch:
 *     summary: Update application status (Admin only)
 *     tags: [Cards]
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [APPROVED, REJECTED]
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Application status updated successfully
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.patch('/apply/:id/status', authenticate, requireAdmin, validateParams(idParamSchema), validateBody(updateApplicationStatusSchema), async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params as any;
    const { status, reason } = req.body;

    const application = await prisma.cardApplication.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!application) {
      throw new NotFoundError('Application not found');
    }

    if (application.status !== 'PENDING') {
      throw new ValidationError('Application has already been processed');
    }

    // Update application status
    const updatedApplication = await prisma.cardApplication.update({
      where: { id },
      data: { status },
    });

    // If approved, create a card
    if (status === 'APPROVED') {
      const cardNumber = generateCardNumber();
      const last4 = cardNumber.slice(-4);
      
      const card = await prisma.card.create({
        data: {
          userId: application.userId,
          number: cardNumber,
          last4,
          cardType: application.product.toUpperCase(),
          status: 'ACTIVE',
          creditLimit: getCreditLimitByProduct(application.product),
        },
      });

      // Create initial reward entry
      await prisma.reward.create({
        data: {
          userId: application.userId,
          cardId: card.id,
          points: 0,
        },
      });

      // Send approval notification
      await createApplicationApprovedNotification(
        application.userId,
        application.product
      );

      logger.info(`Card created for approved application: ${application.id}`);
    } else {
      // Send rejection notification
      await createApplicationRejectedNotification(
        application.userId,
        application.product
      );
    }

    logger.info(`Application ${id} status updated to ${status} by admin ${req.userId}`);

    res.json({
      success: true,
      data: updatedApplication,
      message: `Application ${status.toLowerCase()} successfully`,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/cards:
 *   get:
 *     summary: Get user's cards
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cards retrieved successfully
 */
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;

    const cards = await prisma.card.findMany({
      where: { userId },
      include: {
        rewards: true,
        _count: {
          select: {
            transactions: true,
            payments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: cards.map(card => ({
        id: card.id,
        number: `****-****-****-${card.last4}`,
        last4: card.last4,
        cardType: card.cardType,
        status: card.status,
        creditLimit: card.creditLimit,
        autopayEnabled: card.autopayEnabled,
        createdAt: card.createdAt,
        rewards: card.rewards[0] || { points: 0 },
        stats: {
          totalTransactions: card._count.transactions,
          totalPayments: card._count.payments,
        },
      })),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/cards/{id}:
 *   get:
 *     summary: Get specific card details
 *     tags: [Cards]
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
 *         description: Card retrieved successfully
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id', authenticate, validateParams(idParamSchema), async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const { id } = req.params as any;

    const card = await prisma.card.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        rewards: true,
      },
    });

    if (!card) {
      throw new NotFoundError('Card not found');
    }

    res.json({
      success: true,
      data: {
        id: card.id,
        number: `****-****-****-${card.last4}`,
        last4: card.last4,
        cardType: card.cardType,
        status: card.status,
        creditLimit: card.creditLimit,
        autopayEnabled: card.autopayEnabled,
        createdAt: card.createdAt,
        rewards: card.rewards[0] || { points: 0 },
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/cards/:id/status
router.get('/:id/status', authenticate, validateParams(idParamSchema), async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const { id } = req.params as any;

    const card = await prisma.card.findFirst({
      where: { id, userId },
      select: {
        id: true,
        last4: true,
        cardType: true,
        status: true,
        updatedAt: true,
      },
    });

    if (!card) {
      throw new NotFoundError('Card not found');
    }

    res.json({
      success: true,
      data: {
        cardId: card.id,
        status: card.status,                // ACTIVE | BLOCKED
        cardType: card.cardType,
        cardNumber: `****-****-****-${card.last4}`,
        lastUpdated: card.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
});


/**
 * @swagger
 * /api/cards/{id}/autopay:
 *   patch:
 *     summary: Toggle card autopay
 *     tags: [Cards]
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
 *               - enabled
 *             properties:
 *               enabled:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Autopay setting updated successfully
 */
router.patch('/:id/autopay', authenticate, validateParams(idParamSchema), validateBody(updateAutopaySchema), async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const { id } = req.params as any;
    const { enabled } = req.body;

    const card = await prisma.card.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!card) {
      throw new NotFoundError('Card not found');
    }

    const updatedCard = await prisma.card.update({
      where: { id },
      data: { autopayEnabled: enabled },
    });

    logger.info(`Autopay ${enabled ? 'enabled' : 'disabled'} for card ${id} by user ${userId}`);

    res.json({
      success: true,
      data: {
        id: updatedCard.id,
        autopayEnabled: updatedCard.autopayEnabled,
      },
      message: `Autopay ${enabled ? 'enabled' : 'disabled'} successfully`,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/cards/{id}/status:
 *   patch:
 *     summary: Update card status (block/unblock)
 *     tags: [Cards]
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, BLOCKED]
 *     responses:
 *       200:
 *         description: Card status updated successfully
 */
router.patch('/:id/status', authenticate, validateParams(idParamSchema), validateBody(updateCardStatusSchema), async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const { id } = req.params as any;
    const { status } = req.body;

    const card = await prisma.card.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!card) {
      throw new NotFoundError('Card not found');
    }

    const updatedCard = await prisma.card.update({
      where: { id },
      data: { status },
    });

    // Send notification
    if (status === 'BLOCKED') {
      await createCardBlockedNotification(userId, card.last4);
      // Log card blocked activity
      await logActivity(userId, createActivityData.cardBlocked(card.last4, 'User requested'));
    } else if (status === 'ACTIVE') {
      await createCardUnblockedNotification(userId, card.last4);
      // Log card unblocked activity
      await logActivity(userId, createActivityData.cardUnblocked(card.last4));
    }

    logger.info(`Card ${id} status updated to ${status} by user ${userId}`);

    res.json({
      success: true,
      data: {
        id: updatedCard.id,
        status: updatedCard.status,
        last4: updatedCard.last4,
        cardType: updatedCard.cardType,
        lastUpdated: updatedCard.updatedAt,
      },
      message: `Card ${status.toLowerCase()} successfully`,
    });
  } catch (error) {
    next(error);
  }
});

// Helper functions
function generateCardNumber(): string {
  // Generate a fake card number for demo purposes
  const prefix = '4532'; // Visa prefix
  const middle = Math.random().toString().slice(2, 10);
  const checkDigit = Math.floor(Math.random() * 10);
  return `${prefix}${middle}${checkDigit}`;
}

function getCreditLimitByProduct(product: string): number {
  switch (product.toUpperCase()) {
    case 'SILVER':
      return 100000;
    case 'GOLD':
      return 300000;
    case 'PLATINUM':
      return 500000;
    default:
      return 100000;
  }
}

export default router;