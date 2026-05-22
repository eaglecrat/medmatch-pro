import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all state requirements
router.get('/requirements', async (req, res, next) => {
  try {
    const requirements = await prisma.stateLicenseRequirement.findMany({
      where: { isActive: true },
      orderBy: { state: 'asc' }
    });
    res.json(requirements);
  } catch (error) { next(error); }
});

// Get compact states
router.get('/compact-states', async (req, res, next) => {
  try {
    const compactStates = await prisma.stateLicenseRequirement.findMany({
      where: { isCompactState: true, isActive: true }
    });
    res.json(compactStates);
  } catch (error) { next(error); }
});

// Get requirements by state
router.get('/requirements/:state', async (req, res, next) => {
  try {
    const req = await prisma.stateLicenseRequirement.findUnique({
      where: { state: req.params.state.toUpperCase() }
    });
    res.json(req);
  } catch (error) { next(error); }
});

// Get my compact licenses (provider)
router.get('/my-compact-licenses', authenticate, async (req: any, res, next) => {
  try {
    const provider = await prisma.providerProfile.findUnique({ where: { userId: req.user.id } });
    if (!provider) return res.json([]);
    const licenses = await prisma.compactLicense.findMany({ where: { providerId: provider.id } });
    res.json(licenses);
  } catch (error) { next(error); }
});

export { router as stateLicenseRouter };
