import { ctx } from '@/api/context';
import { db } from '@/api/db';

import { givingOpportunitiesApiDef } from './def';

export const givingOpportunitiesRouter = ctx.router(givingOpportunitiesApiDef);

givingOpportunitiesRouter.get('/:id', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const { id } = req.params;

  const data = await db.givingOpportunities.findById(id ?? '');

  if (!data) {
    return res
      .status(404)
      .json({ error: 'GivingOpportunity record not found' });
  }

  return res.status(200).json(data);
});

givingOpportunitiesRouter.get('/university/:universityId', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const { universityId } = req.params;

  const data = await db.givingOpportunities.findByUniversityId(universityId);

  if (!data) {
    return res.status(404).json({ error: 'GivingOpportunities not found' });
  }

  return res.status(200).json(data);
});
