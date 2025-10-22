import { pgTable, uuid } from 'drizzle-orm/pg-core';

import type { InferResultType } from '@/db/utils';

import type { TableSorting } from './base';
import { baseUniversityFields } from './university-base';
import { users } from './users';

export const chat = pgTable('chat', {
  ...baseUniversityFields,
  userId: uuid()
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
});

export type DbChat = typeof chat.$inferSelect;
export type DbNewChat = typeof chat.$inferInsert;
export type DbChatSorting = TableSorting<DbChat>;

export type DbMessageExtended = InferResultType<'chat', { messages: true }>;
