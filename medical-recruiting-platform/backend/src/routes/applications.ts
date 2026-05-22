import { Router } from 'express';
import { body } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { logHIPAAEvent } from '../middleware/hipaaAudit';
import { NotificationService } from '../services/notificationService';

const router = Router();
const prisma = new PrismaClient();
const notificationService = new NotificationService();

// Apply to job (provider)
router.post('/', authenticate, [
  body('jobId').isUUID(),
  body('coverLetter').optional().trim(),
  body('proposedRate').optional().isFloat()
], async (req: any, res, next) => {
  try {
    const { jobId, coverLetter, proposedRate, availabilityStart } = req.body;

    const provider = await prisma.providerProfile.findUnique({ where: { userId: req.user.id } });
    if (!provider) throw new AppError('Provider profile required', 400);

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.status !== 'ACTIVE') throw new AppError('Job not found or inactive', 404);

    const existing = await prisma.application.findFirst({
      where: { jobId, providerId: provider.id }
    });
    if (existing) throw new AppError('Already applied to this job', 409);

    const application = await prisma.application.create({
      data: {
        jobId, providerId: provider.id, status: 'PENDING',
        coverLetter, proposedRate, availabilityStart: availabilityStart ? new Date(availabilityStart) : null
      },
      include: {
        job: { include: { employer: { include: { user: true } } } },
        provider: true
      }
    });

    // Notify employer
    await notificationService.createNotification({
      userId: application.job.employer.user.id,
      type: 'APPLICATION_RECEIVED',
      title: 'New Application Received',
      message: `${provider.firstName} ${provider.lastName} applied for ${job.title}`,
      data: { applicationId: application.id, jobId, providerId: provider.id }
    });

    await logHIPAAEvent({ userId: req.user.id, action: 'CREATE', resourceType: 'Application', resourceId: application.id, success: true });
    res.status(201).json(application);
  } catch (error) { next(error); }
});

// Get my applications
router.get('/my-applications', authenticate, async (req: any, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        providerProfile: { include: { applications: { include: { job: true, interviews: true } } } },
        employerProfile: { include: { jobs: { include: { applications: { include: { provider: true, interviews: true } } } } } }
      }
    });
    res.json(user);
  } catch (error) { next(error); }
});

// Update application status (employer)
router.patch('/:id/status', authenticate, [
  body('status').isIn(['REVIEWING','INTERVIEW_SCHEDULED','OFFER_EXTENDED','ACCEPTED','REJECTED'])
], async (req: any, res, next) => {
  try {
    const { status } = req.body;
    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: { job: { include: { employer: true } }, provider: { include: { user: true } } }
    });

    if (!application) throw new AppError('Application not found', 404);

    // Verify employer owns the job
    const employer = await prisma.employerProfile.findUnique({ where: { userId: req.user.id } });
    if (application.job.employerId !== employer?.id) throw new AppError('Unauthorized', 403);

    const updated = await prisma.application.update({
      where: { id: req.params.id },
      data: { status }
    });

    // Notify provider
    await notificationService.createNotification({
      userId: application.provider.user.id,
      type: 'APPLICATION_STATUS_CHANGE',
      title: 'Application Status Updated',
      message: `Your application for ${application.job.title} is now ${status}`,
      data: { applicationId: application.id, status }
    });

    res.json(updated);
  } catch (error) { next(error); }
});

export { router as applicationRouter };
