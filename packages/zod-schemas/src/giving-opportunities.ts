import { createSchemasForTable, dbSchemas as schema } from '@meltstudio/db';

export const {
  insert: insertGivingOpportunitiesSchema,
  select: selectGivingOpportunitiesSchema,
  sorting: sortingGivingOpportunitiesSchema,
} = createSchemasForTable(schema.givingOpportunities);
