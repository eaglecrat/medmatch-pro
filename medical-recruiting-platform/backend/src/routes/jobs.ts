import { Router } from 'express';
import { body, query } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { logHIPAAEvent } from '../middleware/hipaaAudit';
import { MatchingService } from '../services/matchingService';

const router = Router();
const prisma = new PrismaClient();
const matchingService = new MatchingService();

// Search jobs (public)
router.get('/search', [
  query('specialty').optional().trim(),
  query('state').optional().trim(),
  query('city').optional().trim(),
  query('type').optional().isIn(['FULL_TIME','PART_TIME','CONTRACT','TRAVEL','PER_DIEM','LOCUM_TENENS']),
  query('setting').optional().trim(),
  query('minRate').optional().isFloat(),
  query('isRemote').optional().isBoolean(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res, next) => {
  try {
    const { specialty, state, city, type, setting, minRate, isRemote, page = 1, limit = 20 } = req.query;
    const where: any = { status: 'ACTIVE' };

    if (specialty) where.specialty = { contains: specialty as string, mode: 'insensitive' };
    if (state) where.state = { contains: state as string, mode: 'insensitive' };
    if (city) where.city = { contains: city as string, mode: 'insensitive' };
    if (type) where.type = type;
    if (setting) where.setting = setting;
    if (minRate) where.hourlyRate = { gte: Number(minRate) };
    if (isRemote === 'true') where.isRemote = true;

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where, skip: (Number(page) - 1) * Number(limit), take: Number(limit),
        include: { employer: { select: { companyName: true, city: true, state: true, logoUrl: true, isVerified: true } } },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.job.count({ where })
    ]);
    res.json({ jobs, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
  } catch (error) { next(error); }
});

// Get job by ID
router.get('/:id', async (req, res, next) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: {
        employer: { select: { companyName: true, description: true, city: true, state: true, logoUrl: true, isVerified: true, website: true } },
        applications: { select: { id: true, status: true, createdAt: true, provider: { select: { firstName: true, lastName: true, specialty: true } } } }
      }
    });
    if (!job) throw new AppError('Job not found', 404);
    res.json(job);
  } catch (error) { next(error); }
});

// Create job (employer only)
router.post('/', authenticate, authorize('EMPLOYER'), [
  body('title').trim().notEmpty(),
  body('specialty').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('type').isIn(['FULL_TIME','PART_TIME','CONTRACT','TRAVEL','PER_DIEM','LOCUM_TENENS']),
  body('setting').isIn(['HOSPITAL','CLINIC','PRIVATE_PRACTICE','NURSING_HOME','URGENT_CARE','EMERGENCY_DEPARTMENT','SURGERY_CENTER','HOME_HEALTH','TELEMEDICINE','RESEARCH','ACADEMIC','OTHER']),
  body('location').trim().notEmpty(),
  body('city').trim().notEmpty(),
  body('state').trim().notEmpty()
], async (req: any, res, next) => {
  try {
    const employer = await prisma.employerProfile.findUnique({ where: { userId: req.user.id } });
    if (!employer) throw new AppError('Employer profile not found', 404);

    const job = await prisma.job.create({
      data: { ...req.body, employerId: employer.id, status: 'ACTIVE' }
    });

    // Trigger matching algorithm
    await matchingService.findMatchesForJob(job.id);

    await logHIPAAEvent({ userId: req.user.id, action: 'CREATE', resourceType: 'Job', resourceId: job.id, success: true });
    res.status(201).json(job);
  } catch (error) { next(error); }
});

// Update job
router.put('/:id', authenticate, authorize('EMPLOYER'), async (req: any, res, next) => {
  try {
    const employer = await prisma.employerProfile.findUnique({ where: { userId: req.user.id } });
    const job = await prisma.job.findFirst({ where: { id: req.params.id, employerId: employer?.id } });
    if (!job) throw new AppError('Job not found or unauthorized', 404);

    const updated = await prisma.job.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(updated);
  } catch (error) { next(error); }
});

// Delete/close job
router.delete('/:id', authenticate, authorize('EMPLOYER'), async (req: any, res, next) => {
  try {
    const employer = await prisma.employerProfile.findUnique({ where: { userId: req.user.id } });
    const job = await prisma.job.findFirst({ where: { id: req.params.id, employerId: employer?.id } });
    if (!job) throw new AppError('Job not found or unauthorized', 404);

    await prisma.job.update({ where: { id: req.params.id }, data: { status: 'CANCELLED' } });
    res.json({ message: 'Job cancelled successfully' });
  } catch (error) { next(error); }
});

export { router as jobRouter };
