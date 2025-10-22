import type { LegacyRingLevelEnum, UserRoleEnum } from '@meltstudio/types';

import { ctx } from '@/api/context';
import { db } from '@/api/db';

import { userUniversitiesApiDef } from './def';

export const userUniversitiesRouter = ctx.router(userUniversitiesApiDef);

userUniversitiesRouter.post('/', async (req, res) => {
  const { universityId, email, role } = req.body;

  const existingUser = await db.user.findUniqueByEmail(email);
  if (!existingUser) {
    return res.status(404).send({ error: 'User not exist' });
  }

  const existingUserUniversity =
    await db.userUniversities.findByUserIdAndUniversityId(
      existingUser.id,
      universityId
    );

  if (existingUserUniversity) {
    return res.status(200).json(existingUserUniversity);
  }

  const data = await db.userUniversities.create({
    data: {
      userId: existingUser.id,
      universityId,
      role: role as UserRoleEnum,
    },
    activityStreamData: {
      userId: existingUser.id,
      universityId,
    },
  });

  await db.user.handleAlgoliaSaveByPk(existingUser.id);

  return res.status(201).json(data);
});

userUniversitiesRouter.put('/legacy-ring', async (req, res) => {
  const { userId, universityId, ringLevel } = req.body;

  const existingUserUniversity =
    await db.userUniversities.findByUserIdAndUniversityId(userId, universityId);

  if (!existingUserUniversity) {
    return res.status(404).send({ error: 'User university not found' });
  }

  await db.userUniversities.updateRingLevelForUserInUniversity(
    userId,
    universityId,
    ringLevel as LegacyRingLevelEnum
  );

  await db.user.handleAlgoliaSaveByPk(userId);

  return res.status(200).json({ success: true });
});
