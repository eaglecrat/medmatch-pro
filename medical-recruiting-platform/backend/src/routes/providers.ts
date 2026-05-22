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

router.get('/search', [
  query('specialty').optional().trim(),
  query('state').optional().trim(),
  query('city').optional().trim(),
  query('available').optional().isBoolean(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res, next) => {
  try {
    const { specialty, state, city, available, page = 1, limit = 20 } = req.query;
    const where: any = {};
    if (specialty) where.specialty = { contains: specialty as string, mode: 'insensitive' };
    if (state) where.state = { contains: state as string, mode: 'insensitive' };
    if (city) where.city = { contains: city as string, mode: 'insensitive' };
    if (available === 'true') where.isAvailable = true;

    const [providers, total] = await Promise.all([
      prisma.providerProfile.findMany({
        where, skip: (Number(page) - 1) * Number(limit), take: Number(limit),
        include: { user: { select: { id: true, email: true } }, credentials: { where: { status: 'ACTIVE' } } }
      }),
      prisma.providerProfile.count({ where })
    ]);
    res.json({ providers, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const provider = await prisma.providerProfile.findUnique({
      where: { id: req.params.id },
      include: {
        credentials: { where: { status: 'ACTIVE' } },
        reviews: { where: { isVisible: true }, include: { employer: { select: { companyName: true } } } },
        user: { select: { id: true, createdAt: true } }
      }
    });
    if (!provider) throw new AppError('Provider not found', 404);
    res.json(provider);
  } catch (error) { next(error); }
});

router.put('/profile', authenticate, authorize('PROVIDER'), async (req: any, res, next) => {
  try {
    const profile = await prisma.providerProfile.findUnique({ where: { userId: req.user.id } });
    if (!profile) throw new AppError('Profile not found', 404);

    const updateData: any = {};
    ['firstName','lastName','title','specialty','subSpecialty','licenseNumber','licenseState','npiNumber','yearsExperience','bio','phone','address','city','state','zipCode','latitude','longitude','preferredShift','hourlyRateMin','hourlyRateMax','availability','isAvailable'].forEach(f => {
      if (req.body[f] !== undefined) updateData[f] = req.body[f];
    });

    const required = ['firstName','lastName','specialty','licenseState','yearsExperience','bio'];
    const completed = required.filter(f => updateData[f] || profile[f as keyof typeof profile]);
    updateData.profileComplete = Math.round((completed.length / required.length) * 100);

    const updated = await prisma.providerProfile.update({ where: { userId: req.user.id }, data: updateData, include: { credentials: true } });
    await logHIPAAEvent({ userId: req.user.id, action: 'UPDATE', resourceType: 'ProviderProfile', resourceId: updated.id, success: true });
    res.json(updated);
  } catch (error) { next(error); }
});

router.get('/matches', authenticate, authorize('PROVIDER'), async (req: any, res, next) => {
  try {
    const provider = await prisma.providerProfile.findUnique({ where: { userId: req.user.id } });
    if (!provider) throw new AppError('Provider profile not found', 404);
    const matches = await matchingService.findMatchesForProvider(provider.id);
    res.json(matches);
  } catch (error) { next(error); }
});

router.post('/credentials', authenticate, authorize('PROVIDER'), async (req: any, res, next) => {
  try {
    const { type, title, issuingBody, licenseNumber, issueDate, expiryDate } = req.body;
    const provider = await prisma.providerProfile.findUnique({ where: { userId: req.user.id } });
    if (!provider) throw new AppError('Provider profile not found', 404);

    const credential = await prisma.credential.create({
      data: { providerId: provider.id, type, title, issuingBody, licenseNumber, issueDate: new Date(issueDate), expiryDate: expiryDate ? new Date(expiryDate) : null, status: 'ACTIVE', verificationStatus: 'PENDING' }
    });
    await logHIPAAEvent({ userId: req.user.id, action: 'CREATE', resourceType: 'Credential', resourceId: credential.id, success: true });
    res.status(201).json(credential);
  } catch (error) { next(error); }
});

export { router as providerRouter };
