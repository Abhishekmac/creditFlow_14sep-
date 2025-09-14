import { Router } from 'express';
import prisma from '../prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { logger } from '../config/logger';

const router = Router();

/**
 * GET /api/activities
 * Get recent activities for the authenticated user
 */
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const { limit = 10, offset = 0, type } = req.query;

    // Build where clause
    const where: any = { userId };
    if (type && typeof type === 'string') {
      where.type = type;
    }

    // Fetch activities
    const activities = await prisma.activity.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string) || 10,
      skip: parseInt(offset as string) || 0,
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
        metadata: true,
        status: true,
        createdAt: true,
      },
    });

    // Get total count for pagination
    const totalCount = await prisma.activity.count({ where });

    logger.info(`Fetched ${activities.length} activities for user ${userId}`, {
      userId,
      limit,
      offset,
      type,
    });

    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          total: totalCount,
          limit: parseInt(limit as string) || 10,
          offset: parseInt(offset as string) || 0,
          hasMore: totalCount > (parseInt(offset as string) || 0) + (parseInt(limit as string) || 10),
        },
      },
    });
  } catch (error) {
    logger.error('Error fetching activities:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user?.id,
    });

    res.status(500).json({
      success: false,
      message: 'Failed to fetch activities',
    });
  }
});

/**
 * GET /api/activities/types
 * Get available activity types
 */
router.get('/types', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    // Get unique activity types for this user
    const activityTypes = await prisma.activity.findMany({
      where: { userId },
      select: { type: true },
      distinct: ['type'],
      orderBy: { type: 'asc' },
    });

    const types = activityTypes.map((activity: any) => activity.type);

    res.json({
      success: true,
      data: { types },
    });
  } catch (error) {
    logger.error('Error fetching activity types:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user?.id,
    });

    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity types',
    });
  }
});

/**
 * GET /api/activities/stats
 * Get activity statistics for the authenticated user
 */
router.get('/stats', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const { period = '30' } = req.query; // days
    const days = parseInt(period as string) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get activity counts by type
    const activityStats = await prisma.activity.groupBy({
      by: ['type'],
      where: {
        userId,
        createdAt: { gte: startDate },
      },
      _count: { type: true },
      orderBy: { _count: { type: 'desc' } },
    });

    // Get total activities in period
    const totalActivities = await prisma.activity.count({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
    });

    // Get most recent activity
    const mostRecent = await prisma.activity.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        type: true,
        title: true,
        createdAt: true,
      },
    });

    res.json({
      success: true,
      data: {
        period: `${days} days`,
        totalActivities,
        activityStats: activityStats.map((stat: any) => ({
          type: stat.type,
          count: stat._count.type,
        })),
        mostRecent,
      },
    });
  } catch (error) {
    logger.error('Error fetching activity stats:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user?.id,
    });

    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity statistics',
    });
  }
});

export default router;
