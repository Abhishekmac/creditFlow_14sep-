import { Router } from 'express';
import prisma from '../prisma';
import { authenticate } from '../middleware/auth';
import { logger } from '../config/logger';

const router = Router();

interface AnalyticsSummary {
  totalSpent: number; // absolute spend (last 6 months)
  avgMonthly: number; // mean of last 6 months
  rewardsEarned: number; // 1% of eligible spend
  transactions: number; // count last 6 months
  byMonth: Array<{ month: string; spent: number }>; // 6 points
  byCategory: Array<{ category: string; amount: number; percent: number }>; // donut
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function sixMonthsAgo(date: Date): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() - 5); // include current month → total 6
  return startOfMonth(d);
}

function monthLabel(date: Date): string {
  return date.toLocaleString('en-US', { month: 'short' });
}

function buildEmptyByMonth(now: Date) {
  const start = sixMonthsAgo(now);
  const points: Array<{ key: string; month: string; start: Date; spent: number }> = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    points.push({ key, month: monthLabel(d), start: d, spent: 0 });
  }
  return points;
}

function computeSummary(transactions: Array<{ amount: number; category?: string | null; date: Date }>): AnalyticsSummary {
  const now = new Date();
  const periodStart = sixMonthsAgo(now);

  const inRange = transactions.filter(t => new Date(t.date) >= periodStart && new Date(t.date) <= now);

  // Eligible spend = absolute value of negative amounts (charges). Ignore refunds/credits (amount > 0)
  const eligible = inRange
    .filter(t => typeof t.amount === 'number' && t.amount < 0)
    .map(t => Math.abs(Number(t.amount)));

  const totalSpent = eligible.reduce((a, b) => a + b, 0);
  const avgMonthly = totalSpent / 6;
  const rewardsEarned = totalSpent * 0.01;

  // byMonth
  const monthBuckets = buildEmptyByMonth(now).reduce<Record<string, { label: string; spent: number }>>((acc, p) => {
    acc[p.key] = { label: p.month, spent: 0 };
    return acc;
  }, {});

  inRange.forEach(t => {
    if (t.amount < 0) {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      if (monthBuckets[key]) {
        monthBuckets[key].spent += Math.abs(Number(t.amount));
      }
    }
  });

  const byMonth = Object.values(monthBuckets).map(({ label, spent }) => ({ month: label, spent }));

  // byCategory (donut)
  const categoryTotals = new Map<string, number>();
  inRange.forEach(t => {
    if (t.amount < 0) {
      const cat = (t.category || 'Others').toString();
      categoryTotals.set(cat, (categoryTotals.get(cat) || 0) + Math.abs(Number(t.amount)));
    }
  });
  const grand = Array.from(categoryTotals.values()).reduce((a, b) => a + b, 0) || 1;
  const byCategory = Array.from(categoryTotals.entries()).map(([category, amount]) => ({
    category,
    amount,
    percent: (amount / grand) * 100,
  }));

  return {
    totalSpent,
    avgMonthly,
    rewardsEarned,
    transactions: inRange.length,
    byMonth,
    byCategory,
  };
}

function mockSummary(): AnalyticsSummary {
  // Simple deterministic mock for demo
  const now = new Date();
  const points = buildEmptyByMonth(now);
  const byMonth = points.map((p, idx) => ({ month: p.month, spent: 12000 + idx * 1800 }));
  const totalSpent = byMonth.reduce((a, b) => a + b.spent, 0);
  const avgMonthly = totalSpent / 6;
  return {
    totalSpent,
    avgMonthly,
    rewardsEarned: totalSpent * 0.01,
    transactions: 47,
    byMonth,
    byCategory: [
      { category: 'Food & Dining', amount: 8500, percent: 35 },
      { category: 'Shopping', amount: 6200, percent: 26 },
      { category: 'Transport', amount: 3800, percent: 16 },
      { category: 'Entertainment', amount: 2900, percent: 12 },
      { category: 'Bills', amount: 2600, percent: 11 },
    ],
  };
}

// GET /api/analytics/summary — authenticated; graceful mock fallback
router.get('/summary', authenticate, async (req: any, res) => {
  try {
    const userId = req.userId as number;
    const since = sixMonthsAgo(new Date());
    const tx = await prisma.transaction.findMany({
      where: { userId, date: { gte: since } },
      select: { amount: true, category: true, date: true },
      orderBy: { date: 'asc' },
    });
    const summary = computeSummary(tx as any);
    res.json({ success: true, data: summary });
  } catch (err) {
    logger.error('Analytics summary error', err as any);
    // Fallback mock so the page always works in demos
    const summary = mockSummary();
    res.json({ success: true, data: summary, message: 'Mock analytics data' });
  }
});

export default router;


