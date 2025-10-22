import { selectUniversitySchema } from '@meltstudio/zod-schemas';
import { makeApi } from '@zodios/core';
import { z } from 'zod';

import { apiCommonErrorSchema } from '@/api/routers/def-utils';

export const universityApiDef = makeApi([
  {
    alias: 'getUniversityId',
    description: 'Get university by id',
    method: 'get',
    path: '/:id',
    parameters: [
      {
        type: 'Path',
        description: 'University record id',
        name: 'id',
        schema: z.string(),
        required: true,
      },
    ],
    response: selectUniversitySchema.extend({
      description: z.string(),
    }),
    errors: [
      {
        status: 401,
        description: 'Unauthorized',
        schema: apiCommonErrorSchema,
      },
      {
        status: 404,
        description: 'University record not found',
        schema: apiCommonErrorSchema,
      },
    ],
  },
]);
