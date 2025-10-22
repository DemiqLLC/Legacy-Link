import { IntegrationHooks } from '@meltstudio/common';
import { ActivityActions, UserRoleEnum } from '@meltstudio/types';

import { ctx } from '@/api/context';
import { db } from '@/api/db';
import { inviteMultipleMembersToUniversity } from '@/api/services/user/invite-member-to-university';

import { universityProfileApiDef } from './def';

export const universityProfileRouter = ctx.router(universityProfileApiDef);

universityProfileRouter.post('/', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  // Check sender
  const user = await db.user.findUniqueByEmail(req.auth.user.email);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { universityId, members } = req.body;

  const existingUniversity = await db.university.findUniqueByPk(universityId);
  const existingProfile =
    await db.universityProfile.findByUniversityId(universityId);

  if (!existingUniversity) {
    return res.status(409).json({
      error: "University doesn't exists for this universityId",
    });
  }

  if (existingProfile) {
    return res.status(409).json({
      error: 'Profile already exists for this universityId',
    });
  }

  // this can be handled by zod, but was added here to showcase the university creation wizard getting an error on submission
  if (req.body.members.length === 0) {
    return res.status(400).json({
      error: 'No members added to the university',
    });
  }

  const newProfile = await db.universityProfile.create({
    data: req.body,
    activityStreamData: {
      userId: req.auth.user.id,
      universityId,
    },
  });

  if (req.body.includeCreatorInUniversity) {
    await db.userUniversities.create({
      data: {
        userId: user.id,
        universityId,
        role: UserRoleEnum.ADMIN,
      },
      activityStreamData: {
        userId: req.auth.user.id,
        universityId,
      },
    });
  }

  await inviteMultipleMembersToUniversity({
    universityId,
    senderName: user.name,
    members,
  });

  const eventType = ActivityActions.CREATE;

  await Promise.all(
    members.map((member) =>
      IntegrationHooks.onAddUser(member, universityId, eventType)
    )
  );

  return res.status(201).json(newProfile);
});

universityProfileRouter.get('/:universityId', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const { universityId } = req.params;

  if (!universityId) {
    return res.status(400).send({ error: 'UniversityId is required' });
  }
  const profile = await db.universityProfile.findByUniversityId(universityId);

  if (!profile) {
    return res.status(404).json({ error: 'University profile not found' });
  }

  return res.status(200).json(profile);
});

universityProfileRouter.put('/:universityId/update', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const { universityId } = req.params;

  const existingProfile =
    await db.universityProfile.findByUniversityId(universityId);
  if (!existingProfile) {
    return res.status(404).json({ error: 'University profile not found' });
  }

  const updatedData = {
    ...existingProfile,
    ...req.body,
  };

  const updatedProfile = await db.universityProfile.update({
    pk: universityId,
    data: updatedData,
    activityStreamData: {
      userId: req.auth.user.id,
      universityId,
      recordId: universityId,
    },
  });

  return res.status(200).json(updatedProfile);
});

universityProfileRouter.delete('/:universityId/delete', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const { universityId } = req.params;

  const existingProfile =
    await db.universityProfile.findByUniversityId(universityId);
  if (!existingProfile) {
    return res.status(404).json({ error: 'University profile not found' });
  }

  await db.universityProfile.delete({
    pk: universityId,
    activityStreamData: {
      userId: req.auth.user.id,
      universityId,
      recordId: universityId,
    },
  });

  return res.status(200).json({ success: true });
});
