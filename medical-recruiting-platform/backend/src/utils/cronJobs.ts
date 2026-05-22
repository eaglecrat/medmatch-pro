import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { logger } from './logger';
import { NotificationService } from '../services/notificationService';

const prisma = new PrismaClient();
const notificationService = new NotificationService();

export function startCronJobs() {
  // Check for expiring credentials daily at 9 AM
  cron.schedule('0 9 * * *', async () => {
    logger.info('Running credential expiry check...');
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiring = await prisma.credential.findMany({
      where: {
        expiryDate: { lte: thirtyDaysFromNow, gt: new Date() },
        status: 'ACTIVE'
      },
      include: { provider: { include: { user: true } } }
    });

    for (const cred of expiring) {
      await notificationService.createNotification({
        userId: cred.provider.user.id,
        type: 'CREDENTIAL_EXPIRING',
        title: 'Credential Expiring Soon',
        message: `Your ${cred.title} expires on ${cred.expiryDate?.toDateString()}`,
        data: { credentialId: cred.id, expiryDate: cred.expiryDate }
      });
    }

    logger.info(`Notified ${expiring.length} providers of expiring credentials`);
  });

  // Check for expired credentials daily at 9:30 AM
  cron.schedule('30 9 * * *', async () => {
    logger.info('Running expired credential check...');
    const expired = await prisma.credential.findMany({
      where: { expiryDate: { lt: new Date() }, status: 'ACTIVE' }
    });

    for (const cred of expired) {
      await prisma.credential.update({
        where: { id: cred.id },
        data: { status: 'EXPIRED', verificationStatus: 'EXPIRED' }
      });
    }

    logger.info(`Marked ${expired.length} credentials as expired`);
  });

  // Clean up old notifications weekly
  cron.schedule('0 0 * * 0', async () => {
    logger.info('Running notification cleanup...');
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const deleted = await prisma.notification.deleteMany({
      where: { isRead: true, createdAt: { lt: ninetyDaysAgo } }
    });

    logger.info(`Deleted ${deleted.count} old notifications`);
  });

  // Update job statuses (expire old jobs)
  cron.schedule('0 2 * * *', async () => {
    logger.info('Running job expiration check...');
    const now = new Date();

    const expired = await prisma.job.updateMany({
      where: { expiresAt: { lt: now }, status: 'ACTIVE' },
      data: { status: 'EXPIRED' }
    });

    logger.info(`Expired ${expired.count} jobs`);
  });

  logger.info('Cron jobs scheduled successfully');
}
