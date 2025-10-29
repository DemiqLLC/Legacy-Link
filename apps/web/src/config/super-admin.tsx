import type { AnyModelKey } from '@meltstudio/zod-schemas';
import {
  AluminsAdminModelSchema,
  givingOpportunitiesAdminModelSchema,
  selectPledgeOpportunitiesSchema,
  universityAdminModelSchema,
  userAdminModelSchema,
} from '@meltstudio/zod-schemas';
import { StackIcon } from '@radix-ui/react-icons';
import { Trans, useTranslation } from 'next-i18next';
import type { ReactNode } from 'react';
import React from 'react';
import type { z } from 'zod';

import { AlgoliaIndex } from '@/common-types/algolia';
import {
  PledgeStatusEnum,
  PledgeTypeEnum,
} from '@/common-types/pledge-opportunities';
import { LegacyRingLevelEnum } from '@/common-types/user-universities';
import type {
  FieldDataOption,
  FieldDataSize,
  FieldDataType,
} from '@/ui/form-hook-helper';

export type ModelConfigFieldType =
  | FieldDataType
  | 'ID'
  | 'boolean'
  | 'email'
  | 'relation'
  | 'manyRelation';

export type ModelConfigField = {
  label: ReactNode;
  type: ModelConfigFieldType;
  key: AnyModelKey;
  size?: FieldDataSize;
  options?: FieldDataOption[];
  relationModel?: string; // TODO: Add relation model type;
};

export type ModelConfigData = {
  name: string;
  displayName: ReactNode;
  indexName?: string;
  fields: ModelConfigField[];
  schema: z.AnyZodObject;
  url: string;
  sidebar?: boolean;
  manyRelations?: {
    [modelName: string]: {
      label: ReactNode;
      relationModel: string;
      key: string;
    };
  };
  isExportable: boolean;
};

export type WizardData = {
  title: ReactNode;
  href: string;
  icon: React.FC;
}[];

type ModelConfig = {
  [key: string]: ModelConfigData;
};

export const modelsConfig: ModelConfig = {
  users: {
    name: 'users',
    displayName: <Trans>Super administrator users</Trans>,
    indexName: AlgoliaIndex.USERS,
    url: 'users',
    fields: [
      { label: 'ID', type: 'ID', key: 'id' },
      { label: <Trans>Name</Trans>, type: 'text', key: 'name' },
      { label: <Trans>E-mail</Trans>, type: 'email', key: 'email' },
      {
        label: <Trans>Super Admin</Trans>,
        type: 'boolean',
        key: 'isSuperAdmin',
      },
      { label: <Trans>Password</Trans>, type: 'password', key: 'password' },
      {
        label: <Trans>Universities</Trans>,
        type: 'manyRelation',
        key: 'universities',
        relationModel: 'university',
      },
    ],
    schema: userAdminModelSchema.pick({
      name: true,
      email: true,
      password: true,
      isSuperAdmin: true,
      universities: true,
    }),
    sidebar: true,
    isExportable: true,
  },
  // globalFeatureFlags: {
  //   name: 'globalFeatureFlags',
  //   displayName: <Trans>Global Feature Flags</Trans>,
  //   indexName: AlgoliaIndex.GLOBAL_FEATURE_FLAGS,
  //   fields: [
  //     { label: 'ID', type: 'ID', key: 'id' },
  //     { label: <Trans>Flag</Trans>, type: 'text', key: 'flag' },
  //     {
  //       label: <Trans>Description</Trans>,
  //       type: 'textarea',
  //       key: 'description',
  //     },
  //     { label: <Trans>Released</Trans>, type: 'boolean', key: 'released' },
  //     {
  //       label: <Trans>Allow University Control</Trans>,
  //       type: 'boolean',
  //       key: 'allowUniversityControl',
  //     },
  //   ],
  //   url: 'globalFeatureFlags',
  //   sidebar: true,
  //   schema: selectGlobalFeatureFlagsSchema.pick({
  //     description: true,
  //     released: true,
  //     allowUniversityControl: true,
  //   }),
  //   isExportable: false,
  // },
  university: {
    name: 'university',
    displayName: <Trans>Universities</Trans>,
    indexName: AlgoliaIndex.UNIVERSITIES,
    url: 'university',
    sidebar: true,
    fields: [
      { label: 'ID', type: 'ID', key: 'id' },
      { label: <Trans>Name</Trans>, type: 'text', key: 'name' },
      {
        label: <Trans>Users</Trans>,
        type: 'manyRelation',
        key: 'users',
        relationModel: 'users',
      },
    ],
    schema: universityAdminModelSchema.pick({
      name: true,
      users: true,
      universityAbbreviation: true,
    }),
    isExportable: true,
  },
  givingOpportunities: {
    name: 'givingOpportunities',
    displayName: <Trans>Giving Opportunities</Trans>,
    indexName: AlgoliaIndex.GIVING_OPPORTUNITIES,
    url: 'giving-opportunities',
    sidebar: true,
    fields: [
      { label: 'ID', type: 'ID', key: 'id' },
      { label: <Trans>Name</Trans>, type: 'text', key: 'name' },
      {
        label: <Trans>Description</Trans>,
        type: 'textarea',
        key: 'description',
      },
      { label: <Trans>Goal Amount</Trans>, type: 'number', key: 'goalAmount' },
      {
        label: <Trans>University</Trans>,
        type: 'relation',
        key: 'universityId',
        relationModel: 'university',
      },
      { label: <Trans>Is it active?</Trans>, type: 'boolean', key: 'isActive' },
    ],
    schema: givingOpportunitiesAdminModelSchema.pick({
      name: true,
      isActive: true,
      goalAmount: true,
      description: true,
      universityId: true,
    }),
    isExportable: true,
  },
  userUniversities: {
    name: 'userUniversities',
    displayName: <Trans>Alumnis</Trans>,
    indexName: AlgoliaIndex.USER_UNIVERSITIES,
    url: 'user-universities',
    fields: [
      {
        label: <Trans>User ID</Trans>,
        key: 'userId',
        type: 'relation',
        relationModel: 'users',
      },
      {
        label: <Trans>University ID</Trans>,
        key: 'universityId',
        type: 'relation',
        relationModel: 'university',
      },
      {
        label: <Trans>Ring Level</Trans>,
        type: 'select',
        key: 'ringLevel',
        options: [
          {
            label: 'Ring One – Builder: $1 – $499',
            value: LegacyRingLevelEnum.RING_ONE_BUILDER,
          },
          {
            label: 'Ring Two – Advocate: $500 – $4,999',
            value: LegacyRingLevelEnum.RING_TWO_ADVOCATE,
          },
          {
            label: 'Ring Three – Leader: $5,000 – $24,999',
            value: LegacyRingLevelEnum.RING_THREE_LEADER,
          },
          {
            label: 'Ring Four – Visionary: $25,000 – $99,999',
            value: LegacyRingLevelEnum.RING_FOUR_VISIONARY,
          },
          {
            label: 'Ring Five – Legacy: $100,000+',
            value: LegacyRingLevelEnum.RING_FIVE_LEGACY,
          },
        ],
      },
    ],
    sidebar: true,
    schema: AluminsAdminModelSchema.pick({
      userId: true,
      universityId: true,
      ringLevel: true,
    }),
    isExportable: false,
  },
  pledgeOpportunities: {
    name: 'pledgeOpportunities',
    displayName: <Trans>Pledge Opportunities</Trans>,
    indexName: AlgoliaIndex.PLEDGE_OPPORTUNITIES,
    url: 'pledge-opportunities',
    sidebar: true,
    fields: [
      {
        label: <Trans>User</Trans>,
        type: 'relation',
        key: 'userId',
        relationModel: 'users',
      },
      {
        label: <Trans>University</Trans>,
        type: 'relation',
        key: 'universityId',
        relationModel: 'university',
      },
      {
        label: <Trans>Giving Opportunity</Trans>,
        type: 'relation',
        key: 'givingOpportunityId',
        relationModel: 'givingOpportunities',
      },
      {
        label: <Trans>Communication Method</Trans>,
        type: 'text',
        key: 'preferredCommunicationMethod',
      },
      {
        label: <Trans>Email</Trans>,
        type: 'text',
        key: 'email',
      },
      {
        label: <Trans>Status</Trans>,
        type: 'select',
        key: 'status',
        options: [
          { label: 'Pledge Intent', value: PledgeStatusEnum.PLEDGE_INTENT },
          {
            label: 'Awaiting Confirmation',
            value: PledgeStatusEnum.AWAITING_CONFIRMATION,
          },
          {
            label: 'Processing Donation',
            value: PledgeStatusEnum.PROCESSING_DONATION,
          },
          { label: 'Completed', value: PledgeStatusEnum.COMPLETED },
          { label: 'Impact Recorded', value: PledgeStatusEnum.IMPACT_RECORDED },
        ],
      },
      {
        label: <Trans>Pledge Type</Trans>,
        type: 'select',
        key: 'pledgeType',
        options: [
          {
            label: 'Monetary Support',
            value: PledgeTypeEnum.MONETARY_SUPPORT,
          },
          {
            label: 'Mentorship Engagement',
            value: PledgeTypeEnum.MENTORSHIP_ENGAGEMENT,
          },
          {
            label: 'In Kind Skill Based Support',
            value: PledgeTypeEnum.IN_KIND_SKILL_BASED_SUPPORT,
          },
          {
            label: 'Innovation Entrepreneurship Support',
            value: PledgeTypeEnum.INNOVATION_ENTREPRENEURSHIP_SUPPORT,
          },
        ],
      },
      {
        label: <Trans>Reference Code</Trans>,
        type: 'text',
        key: 'referenceCode',
      },
    ],
    schema: selectPledgeOpportunitiesSchema.pick({
      userId: true,
      universityId: true,
      givingOpportunityId: true,
      email: true,
      status: true,
      pledgeType: true,
      preferredCommunicationMethod: true,
      referenceCode: true,
    }),
    isExportable: true,
  },
  // TODO: use algolia in some models
  // tablesHistory: {
  //   name: 'tablesHistory',
  //   displayName: 'Tables History',
  //   indexName: AlgoliaIndex.TABLES_HISTORY,
  //   url: 'tables-history',
  //   fields: [
  //     { label: 'ID', type: 'ID', key: 'id' },
  //     { label: 'Table Name', type: 'text', key: 'tableName' },
  //     { label: 'Action', type: 'text', key: 'action' },
  //     { label: 'User ID', type: 'text', key: 'userId' },
  //     { label: 'Data', type: 'text', key: 'actionDescription' },
  //     { label: 'Created At', type: 'text', key: 'createdAt' },
  //   ],
  //   sidebar: true,
  //   schema: selectTablesHistorySchema.pick({
  //     tableName: true,
  //     action: true,
  //     userId: true,
  //     actionDescription: true,
  //     createdAt: true,
  //   }),
  //   isExportable: false,
  // },
};

// TODO: Remove this is an example
// const wizardsNav: WizardData = [
//   {
//     title: <Trans>Wizard</Trans>,
//     href: '/super-admin/wizard',
//     icon: MagicWandIcon,
//   },
// ];

const adminNav = Object.entries(modelsConfig)
  .filter(([, config]) => config.sidebar)
  .map(([, config]) => ({
    id: config.name,
    title: config.displayName,
    href: `/super-admin/${config.url}`,
    icon: StackIcon,
  }));

export const useNavAdmin = (): {
  title: string;
  href: string;
}[] => {
  const { t } = useTranslation();

  return [{ title: t('Super Admin'), href: '/super-admin/wizard' }];
};
// const GoogleTagManagerNav = [
//   {
//     title: 'Google tag manager',
//     href: '/super-admin/google-tag-manager',
//     icon: GlobeIcon,
//   },
// ];

// const ChatBot = [
//   {
//     title: 'Chat Bot',
//     href: '/super-admin/chat-bot',
//     icon: ChatBubbleIcon,
//   },
// ];

// const taskRunnerNav = [
//   {
//     title: 'Task Runner',
//     href: '/super-admin/async-tasks',
//     icon: ClipboardIcon,
//   },
// ];

export const navAdmin = [{ title: 'Admin', href: '/super-admin/wizard' }];

export const sidebarNavAdmin = [
  // ...wizardsNav,
  ...adminNav,
  // ...GoogleTagManagerNav,
  // ...ChatBot,
  // ...taskRunnerNav,
];
