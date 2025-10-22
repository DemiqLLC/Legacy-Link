export type ActivityStreamData = {
  universityId: string | null;
  userId: string;
  recordId?: string;
};

export enum ActivityActions {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  ENABLE = 'enable',
  DISABLE = 'disable',
  INVITE = 'invite',
}
