import { Router } from 'express';
import { body, query } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { logHIPAAEvent } from '../middleware/hipaaAudit';

const router = Router();
const prisma = new PrismaClient();

router.get('/search', [
  query('companyName').optional().trim(),
  query('state').optional().trim(),
  query('verified').optional().isBoolean(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res, next) => {
  try {
    const { companyName, state, verified, page = 1, limit = 20 } = req.query;
    const where: any = {};
    if (companyName) where.companyName = { contains: companyName as string, mode: 'insensitive' };
    if (state) where.state = { contains: state as string, mode: 'insensitive' };
    if (verified === 'true') where.isVerified = true;

    const [employers, total] = await Promise.all([
      prisma.employerProfile.findMany({
        where, skip: (Number(page) - 1) * Number(limit), take: Number(limit),
        include: { jobs: { where: { status: 'ACTIVE' }, select: { id: true, title: true } }, reviews: { where: { isVisible: true } } }
      }),
      prisma.employerProfile.count({ where })
    ]);
    res.json({ employers, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const employer = await prisma.employerProfile.findUnique({
      where: { id: req.params.id },
      include: {
        jobs: { where: { status: 'ACTIVE' } },
        reviews: { where: { isVisible: true }, include: { provider: { select: { firstName: true, lastName: true, specialty: true } } } }
      }
    });
    if (!employer) throw new AppError('Employer not found', 404);
    res.json(employer);
  } catch (error) { next(error); }
});

router.put('/profile', authenticate, authorize('EMPLOYER'), async (req: any, res, next) => {
  try {
    const profile = await prisma.employerProfile.findUnique({ where: { userId: req.user.id } });
    if (!profile) throw new AppError('Profile not found', 404);

    const updateData: any = {};
    ['companyName','ein','contactName','contactPhone','website','address','city','state','zipCode','latitude','longitude','companySize','industry','description'].forEach(f => {
      if (req.body[f] !== undefined) updateData[f] = req.body[f];
    });

    const updated = await prisma.employerProfile.update({ where: { userId: req.user.id }, data: updateData });
    await logHIPAAEvent({ userId: req.user.id, action: 'UPDATE', resourceType: 'EmployerProfile', resourceId: updated.id, success: true });
    res.json(updated);
  } catch (error) { next(error); }
});

export { router as employerRouter };
