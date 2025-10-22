import { createSchemasForTable, dbSchemas } from '@meltstudio/db';

export const {
  insert: insertUniversitySchema,
  select: selectUniversitySchema,
  sorting: sortingUniversitySchema,
} = createSchemasForTable(dbSchemas.university);
