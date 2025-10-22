import { givingOpportunitiesAlgolia } from '@/db/algolia/model/giving-opportunities';
// import { globalFeatureFlagsAlgolia } from '@/db/algolia/model/global-feature-flags';
import { pledgeOpportunitiesAlgolia } from '@/db/algolia/model/pledge-opportunities';
// import { algoliaReports } from '@/db/algolia/model/reports';
import { algoliaTablesHistory } from '@/db/algolia/model/tables-history';
import { universities } from '@/db/algolia/model/university';
import { user } from '@/db/algolia/model/user';
import { userUniversitiesModel } from '@/db/algolia/model/user-universities';

import { DbChatModel } from './chat';
import { DBFeatureFlagModel } from './feature-flag';
import { DbGivingOpportunitiesModel } from './giving-opportunities';
import { DbGlobalFeatureFlagsModel } from './global-feature-flags';
import { DbIntegrationModel } from './integration';
import { DbIntegrationKeyModel } from './integration-key';
import { DbMemberInviteModel } from './member-invitations';
import { DbMessageModel } from './message';
import { DbPasswordRecoveryTokenModel } from './password-recovery-token';
import { DbPledgeOpportunitiesModel } from './pledge-opportunities';
import { DbReportsModel } from './reports';
import { DbTablesHistoryModel } from './tables-history';
import { DbUniversityModel } from './university';
import { DbUniversityProfileModel } from './university-profile';
import { DbUserModel } from './user';
import { DBUserFeatureFlags } from './user-feature-flags';
import { DbUserProfileModel } from './user-profile';
import { DbUserUniversitiesModel } from './user-universities';
import { DbWebhookEventsModel } from './webhook-events';
import { DbWebhooksModel } from './webhooks';

export type DbModelMap = {
  passwordRecoveryToken: DbPasswordRecoveryTokenModel;
  users: DbUserModel;
  featureFlag: DBFeatureFlagModel;
  userFeatureFlag: DBUserFeatureFlags;
  university: DbUniversityModel;
  userUniversities: DbUserUniversitiesModel;
  memberInvitations: DbMemberInviteModel;
  universityProfile: DbUniversityProfileModel;
  integration: DbIntegrationModel;
  integrationKey: DbIntegrationKeyModel;
  webhooks: DbWebhooksModel;
  webhookEvents: DbWebhookEventsModel;
  chat: DbChatModel;
  message: DbMessageModel;
  tablesHistory: DbTablesHistoryModel;
  reports: DbReportsModel;
  globalFeatureFlags: DbGlobalFeatureFlagsModel;
  givingOpportunities: DbGivingOpportunitiesModel;
  userProfile: DbUserProfileModel;
  pledgeOpportunities: DbPledgeOpportunitiesModel;
  // Add other models here
};

export const DbModelMapValues = {
  passwordRecoveryToken: true,
  users: true,
  featureFlag: true,
  userFeatureFlag: true,
  university: true,
  userUniversities: true,
  memberInvitations: true,
  universityProfile: true,
  integration: true,
  integrationKey: true,
  webhooks: true,
  webhookEvents: true,
  globalFeatureFlags: true,
  userProfile: true,
} as const;

export type DbModelKeys = keyof DbModelMap;
export const dbModelKeys = Object.keys(DbModelMapValues) as DbModelKeys[];
export type DbModelRecord = DbModelMap[DbModelKeys];

export class Db {
  public models: { [K in keyof DbModelMap]: DbModelMap[K] };

  public constructor() {
    this.models = {
      passwordRecoveryToken: new DbPasswordRecoveryTokenModel(this),
      users: new DbUserModel(this, user),
      featureFlag: new DBFeatureFlagModel(this),
      userFeatureFlag: new DBUserFeatureFlags(this),
      university: new DbUniversityModel(this, universities),
      userUniversities: new DbUserUniversitiesModel(
        this,
        userUniversitiesModel
      ),
      memberInvitations: new DbMemberInviteModel(this),
      universityProfile: new DbUniversityProfileModel(this),
      integration: new DbIntegrationModel(this),
      integrationKey: new DbIntegrationKeyModel(this),
      webhookEvents: new DbWebhookEventsModel(this),
      webhooks: new DbWebhooksModel(this),
      chat: new DbChatModel(this),
      message: new DbMessageModel(this),
      tablesHistory: new DbTablesHistoryModel(this, algoliaTablesHistory),
      reports: new DbReportsModel(this),
      globalFeatureFlags: new DbGlobalFeatureFlagsModel(this),
      givingOpportunities: new DbGivingOpportunitiesModel(
        this,
        givingOpportunitiesAlgolia
      ),
      pledgeOpportunities: new DbPledgeOpportunitiesModel(
        this,
        pledgeOpportunitiesAlgolia
      ),
      userProfile: new DbUserProfileModel(this),
    };
  }

  public get user(): DbUserModel {
    return this.models.users;
  }

  public get passwordRecoveryToken(): DbPasswordRecoveryTokenModel {
    return this.models.passwordRecoveryToken;
  }

  public get featureFlag(): DBFeatureFlagModel {
    return this.models.featureFlag;
  }

  public get userFeatureFlag(): DBUserFeatureFlags {
    return this.models.userFeatureFlag;
  }

  public get university(): DbUniversityModel {
    return this.models.university;
  }

  public get userUniversities(): DbUserUniversitiesModel {
    return this.models.userUniversities;
  }

  public get memberInvitations(): DbMemberInviteModel {
    return this.models.memberInvitations;
  }

  public get universityProfile(): DbUniversityProfileModel {
    return this.models.universityProfile;
  }

  public get webhooks(): DbWebhooksModel {
    return this.models.webhooks;
  }

  public get integration(): DbIntegrationModel {
    return this.models.integration;
  }

  public get integrationKey(): DbIntegrationKeyModel {
    return this.models.integrationKey;
  }

  public get message(): DbMessageModel {
    return this.models.message;
  }

  public get chat(): DbChatModel {
    return this.models.chat;
  }

  public get webhookEvents(): DbWebhookEventsModel {
    return this.models.webhookEvents;
  }

  public get tablesHistory(): DbTablesHistoryModel {
    return this.models.tablesHistory;
  }

  public get globalFeatureFlags(): DbGlobalFeatureFlagsModel {
    return this.models.globalFeatureFlags;
  }

  public get reports(): DbReportsModel {
    return this.models.reports;
  }

  public get givingOpportunities(): DbGivingOpportunitiesModel {
    return this.models.givingOpportunities;
  }

  public get userProfile(): DbUserProfileModel {
    return this.models.userProfile;
  }

  public get pledgeOpportunities(): DbPledgeOpportunitiesModel {
    return this.models.pledgeOpportunities;
  }

  public getModel<K extends keyof DbModelMap>(modelName: K): DbModelMap[K] {
    return this.models[modelName];
  }
}
