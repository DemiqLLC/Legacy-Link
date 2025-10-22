import type { UseQueryResult } from '@tanstack/react-query';
import type { ZodiosBodyByAlias } from '@zodios/core';

import type { ZodApi } from './zodios';
import { apiHooks } from './zodios';

export type CreateUserProfile = ZodiosBodyByAlias<ZodApi, 'createUserProfile'>;

export function useCreateUserProfile(): ReturnType<
  typeof apiHooks.useCreateUserProfile
> {
  return apiHooks.useCreateUserProfile();
}

export type GetUserProfileByUserId = ZodiosBodyByAlias<
  ZodApi,
  'getUserProfileByUserId'
>;

export function useGetUserProfileByUserId(args: {
  userId: string;
}): UseQueryResult<GetUserProfileByUserId | undefined, Error> {
  return apiHooks.useGetUserProfileByUserId(
    {
      params: {
        userId: args.userId,
      },
    },
    {
      enabled: !!args.userId,
    }
  );
}

export function useUpdateUserProfile(
  ...params: Parameters<typeof apiHooks.useUpdateUserProfile>
): ReturnType<typeof apiHooks.useUpdateUserProfile> {
  return apiHooks.useUpdateUserProfile(...params);
}
