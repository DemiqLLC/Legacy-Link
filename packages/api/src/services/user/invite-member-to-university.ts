import {
  generateInviteToken,
  INVITATION_TOKEN_EXP_DAYS,
} from '@meltstudio/auth';
import { sendEmailTemplate } from '@meltstudio/mailing';
import type { UserRoleEnum } from '@meltstudio/types';
import { addDays, isAfter } from 'date-fns';

import { db } from '@/api/db';
import { ServiceError } from '@/api/types/errors';

export type InviteMemberArgs = {
  universityId: string;
  email: string;
  role: UserRoleEnum;
  senderName: string;
};

export type InviteMultipleMembersArgs = {
  universityId: string;
  senderName: string;
  members: {
    email: string;
    role: UserRoleEnum;
  }[];
};

async function getUniversityById(universityId: string): Promise<{
  id: string;
  name: string;
  createdAt: string;
}> {
  const university = await db.university.findUniqueByPk(universityId);

  if (!university) {
    throw new ServiceError('University not found', 400);
  }
  return university;
}

async function validateUserNotInUniversity({
  universityId,
  email,
}: InviteMemberArgs): Promise<void> {
  const destinyUser = await db.user.findUniqueByEmail(email);

  if (destinyUser) {
    const userUniversity =
      await db.userUniversities.findByUserIdAndUniversityId(
        destinyUser.id,
        universityId
      );
    if (userUniversity) {
      throw new ServiceError('User already in university', 400);
    }
  }
}

async function validateMultipleUserNotInUniversity({
  universityId,
  members,
}: InviteMultipleMembersArgs): Promise<void> {
  const destinyUsers = await db.user.findManyByEmail(
    members.map(({ email }) => email)
  );

  if (destinyUsers.length) {
    const usersInUniversity =
      await db.userUniversities.findManyByUserIdAndUniversityId(
        destinyUsers.map(({ id }) => id),
        universityId
      );
    if (usersInUniversity.length) {
      throw new ServiceError('User already in university', 400);
    }
  }
}

export async function saveInvitationToken({
  universityId,
  email,
  role,
}: InviteMemberArgs): Promise<string> {
  // Check if there is a token already generated
  let data = null;
  const existingToken = await db.memberInvitations.findByEmailAndUniversity(
    email,
    universityId
  );

  // Reuse token if still valid
  if (
    existingToken &&
    isAfter(existingToken.expiresAt, new Date()) &&
    !existingToken.userId
  ) {
    data = existingToken;
  } else {
    const token = generateInviteToken();

    // Send email
    data = await db.memberInvitations.create({
      data: {
        email,
        token,
        role,
        expiresAt: addDays(new Date(), INVITATION_TOKEN_EXP_DAYS),
        universityId,
      },
    });
  }

  if (!data) {
    throw new ServiceError('Failed to create invitation', 500);
  }
  return data.token;
}

export async function saveMultipleInvitationTokens({
  universityId,
  members,
}: InviteMultipleMembersArgs): Promise<{ email: string; token: string }[]> {
  const memberCreateQueries = members.map((member) => {
    const token = generateInviteToken();
    return {
      email: member.email,
      token,
      role: member.role,
      expiresAt: addDays(new Date(), INVITATION_TOKEN_EXP_DAYS),
      universityId,
    };
  });

  // Send email
  await db.memberInvitations.createMany({
    data: memberCreateQueries,
  });
  return memberCreateQueries.map(({ email, token }) => ({ email, token }));
}

export async function inviteMemberToUniversity(
  args: InviteMemberArgs
): Promise<void> {
  const { universityId, email, senderName } = args;
  const university = await getUniversityById(universityId);
  await validateUserNotInUniversity(args);
  const token = await saveInvitationToken(args);
  await sendEmailTemplate({
    template: {
      id: 'member-invitation',
      props: {
        by: senderName,
        university: university.name,
        token,
      },
    },
    options: {
      to: email,
      subject: `You've been invited to ${university.name}`,
    },
  });
}

export async function inviteMultipleMembersToUniversity(
  args: InviteMultipleMembersArgs
): Promise<void> {
  const { universityId, senderName } = args;
  const university = await getUniversityById(universityId);
  await validateMultipleUserNotInUniversity(args);
  const tokensByEmail = await saveMultipleInvitationTokens(args);
  await Promise.all(
    tokensByEmail.map(({ email, token }) =>
      sendEmailTemplate({
        template: {
          id: 'member-invitation',
          props: {
            by: senderName,
            university: university.name,
            token,
          },
        },
        options: {
          to: email,
          subject: `You've been invited to ${university.name}`,
        },
      })
    )
  );
}
