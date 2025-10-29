import { AlgoliaIndex } from '@meltstudio/types';

import type { university } from '@/db/schema';
import { givingOpportunities } from '@/db/schema';

import type { NotifyRelationDef } from './base';
import { algoliaModel } from './base';
import { universities } from './university';

export const opportunitiesUniversityRelation: NotifyRelationDef<
  typeof university
> = {
  type: 'one',
  model: universities,
  index: AlgoliaIndex.UNIVERSITIES,
  targetTable: givingOpportunities,
  keys: {
    foreignKey: givingOpportunities.universityId,
  },
};

export const givingOpportunitiesAlgolia = algoliaModel({
  table: givingOpportunities,
  pkColumn: givingOpportunities.id,
  config: {
    id: true,
    name: true,
    isActive: {
      canFilter: true,
    },
    goalAmount: true,
    description: true,
    universityId: true,
    referenceCode: true,
    createdAt: { canSort: true },
  },
  includeRelations: {
    university: opportunitiesUniversityRelation,
  },
  notifyRelations: {
    universityId: opportunitiesUniversityRelation,
  },
});
