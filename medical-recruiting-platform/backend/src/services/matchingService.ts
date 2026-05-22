import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class MatchingService {
  async findMatchesForProvider(providerId: string) {
    const provider = await prisma.providerProfile.findUnique({
      where: { id: providerId },
      include: { credentials: true }
    });
    if (!provider) return [];

    // Find active jobs matching specialty, state, and availability
    const jobs = await prisma.job.findMany({
      where: {
        status: 'ACTIVE',
        specialty: { contains: provider.specialty, mode: 'insensitive' },
        OR: [
          { state: { contains: provider.state || '', mode: 'insensitive' } },
          { isRemote: true }
        ]
      },
      include: { employer: { select: { companyName: true, city: true, state: true, isVerified: true } } }
    });

    // Score and rank matches
    const scored = jobs.map(job => {
      let score = 0;
      const factors: any = {};

      // Specialty match (40 points)
      if (job.specialty.toLowerCase() === provider.specialty.toLowerCase()) {
        score += 40;
        factors.specialty = 40;
      } else if (job.specialty.toLowerCase().includes(provider.specialty.toLowerCase())) {
        score += 25;
        factors.specialty = 25;
      } else {
        factors.specialty = 0;
      }

      // Location match (30 points)
      if (job.state && provider.state && job.state.toLowerCase() === provider.state.toLowerCase()) {
        score += 30;
        factors.location = 30;
      } else if (job.isRemote) {
        score += 20;
        factors.location = 20;
      } else {
        factors.location = 0;
      }

      // Rate match (20 points)
      if (job.hourlyRate && provider.hourlyRateMin && job.hourlyRate >= provider.hourlyRateMin) {
        score += 20;
        factors.rate = 20;
      } else {
        factors.rate = 0;
      }

      // Availability (10 points)
      if (provider.isAvailable) {
        score += 10;
        factors.availability = 10;
      } else {
        factors.availability = 0;
      }

      return { job, score, factors, matchPercentage: Math.round(score) };
    });

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    // Save top matches
    for (const match of scored.slice(0, 10)) {
      await prisma.matchScore.upsert({
        where: { providerId_jobId: { providerId, jobId: match.job.id } },
        update: { score: match.score, factors: match.factors },
        create: { providerId, jobId: match.job.id, score: match.score, factors: match.factors }
      });
    }

    return scored;
  }

  async findMatchesForJob(jobId: string) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return [];

    const providers = await prisma.providerProfile.findMany({
      where: {
        isAvailable: true,
        specialty: { contains: job.specialty, mode: 'insensitive' }
      },
      include: { credentials: { where: { status: 'ACTIVE' } } }
    });

    const scored = providers.map(provider => {
      let score = 0;
      const factors: any = {};

      if (provider.specialty.toLowerCase() === job.specialty.toLowerCase()) {
        score += 40; factors.specialty = 40;
      } else { factors.specialty = 0; }

      if (provider.state && job.state && provider.state.toLowerCase() === job.state.toLowerCase()) {
        score += 30; factors.location = 30;
      } else { factors.location = 0; }

      if (provider.hourlyRateMin && job.hourlyRate && provider.hourlyRateMin <= job.hourlyRate) {
        score += 20; factors.rate = 20;
      } else { factors.rate = 0; }

      score += 10; factors.availability = 10;

      return { provider, score, factors, matchPercentage: Math.round(score) };
    });

    scored.sort((a, b) => b.score - a.score);

    for (const match of scored.slice(0, 10)) {
      await prisma.matchScore.upsert({
        where: { providerId_jobId: { providerId: match.provider.id, jobId } },
        update: { score: match.score, factors: match.factors },
        create: { providerId: match.provider.id, jobId, score: match.score, factors: match.factors }
      });
    }

    return scored;
  }

  async findMatchesForEmployer(employerId: string) {
    const jobs = await prisma.job.findMany({ where: { employerId, status: 'ACTIVE' } });
    const allMatches: any[] = [];
    for (const job of jobs) {
      const matches = await this.findMatchesForJob(job.id);
      allMatches.push(...matches.map(m => ({ ...m, job })));
    }
    return allMatches.sort((a, b) => b.score - a.score);
  }

  async getProviderByUserId(userId: string) {
    return prisma.providerProfile.findUnique({ where: { userId } });
  }

  async getEmployerByUserId(userId: string) {
    return prisma.employerProfile.findUnique({ where: { userId } });
  }
}
