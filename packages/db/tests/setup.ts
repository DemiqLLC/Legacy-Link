/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { PgTableWithColumns } from 'drizzle-orm/pg-core';

import type {
  DBFeatureFlagModel,
  DbGivingOpportunitiesModel,
  DbGlobalFeatureFlagsModel,
  DbGlobalFeatureFlagsWhere,
  DbIntegrationKeyModel,
  DbIntegrationKeyWhere,
  DbIntegrationModel,
  DbIntegrationWhere,
  DbMemberInvitationWhere,
  DbMemberInviteModel,
  DbPledgeOpportunitiesModel,
  DbReportsModel,
  DbUniversityModel,
  DbUniversityWhere,
  DBUserFeatureFlags,
  DbUserModel,
  DbUserUniversitiesModel,
  DbUserUniversitiesWhere,
  FeatureFlagsWhere,
  GivingOpportunitiesDbWhere,
  PledgeOpportunitiesDbWhere,
  ReportsDbWhere,
  TablesHistoryDbWhere,
  UserDbWhere,
} from '@/db/models';
import type { DbModel, DbWhere } from '@/db/models/base';
import type { ChatWhere } from '@/db/models/chat';
import type { MessageWhere } from '@/db/models/message';
import type {
  DbPasswordRecoveryTokenModel,
  DbPasswordRecoveryTokenWhere,
} from '@/db/models/password-recovery-token';
import type {
  DbUniversitiesProfileWhere,
  DbUniversityProfileModel,
} from '@/db/models/university-profile';
import type {
  DbUserProfileModel,
  DbUsersProfileWhere,
} from '@/db/models/user-profile';
import type { DbWebhookEventsWhere } from '@/db/models/webhook-events';
import type { DbWebhooksWhere } from '@/db/models/webhooks';
import type {
  chat,
  DbChat,
  DbMessage,
  DbTablesHistory,
  DbWebhooks,
  featureFlag as featureFlagTable,
  givingOpportunities,
  globalFeatureFlags,
  integration as integrationTable,
  integrationKey as integrationKeyTable,
  message,
  passwordRecoveryTokens as passwordRecoveryTokensTable,
  pledgeOpportunities,
  reports,
  tablesHistory as tablesHistoryTable,
  university as universitiesTable,
  universityProfile as universityProfileTable,
  userFeatureFlags as userFeatureFlagsTable,
  userProfile,
  users as usersTable,
  userUniversities as userUniversitiesTable,
  webhookEvents as webhookEventsTable,
  webhooks as webhooksTable,
} from '@/db/schema';
import type { memberInvitations } from '@/db/schema/member-invitations';
import type { SchemaAccessibleName } from '@/db/utils';

import type { MockedClassInstance, MockedDb } from './types';

function buildDbMainModelMock<
  Model,
  DbModelTable extends PgTableWithColumns<{
    name: string;
    schema: undefined;
    columns: Record<string, any>;
    dialect: 'pg';
  }> & {
    enableRLS: () => Omit<DbModelTable, 'enableRLS'>;
  },
  DbModelWhere = Model extends DbModel<any, infer Where, any> ? Where : never,
  DbModelTSName extends SchemaAccessibleName = Model extends DbModel<
    any,
    any,
    infer TSName
  >
    ? TSName
    : never,
>(): MockedClassInstance<DbModel<DbModelTable, DbModelWhere, DbModelTSName>> {
  return {
    findManyWithRelations: jest.fn(),
    dbTableName: 'mockedTableName',
    getDynamicManyRelations: jest.fn(),
    getAdminFieldChoiceName: jest.fn(),
    getModelName: jest.fn(),
    create: jest.fn(),
    loadRelationsByAdmin: jest.fn(),
    createByAdmin: jest.fn(),
    createMany: jest.fn(),
    createManyByAdmin: jest.fn(),
    findWithRelationsByPk: jest.fn(),
    findUniqueByPk: jest.fn(),
    // Add other mocked methods or properties as needed
  } as unknown as MockedClassInstance<
    DbModel<DbModelTable, DbModelWhere, DbModelTSName>
  >;
}

const usersModelMock = {
  ...buildDbMainModelMock<DbUserModel, typeof usersTable, UserDbWhere>(),
  findUniqueByID: jest.fn(),
  findUniqueByEmail: jest.fn(),
  findManyByEmail: jest.fn(),
  findUniqueByEmailWithPassword: jest.fn(),
  getUsersOverTime: jest.fn(),
  getUniversityMembers: jest.fn(),
  findManyWithUserUniversities: jest.fn(),
  findById: jest.fn(),
};

const passwordRecoveryTokensModelMock = {
  ...buildDbMainModelMock<
    DbPasswordRecoveryTokenModel,
    typeof passwordRecoveryTokensTable,
    DbPasswordRecoveryTokenWhere
  >(),
  findUniqueByToken: jest.fn(),
};

const featureFlagModelMock = {
  ...buildDbMainModelMock<
    DBFeatureFlagModel,
    typeof featureFlagTable,
    FeatureFlagsWhere
  >(),
  toggle: jest.fn(),
};

const userFeatureFlagsModelMock = {
  ...buildDbMainModelMock<
    DBUserFeatureFlags,
    typeof userFeatureFlagsTable,
    DbWhere
  >(),
  findManyByUserId: jest.fn(),
  findManyByFeatureFlagId: jest.fn(),
  findByUserIdAndFeatureFlagId: jest.fn(),
  deleteByUser: jest.fn(),
  toggle: jest.fn(),
};

const universitiesModelMock = {
  ...buildDbMainModelMock<
    DbUniversityModel,
    typeof universitiesTable,
    DbUniversityWhere
  >(),
  findById: jest.fn(),
};

const userUniversitiesModelMock = {
  ...buildDbMainModelMock<
    DbUserUniversitiesModel,
    typeof userUniversitiesTable,
    DbUserUniversitiesWhere
  >(),
  findByUserIdAndUniversityId: jest.fn(),
  findManyByUserIdAndUniversityId: jest.fn(),
  updateRoleMultipleUsersInUniversity: jest.fn(),
  updateRingLevelForUserInUniversity: jest.fn(),
};

const memberInvitationsModelMock = {
  ...buildDbMainModelMock<
    DbMemberInviteModel,
    typeof memberInvitations,
    DbMemberInvitationWhere
  >(),
  findByEmailAndUniversity: jest.fn(),
  findByToken: jest.fn(),
};

const universityProfileModelMock = {
  ...buildDbMainModelMock<
    DbUniversityProfileModel,
    typeof universityProfileTable,
    DbUniversitiesProfileWhere
  >(),
  findByUniversityId: jest.fn(),
};

const integrationModelMock = {
  ...buildDbMainModelMock<
    DbIntegrationModel,
    typeof integrationTable,
    DbIntegrationWhere
  >(),
  findByUniversityId: jest.fn(),
  findByUniversityAndPlatformWithKeys: jest.fn(),
  saveIntegrationData: jest.fn(),
  findEnabledZapierIntegration: jest.fn(),
  hasWebhookUrlForPlatform: jest.fn(),
};
const integrationKeyModelMock = {
  ...buildDbMainModelMock<
    DbIntegrationKeyModel,
    typeof integrationKeyTable,
    DbIntegrationKeyWhere
  >(),
  findByIntegrationId: jest.fn(),
  findAllWebhookUrlsOrderedByCreatedAt: jest.fn(),
};

const webhooksModelMock = {
  ...buildDbMainModelMock<DbWebhooks, typeof webhooksTable, DbWebhooksWhere>(),
  findAllOrderedByCreatedAt: jest.fn(),
  findById: jest.fn(),
  findAllWebhooks: jest.fn(),
  findUrlsAndNamesByUniversityId: jest.fn(),
  findManyWithWhere: jest.fn(),
};

const webhookEventsModelMock = {
  ...buildDbMainModelMock<
    DbWebhooks,
    typeof webhookEventsTable,
    DbWebhookEventsWhere
  >(),
  findAllOrderedByCreatedAt: jest.fn(),
};

const messageModelMock = {
  ...buildDbMainModelMock<DbMessage, typeof message, MessageWhere>(),
  findMessagesByChat: jest.fn(),
};
const chatModelMock = {
  ...buildDbMainModelMock<DbChat, typeof chat, ChatWhere>(),
  findChatsByUniversity: jest.fn(),
};

const tablesHistoryMock = {
  ...buildDbMainModelMock<
    DbTablesHistory,
    typeof tablesHistoryTable,
    TablesHistoryDbWhere
  >(),
  findWithUser: jest.fn(),
  findById: jest.fn(),
  findManyWithUserName: jest.fn(),
};

const globalFeatureFlagsModelMock = {
  ...buildDbMainModelMock<
    DbGlobalFeatureFlagsModel,
    typeof globalFeatureFlags,
    DbGlobalFeatureFlagsWhere
  >(),
};

const reportsModelMock = {
  ...buildDbMainModelMock<DbReportsModel, typeof reports, ReportsDbWhere>(),
};

const givingOpportunitiesModelMock = {
  ...buildDbMainModelMock<
    DbGivingOpportunitiesModel,
    typeof givingOpportunities,
    GivingOpportunitiesDbWhere
  >(),
  findById: jest.fn(),
  findByUniversityId: jest.fn(),
};

const userProfileModelMock = {
  ...buildDbMainModelMock<
    DbUserProfileModel,
    typeof userProfile,
    DbUsersProfileWhere
  >(),
  findByUserId: jest.fn(),
};

const pledgeOpportunitiesModelMock = {
  ...buildDbMainModelMock<
    DbPledgeOpportunitiesModel,
    typeof pledgeOpportunities,
    PledgeOpportunitiesDbWhere
  >(),
  findById: jest.fn(),
  findByGivingOpportunityId: jest.fn(),
};

const DBMock = jest.fn<MockedDb, void[]>().mockImplementation(() => ({
  models: {
    users: usersModelMock,
    passwordRecoveryToken: passwordRecoveryTokensModelMock,
    featureFlag: featureFlagModelMock,
    userFeatureFlag: userFeatureFlagsModelMock,
    university: universitiesModelMock,
    userUniversities: userUniversitiesModelMock,
    memberInvitations: memberInvitationsModelMock,
    universityProfile: universityProfileModelMock,
    integration: integrationModelMock,
    integrationKey: integrationKeyModelMock,
    webhooks: webhooksModelMock,
    webhookEvents: webhookEventsModelMock,
    message: messageModelMock,
    chat: chatModelMock,
    tablesHistory: tablesHistoryMock,
    globalFeatureFlags: globalFeatureFlagsModelMock,
    reports: reportsModelMock,
    givingOpportunities: givingOpportunitiesModelMock,
    userProfile: userProfileModelMock,
    pledgeOpportunities: pledgeOpportunitiesModelMock,
  },
  user: usersModelMock,
  passwordRecoveryToken: passwordRecoveryTokensModelMock,
  featureFlag: featureFlagModelMock,
  userFeatureFlag: userFeatureFlagsModelMock,
  university: universitiesModelMock,
  userUniversities: userUniversitiesModelMock,
  memberInvitations: memberInvitationsModelMock,
  universityProfile: universityProfileModelMock,
  integration: integrationModelMock,
  integrationKey: integrationKeyModelMock,
  webhooks: webhooksModelMock,
  webhookEvents: webhookEventsModelMock,
  message: messageModelMock,
  chat: chatModelMock,
  tablesHistory: tablesHistoryMock,
  globalFeatureFlags: globalFeatureFlagsModelMock,
  reports: reportsModelMock,
  givingOpportunities: givingOpportunitiesModelMock,
  userProfile: userProfileModelMock,
  pledgeOpportunities: pledgeOpportunitiesModelMock,
  getModel: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('@meltstudio/db', () => ({
  ...jest.requireActual('@meltstudio/db'),
  Db: DBMock,
}));
