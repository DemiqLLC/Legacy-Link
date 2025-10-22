import { selectPledgeOpportunitiesSchema } from '@meltstudio/zod-schemas';
import { makeApi } from '@zodios/core';
import { z } from 'zod';

import { apiCommonErrorSchema } from '@/api/routers/def-utils';

export const pledgeOppotunitiesApiDef = makeApi([
  {
    alias: 'createPledgeOpportunity',
    description: 'Create a new pledge',
    method: 'post',
    path: '/',
    parameters: [
      {
        type: 'Body',
        description: 'Pledge data',
        name: 'body',
        schema: selectPledgeOpportunitiesSchema.omit({
          id: true,
          createdAt: true,
          referenceCode: true,
        }),
      },
    ],
    response: z.object({
      pledge: selectPledgeOpportunitiesSchema,
    }),
    errors: [
      {
        status: 400,
        description: 'Invalid format for path',
        schema: apiCommonErrorSchema,
      },
      {
        status: 401,
        description: 'Unauthorized',
        schema: apiCommonErrorSchema,
      },
      {
        status: 500,
        description:
          'An unexpected error occurred while retrieving the pledge opportunities',
        schema: apiCommonErrorSchema,
      },
    ],
  },
  {
    alias: 'getPledgeOpportunitiesByGivingId',
    description:
      'Get all pledge opportunities for a specific giving opportunity',
    method: 'get',
    path: '/:givingOpportunityId',
    parameters: [
      {
        type: 'Path',
        description: 'Giving opportunity ID',
        name: 'givingOpportunityId',
        schema: z.string(),
        required: true,
      },
    ],
    response: z.array(selectPledgeOpportunitiesSchema),
    errors: [
      {
        status: 401,
        description: 'Unauthorized',
        schema: apiCommonErrorSchema,
      },
      {
        status: 404,
        description: 'GivingOpportunities not found',
        schema: apiCommonErrorSchema,
      },
      {
        status: 500,
        description:
          'An unexpected error occurred while retrieving the pledge opportunities',
        schema: apiCommonErrorSchema,
      },
    ],
  },
]);
