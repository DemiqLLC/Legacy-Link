import { boolean, numeric, pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

import { baseFields } from './base';
import { university } from './university';

export const givingOpportunities = pgTable('giving_opportunities', {
  ...baseFields,
  name: varchar({ length: 256 }).notNull(),
  description: varchar({ length: 512 }).notNull(),
  goalAmount: numeric({ precision: 12, scale: 2 }).notNull(),
  referenceCode: varchar({ length: 50 }).notNull().unique(),
  isActive: boolean().notNull().default(true),
  universityId: uuid()
    .notNull()
    .references(() => university.id, {
      onDelete: 'cascade',
    }),
});

export type DbGivingOpportunities = typeof givingOpportunities.$inferSelect;
