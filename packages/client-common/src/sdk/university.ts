import type { UseQueryResult } from '@tanstack/react-query';
import type { ZodiosResponseByAlias } from '@zodios/core';

import type { ZodApi } from './zodios';
import { apiHooks } from './zodios';

export type University = ZodiosResponseByAlias<ZodApi, 'getUniversityId'>;

export function useGetUniversityId(args: {
  id: string;
}): UseQueryResult<University | undefined, Error> {
  return apiHooks.useGetUniversityId(
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
