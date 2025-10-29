import { AlgoliaIndex } from '@meltstudio/types';

import { university, users, userUniversities } from '@/db/schema';

import type { IncludeRelationDef } from './base';
import { algoliaModel } from './base';

export const userUniversityRelation: IncludeRelationDef<
  typeof university,
  typeof userUniversities
> = {
  type: 'many',
  index: AlgoliaIndex.USERS,
  model: algoliaModel({
    table: university,
    pkColumn: university.id,
    config: {
      id: {
        canFilter: true,
      },
      name: true,
      createdAt: true,
    },
  }),
  targetTable: userUniversities,
  keys: {
    foreignKey: userUniversities.userId,
    referenceKey: userUniversities.universityId,
  },
  includeRelationData: {
    role: true,
  },
};

export const user = algoliaModel({
  table: users,
  pkColumn: users.id,
  config: {
    id: true,
    name: true,
    email: true,
    active: true,
    createdAt: { canSort: true },
    isSuperAdmin: true,
    profileImage: true,
  },
  includeRelations: {
    universities: userUniversityRelation,
  },
});
