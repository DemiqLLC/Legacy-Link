import { pgTable, primaryKey, text, uuid, varchar } from 'drizzle-orm/pg-core';

import { university } from './university';

export const universityProfile = pgTable(
  'university_profile',
  {
    universityId: uuid('university_id')
      .references(() => university.id, { onDelete: 'cascade' })
      .notNull(),
    description: text().notNull(),
    logoFile: varchar({ length: 256 }).notNull(),
    instagramUrl: varchar({ length: 256 }),
    facebookUrl: varchar({ length: 256 }),
    companyUrl: varchar({ length: 256 }),
    linkedinUrl: varchar({ length: 256 }),
  },
  (t) => [primaryKey({ columns: [t.universityId] })]
);

export type DbUniversityProfile = typeof universityProfile.$inferSelect;
export type DbNewUniversityProfile = typeof universityProfile.$inferInsert;
