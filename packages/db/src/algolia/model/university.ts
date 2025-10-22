import { AlgoliaIndex } from '@meltstudio/types';

import type { users } from '@/db/schema';
import { university, userUniversities } from '@/db/schema';

import type { NotifyRelationDef } from './base';
import { algoliaModel } from './base';
import { user } from './user';

export const universityUserRelation: NotifyRelationDef<typeof users> = {
  type: 'many',
  model: user,
  index: AlgoliaIndex.USERS,
  targetTable: userUniversities,
  keys: {
    foreignKey: userUniversities.universityId,
    referenceKey: userUniversities.userId,
  },
};

export const universities = algoliaModel({
  table: university,

  pkColumn: university.id,
  config: {
    id: true,
    name: true,
    referenceCode: true,
    createdAt: { canSort: true },
  },

  notifyRelations: {
    users: universityUserRelation,
  },
});
