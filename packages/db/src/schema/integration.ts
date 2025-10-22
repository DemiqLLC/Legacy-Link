import { IntegrationsKeys } from '@meltstudio/types';
import { boolean, pgEnum, pgTable, unique, uuid } from 'drizzle-orm/pg-core';

import type { InferResultType } from '@/db/utils';

import type { TableSorting } from './base';
import { baseFields, enumToPgEnum } from './base';
import { university } from './university';

export const platformEnum = pgEnum('platform', enumToPgEnum(IntegrationsKeys));

export const integration = pgTable(
  'integration',
  {
    ...baseFields,

    platform: platformEnum().notNull(),
    enabled: boolean().notNull(),
    universityId: uuid()
      .notNull()
      .references(() => university.id, {
        onDelete: 'cascade',
      }),
  },
  (table) => [unique().on(table.platform, table.universityId)]
);

export type DbIntegration = typeof integration.$inferSelect;
export type DbIntegrationExtended = InferResultType<
  'integration',
  {
    integrationKeys: true;
  }
>;
export type DbNewIntegration = typeof integration.$inferInsert;
export type DbIntegrationSorting = TableSorting<DbIntegration>;
