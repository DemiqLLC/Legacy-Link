import { createSchemasForTable, dbSchemas } from '@meltstudio/db';

export const {
  insert: insertUniversityProfileSchema,
  select: selectUniversityProfileSchema,
  sorting: sortingUniversityProfileSchema,
} = createSchemasForTable(dbSchemas.universityProfile);
