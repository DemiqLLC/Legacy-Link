import { IntegrationsKeys } from '@meltstudio/types';
import { selectIntegrationWithKeysSchema } from '@meltstudio/zod-schemas';
import { makeApi } from '@zodios/core';
import { z } from 'zod';

import { apiCommonErrorSchema } from '@/api/routers/def-utils';

export const integrationsApiDef = makeApi([
  {
    alias: 'listIntegrationKeys',
    description:
      'List integration keys for an specific university and platform',
    method: 'get',
    path: '/keys/:universityId/:platform',
    response: selectIntegrationWithKeysSchema.or(z.null()),
    parameters: [
      {
        type: 'Path',
        description: 'University ID',
        name: 'universityId',
        schema: z.string(),
      },
      {
        type: 'Path',
        description: 'Integration platform (Zapier, shopify, etc.)',
        name: 'platform',
        schema: z.nativeEnum(IntegrationsKeys),
      },
    ],
    errors: [
      {
        status: 401,
        description: 'Invalid auth',
        schema: apiCommonErrorSchema,
      },
    ],
  },
  {
    alias: 'saveIntegrationKeys',
    description: 'Save API keys for a university integration',
    method: 'post',
    path: '/keys/:universityId/:platform',
    response: z.void(),
    parameters: [
      {
        type: 'Path',
        description: 'University ID',
        name: 'universityId',
        schema: z.string(),
      },
      {
        type: 'Path',
        description: 'Integration platform (Zapier, shopify, etc.)',
        name: 'platform',
        schema: z.nativeEnum(IntegrationsKeys),
      },
      {
        name: 'body',
        type: 'Body',
        schema: z.object({
          enabled: z.boolean(),
          keys: z.array(
            z.object({
              name: z.string(),
              value: z.string(),
            })
          ),
        }),
      },
    ],
    errors: [
      {
        status: 401,
        description: 'Invalid auth',
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
