import { IntegrationHooks } from '@meltstudio/common';
import type { UserRoleEnum } from '@meltstudio/types';
import { ActivityActions } from '@meltstudio/types';
import { isAfter } from 'date-fns';

import { ctx } from '@/api/context';
import { db } from '@/api/db';
import { inviteMemberToUniversity } from '@/api/services/user/invite-member-to-university';
import { createNewUser } from '@/api/utils/session';

import { usersApiDef } from './def';

export const usersRouter = ctx.router(usersApiDef);

usersRouter.get('/me', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const user = await db.user.findUniqueByEmailWithPassword(req.auth.user.email);

  if (user) {
    return res.status(200).json(user);
  }
  return res.status(404).json({ error: 'User not found' });
});

usersRouter.put('/:universityId/me', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const { universityId } = req.params;

  await db.user.update({
    pk: req.auth.user.id,
    data: req.body,
    activityStreamData: {
      userId: req.auth.user.id,
      universityId,
      recordId: req.auth.user.id,
    },
  });

  return res.status(204).end();
});

usersRouter.get('/list', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const { query } = req.query;
  const { filters, pagination, sorting } = query ?? {};

  const total = await db.user.count({ ...filters });

  // TODO: Remove parsing once query params sanitize is handled
  const pageIndex = pagination?.pageIndex ? Number(pagination?.pageIndex) : 0;
  const limit = pagination?.pageSize ? Number(pagination?.pageSize) : total; // If limit is passed as 0 no users will be returned
  const offset = limit > 0 ? pageIndex * limit : 0;

  const pageCount = limit ? Math.ceil(total / limit) : total;

  const users = await db.user.findMany({
    args: {
      pagination: { limit, offset },
      where: { ...filters },
      sorting,
    },
    select: {
      id: true,
      name: true,
      email: true,
      active: true,
      createdAt: true,
      is2faEnabled: true,
      profileImage: true,
      isSuperAdmin: true,
      gtmId: true,
    },
  });

  if (users) {
    return res.status(200).json({
      items: users,
      total,
      limit,
      offset,
      pageCount,
    });
  }

  return res.status(404).json({ error: 'Users not found' });
});

usersRouter.delete('/:universityId/remove', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const { universityId } = req.params;

  const { id } = req.body;

  await db.user.delete({
    pk: id,
    activityStreamData: {
      userId: req.auth.user.id,
      universityId,
      recordId: id,
    },
  });

  return res.status(200).json({ success: true });
});

usersRouter.put('/:universityId/role', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const { universityId } = req.params;
  const { userId, role } = req.body;

  await db.userUniversities.updateRoleMultipleUsersInUniversity(
    [userId],
    universityId as string,
    role
  );

  await db.user.handleAlgoliaSaveByPk(userId);

  return res.status(200).end();
});

usersRouter.post('/:universityId/invite', async (req, res) => {
  // Unauthorized
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  // Check sender
  const user = await db.user.findUniqueByEmail(req.auth.user.email);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Checks if user to be invited exists
  const { universityId } = req.params;
  const { email, role } = req.body;

  await inviteMemberToUniversity({
    email,
    role,
    universityId,
    senderName: user.name,
  });

  const eventType = ActivityActions.INVITE;

  await IntegrationHooks.onAddUser({ email, role }, universityId, eventType);

  return res.status(200).json({ success: true });
});

usersRouter.post('/invite/accept', async (req, res) => {
  const { token, ...params } = req.body;
  const invitation = await db.memberInvitations.findByToken(token);

  if (!invitation) {
    return res.status(404).json({ error: 'Invitation not found' });
  }

  if (invitation.userId) {
    return res.status(400).json({ error: 'Invitation already used' });
  }

  if (!isAfter(invitation.expiresAt, new Date())) {
    return res.status(400).json({ error: 'Invitation expired' });
  }

  const existingUser = await db.user.findUniqueByEmail(invitation.email);
  let user = null;

  if (existingUser) {
    user = existingUser;

    const existingUserUniversity =
      await db.userUniversities.findByUserIdAndUniversityId(
        existingUser?.id,
        invitation.universityId
      );

    if (!existingUserUniversity) {
      await db.userUniversities.create({
        data: {
          userId: user.id,
          universityId: invitation.universityId,
          role: invitation.role as UserRoleEnum,
        },
        activityStreamData: {
          userId: user.id,
          universityId: invitation.universityId,
        },
      });

      await db.user.handleAlgoliaSaveByPk(user.id);
    }
  } else {
    const { name, password } = params;

    if (!name || !password) {
      return res.status(400).json({ error: 'Name and password are required' });
    }

    user = await createNewUser({
      email: invitation.email,
      role: invitation.role as UserRoleEnum,
      universityId: invitation.universityId,
      name,
      password,
    });
  }

  await db.memberInvitations.update({
    pk: invitation.id,
    data: { userId: user.id },
    activityStreamData: {
      userId: user.id,
      universityId: invitation.universityId,
      recordId: invitation.id,
    },
  });
  const university = await db.university.findUniqueByPk(
    invitation.universityId
  );

  if (!university) {
    return res.status(404).json({ error: 'Invitation university not found' });
  }

  return res.status(201).json({
    success: true,
    user: { id: user.id },
    universityId: invitation.universityId,
    name: university?.name,
  });
});

usersRouter.get('/invite/get', async (req, res) => {
  const { token } = req.query;

  const invitation = await db.memberInvitations.findByToken(token);

  if (!invitation) {
    return res.status(404).json({ error: 'Invitation not found' });
  }

  const user = await db.user.findUniqueByEmail(invitation.email);
  const university = await db.university.findUniqueByPk(
    invitation.universityId
  );

  if (!university) {
    return res.status(404).json({ error: 'Invitation university not found' });
  }

  return res
    .status(200)
    .json({ ...invitation, university: university.name, isNewUser: !user });
});

usersRouter.get('/:universityId/members', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const { universityId } = req.params;

  const members = await db.user.getUniversityMembers(universityId);

  return res.status(200).json(members);
});
