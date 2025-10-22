import { fakeMemberInvitation, fakeUniversity } from '@meltstudio/db/tests';
import { UserRoleEnum } from '@meltstudio/types';
import {
  mockedDb,
  mockedGenerateInviteToken,
  mockedSendEmailTemplate,
} from 'tests/utils';

import { saveInvitationToken } from '@/api/services/user/invite-member-to-university';
import { ServiceError } from '@/api/types/errors';

const invitation = fakeMemberInvitation();
const university = fakeUniversity();

describe('saveInvitationToken', () => {
  it('should save a new invitation token', async () => {
    const args = {
      universityId: university.id,
      email: 'test@example.com',
      role: UserRoleEnum.ALUMNI,
      senderName: 'Admin',
    };
    mockedDb.memberInvitations.findByEmailAndUniversity.mockResolvedValue(null);
    mockedGenerateInviteToken.mockReturnValue('invite-token');
    mockedDb.memberInvitations.create.mockResolvedValue(invitation);

    const token = await saveInvitationToken(args);

    expect(token).toBe('invite-token');
  });

  it('should reuse an existing valid token', async () => {
    const args = {
      universityId: university.id,
      email: 'test@example.com',
      role: UserRoleEnum.ALUMNI,
      senderName: 'Admin',
    };
    mockedDb.memberInvitations.findByEmailAndUniversity.mockResolvedValue(
      invitation
    );

    const token = await saveInvitationToken(args);

    expect(token).toBe(invitation.token);
  });

  it('should throw an error if token creation fails', async () => {
    const args = {
      universityId: '1',
      email: 'test@example.com',
      role: UserRoleEnum.ALUMNI,
    };
    mockedDb.memberInvitations.findByEmailAndUniversity.mockResolvedValue(null);

    await expect(mockedSendEmailTemplate(args)).rejects.toThrow(ServiceError);
  });
});
