import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get my audit log
router.get('/my-audit-log', authenticate, async (req: any, res, next) => {
  try {
    const logs = await prisma.hIPAAAuditLog.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    res.json(logs);
  } catch (error) { next(error); }
});

// Get BAA status (employer)
router.get('/baa-status', authenticate, async (req: any, res, next) => {
  try {
    if (req.user.role !== 'EMPLOYER') return res.json({});
    const employer = await prisma.employerProfile.findUnique({ where: { userId: req.user.id } });
    if (!employer) return res.json({});
    const baa = await prisma.bAARecord.findFirst({ where: { employerId: employer.id } });
    res.json(baa || { status: 'PENDING' });
  } catch (error) { next(error); }
});

// Get privacy consents
router.get('/consents', authenticate, async (req: any, res, next) => {
  try {
    const consents = await prisma.privacyConsent.findMany({ where: { userId: req.user.id } });
    res.json(consents);
  } catch (error) { next(error); }
});

// Update consent
router.post('/consent', authenticate, async (req: any, res, next) => {
  try {
    const { consentType, granted } = req.body;
    const consent = await prisma.privacyConsent.upsert({
      where: { userId_consentType: { userId: req.user.id, consentType } },
      update: { granted, grantedAt: granted ? new Date() : null, revokedAt: !granted ? new Date() : null },
      create: { userId: req.user.id, consentType, granted, grantedAt: granted ? new Date() : null }
    });
    res.json(consent);
  } catch (error) { next(error); }
});

// Admin: Get all audit logs
router.get('/admin/audit-logs', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const logs = await prisma.hIPAAAuditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 500,
      include: { user: { select: { email: true } } }
    });
    res.json(logs);
  } catch (error) { next(error); }
});

export { router as hipaaRouter };
