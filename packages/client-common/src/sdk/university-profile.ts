import type { UseQueryResult } from '@tanstack/react-query';
import type { ZodiosBodyByAlias, ZodiosResponseByAlias } from '@zodios/core';

import type { ZodApi } from './zodios';
import { apiHooks } from './zodios';

export function useUpdateUniversityProfile(
  ...params: Parameters<typeof apiHooks.useUpdateUniversityProfile>
): ReturnType<typeof apiHooks.useUpdateUniversityProfile> {
  return apiHooks.useUpdateUniversityProfile(...params);
}

export function useDeleteUniversityProfile(
  ...params: Parameters<typeof apiHooks.useDeleteUniversityProfile>
): ReturnType<typeof apiHooks.useDeleteUniversityProfile> {
  return apiHooks.useDeleteUniversityProfile(...params);
}

export type CreateUniversityProfile = ZodiosBodyByAlias<
  ZodApi,
  'createUniversityProfile'
>;

export function useCreateUniversityProfile(): ReturnType<
  typeof apiHooks.useCreateUniversityProfile
> {
  return apiHooks.useCreateUniversityProfile();
}

export type UniversityProfile = ZodiosResponseByAlias<
  ZodApi,
  'getUniversityProfile'
>;

export function useGetUniversityProfile(args: {
  universityId: string;
}): UseQueryResult<UniversityProfile | undefined, Error> {
  const { universityId } = args;

  return apiHooks.useGetUniversityProfile({ params: { universityId } });
}
