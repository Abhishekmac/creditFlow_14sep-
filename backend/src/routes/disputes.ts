import { Router } from 'express';
import prisma from '../prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Raise a dispute
router.post('/:transactionId', authenticate, async (req: AuthRequest, res) => {
  const { transactionId } = req.params;
  const { reason } = req.body;
  const dispute = await prisma.dispute.create({
    data: {
      transactionId: Number(transactionId),
      userId: req.userId!,
      reason,
    },
  });
  res.json(dispute);
});

// Track dispute status
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const dispute = await prisma.dispute.findFirst({
    where: { id: Number(id), userId: req.userId },
  });
  if (!dispute) return res.status(404).json({ error: 'Not found' });
  res.json(dispute);
});

export default router;
