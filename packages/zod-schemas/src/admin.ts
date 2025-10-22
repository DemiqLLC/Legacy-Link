import { z } from 'zod';

import { insertChatSchema, selectChatSchema } from './chat';
import {
  insertFeatureFlagsSchema,
  selectFeatureFlagsSchema,
} from './feature-flag';
import {
  insertGivingOpportunitiesSchema,
  selectGivingOpportunitiesSchema,
} from './giving-opportunities';
import {
  insertGlobalFeatureFlagsSchema,
  selectGlobalFeatureFlagsSchema,
} from './global-feature-flags';
import {
  insertIntegrationKeySchema,
  selectIntegrationKeySchema,
} from './integration-key';
import {
  insertIntegrationSchema,
  selectIntegrationSchema,
} from './integrations';
import { insertMemberInvitationSchema } from './member-invitations';
import { insertMessageSchema, selectMessageSchema } from './message';
import {
  insertPasswordRecoveryTokenSchema,
  selectPasswordRecoveryTokenSchema,
} from './password-recovery-tokens';
import {
  insertPledgeOpportunitiesSchema,
  selectPledgeOpportunitiesSchema,
} from './pledge-opportunities';
import { insertReportsSchema, selectReportsSchema } from './reports';
import {
  insertTablesHistorySchema,
  selectTablesHistorySchema,
} from './tables-history';
import { insertUniversitySchema, selectUniversitySchema } from './university';
import {
  insertUniversityProfileSchema,
  selectUniversityProfileSchema,
} from './university-profile';
import {
  insertUserFeatureFlagsSchema,
  selectUserFeatureFlagsSchema,
} from './user-feature-flags';
import {
  insertUserProfileSchema,
  selectUserProfileSchema,
} from './user-profile';
import {
  insertUserUniversitiesSchema,
  selectUserUniversitiesSchema,
} from './user-universities';
import { insertUserSchema, selectUserSchemaWithPassword } from './users';
import {
  insertWebhookEventsSchema,
  selectWebhookEventsSchema,
} from './webhook-events';
import { insertWebhooksSchema, selectWebhooksSchema } from './webhooks';

const relationAdminSchema = z.string();

export const userAdminModelSchema = selectUserSchemaWithPassword.extend({
  universities: z.array(relationAdminSchema).optional().nullish(),
});

export type UserAdminType = z.infer<typeof userAdminModelSchema>;

export const universityAdminModelSchema = selectUniversitySchema.extend({
  users: z.array(relationAdminSchema).optional().nullish(),
});

export const givingOpportunitiesAdminModelSchema =
  selectGivingOpportunitiesSchema.extend({
    universities: z.array(relationAdminSchema).optional().nullish(),
  });

export const AluminsAdminModelSchema = selectUserUniversitiesSchema.extend({
  universities: z.array(relationAdminSchema).optional().nullish(),
  users: z.array(relationAdminSchema).optional().nullish(),
});

export const pledgeOpportunitiesAdminModelSchema =
  selectPledgeOpportunitiesSchema.extend({
    universities: z.array(relationAdminSchema).optional().nullish(),
    givingOpportunities: z.array(relationAdminSchema).optional().nullish(),
    users: z.array(relationAdminSchema).optional().nullish(),
  });

// Define a union schema using a tuple
export const anyModelSchema = z.union([
  userAdminModelSchema,
  selectPasswordRecoveryTokenSchema,
  selectFeatureFlagsSchema,
  selectUserFeatureFlagsSchema,
  universityAdminModelSchema,
  selectUserUniversitiesSchema,
  selectTablesHistorySchema,
  selectGlobalFeatureFlagsSchema,
  givingOpportunitiesAdminModelSchema,
  AluminsAdminModelSchema,
  pledgeOpportunitiesAdminModelSchema,
]);

type UnionKeys<T> = T extends T ? keyof T : never;

export type AnyModelType = z.infer<typeof anyModelSchema>;

export type AnyModelKey = UnionKeys<AnyModelType>;

export const modelSchemas = {
  users: userAdminModelSchema,
  integration: selectIntegrationSchema,
  integrationKey: selectIntegrationKeySchema,
  userFeatureFlags: selectUserFeatureFlagsSchema,
  passwordRecoveryTokens: selectPasswordRecoveryTokenSchema,
  featureFlag: selectFeatureFlagsSchema,
  university: universityAdminModelSchema,
  userUniversities: selectUserUniversitiesSchema,
  universityProfile: selectUniversityProfileSchema,
  webhooks: selectWebhooksSchema,
  webhookEvents: selectWebhookEventsSchema,
  message: selectMessageSchema,
  chat: selectChatSchema,
  tablesHistory: selectTablesHistorySchema,
  globalFeatureFlags: selectGlobalFeatureFlagsSchema,
  reports: selectReportsSchema,
  givingOpportunities: selectGivingOpportunitiesSchema,
  userProfile: selectUserProfileSchema,
  pledgeOpportunities: selectPledgeOpportunitiesSchema,
} as const;

export const insertModelSchemas = {
  users: insertUserSchema,
  integration: insertIntegrationSchema,
  integrationKey: insertIntegrationKeySchema,
  userFeatureFlag: insertUserFeatureFlagsSchema,
  passwordRecoveryToken: insertPasswordRecoveryTokenSchema,
  featureFlag: insertFeatureFlagsSchema,
  university: insertUniversitySchema,
  userUniversities: insertUserUniversitiesSchema,
  memberInvitations: insertMemberInvitationSchema,
  universityProfile: insertUniversityProfileSchema,
  webhooks: insertWebhooksSchema,
  webhookEvents: insertWebhookEventsSchema,
  message: insertMessageSchema,
  chat: insertChatSchema,
  tablesHistory: insertTablesHistorySchema,
  globalFeatureFlags: insertGlobalFeatureFlagsSchema,
  reports: insertReportsSchema,
  givingOpportunities: insertGivingOpportunitiesSchema,
  userProfile: insertUserProfileSchema,
  pledgeOpportunities: insertPledgeOpportunitiesSchema,
};

export type ModelName = keyof typeof modelSchemas;

export type ModelSchemas = typeof modelSchemas;

// Function to get schema based on model name
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
const getModelSchema = (modelName: string) => {
  if (modelName in modelSchemas) {
    return modelSchemas[modelName as keyof typeof modelSchemas];
  }
  // Return a default schema;
  return z.unknown();
};

export { getModelSchema };
