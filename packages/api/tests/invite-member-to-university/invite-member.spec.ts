import { fakeMemberInvitation, fakeUniversity } from '@meltstudio/db/tests';
import { UserRoleEnum } from '@meltstudio/types';
import {
  mockedDb,
  mockedGenerateInviteToken,
  mockedSendEmailTemplate,
} from 'tests/utils';

import { inviteMemberToUniversity } from '@/api/services/user';
import { ServiceError } from '@/api/types/errors';

const memberInvitation = fakeMemberInvitation();
const university = fakeUniversity();

describe('inviteMemberToUniversity', () => {
  it('should invite a member to the university', async () => {
    const args = {
      universityId: university.id,
      email: 'test@example.com',
      role: UserRoleEnum.ALUMNI,
      senderName: 'Admin',
    };
    mockedDb.university.findUniqueByPk.mockResolvedValue(university);
    mockedDb.user.findUniqueByEmail.mockResolvedValue(null);
    mockedGenerateInviteToken.mockReturnValue(memberInvitation.token);
    mockedDb.memberInvitations.findByEmailAndUniversity.mockResolvedValue(null);
    mockedDb.memberInvitations.create.mockResolvedValue(memberInvitation);

    await inviteMemberToUniversity(args);

    expect(mockedSendEmailTemplate).toHaveBeenCalledWith({
      template: {
        id: 'member-invitation',
        props: {
          by: 'Admin',
          university: university.name,
          token: memberInvitation.token,
        },
      },
      options: {
        to: 'test@example.com',
        subject: `You've been invited to ${university.name}`,
      },
    });
  });

  it('should throw an error if the university is not found', async () => {
    const args = {
      universityId: university.id,
      email: 'test@example.com',
      role: UserRoleEnum.ALUMNI,
      senderName: 'Admin',
    };
    mockedDb.university.findUniqueByPk.mockResolvedValue(null);

    await expect(inviteMemberToUniversity(args)).rejects.toThrow(ServiceError);
  });
});
