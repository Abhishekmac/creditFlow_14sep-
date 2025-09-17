import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@creditflow.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@creditflow.com',
      passwordHash: adminPasswordHash,
      isAdmin: true,
    },
  });

  // Create demo user
  const userPasswordHash = await bcrypt.hash('password123', 10);
  const demoUser = await prisma.user.upsert({
    where: { email: 'john.doe@example.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      passwordHash: userPasswordHash,
      isAdmin: false,
    },
  });

  // Create demo card for user
  const demoCard = await prisma.card.upsert({
    where: { number: '4532123456789012' },
    update: {},
    create: {
      userId: demoUser.id,
      number: '4532123456789012',
      last4: '9012',
      cardType: 'PLATINUM',
      status: 'ACTIVE',
      creditLimit: 500000,
      autopayEnabled: false,
    },
  });

  // Create demo rewards
  await prisma.reward.upsert({
    where: { cardId_userId: { cardId: demoCard.id, userId: demoUser.id } },
    update: {},
    create: {
      cardId: demoCard.id,
      userId: demoUser.id,
      points: 12580,
    },
  });

  // Create demo statements
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // Current month statement
  await prisma.statement.upsert({
    where: { cardId_month_year: { cardId: demoCard.id, month: currentMonth, year: currentYear } },
    update: {},
    create: {
      cardId: demoCard.id,
      month: currentMonth,
      year: currentYear,
      dueDate: new Date(currentYear, currentMonth, 25), // 25th of next month
      balance: 45320,
      minDue: 2266,
      isPaid: false,
    },
  });

  // Previous month statement (paid)
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
  
  await prisma.statement.upsert({
    where: { cardId_month_year: { cardId: demoCard.id, month: prevMonth, year: prevYear } },
    update: {},
    create: {
      cardId: demoCard.id,
      month: prevMonth,
      year: prevYear,
      dueDate: new Date(prevYear, prevMonth, 25),
      balance: 0,
      minDue: 0,
      isPaid: true,
    },
  });

  // Create demo transactions
  const transactions = [
    {
      merchant: 'Swiggy - Food Delivery',
      category: 'Food & Dining',
      amount: -480,
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      merchant: 'Amazon - Online Shopping',
      category: 'Shopping',
      amount: -2340,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      merchant: 'Uber - Ride',
      category: 'Transport',
      amount: -280,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      merchant: 'Apple store',
      category: 'Refund',
      amount: 75000,
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
    {
      merchant: 'Netflix - Subscription',
      category: 'Entertainment',
      amount: -799,
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      merchant: 'Flipkart - Electronics',
      category: 'Shopping',
      amount: -15600,
      date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    },
    {
      merchant: 'Zomato - Food Order',
      category: 'Food & Dining',
      amount: -850,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      merchant: 'Petrol Pump',
      category: 'Transport',
      amount: -3200,
      date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const transaction of transactions) {
    await prisma.transaction.create({
      data: {
        cardId: demoCard.id,
        userId: demoUser.id,
        merchant: transaction.merchant,
        category: transaction.category,
        amount: transaction.amount,
        date: transaction.date,
        status: 'SUCCESS',
      },
    });
  }

  // Create demo notifications
  const notifications = [
    {
      type: 'PAYMENT_DUE',
      title: 'Payment Due Soon',
      message: `Your credit card payment of ₹45,320 is due on ${new Date(currentYear, currentMonth, 25).toLocaleDateString()}`,
    },
    {
      type: 'PAYMENT_SUCCESS',
      title: 'Payment Successful',
      message: 'Your payment of ₹25,000 was processed successfully.',
    },
    {
      type: 'STATEMENT_GENERATED',
      title: 'Statement Ready',
      message: `Your statement for card ending in ${demoCard.last4} is ready.`,
    },
  ];

  for (const notification of notifications) {
    await prisma.notification.create({
      data: {
        userId: demoUser.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        read: Math.random() > 0.5, // Randomly mark some as read
      },
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log(`👤 Admin user: admin@creditflow.com / admin123`);
  console.log(`👤 Demo user: john.doe@example.com / password123`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });