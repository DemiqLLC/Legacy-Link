import { selectGivingOpportunitiesSchema } from '@meltstudio/zod-schemas';
import { makeApi } from '@zodios/core';
import { z } from 'zod';

import { apiCommonErrorSchema } from '@/api/routers/def-utils';

export const givingOpportunitiesApiDef = makeApi([
  {
    alias: 'getGivingOpportunityById',
    description: 'Get givingOpportunities by id',
    method: 'get',
    path: '/:id',
    parameters: [
      {
        type: 'Path',
        description: 'GivingOpportunity record id',
        name: 'id',
        schema: z.string(),
        required: true,
      },
    ],
    response: selectGivingOpportunitiesSchema.extend({
      universityName: z.string(),
    }),
    errors: [
      {
        status: 401,
        description: 'Unauthorized',
        schema: apiCommonErrorSchema,
      },
      {
        status: 404,
        description: 'GivingOpportunity record not found',
        schema: apiCommonErrorSchema,
      },
    ],
  },
  {
    alias: 'getGivingOpportunitiesByUniversityId',
    description: 'Get all giving opportunities for a specific university',
    method: 'get',
    path: '/university/:universityId',
    parameters: [
      {
        type: 'Path',
        description: 'University ID',
        name: 'universityId',
        schema: z.string(),
        required: true,
      },
    ],
    response: z.array(selectGivingOpportunitiesSchema),
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
    ],
  },
]);
