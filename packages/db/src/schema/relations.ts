import { relations } from 'drizzle-orm';

import { chat } from './chats';
import { featureFlag } from './feature-flag';
import { givingOpportunities } from './giving-opportunities';
import { globalFeatureFlags } from './global-feature-flags';
import { integration } from './integration';
import { integrationKey } from './integration-key';
import { memberInvitations } from './member-invitations';
import { message } from './messages';
import { passwordRecoveryTokens } from './password-recovery-tokens';
import { pledgeOpportunities } from './pledge-opportunities';
import { reports } from './reports';
import { tablesHistory } from './tables-history';
import { university } from './university';
import { universityProfile } from './university-profile';
import { userFeatureFlags } from './user-feature-flags';
import { userProfile } from './user-profile';
import { userUniversities } from './user-universities';
import { users } from './users';
import { webhookEvents } from './webhook-events';
import { webhooks } from './webhooks';

export const passwordRecoveryTokensRelations = relations(
  passwordRecoveryTokens,
  ({ one }) => ({
    user: one(users, {
      fields: [passwordRecoveryTokens.userId],
      references: [users.id],
    }),
  })
);

export const usersRelations = relations(users, ({ many, one }) => ({
  passwordRecoveryTokens: many(passwordRecoveryTokens),
  featureFlags: many(userFeatureFlags),
  universities: many(userUniversities),
  inviteToken: one(memberInvitations, {
    fields: [users.id],
    references: [memberInvitations.userId],
  }),
  chats: many(chat),
  messages: many(message),
  history: many(tablesHistory),
  profile: one(userProfile, {
    fields: [users.id],
    references: [userProfile.userId],
  }),
  pledges: many(pledgeOpportunities),
}));

export const integrationsRelations = relations(integration, ({ many }) => ({
  integrationKeys: many(integrationKey),
}));

export const integrationsKeysRelations = relations(
  integrationKey,
  ({ one }) => ({
    integration: one(integration, {
      fields: [integrationKey.integrationId],
      references: [integration.id],
    }),
  })
);

export const universityRelations = relations(university, ({ many, one }) => ({
  users: many(userUniversities),
  profile: one(universityProfile, {
    fields: [university.id],
    references: [universityProfile.universityId],
  }),
  history: many(tablesHistory),
  webhooks: many(webhooks),
  webhookEvents: many(webhookEvents),
}));

export const userUniversitiesRelations = relations(
  userUniversities,
  ({ one }) => ({
    user: one(users, {
      fields: [userUniversities.userId],
      references: [users.id],
    }),
    university: one(university, {
      fields: [userUniversities.universityId],
      references: [university.id],
    }),
  })
);

export const featureFlagRelations = relations(featureFlag, ({ many, one }) => ({
  users: many(userFeatureFlags),
  university: one(university, {
    fields: [featureFlag.universityId],
    references: [university.id],
  }),
  globalFeatureFlag: one(globalFeatureFlags, {
    fields: [featureFlag.globalFeatureFlagId],
    references: [globalFeatureFlags.id],
  }),
}));

export const globalFeatureFlagsRelations = relations(
  globalFeatureFlags,
  ({ many }) => ({
    featureFlags: many(featureFlag),
  })
);

export const userFeatureFlagsRelations = relations(
  userFeatureFlags,
  ({ one }) => ({
    featureFlag: one(featureFlag, {
      fields: [userFeatureFlags.featureFlagId],
      references: [featureFlag.id],
    }),
    user: one(users, {
      fields: [userFeatureFlags.userId],
      references: [users.id],
    }),
  })
);

export const memberInvitationsRelations = relations(
  memberInvitations,
  ({ one }) => ({
    user: one(users, {
      fields: [memberInvitations.userId],
      references: [users.id],
    }),
    university: one(university, {
      fields: [memberInvitations.universityId],
      references: [university.id],
    }),
  })
);

export const webhooksRelations = relations(webhooks, ({ one, many }) => ({
  university: one(university, {
    fields: [webhooks.universityId],
    references: [university.id],
  }),
  webhookEvents: many(webhookEvents),
}));

export const webhookEventsRelations = relations(webhookEvents, ({ one }) => ({
  university: one(university, {
    fields: [webhookEvents.universityId],
    references: [university.id],
  }),
  webhook: one(webhooks, {
    fields: [webhookEvents.webhookId],
    references: [webhooks.id],
  }),
}));

export const chatRelations = relations(chat, ({ one, many }) => ({
  university: one(university, {
    fields: [chat.universityId],
    references: [university.id],
  }),
  messages: many(message),
  user: one(users, {
    fields: [chat.userId],
    references: [users.id],
  }),
}));
export const messageRelations = relations(message, ({ one }) => ({
  chat: one(chat, {
    fields: [message.chatId],
    references: [chat.id],
  }),
  user: one(users, {
    fields: [message.userId],
    references: [users.id],
  }),
}));

export const tableHistoryRelations = relations(tablesHistory, ({ one }) => ({
  user: one(users, {
    fields: [tablesHistory.userId],
    references: [users.id],
  }),
  university: one(university, {
    fields: [tablesHistory.universityId],
    references: [university.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  university: one(university, {
    fields: [reports.universityId],
    references: [university.id],
  }),
}));

export const givingOpportunitiesRelations = relations(
  givingOpportunities,
  ({ one, many }) => ({
    university: one(university, {
      fields: [givingOpportunities.universityId],
      references: [university.id],
    }),
    pledges: many(pledgeOpportunities),
  })
);

export const userProfileRelations = relations(userProfile, ({ one }) => ({
  user: one(users, {
    fields: [userProfile.userId],
    references: [users.id],
  }),
}));

export const pledgeOpportunitiesRelations = relations(
  pledgeOpportunities,
  ({ one }) => ({
    givingOpportunity: one(givingOpportunities, {
      fields: [pledgeOpportunities.givingOpportunityId],
      references: [givingOpportunities.id],
    }),
    user: one(users, {
      fields: [pledgeOpportunities.userId],
      references: [users.id],
    }),
  })
);
