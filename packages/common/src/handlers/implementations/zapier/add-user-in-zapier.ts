import type { ActivityActions } from '@meltstudio/types';

import ZapierClient from '@/common/clients/zapier';

export type AddUserForZapier = {
  email: string;
  role: string;
};

const addUserInZapier = async (
  user: AddUserForZapier,
  universityId: string,
  eventType: ActivityActions
): Promise<void> => {
  const client = new ZapierClient();

  await client.addUser(user, universityId, eventType);
};

export default addUserInZapier;
