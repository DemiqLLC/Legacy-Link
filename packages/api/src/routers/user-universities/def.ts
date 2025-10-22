import { selectUserUniversitiesSchema } from '@meltstudio/zod-schemas';
import { makeApi } from '@zodios/core';
import { z } from 'zod';

import { apiCommonErrorSchema } from '@/api/routers/def-utils';

export const userUniversitiesApiDef = makeApi([
  {
    alias: 'createUserUniversity',
    description: 'Create a new user university',
    method: 'post',
    path: '/',
    parameters: [
      {
        type: 'Body',
        description: 'User university data',
        name: 'body',
        schema: z.object({
          universityId: z.string(),
          email: z.string(),
          role: z.string(),
        }),
      },
    ],
    response: selectUserUniversitiesSchema,
    errors: [
      {
        status: 404,
        description: 'User not exist',
        schema: apiCommonErrorSchema,
      },
    ],
  },
  {
    alias: 'updateLegacyRing',
    description: 'Update legacy ring level for a user university',
    method: 'put',
    path: '/legacy-ring',
    parameters: [
      {
        type: 'Body',
        description: 'Legacy ring data',
        name: 'body',
        schema: z.object({
          userId: z.string().uuid(),
          universityId: z.string().uuid(),
          ringLevel: z.string(),
        }),
      },
    ],
    response: z.object({ success: z.boolean() }),
    errors: [
      {
        status: 404,
        description: 'User university not found',
        schema: apiCommonErrorSchema,
      },
      {
        status: 400,
        description: 'Invalid ring level',
        schema: apiCommonErrorSchema,
      },
    ],
  },
]);
