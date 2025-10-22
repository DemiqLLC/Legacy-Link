import { selectUserProfileSchema } from '@meltstudio/zod-schemas';
import { makeApi } from '@zodios/core';
import { z } from 'zod';

import { apiCommonErrorSchema } from '@/api/routers/def-utils';

export const userProfileApiDef = makeApi([
  {
    alias: 'createUserProfile',
    description: 'Create a new user profile',
    method: 'post',
    path: '/',
    parameters: [
      {
        type: 'Body',
        description: 'User profile data',
        name: 'body',
        schema: selectUserProfileSchema
          .omit({
            id: true,
            createdAt: true,
            legacyLinkId: true,
            lifetimeGiving: true,
          })
          .extend({
            universityId: z.string(),
            lifetimeGiving: z.number().nullable().optional(),
          }),
      },
    ],
    response: z.object({
      status: z.boolean(),
    }),
    errors: [
      {
        status: 400,
        description: 'Bad Request',
        schema: apiCommonErrorSchema,
      },
    ],
  },
  {
    alias: 'getUserProfileByUserId',
    description: 'Get a user profile by userId',
    method: 'get',
    path: '/by-user/:userId',
    parameters: [
      {
        type: 'Path',
        name: 'userId',
        schema: z.string(),
        description: 'User ID',
      },
    ],
    response: selectUserProfileSchema,
    errors: [
      {
        status: 404,
        description: 'Profile not found',
        schema: apiCommonErrorSchema,
      },
      {
        status: 500,
        description:
          'An unexpected error occurred while retrieving the user profile',
        schema: apiCommonErrorSchema,
      },
    ],
  },
  {
    alias: 'updateUserProfile',
    description: 'Update user profile by userId',
    method: 'put',
    path: '/:userId',
    parameters: [
      {
        type: 'Path',
        name: 'userId',
        schema: z.string(),
      },
      {
        type: 'Body',
        description: 'User profile data to update',
        name: 'body',
        schema: selectUserProfileSchema
          .omit({
            id: true,
            createdAt: true,
            legacyLinkId: true,
            userId: true,
          })
          .partial()
          .extend({
            lifetimeGiving: z.number().nullable().optional(),
          }),
      },
    ],
    response: z.object({
      status: z.boolean(),
      profile: selectUserProfileSchema,
    }),
    errors: [
      {
        status: 404,
        description: 'Profile not found',
        schema: apiCommonErrorSchema,
      },
      {
        status: 400,
        description: 'Bad Request',
        schema: apiCommonErrorSchema,
      },
      {
        status: 500,
        description:
          'An unexpected error occurred while retrieving the user profile',
        schema: apiCommonErrorSchema,
      },
    ],
  },
]);
