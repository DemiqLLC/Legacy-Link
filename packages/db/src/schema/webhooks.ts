import { sql } from 'drizzle-orm';
import { pgTable, text, uuid } from 'drizzle-orm/pg-core';

import { baseFields } from './base';
import { university } from './university';

export const webhooks = pgTable('webhooks', {
  ...baseFields,
  name: text().notNull(),
  url: text().notNull(),
  universityId: uuid()
    .notNull()
    .references(() => university.id, {
      onDelete: 'cascade',
    }),
  eventTypes: text()
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
});

export type DbWebhooks = typeof webhooks.$inferSelect;
