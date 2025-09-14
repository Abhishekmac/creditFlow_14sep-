import prisma from '../config/database';
import { logger } from '../config/logger';

export enum NotificationType {
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  CARD_BLOCKED = 'CARD_BLOCKED',
  CARD_UNBLOCKED = 'CARD_UNBLOCKED',
  APPLICATION_APPROVED = 'APPLICATION_APPROVED',
  APPLICATION_REJECTED = 'APPLICATION_REJECTED',
  STATEMENT_GENERATED = 'STATEMENT_GENERATED',
  PAYMENT_DUE = 'PAYMENT_DUE',
  DISPUTE_CREATED = 'DISPUTE_CREATED',
  DISPUTE_RESOLVED = 'DISPUTE_RESOLVED',
}

interface CreateNotificationData {
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
}

export async function createNotification(data: CreateNotificationData): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
      },
    });

    logger.info(`Notification created for user ${data.userId}: ${data.type}`);
  } catch (error) {
    logger.error('Error creating notification:', error);
    // Don't throw error to avoid breaking the main flow
  }
}

export async function createPaymentSuccessNotification(
  userId: number,
  amount: number,
  cardLast4: string
): Promise<void> {
  await createNotification({
    userId,
    type: NotificationType.PAYMENT_SUCCESS,
    title: 'Payment Successful',
    message: `Your payment of ₹${amount.toLocaleString()} for card ending in ${cardLast4} was processed successfully.`,
  });
}

export async function createPaymentFailedNotification(
  userId: number,
  amount: number,
  cardLast4: string
): Promise<void> {
  await createNotification({
    userId,
    type: NotificationType.PAYMENT_FAILED,
    title: 'Payment Failed',
    message: `Your payment of ₹${amount.toLocaleString()} for card ending in ${cardLast4} could not be processed. Please try again.`,
  });
}

export async function createCardBlockedNotification(
  userId: number,
  cardLast4: string
): Promise<void> {
  await createNotification({
    userId,
    type: NotificationType.CARD_BLOCKED,
    title: 'Card Blocked',
    message: `Your card ending in ${cardLast4} has been temporarily blocked for security.`,
  });
}

export async function createCardUnblockedNotification(
  userId: number,
  cardLast4: string
): Promise<void> {
  await createNotification({
    userId,
    type: NotificationType.CARD_UNBLOCKED,
    title: 'Card Unblocked',
    message: `Your card ending in ${cardLast4} has been unblocked and is now active.`,
  });
}

export async function createApplicationApprovedNotification(
  userId: number,
  cardType: string
): Promise<void> {
  await createNotification({
    userId,
    type: NotificationType.APPLICATION_APPROVED,
    title: 'Application Approved',
    message: `Congratulations! Your ${cardType} card application has been approved. Your card will be delivered within 7-10 business days.`,
  });
}

export async function createApplicationRejectedNotification(
  userId: number,
  cardType: string
): Promise<void> {
  await createNotification({
    userId,
    type: NotificationType.APPLICATION_REJECTED,
    title: 'Application Update',
    message: `We're unable to approve your ${cardType} card application at this time. You can reapply after 30 days.`,
  });
}

export async function createStatementGeneratedNotification(
  userId: number,
  cardLast4: string,
  dueDate: Date,
  amount: number
): Promise<void> {
  await createNotification({
    userId,
    type: NotificationType.STATEMENT_GENERATED,
    title: 'Statement Ready',
    message: `Your statement for card ending in ${cardLast4} is ready. Amount due: ₹${amount.toLocaleString()} by ${dueDate.toLocaleDateString()}.`,
  });
}

export async function createPaymentDueNotification(
  userId: number,
  cardLast4: string,
  dueDate: Date,
  amount: number
): Promise<void> {
  await createNotification({
    userId,
    type: NotificationType.PAYMENT_DUE,
    title: 'Payment Due Soon',
    message: `Your payment of ₹${amount.toLocaleString()} for card ending in ${cardLast4} is due on ${dueDate.toLocaleDateString()}.`,
  });
}

export async function createDisputeCreatedNotification(
  userId: number,
  transactionId: number,
  amount: number
): Promise<void> {
  await createNotification({
    userId,
    type: NotificationType.DISPUTE_CREATED,
    title: 'Dispute Created',
    message: `Your dispute for transaction of ₹${amount.toLocaleString()} has been created. We'll investigate and get back to you within 5-7 business days.`,
  });
}

export async function createDisputeResolvedNotification(
  userId: number,
  transactionId: number,
  amount: number,
  resolution: string
): Promise<void> {
  await createNotification({
    userId,
    type: NotificationType.DISPUTE_RESOLVED,
    title: 'Dispute Resolved',
    message: `Your dispute for transaction of ₹${amount.toLocaleString()} has been resolved: ${resolution}`,
  });
}