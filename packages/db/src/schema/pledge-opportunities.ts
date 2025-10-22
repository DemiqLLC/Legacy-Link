import {
  CommunicationMethodEnum,
  PledgeStatusEnum,
  PledgeTypeEnum,
} from '@meltstudio/types';
import { pgEnum, pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core';

import { baseFields, enumToPgEnum } from './base';
import { givingOpportunities } from './giving-opportunities';
import { university } from './university';
import { users } from './users';

export const pledgeTypeEnum = pgEnum(
  'pledge_type',
  enumToPgEnum(PledgeTypeEnum)
);
export const pledgeStatusEnum = pgEnum(
  'pledge_status',
  enumToPgEnum(PledgeStatusEnum)
);
export const communicationMethodEnum = pgEnum(
  'communication_method',
  enumToPgEnum(CommunicationMethodEnum)
);

export const pledgeOpportunities = pgTable('pledge_opportunities', {
  ...baseFields,
  userId: uuid()
    .notNull()
    .references(() => users.id, {
      onDelete: 'cascade',
    }),
  universityId: uuid()
    .notNull()
    .references(() => university.id, {
      onDelete: 'cascade',
    }),
  givingOpportunityId: uuid()
    .notNull()
    .references(() => givingOpportunities.id, {
      onDelete: 'cascade',
    }),
  email: varchar({ length: 256 }).notNull(),
  status: pledgeStatusEnum().notNull().default(PledgeStatusEnum.PLEDGE_INTENT),
  pledgeType: pledgeTypeEnum()
    .notNull()
    .default(PledgeTypeEnum.MONETARY_SUPPORT),
  phoneNumber: varchar({ length: 20 }),
  reasonForInterest: text(),
  referenceCode: varchar({ length: 50 }).notNull().unique(),
  preferredCommunicationMethod: communicationMethodEnum().notNull(),
});

export type DbPledgeOpportunity = typeof pledgeOpportunities.$inferSelect;
