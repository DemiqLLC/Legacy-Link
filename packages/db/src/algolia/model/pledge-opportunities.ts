import { AlgoliaIndex } from '@meltstudio/types';

import type { givingOpportunities, university, users } from '@/db/schema';
import { pledgeOpportunities } from '@/db/schema';

import type { NotifyRelationDef } from './base';
import { algoliaModel } from './base';
import { givingOpportunitiesAlgolia } from './giving-opportunities';
import { universities } from './university';
import { user } from './user';

export const opportunitiesUniversityRelation: NotifyRelationDef<
  typeof university
> = {
  type: 'one',
  model: universities,
  index: AlgoliaIndex.UNIVERSITIES,
  targetTable: pledgeOpportunities,
  keys: {
    foreignKey: pledgeOpportunities.universityId,
  },
};

export const userRelation: NotifyRelationDef<typeof users> = {
  type: 'one',
  model: user,
  index: AlgoliaIndex.USERS,
  targetTable: pledgeOpportunities,
  keys: {
    foreignKey: pledgeOpportunities.userId,
  },
};

export const givingOpportunitiesRelation: NotifyRelationDef<
  typeof givingOpportunities
> = {
  type: 'many',
  model: givingOpportunitiesAlgolia,
  index: AlgoliaIndex.GIVING_OPPORTUNITIES,
  targetTable: pledgeOpportunities,
  keys: {
    foreignKey: pledgeOpportunities.givingOpportunityId,
    referenceKey: pledgeOpportunities.id,
  },
};

export const pledgeOpportunitiesAlgolia = algoliaModel({
  table: pledgeOpportunities,
  pkColumn: pledgeOpportunities.id,
  config: {
    id: true,
    email: true,
    status: true,
    pledgeType: true,
    phoneNumber: true,
    reasonForInterest: true,
    createdAt: { canSort: true },
    preferredCommunicationMethod: true,
    userId: {
      canFilter: true,
    },
    universityId: true,
    givingOpportunityId: true,
    referenceCode: true,
  },
  includeRelations: {},
  notifyRelations: {},
});
