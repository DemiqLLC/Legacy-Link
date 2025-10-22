import {
  boolean,
  pgTable,
  text,
  unique,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import type { InferResultType } from '@/db/utils';

import type { TableSorting } from './base';
import { baseFields } from './base';
import { globalFeatureFlags } from './global-feature-flags';
import { university } from './university';

export const featureFlag = pgTable(
  'feature_flag',
  {
    ...baseFields,
    flag: varchar({ length: 64 }).notNull(),
    description: text().notNull().default(''),
    released: boolean().notNull().default(false),
    universityId: uuid()
      .notNull()
      .references(() => university.id, {
        onDelete: 'cascade',
      }),
    globalFeatureFlagId: uuid()
      .notNull()
      .references(() => globalFeatureFlags.id, {
        onDelete: 'cascade',
      }),
  },
  (t) => [unique().on(t.universityId, t.globalFeatureFlagId)]
);

export type DbFeatureFlag = typeof featureFlag.$inferSelect;
export type DbFeatureFlagExtended = InferResultType<
  'featureFlag',
  {
    users: true;
    university: true;
    globalFeatureFlag: true;
  }
>;
export type DbNewFeatureFlag = typeof featureFlag.$inferInsert;
export type DbFeatureFlagSorting = TableSorting<DbFeatureFlag>;
