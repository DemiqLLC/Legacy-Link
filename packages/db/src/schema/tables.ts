import { chat } from './chats';
import { embeddings } from './embeddings';
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

export const dbSchemas = {
  embeddings,
  featureFlag,
  integration,
  integrationKey,
  memberInvitations,
  passwordRecoveryTokens,
  userFeatureFlags,
  userUniversities,
  users,
  university,
  universityProfile,
  webhooks,
  webhookEvents,
  message,
  chat,
  tablesHistory,
  globalFeatureFlags,
  reports,
  givingOpportunities,
  userProfile,
  pledgeOpportunities,
};
