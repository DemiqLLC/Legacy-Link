import type { ZodiosBodyByAlias } from '@zodios/core';

import type { ZodApi } from './zodios';
import { apiHooks } from './zodios';

export type CreateUserUniversity = ZodiosBodyByAlias<
  ZodApi,
  'createUserUniversity'
>;

export function useCreateUserUniversity(): ReturnType<
  typeof apiHooks.useCreateUserUniversity
> {
  return apiHooks.useCreateUserUniversity();
}

export type UpdateLegacyRing = ZodiosBodyByAlias<ZodApi, 'updateLegacyRing'>;

export function useUpdateLegacyRing(): ReturnType<
  typeof apiHooks.useUpdateLegacyRing
> {
  return apiHooks.useUpdateLegacyRing();
}
