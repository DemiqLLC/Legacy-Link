import { useQueryClient } from '@tanstack/react-query';
import type { ZodiosBodyByAlias } from '@zodios/core';

import type { DbUserUniversities } from '@/db/schema';

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
  const queryClient = useQueryClient();
  return apiHooks.useUpdateLegacyRing(undefined, {
    onSuccess: async (_data, variables) => {
      queryClient.setQueryData<DbUserUniversities>(
        ['userUniversities', variables.userId, variables.universityId],
        (oldData) => {
          if (oldData) {
            return { ...oldData, ringLevel: variables.ringLevel };
          }
          return oldData;
        }
      );
      await queryClient.invalidateQueries(['getRecord', 'userUniversities']);
      await queryClient.invalidateQueries(['getRecords', 'userUniversities']);
    },
  });
}
