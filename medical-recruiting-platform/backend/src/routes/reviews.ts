import { Router } from 'express';
import { body } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();
const prisma = new PrismaClient();

// Create review
router.post('/', authenticate, [
  body('rating').isInt({ min: 1, max: 5 }),
  body('providerId').optional().isUUID(),
  body('employerId').optional().isUUID(),
  body('comment').optional().trim()
], async (req: any, res, next) => {
  try {
    const { rating, providerId, employerId, comment, professionalism, communication, punctuality, skillLevel } = req.body;

    if (!providerId && !employerId) throw new AppError('Must specify providerId or employerId', 400);

    const review = await prisma.review.create({
      data: {
        reviewerId: req.user.id, rating, comment,
        providerId, employerId,
        professionalism, communication, punctuality, skillLevel
      }
    });
    res.status(201).json(review);
  } catch (error) { next(error); }
});

// Get reviews for provider
router.get('/provider/:id', async (req, res, next) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { providerId: req.params.id, isVisible: true },
      include: { employer: { select: { companyName: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reviews);
  } catch (error) { next(error); }
});

// Get reviews for employer
router.get('/employer/:id', async (req, res, next) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { employerId: req.params.id, isVisible: true },
      include: { provider: { select: { firstName: true, lastName: true, specialty: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reviews);
  } catch (error) { next(error); }
});

export { router as reviewRouter };
