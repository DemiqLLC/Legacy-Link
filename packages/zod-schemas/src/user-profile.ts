import { createSchemasForTable, dbSchemas } from '@meltstudio/db';

export const {
  insert: insertUserProfileSchema,
  select: selectUserProfileSchema,
  sorting: sortingUserProfileSchema,
} = createSchemasForTable(dbSchemas.userProfile);
