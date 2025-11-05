import { logger } from '@meltstudio/logger';
import type { LegacyRingLevelEnum } from '@meltstudio/types';

import { ctx } from '@/api/context';
import { db } from '@/api/db';

import { alumniApiDef } from './def';

export const alumniRouter = ctx.router(alumniApiDef);

type FormattedPledge = {
  id: string;
  date: string;
  pledgeType: string | null;
  universityName: string | null;
  givingOpportunityName: string | null;
};

alumniRouter.get('/dashboard', async (req, res) => {
  if (!req.auth || !req.auth.user?.id) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const userId = req.auth.user.id;

  try {
    const userUniversities = await db.userUniversities.findMany({
      args: { where: { userId } },
    });

    const legacyRingLevel =
      (userUniversities?.[0]?.ringLevel as LegacyRingLevelEnum) || null;

    const allUserPledges = await db.pledgeOpportunities.findMany({
      args: {
        where: {
          userId,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!allUserPledges || allUserPledges.length === 0) {
      return res.status(200).json({
        totalPledges: 0,
        legacyRingLevel,
        monetaryPledgesList: [],
        nonMonetaryPledgesList: [],
      });
    }

    const universityIds = Array.from(
      new Set(allUserPledges.map((p) => p.universityId).filter(Boolean))
    );

    const universities = await db.university.findMany({
      args: { where: { id: universityIds } },
    });

    const universityMap = new Map(universities.map((u) => [u.id, u.name]));

    const givingIds = Array.from(
      new Set(allUserPledges.map((p) => p.givingOpportunityId).filter(Boolean))
    );

    const givingOpportunities = await db.givingOpportunities.findMany({
      args: { where: { id: givingIds } },
    });

    const givingMap = new Map(givingOpportunities.map((g) => [g.id, g.name]));

    const totalPledges = allUserPledges.length;
    const MONETARY_TYPE = 'monetary_support';

    const formattedPledges = allUserPledges.map<FormattedPledge>((p) => ({
      id: String(p.id),
      date: new Date(p.createdAt).toISOString(),
      pledgeType: p.pledgeType ?? null,
      universityName: universityMap.get(p.universityId ?? '') ?? null,
      givingOpportunityName: givingMap.get(p.givingOpportunityId ?? '') ?? null,
    }));

    const monetaryPledgesList = formattedPledges.filter(
      (p) => p.pledgeType === MONETARY_TYPE
    );

    const nonMonetaryPledgesList = formattedPledges.filter(
      (p) => p.pledgeType !== MONETARY_TYPE
    );

    const dashboardData = {
      totalPledges,
      legacyRingLevel,
      monetaryPledgesList,
      nonMonetaryPledgesList,
    };

    return res.status(200).json(dashboardData);
  } catch (error: unknown) {
    logger.error(error, 'Error fetching alumni dashboard data:');
    return res.status(500).json({ error: 'Error fetching data' });
  }
});
