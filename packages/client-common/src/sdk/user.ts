import type { MemberFiltersType } from '@meltstudio/types';
import type { QueryKey, UseQueryResult } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import type { ZodiosResponseByAlias } from '@zodios/core';
import QueryString from 'qs';

import type { ZodApi } from './zodios';
import { apiHooks } from './zodios';

export type User = ZodiosResponseByAlias<ZodApi, 'getOwnUser'>;

type GetOwnUserReturn = UseQueryResult<User | undefined, Error> & {
  invalidate: () => Promise<void>;
};

export function useGetOwnUser(hasSession: boolean): GetOwnUserReturn {
  return apiHooks.useGetOwnUser(
    {},
    {
      enabled: hasSession,
    }
  );
}

export type UseInvalidateGetOwnUserReturn = {
  invalidate: () => Promise<void>;
};

export type Users = ZodiosResponseByAlias<ZodApi, 'listUsers'>;

// TODO: create a reusable function to handle pagination, filters, and sorting
export function useListUsers(params?: {
  pagination?: {
    pageIndex: number;
    pageSize: number;
  };
  filters?: MemberFiltersType & {
    search?: string;
  };
  sorting?: {
    column: 'name' | 'email' | 'createdAt';
    order: 'asc' | 'desc';
  }[];
  enabled?: boolean;
}): UseQueryResult<Users | undefined, Error> {
  return apiHooks.useListUsers(
    {
      queries: {
        query: {
          pagination: params?.pagination,
          filters: params?.filters,
          sorting: params?.sorting,
        },
      },
      // TODO: Move this serializer globally when option is available for zodios
      paramsSerializer: (data) => QueryString.stringify(data),
    },
    {
      keepPreviousData: true,
      enabled: params?.enabled !== undefined ? params.enabled : true,
    }
  );
}

export type UseInvalidateListUsersReturn = {
  invalidate: () => Promise<void>;
};

export type UniversityMembers = ZodiosResponseByAlias<
  ZodApi,
  'universityMembers'
>;

export function getUniversityMembersKey(universityId: string): QueryKey {
  return apiHooks.getKeyByPath<'get', '/api/users/:universityId/members'>(
    'get',
    '/api/users/:universityId/members',
    {
      params: { universityId },
    }
  );
}

export function useUniversityMembers(params: {
  universityId: string;
  enabled?: boolean;
}): UseQueryResult<UniversityMembers | undefined, Error> {
  return apiHooks.useUniversityMembers(
    {
      params: { universityId: params.universityId },
    },
    {
      enabled: params?.enabled !== undefined ? params.enabled : true,
    }
  );
}

export function useInvalidateListUsers(): UseInvalidateListUsersReturn {
  const { invalidate } = apiHooks.useListUsers();
  return { invalidate };
}

export function useUpdateOwnUser(
  ...params: Parameters<typeof apiHooks.useUpdateOwnUser>
): ReturnType<typeof apiHooks.useUpdateOwnUser> {
  return apiHooks.useUpdateOwnUser(...params);
}

export function useUpdateUserUniversityRole(
  args: {
    params: { universityId: string };
  },
  hooks?: { onSuccess?: () => Promise<void>; onError?: (error: Error) => void }
): ReturnType<typeof apiHooks.useUpdateUserUniversityRole> {
  const queryClient = useQueryClient();
  return apiHooks.useUpdateUserUniversityRole(
    { params: args.params },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          getUniversityMembersKey(args.params.universityId)
        );
        if (hooks?.onSuccess) {
          await hooks.onSuccess();
        }
      },
      onError: hooks?.onError,
    }
  );
}

export type Invitation = ZodiosResponseByAlias<ZodApi, 'getInvitation'>;

export function useGetInvitation(params: {
  queries: { token: string };
}): UseQueryResult<Invitation | undefined, Error> {
  return apiHooks.useGetInvitation(params, {
    enabled: !!params.queries.token,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

export function useInviteMember(args: {
  universityId: string;
}): ReturnType<typeof apiHooks.useInviteMember> {
  return apiHooks.useInviteMember({
    params: { universityId: args.universityId },
  });
}

export function useDeleteUser(
  ...params: Parameters<typeof apiHooks.useDeleteUser>
): ReturnType<typeof apiHooks.useDeleteUser> {
  return apiHooks.useDeleteUser(...params);
}

export function useMemberAcceptInvitation(
  ...params: Parameters<typeof apiHooks.useMemberAcceptInvitation>
): ReturnType<typeof apiHooks.useMemberAcceptInvitation> {
  return apiHooks.useMemberAcceptInvitation(...params);
}
