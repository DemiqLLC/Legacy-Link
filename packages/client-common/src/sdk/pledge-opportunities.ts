import type { UseQueryResult } from '@tanstack/react-query';
import type { ZodiosBodyByAlias, ZodiosResponseByAlias } from '@zodios/core';

import type { ZodApi } from './zodios';
import { apiHooks } from './zodios';

export type CreatePledgeOpportunity = ZodiosBodyByAlias<
  ZodApi,
  'createPledgeOpportunity'
>;

export function useCreatePledgeOpportunity(): ReturnType<
  typeof apiHooks.useCreatePledgeOpportunity
> {
  return apiHooks.useCreatePledgeOpportunity();
}

export type GetPledgeOpportunitiesByGivingId = ZodiosResponseByAlias<
  ZodApi,
  'getPledgeOpportunitiesByGivingId'
>;

export function useGetPledgeOpportunitiesByGivingId(args: {
  givingOpportunityId: string;
}): UseQueryResult<GetPledgeOpportunitiesByGivingId | undefined, Error> {
  return apiHooks.useGetPledgeOpportunitiesByGivingId(
    {
      params: {
        givingOpportunityId: args.givingOpportunityId,
      },
    },
    {
      enabled: !!args.givingOpportunityId,
    }
  );
}
