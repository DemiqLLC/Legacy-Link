import { AlgoliaIndex } from '@meltstudio/types';

import type { university, users } from '@/db/schema';
import { userUniversities } from '@/db/schema';

import type { NotifyRelationDef } from './base';
import { algoliaModel } from './base';
import { universities } from './university';
import { user } from './user';

export const userUniversityUserRelation: NotifyRelationDef<typeof users> = {
  type: 'one',
  model: user,
  index: AlgoliaIndex.USERS,
  targetTable: userUniversities,
  keys: {
    foreignKey: userUniversities.userId,
  },
};

export const userUniversityUniversityRelation: NotifyRelationDef<
  typeof university
> = {
  type: 'one',
  model: universities,
  index: AlgoliaIndex.UNIVERSITIES,
  targetTable: userUniversities,
  keys: {
    foreignKey: userUniversities.universityId,
  },
};

export const userUniversitiesModel = algoliaModel({
  table: userUniversities,
  pkColumn: userUniversities.userId,
  config: {
    userId: true,
    universityId: true,
    role: {
      canFilter: true,
    },
    ringLevel: true,
  },
  notifyRelations: {
    user: userUniversityUserRelation,
    university: userUniversityUniversityRelation,
  },
});
