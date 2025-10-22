import { createSchemasForTable, dbSchemas } from '@meltstudio/db';
import { z } from 'zod';

import { selectUniversitySchema } from './university';
import { selectUserFeatureFlagsSchema } from './user-feature-flags';
import { selectUserUniversitiesSchema } from './user-universities';

export const {
  insert: insertUserSchema,
  select: selectUserSchemaWithPassword,
  sorting: sortingUserSchema,
} = createSchemasForTable(dbSchemas.users, {
  insert: {
    id: (s) => s.uuid(),
    email: (s) => s.email(),
  },
  select: {
    id: (s) => s.uuid(),
    email: (s) => s.email(),
    secret2fa: (s) => s.nullish(),
    profileImage: (s) => s.nullable(),
  },
});

const userUniversities = z
  .object({
    university: selectUniversitySchema,
  })
  .merge(selectUserUniversitiesSchema);

export const selectUserSchema = selectUserSchemaWithPassword.omit({
  password: true,
  secret2fa: true,
});

const featureFlags = z.object({
  featureFlags: z.array(selectUserFeatureFlagsSchema),
});

const universities = z.object({
  universities: z.array(userUniversities),
});

const universitiesWithRole = z.object({
  universities: z.array(selectUserUniversitiesSchema),
});

export const selectUserSchemaWithPasswordExtendedSchema =
  selectUserSchemaWithPassword.merge(featureFlags).merge(universities);

export const selectUserSchemaWithRole =
  selectUserSchema.merge(universitiesWithRole);
