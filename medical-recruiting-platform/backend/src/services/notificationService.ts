import { PrismaClient, NotificationType } from '@prisma/client';
import { SocketManager } from './socketManager';

const prisma = new PrismaClient();

export class NotificationService {
  async createNotification(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: any;
  }) {
    const notification = await prisma.notification.create({ data });
    SocketManager.emitToUser(data.userId, 'notification', notification);
    return notification;
  }

  async createBulkNotifications(notifications: Array<{
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: any;
  }>) {
    const created = await prisma.notification.createMany({ data: notifications });
    for (const n of notifications) {
      SocketManager.emitToUser(n.userId, 'notification', n);
    }
    return created;
  }

  async getUnreadCount(userId: string) {
    return prisma.notification.count({ where: { userId, isRead: false } });
  }
}
