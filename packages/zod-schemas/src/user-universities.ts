import { createSchemasForTable, dbSchemas } from '@meltstudio/db';

export const {
  insert: insertUserUniversitiesSchema,
  select: selectUserUniversitiesSchema,
  sorting: sortingUserUniversitiesSchema,
} = createSchemasForTable(dbSchemas.userUniversities);
