import type { UseQueryResult } from '@tanstack/react-query';
import type { ZodiosResponseByAlias } from '@zodios/core';

import type { ZodApi } from './zodios';
import { apiHooks } from './zodios';

export type GivingOpportunity = ZodiosResponseByAlias<
  ZodApi,
  'getGivingOpportunityById'
>;

export function useGetGivingOpportunityById(args: {
  id: string;
}): UseQueryResult<GivingOpportunity | undefined, Error> {
  return apiHooks.useGetGivingOpportunityById(
    {
      params: {
        id: args.id,
      },
    },
    {
      enabled: !!args.id,
    }
  );
}

export type GetGivingOpportunitiesByUniversityId = ZodiosResponseByAlias<
  ZodApi,
  'getGivingOpportunitiesByUniversityId'
>;

export function useGetGivingOpportunitiesByUniversityId(args: {
  universityId: string;
}): UseQueryResult<GetGivingOpportunitiesByUniversityId | undefined, Error> {
  return apiHooks.useGetGivingOpportunitiesByUniversityId(
    {
      params: {
        universityId: args.universityId,
      },
    },
    {
      enabled: !!args.universityId,
    }
  );
}
