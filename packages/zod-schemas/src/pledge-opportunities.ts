import { createSchemasForTable, dbSchemas as schema } from '@meltstudio/db';

export const {
  insert: insertPledgeOpportunitiesSchema,
  select: selectPledgeOpportunitiesSchema,
  sorting: sortingPledgeOpportunitiesSchema,
} = createSchemasForTable(schema.pledgeOpportunities);
