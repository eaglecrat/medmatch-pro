import { Router } from 'express';
import { body } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { logHIPAAEvent } from '../middleware/hipaaAudit';

const router = Router();
const prisma = new PrismaClient();

router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/),
  body('role').isIn(['PROVIDER', 'EMPLOYER']),
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty()
], async (req, res, next) => {
  try {
    const { email, password, role, firstName, lastName } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError('Email already registered', 409);

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email, passwordHash, role,
        ...(role === 'PROVIDER' ? {
          providerProfile: { create: { firstName, lastName, specialty: 'Pending' } }
        } : {
          employerProfile: { create: { companyName: firstName, contactName: `${firstName} ${lastName}` } }
        })
      },
      select: { id: true, email: true, role: true, status: true }
    });

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '7d' });
    await logHIPAAEvent({ userId: user.id, action: 'LOGIN', resourceType: 'User', resourceId: user.id, success: true });
    res.status(201).json({ user, token });
  } catch (error) { next(error); }
});

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { email },
      include: { providerProfile: true, employerProfile: true }
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) throw new AppError('Invalid credentials', 401);
    if (user.status !== 'ACTIVE') throw new AppError('Account not active', 403);

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '7d' });
    await logHIPAAEvent({ userId: user.id, action: 'LOGIN', resourceType: 'User', resourceId: user.id, success: true });

    const { passwordHash, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (error) { next(error); }
});

router.get('/me', authenticate, async (req: any, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        providerProfile: { include: { credentials: true } },
        employerProfile: { include: { jobs: { where: { status: 'ACTIVE' } } } }
      }
    });
    if (!user) throw new AppError('User not found', 404);
    const { passwordHash, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) { next(error); }
});

export { router as authRouter };
