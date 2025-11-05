import { pgTable, varchar } from 'drizzle-orm/pg-core';

import type { InferResultType } from '@/db/utils';

import type { TableSorting } from './base';
import { baseFields } from './base';

export const university = pgTable('university', {
  ...baseFields,
  name: varchar({ length: 256 }).notNull(),
  referenceCode: varchar({ length: 50 }).notNull().unique(),
  universityAbbreviation: varchar({ length: 10 }).notNull().unique(),
  legacyLinkFoundationCode: varchar({ length: 20 }).notNull().unique(),
});

export type DbUniversity = typeof university.$inferSelect;
export type DbUniversityExtended = InferResultType<
  'university',
  { users: true }
>;
export type DbNewUniversity = typeof university.$inferInsert;
export type DbUniversitysSorting = TableSorting<DbUniversity>;
