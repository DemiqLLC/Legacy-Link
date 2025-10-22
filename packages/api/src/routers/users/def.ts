import { UserRoleEnum } from '@meltstudio/types';
import {
  selectMemberInvitationSchema,
  selectUserSchema,
  selectUserSchemaWithPasswordExtendedSchema,
  selectUserSchemaWithRole,
} from '@meltstudio/zod-schemas';
import { makeApi } from '@zodios/core';
import { z } from 'zod';

import { apiCommonErrorSchema } from '@/api/routers/def-utils';
import { createPaginationResponseSchema } from '@/api/types/paginated-response';
import { CreateUserParamsSchema, UserListArgsSchema } from '@/api/types/users';

const UsersPaginatedResponse = createPaginationResponseSchema(selectUserSchema);

export const usersApiDef = makeApi([
  {
    alias: 'getOwnUser',
    description: 'Get own user',
    method: 'get',
    path: '/me',
    response: z.object(selectUserSchemaWithPasswordExtendedSchema.shape),
    errors: [
      {
        status: 401,
        description: 'Invalid auth',
        schema: apiCommonErrorSchema,
      },
      {
        status: 404,
        description: 'No user found',
        schema: apiCommonErrorSchema,
      },
    ],
  },
  {
    alias: 'updateOwnUser',
    description: 'Update own user',
    method: 'put',
    path: '/:universityId/me',
    response: selectUserSchema,
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: z.object({
          name: z.string().optional(),
          email: z.string().optional(),
          profileImage: z.string().nullable().optional(),
        }),
      },
      {
        name: 'universityId',
        type: 'Path',
        schema: z.string(),
      },
    ],
    errors: [
      {
        status: 401,
        description: 'Invalid auth',
        schema: apiCommonErrorSchema,
      },
      {
        status: 404,
        description: 'No user found',
        schema: apiCommonErrorSchema,
      },
      {
        status: 500,
        description: 'Internal Server Error',
        schema: apiCommonErrorSchema,
      },
    ],
  },
  {
    alias: 'listUsers',
    description: 'List users',
    method: 'get',
    path: '/list',
    response: UsersPaginatedResponse,
    immutable: true,
    parameters: [
      {
        type: 'Query',
        description: 'List users',
        name: 'query',
        schema: UserListArgsSchema,
      },
    ],
    errors: [
      {
        status: 401,
        description: 'Invalid auth',
        schema: apiCommonErrorSchema,
      },
      {
        status: 404,
        description: 'No users found',
        schema: apiCommonErrorSchema,
      },
    ],
  },
  {
    alias: 'deleteUser',
    description: 'Delete an user',
    method: 'delete',
    path: '/:universityId/remove',
    immutable: true,
    parameters: [
      {
        type: 'Body',
        description: 'User ID',
        name: 'query',
        schema: z.object({
          id: z.string(),
        }),
      },
      {
        type: 'Path',
        description: 'University ID',
        name: 'universityId',
        schema: z.string(),
      },
    ],
    response: z.object({
      success: z.boolean(),
    }),
    errors: [
      {
        status: 401,
        description: 'Invalid auth',
        schema: apiCommonErrorSchema,
      },
    ],
  },
  {
    alias: 'updateUserUniversityRole',
    description: 'Update users role in specific universities',
    method: 'put',
    path: '/:universityId/role',
    response: z.void(),
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: z.object({
          userId: z.string().uuid(),
          role: z.nativeEnum(UserRoleEnum),
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
        status: 404,
        description: 'User or university not found',
        schema: apiCommonErrorSchema,
      },
    ],
  },
  {
    alias: 'inviteMember',
    description: 'Invite a member',
    method: 'post',
    path: '/:universityId/invite',
    parameters: [
      {
        type: 'Body',
        description: 'Member invitation data',
        name: 'body',
        schema: z.object({
          email: z.string().email(),
          role: z.nativeEnum(UserRoleEnum),
        }),
      },
      {
        type: 'Path',
        description: 'University ID',
        name: 'universityId',
        schema: z.string(),
      },
    ],
    response: z.object({
      success: z.boolean(),
    }),
    errors: [
      {
        status: 400,
        description: 'Bad Request',
        schema: apiCommonErrorSchema,
      },
      {
        status: 401,
        description: 'Invalid auth',
        schema: apiCommonErrorSchema,
      },
      {
        status: 404,
        description: 'The sender user was not found',
        schema: apiCommonErrorSchema,
      },
      {
        status: 500,
        description: 'Internal server error',
        schema: apiCommonErrorSchema,
      },
    ],
  },
  {
    alias: 'memberAcceptInvitation',
    description: 'Accept an invitation',
    method: 'post',
    path: '/invite/accept',
    parameters: [
      {
        type: 'Body',
        description: 'Member invitation data',
        name: 'body',
        schema: CreateUserParamsSchema.partial()
          .omit({
            email: true,
            role: true,
            universityId: true,
          })
          .merge(z.object({ token: z.string() })),
      },
    ],
    response: z.object({
      success: z.boolean(),
      user: selectUserSchema.pick({ id: true }),
      universityId: z.string(),
      name: z.string(),
    }),
    errors: [
      {
        status: 400,
        description: 'Bad Request',
        schema: apiCommonErrorSchema,
      },
      {
        status: 401,
        description: 'Invalid auth',
        schema: apiCommonErrorSchema,
      },
      {
        status: 404,
        description: 'The sender user was not found',
        schema: apiCommonErrorSchema,
      },
      {
        status: 500,
        description: 'Internal server error',
        schema: apiCommonErrorSchema,
      },
    ],
  },
  {
    alias: 'getInvitation',
    description: 'Get an existing invitation',
    method: 'get',
    path: '/invite/get',
    parameters: [
      {
        type: 'Query',
        description: 'Member invitation token',
        name: 'token',
        schema: z.string(),
      },
    ],
    response: selectMemberInvitationSchema
      .omit({
        expiresAt: true,
        userId: true,
        universityId: true,
      })
      .merge(z.object({ university: z.string(), isNewUser: z.boolean() })),
    errors: [
      {
        status: 400,
        description: 'Bad Request',
        schema: apiCommonErrorSchema,
      },
      {
        status: 404,
        description: 'The sender user was not found',
        schema: apiCommonErrorSchema,
      },
    ],
  },
  {
    alias: 'universityMembers',
    description: 'Get university members',
    method: 'get',
    path: '/:universityId/members',
    response: z.array(selectUserSchemaWithRole),
    immutable: true,
    parameters: [
      {
        type: 'Path',
        description: 'University ID',
        name: 'universityId',
        schema: z.string(),
      },
    ],
    errors: [
      {
        status: 401,
        description: 'Invalid auth',
        schema: apiCommonErrorSchema,
      },
      {
        status: 404,
        description: 'No users found',
        schema: apiCommonErrorSchema,
      },
    ],
  },
]);
