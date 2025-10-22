import { fakeMemberInvitation, fakeUniversity } from '@meltstudio/db/tests';
import { UserRoleEnum } from '@meltstudio/types';
import {
  mockedDb,
  mockedGenerateInviteToken,
  mockedSendEmailTemplate,
} from 'tests/utils';

import { inviteMultipleMembersToUniversity } from '@/api/services/user';

const university = fakeUniversity();
const invitation = fakeMemberInvitation();
const invitation2 = fakeMemberInvitation();

describe('inviteMultipleMembersToUniversity', () => {
  it('should invite multiple members to the university', async () => {
    const args = {
      universityId: university.id,
      senderName: 'Admin',
      members: [
        { email: 'member1@example.com', role: UserRoleEnum.ALUMNI },
        { email: 'member2@example.com', role: UserRoleEnum.ALUMNI },
      ],
    };
    mockedDb.university.findUniqueByPk.mockResolvedValue(university);
    mockedDb.user.findManyByEmail.mockResolvedValue([]);
    mockedGenerateInviteToken.mockReturnValue('invite-token');
    mockedDb.memberInvitations.createMany.mockResolvedValue([
      invitation,
      invitation2,
    ]);

    await inviteMultipleMembersToUniversity(args);

    expect(mockedSendEmailTemplate).toHaveBeenCalledTimes(2);
  });
});
