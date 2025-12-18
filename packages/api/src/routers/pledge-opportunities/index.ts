import { ctx } from '@/api/context';
import { db } from '@/api/db';

import { pledgeOppotunitiesApiDef } from './def';

export const pledgeOpportunitiesRouter = ctx.router(pledgeOppotunitiesApiDef);

pledgeOpportunitiesRouter.post('/', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  try {
    const { user } = req.auth;
    const { userId } = req.body;

    if (!req.body.universityId || !req.body.userId) {
      return res.status(400).json({
        error: 'universityId and alumniId are required',
      });
    }

    const university = await db.university.findUniqueByPkAdmin(
      req.body.universityId,
      false
    );

    if (!university) {
      return res.status(400).json({ error: 'University not found' });
    }

    const userProfile = await db.userProfile.findByUserId(userId);

    if (!userProfile || !userProfile.legacyLinkId) {
      return res.status(400).json({
        error: 'User profile or legacy links ID not found',
      });
    }

    const universityCode = university.referenceCode?.split('-')[1] || 'XXX';

    const legacyIdParts = userProfile.legacyLinkId.split('-');
    const alumniLegacyId = legacyIdParts[legacyIdParts.length - 1];

    const pledgeCount = await db.pledgeOpportunities.count({
      universityId: req.body.universityId,
      userId: req.body.userId,
    });

    const sequentialNumber = String(pledgeCount + 1).padStart(3, '0');

    const referenceCode = `LL-P-${universityCode}-${alumniLegacyId}-${sequentialNumber}`;

    const pledgeData = {
      ...req.body,
      referenceCode,
    };

    const pledge = await db.pledgeOpportunities.create({
      data: pledgeData,
      activityStreamData: {
        userId: user.id,
        universityId: req.body.universityId,
      },
    });

    return res.status(201).json({ pledge });
  } catch (error) {
    return res.status(500).json({
      error:
        'An unexpected error occurred while creating the pledge opportunity',
    });
  }
});

pledgeOpportunitiesRouter.get('/:givingOpportunityId', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  try {
    const { givingOpportunityId } = req.params;
    const { user } = req.auth;

    const dbUser = await db.user.findById(user.id);

    if (!dbUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    let data;

    if (dbUser.isSuperAdmin) {
      data =
        await db.pledgeOpportunities.findByGivingOpportunityId(
          givingOpportunityId
        );
    } else {
      data = await db.pledgeOpportunities.findMany({
        args: {
          where: {
            givingOpportunityId,
            userId: user.id,
          },
        },
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'No pledge opportunities found' });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      error:
        'An unexpected error occurred while retrieving the pledge opportunities',
    });
  }
});
