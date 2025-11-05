import { makeApi } from '@zodios/core';
import { z } from 'zod';

import { apiCommonErrorSchema } from '@/api/routers/def-utils';

const recentActivitySchema = z.object({
  id: z.string(),
  date: z.string(),
  pledgeType: z.string().nullable(),
  universityName: z.string().nullable(),
  givingOpportunityName: z.string().nullable(),
});

const alumniStatsSchema = z.object({
  totalPledges: z.number(),
  legacyRingLevel: z.string().nullable(),
  monetaryPledgesList: z.array(recentActivitySchema),
  nonMonetaryPledgesList: z.array(recentActivitySchema),
});

export type AlumniStats = z.infer<typeof alumniStatsSchema>;

export const alumniApiDef = makeApi([
  {
    alias: 'getAlumniDashboard',
    description: "Fetch data for the alumni's personal dashboard",
    method: 'get',
    immutable: true,
    path: '/dashboard',
    status: 200,
    response: alumniStatsSchema,
    errors: [
      {
        status: 401,
        description: 'Unauthorized',
        schema: apiCommonErrorSchema,
      },
      {
        status: 400,
        description: 'Error fetching data',
        schema: apiCommonErrorSchema,
      },
      {
        status: 500,
        description: 'Internal Server Error',
        schema: apiCommonErrorSchema,
      },
    ],
  },
]);
