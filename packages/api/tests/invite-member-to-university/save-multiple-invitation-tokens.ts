import { fakeMemberInvitation, fakeUniversity } from '@meltstudio/db/tests';
import { UserRoleEnum } from '@meltstudio/types';
import { mockedDb, mockedGenerateInviteToken } from 'tests/utils';

import { saveMultipleInvitationTokens } from '@/api/services/user';

const invitation = fakeMemberInvitation();
const invitation2 = fakeMemberInvitation();

const university = fakeUniversity();

describe('saveMultipleInvitationTokens', () => {
  it('should save multiple invitation tokens', async () => {
    const args = {
      universityId: university.id,
      members: [
        { email: 'member1@example.com', role: UserRoleEnum.ALUMNI },
        { email: 'member2@example.com', role: UserRoleEnum.ALUMNI },
      ],
      senderName: 'Admin',
    };
    mockedGenerateInviteToken.mockReturnValue(invitation.token);
    mockedGenerateInviteToken.mockReturnValue(invitation2.token);
    mockedDb.memberInvitations.createMany.mockResolvedValue([
      invitation,
      invitation2,
    ]);

    const tokens = await saveMultipleInvitationTokens(args);

    expect(tokens).toEqual([
      { email: 'member1@example.com', token: invitation.token },
      { email: 'member2@example.com', token: invitation2.token },
    ]);
  });
});
