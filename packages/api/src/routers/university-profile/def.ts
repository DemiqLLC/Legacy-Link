import { UserRoleEnum } from '@meltstudio/types';
import { selectUniversityProfileSchema } from '@meltstudio/zod-schemas/src/university-profile';
import { makeApi } from '@zodios/core';
import { z } from 'zod';

import { apiCommonErrorSchema } from '@/api/routers/def-utils';

export const universityProfileApiDef = makeApi([
  {
    alias: 'createUniversityProfile',
    description: 'Create a new university profile',
    method: 'post',
    path: '/',
    parameters: [
      {
        type: 'Body',
        description: 'University profile data',
        name: 'body',
        schema: z.object({
          universityId: z.string(),
          description: z.string(),
          logoFile: z.string(),
          instagramUrl: z.string().url().optional(),
          facebookUrl: z.string().url().optional(),
          companyUrl: z.string().url().optional(),
          linkedinUrl: z.string().url().optional(),
          members: z.array(
            z.object({
              email: z.string(),
              role: z.nativeEnum(UserRoleEnum),
            })
          ),
          // include the user who makes the request as admin in the new university
          includeCreatorInUniversity: z.boolean().optional(),
        }),
      },
    ],
    response: selectUniversityProfileSchema,
    errors: [
      {
        status: 400,
        description: 'Bad Request',
        schema: apiCommonErrorSchema,
      },
      {
        status: 401,
        description: 'Unauthorized',
        schema: apiCommonErrorSchema,
      },
      {
        status: 404,
        description: 'Not found',
        schema: apiCommonErrorSchema,
      },
      {
        status: 409,
        description: 'Profile already exists for this universityId',
        schema: apiCommonErrorSchema,
      },
    ],
  },
  {
    alias: 'getUniversityProfile',
    description: 'Get a university profile by universityId',
    method: 'get',
    path: '/:universityId',
    parameters: [
      {
        type: 'Path',
        description: 'The ID of the university to get the profile for',
        name: 'universityId',
        schema: z.string(),
      },
    ],
    response: selectUniversityProfileSchema,
    errors: [
      {
        status: 401,
        description: 'Invalid auth',
        schema: apiCommonErrorSchema,
      },
      {
        status: 400,
        description: 'UniversityId is required',
        schema: apiCommonErrorSchema,
      },
      {
        status: 404,
        description: 'University profile not found',
        schema: apiCommonErrorSchema,
      },
    ],
  },
  {
    alias: 'updateUniversityProfile',
    description: 'Update an existing university profile',
    method: 'put',
    path: '/:universityId/update',
    parameters: [
      {
        type: 'Path',
        description: 'ID of the university to update the profile for',
        name: 'universityId',
        schema: z.string(),
      },
      {
        type: 'Body',
        description: 'Updated university profile data',
        name: 'body',
        schema: z.object({
          description: z.string().optional(),
          logoFile: z.string().optional(),
          instagramUrl: z.string().url().optional(),
          facebookUrl: z.string().url().optional(),
          companyUrl: z.string().url().optional(),
          linkedinUrl: z.string().url().optional(),
        }),
      },
    ],
    response: selectUniversityProfileSchema,
    errors: [
      {
        status: 401,
        description: 'Unauthorized',
        schema: apiCommonErrorSchema,
      },
      {
        status: 404,
        description: 'University profile not found',
        schema: apiCommonErrorSchema,
      },
    ],
  },
  {
    alias: 'deleteUniversityProfile',
    description: 'Delete a university profile',
    method: 'delete',
    path: '/:universityId/delete',
    parameters: [
      {
        type: 'Path',
        description: 'ID of the university to delete the profile for',
        name: 'universityId',
        schema: z.string(),
      },
    ],
    response: z.object({ success: z.boolean() }),
    errors: [
      {
        status: 401,
        description: 'Unauthorized',
        schema: apiCommonErrorSchema,
      },
      {
        status: 404,
        description: 'University profile not found',
        schema: apiCommonErrorSchema,
      },
    ],
  },
]);
