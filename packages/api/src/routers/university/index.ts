import { ctx } from '@/api/context';
import { db } from '@/api/db';

import { universityApiDef } from './def';

export const universityRouter = ctx.router(universityApiDef);

universityRouter.get('/:id', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const { id } = req.params;

  const data = await db.university.findById(id ?? '');

  if (!data) {
    return res.status(404).json({ error: 'University record not found' });
  }

  return res.status(200).json(data);
});
