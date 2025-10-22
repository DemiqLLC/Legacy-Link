import { LegacyRingLevelEnum, UserRoleEnum } from '@meltstudio/types';
import { pgEnum, pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core';

import type { InferResultType } from '@/db/utils';

import type { TableSorting } from './base';
import { enumToPgEnum } from './base';
import { university } from './university';
import { roleEnum, users } from './users';

export const legacyRingLevelEnum = pgEnum(
  'legacy_ring_level',
  enumToPgEnum(LegacyRingLevelEnum)
);

export const userUniversities = pgTable(
  'user_universities',
  {
    userId: uuid()
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    universityId: uuid()
      .references(() => university.id, { onDelete: 'cascade' })
      .notNull(),
    role: roleEnum().notNull().default(UserRoleEnum.ALUMNI),
    ringLevel: legacyRingLevelEnum(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.universityId] }),
  })
);

export type DbUserUniversities = typeof userUniversities.$inferSelect;
export type DbUserUniversityExtended = InferResultType<
  'userUniversities',
  {
    user: true;
    university: true;
  }
>;

export type DbNewUserUniversities = typeof userUniversities.$inferInsert;
export type DbUserUniversitiesSorting = TableSorting<DbUserUniversities>;
