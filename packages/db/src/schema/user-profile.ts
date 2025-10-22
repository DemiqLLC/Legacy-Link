import type {
  GivingInspirationEnum,
  GivingTypesEnum,
  ImportantCausesEnum,
  RacialEthnicBackgroundEnum,
  RecognitionPreferencesEnum,
} from '@meltstudio/types';
import {
  EmploymentStatusEnum,
  GenderIdentityEnum,
  IncomeRangeEnum,
  IndustryEnum,
  InterestedInFundEnum,
  RelationshipStatusEnum,
} from '@meltstudio/types';
import {
  boolean,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { baseFields, enumToPgEnum } from './base';
import { users } from './users';

export const genderIdentityEnum = pgEnum(
  'gender_identity',
  enumToPgEnum(GenderIdentityEnum)
);

export const relationshipStatusEnum = pgEnum(
  'relationship_status',
  enumToPgEnum(RelationshipStatusEnum)
);

export const employmentStatusEnum = pgEnum(
  'employment_status',
  enumToPgEnum(EmploymentStatusEnum)
);

export const industryEnum = pgEnum('industry', enumToPgEnum(IndustryEnum));

export const incomeRangeEnum = pgEnum(
  'income_range',
  enumToPgEnum(IncomeRangeEnum)
);

export const interestedInFundEnum = pgEnum(
  'interested_in_fund',
  enumToPgEnum(InterestedInFundEnum)
);

export const userProfile = pgTable('user_profile', {
  ...baseFields,
  userId: uuid()
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  graduationYear: integer('graduation_year').notNull(),
  degreeMajor: varchar('degree_major', { length: 256 }).notNull(),
  legacyLinkId: varchar('legacy_link_id', { length: 64 }).notNull(),
  givingInspiration: text('giving_inspiration')
    .array()
    .$type<GivingInspirationEnum[]>(),
  legacyDefinition: text('legacy_definition'),
  importantCauses: text('important_causes')
    .array()
    .$type<ImportantCausesEnum[]>(),
  anonymousGiving: boolean('anonymous_giving'),
  givingTypes: text('giving_types').array().$type<GivingTypesEnum[]>(),
  mentorshipHours: integer('mentorship_hours'),
  lifetimeGiving: numeric('lifetime_giving', { precision: 12, scale: 2 }),
  notifyGivingOpportunities: boolean('notify_giving_opportunities')
    .notNull()
    .default(false),
  cityState: varchar('city_state', { length: 256 }).notNull(),
  country: varchar('country', { length: 128 }).notNull(),
  hometownAtEnrollment: varchar('hometown_at_enrollment', { length: 256 }),
  genderIdentity: genderIdentityEnum(),
  racialEthnicBackground: text('racial_ethnic_background')
    .array()
    .$type<RacialEthnicBackgroundEnum[]>(),
  firstGenerationGraduate: boolean('first_generation_graduate'),
  relationshipStatus: relationshipStatusEnum(),
  dependentsInCollege: boolean('dependents_in_college'),
  employmentStatus: employmentStatusEnum().notNull(),
  industry: industryEnum().notNull(),
  occupation: varchar('occupation', { length: 128 }),
  employer: varchar('employer', { length: 256 }),
  incomeRange: incomeRangeEnum(),
  educationGivingPercentage: integer('education_giving_percentage'),
  hasCurrentContributions: boolean('has_current_contributions'),
  interestedInFund: interestedInFundEnum(),
  willingToMentor: boolean('willing_to_mentor'),
  wantsAlumniConnections: boolean('wants_alumni_connections'),
  interestedInEvents: boolean('interested_in_events'),
  recognitionPreferences: text('recognition_preferences')
    .array()
    .$type<RecognitionPreferencesEnum[]>(),
});

export type DbUserProfile = typeof userProfile.$inferSelect;
export type InsertUserProfile = typeof userProfile.$inferInsert;
