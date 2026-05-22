import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { MatchingService } from '../services/matchingService';

const router = Router();
const matchingService = new MatchingService();

// Get matches for current user (provider or employer)
router.get('/my-matches', authenticate, async (req: any, res, next) => {
  try {
    if (req.user.role === 'PROVIDER') {
      const provider = await matchingService.getProviderByUserId(req.user.id);
      if (!provider) return res.json({ matches: [] });
      const matches = await matchingService.findMatchesForProvider(provider.id);
      res.json({ matches });
    } else {
      const employer = await matchingService.getEmployerByUserId(req.user.id);
      if (!employer) return res.json({ matches: [] });
      const matches = await matchingService.findMatchesForEmployer(employer.id);
      res.json({ matches });
    }
  } catch (error) { next(error); }
});

// Run matching for a specific job (employer trigger)
router.post('/run/:jobId', authenticate, async (req: any, res, next) => {
  try {
    const matches = await matchingService.findMatchesForJob(req.params.jobId);
    res.json({ matches, count: matches.length });
  } catch (error) { next(error); }
});

export { router as matchingRouter };
