import { Router } from 'express';
import { body } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { SocketManager } from '../services/socketManager';

const router = Router();
const prisma = new PrismaClient();

// Get conversations
router.get('/conversations', authenticate, async (req: any, res, next) => {
  try {
    const messages = await prisma.message.findMany({
      where: { OR: [{ senderId: req.user.id }, { recipientId: req.user.id }] },
      include: {
        sender: { select: { id: true, email: true, providerProfile: true, employerProfile: true } },
        recipient: { select: { id: true, email: true, providerProfile: true, employerProfile: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Group by conversation partner
    const conversations = new Map();
    messages.forEach(msg => {
      const partnerId = msg.senderId === req.user.id ? msg.recipientId : msg.senderId;
      if (!conversations.has(partnerId)) {
        conversations.set(partnerId, {
          partner: msg.senderId === req.user.id ? msg.recipient : msg.sender,
          lastMessage: msg,
          unreadCount: msg.recipientId === req.user.id && !msg.isRead ? 1 : 0
        });
      } else {
        const conv = conversations.get(partnerId);
        if (msg.recipientId === req.user.id && !msg.isRead) conv.unreadCount++;
      }
    });

    res.json(Array.from(conversations.values()));
  } catch (error) { next(error); }
});

// Get messages with specific user
router.get('/:userId', authenticate, async (req: any, res, next) => {
  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: req.user.id, recipientId: req.params.userId },
          { senderId: req.params.userId, recipientId: req.user.id }
        ]
      },
      include: {
        sender: { select: { id: true, providerProfile: { select: { firstName: true, lastName: true } }, employerProfile: { select: { companyName: true } } } }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Mark as read
    await prisma.message.updateMany({
      where: { recipientId: req.user.id, senderId: req.params.userId, isRead: false },
      data: { isRead: true, readAt: new Date() }
    });

    res.json(messages);
  } catch (error) { next(error); }
});

// Send message
router.post('/', authenticate, [
  body('recipientId').isUUID(),
  body('content').trim().notEmpty(),
  body('applicationId').optional().isUUID()
], async (req: any, res, next) => {
  try {
    const { recipientId, content, applicationId } = req.body;

    const message = await prisma.message.create({
      data: {
        senderId: req.user.id, recipientId, content,
        applicationId, isRead: false
      },
      include: {
        sender: { select: { id: true, providerProfile: true, employerProfile: true } }
      }
    });

    // Emit via Socket.IO
    SocketManager.emitToUser(recipientId, 'new_message', message);

    res.status(201).json(message);
  } catch (error) { next(error); }
});

export { router as messageRouter };
