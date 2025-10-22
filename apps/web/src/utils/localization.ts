import {
  ActivityActions,
  CommunicationMethodEnum,
  GenderIdentityEnum,
  GivingInspirationEnum,
  GivingTypesEnum,
  ImportantCausesEnum,
  IncomeRangeEnum,
  InterestedInFundEnum,
  LegacyRingLevelEnum,
  PledgeStatusEnum,
  PledgeTypeEnum,
  RacialEthnicBackgroundEnum,
  RecognitionPreferencesEnum,
  RelationshipStatusEnum,
  ReportStatusEnum,
  TableNames,
  UserRoleEnum,
} from '@meltstudio/types';
import type { TFunction } from 'next-i18next';

import { FeatureFlag } from '@/feature-flags/index';

export function getUserRoleName(t: TFunction, role: UserRoleEnum): string {
  switch (role) {
    case UserRoleEnum.ADMIN:
      return t('Admin');
    case UserRoleEnum.ALUMNI:
      return t('Alumni');
    case UserRoleEnum.SUPER_ADMIN:
      return t('Super Admin');
    default:
      return t('Role does not exist');
  }
}

export function getLocalizedFeatureFlagName(
  t: TFunction,
  flag: FeatureFlag
): string {
  switch (flag) {
    case FeatureFlag.EXAMPLE_FEATURE:
      return t('Example Feature');
    case FeatureFlag.TWO_FACTOR_AUTH:
      return t('Two Factor Authentication');
    case FeatureFlag.REPORTS_MODULE:
      return t('Reports Module');
    case FeatureFlag.HISTORY_MODULE:
      return t('History Module');
    case FeatureFlag.CHATS_MODULE:
      return t('Chats Module');
    case FeatureFlag.MEMBERS_MANAGEMENT:
      return t('Members Management');
    case FeatureFlag.WEBHOOKS_MODULE:
      return t('Webhooks Module');
    case FeatureFlag.INTEGRATIONS_MODULE:
      return t('Integrations Module');
    default:
      return t('Feature flag does not exist');
  }
}

export function getLocalizedFeatureFlagDescription(
  t: TFunction,
  flag: FeatureFlag
): string {
  switch (flag) {
    case FeatureFlag.TWO_FACTOR_AUTH:
      return t(
        'Security module that allows enabling two-factor authentication (2FA) during login.'
      );
    case FeatureFlag.REPORTS_MODULE:
      return t('Module for generating reports.');
    case FeatureFlag.HISTORY_MODULE:
      return t(
        'Module that displays a chronological history of user actions, updates, and system events.'
      );
    case FeatureFlag.CHATS_MODULE:
      return t(
        'Interactive chat module that allows users to ask questions about the university and receive automated or real-time assistance through AI.'
      );
    case FeatureFlag.MEMBERS_MANAGEMENT:
      return t(
        'Module for managing university members, including member information and role assignment.'
      );
    case FeatureFlag.WEBHOOKS_MODULE:
      return t(
        'Module for configuring webhooks to send selected application events to external services.'
      );
    case FeatureFlag.INTEGRATIONS_MODULE:
      return t(
        'Module that enables integration of the university with third-party platforms.'
      );
    default:
      return t('Feature flag description not available');
  }
}

export function getLocalizedReportStatusName(
  t: TFunction,
  status: ReportStatusEnum
): string {
  switch (status) {
    case ReportStatusEnum.PENDING:
      return t('Pending');
    case ReportStatusEnum.DONE:
      return t('Done');
    default:
      return t('Status does not exist');
  }
}

export function getLocalizedTableName(t: TFunction, table: TableNames): string {
  switch (table) {
    case TableNames.FEATURE_FLAGS:
      return t('Feature Flags');
    case TableNames.MEMBER_INVITATIONS:
      return t('Member Invitations');
    case TableNames.PASSWORD_RECOVERY_TOKENS:
      return t('Password Recovery Tokens');
    case TableNames.USER_FEATURE_FLAGS:
      return t('User Feature Flags');
    case TableNames.USER_UNIVERSITIES:
      return t('User Universities');
    case TableNames.USERS:
      return t('Users');
    case TableNames.UNIVERSITIES:
      return t('Universities');
    case TableNames.UNIVERSITY_PROFILE:
      return t('University Profiles');
    default:
      return t('Unknown Table');
  }
}

export function getLocalizedActivityActionName(
  t: TFunction,
  action: ActivityActions
): string {
  switch (action) {
    case ActivityActions.CREATE:
      return t('Create');
    case ActivityActions.UPDATE:
      return t('Update');
    case ActivityActions.DELETE:
      return t('Delete');
    case ActivityActions.ENABLE:
      return t('Enable');
    case ActivityActions.DISABLE:
      return t('Disable');
    case ActivityActions.INVITE:
      return t('Invite');
    default:
      return t('Action does not exist');
  }
}

export function getLocalizedReportTableName(
  t: TFunction,
  table: string
): string {
  switch (table) {
    case 'users':
      return t('Users');
    case 'tables_history':
      return t('History');
    case 'webhooks':
      return t('Webhooks');
    default:
      return t('Unknown Report Table');
  }
}

export function getLocalizedEmploymentStatus(
  t: TFunction,
  value: string
): string {
  const statuses: Record<string, string> = {
    employed_full_time: t('Employed Full-time'),
    employed_part_time: t('Employed Part-time'),
    self_employed: t('Self-employed'),
    unemployed: t('Unemployed'),
    student: t('Student'),
    retired: t('Retired'),
  };
  return statuses[value] ?? value;
}

export function getLocalizedIndustry(t: TFunction, value: string): string {
  const industries: Record<string, string> = {
    technology: t('Technology'),
    healthcare: t('Healthcare'),
    finance: t('Finance'),
    education: t('Education'),
    other: t('Other'),
  };
  return industries[value] ?? value;
}

export function getLocalizedModelName(t: TFunction, modelName: string): string {
  switch (modelName) {
    case 'users':
      return t('User');
    case 'globalFeatureFlags':
      return t('Feature Flag');
    case 'university':
      return t('University');
    case 'userUniversities':
      return t('Alumni');
    case 'tablesHistory':
      return t('Table History');
    case 'givingOpportunities':
      return t('Giving Opportunities');
    case 'pledgeOpportunities':
      return t('status of the pledge opportunity');
    default:
      return t('Unknown Model');
  }
}

export function getLocalizedPledgeType(t: TFunction, value: string): string {
  const types: Record<string, string> = {
    [PledgeTypeEnum.MONETARY_SUPPORT]: t('Monetary Support'),
    [PledgeTypeEnum.MENTORSHIP_ENGAGEMENT]: t('Mentorship Engagement'),
    [PledgeTypeEnum.IN_KIND_SKILL_BASED_SUPPORT]: t(
      'In-kind / Skill-based Support'
    ),
    [PledgeTypeEnum.INNOVATION_ENTREPRENEURSHIP_SUPPORT]: t(
      'Innovation & Entrepreneurship Support'
    ),
  };
  return types[value] ?? value;
}

export function getLocalizedPledgeStatus(t: TFunction, value: string): string {
  const statuses: Record<string, string> = {
    [PledgeStatusEnum.PLEDGE_INTENT]: t('Pledge Intent'),
    [PledgeStatusEnum.AWAITING_CONFIRMATION]: t('Awaiting Confirmation'),
    [PledgeStatusEnum.PROCESSING_DONATION]: t('Processing Donation'),
    [PledgeStatusEnum.COMPLETED]: t('Completed'),
    [PledgeStatusEnum.IMPACT_RECORDED]: t('Impact Recorded'),
  };
  return statuses[value] ?? value;
}

export function getLocalizedCommunicationMethod(
  t: TFunction,
  value: string
): string {
  const methods: Record<string, string> = {
    [CommunicationMethodEnum.EMAIL]: t('Email'),
    [CommunicationMethodEnum.PHONE]: t('Phone'),
  };
  return methods[value] ?? value;
}

export function getLocalizedGivingInspiration(
  t: TFunction,
  value: string
): string {
  const map: Record<string, string> = {
    [GivingInspirationEnum.GRATITUDE]: t('Gratitude'),
    [GivingInspirationEnum.EQUITY]: t('Equity'),
    [GivingInspirationEnum.INNOVATION]: t('Innovation'),
    [GivingInspirationEnum.LEGACY]: t('Legacy'),
    [GivingInspirationEnum.SOCIAL_IMPACT]: t('Social Impact'),
    [GivingInspirationEnum.COMMUNITY_BUILDING]: t('Community Building'),
  };
  return map[value] ?? value;
}

export function getLocalizedImportantCause(
  t: TFunction,
  value: string
): string {
  const map: Record<string, string> = {
    [ImportantCausesEnum.SCHOLARSHIPS]: t('Scholarships'),
    [ImportantCausesEnum.RESEARCH]: t('Research'),
    [ImportantCausesEnum.ATHLETICS]: t('Athletics'),
    [ImportantCausesEnum.ARTS_CULTURE]: t('Arts & Culture'),
    [ImportantCausesEnum.INFRASTRUCTURE]: t('Infrastructure'),
    [ImportantCausesEnum.STUDENT_SUPPORT]: t('Student Support'),
    [ImportantCausesEnum.DEI_INITIATIVES]: t('DEI Initiatives'),
    [ImportantCausesEnum.ENVIRONMENTAL]: t('Environmental'),
  };
  return map[value] ?? value;
}

export function getLocalizedGivingType(t: TFunction, value: string): string {
  const map: Record<string, string> = {
    [GivingTypesEnum.FINANCIAL]: t('Financial'),
    [GivingTypesEnum.MENTORSHIP]: t('Mentorship'),
    [GivingTypesEnum.VOLUNTEERING]: t('Volunteering'),
    [GivingTypesEnum.ADVOCACY]: t('Advocacy'),
  };
  return map[value] ?? value;
}

export function getLocalizedGenderIdentity(
  t: TFunction,
  value: string
): string {
  const map: Record<string, string> = {
    [GenderIdentityEnum.MALE]: t('Male'),
    [GenderIdentityEnum.FEMALE]: t('Female'),
    [GenderIdentityEnum.NON_BINARY]: t('Non-binary'),
    [GenderIdentityEnum.PREFER_NOT_SAY]: t('Prefer not to say'),
    [GenderIdentityEnum.OTHER]: t('Other'),
  };
  return map[value] ?? value;
}

export function getLocalizedRacialEthnicBackground(
  t: TFunction,
  value: string
): string {
  const map: Record<string, string> = {
    [RacialEthnicBackgroundEnum.ASIAN]: t('Asian'),
    [RacialEthnicBackgroundEnum.BLACK]: t('Black or African American'),
    [RacialEthnicBackgroundEnum.HISPANIC]: t('Hispanic or Latino'),
    [RacialEthnicBackgroundEnum.WHITE]: t('White'),
    [RacialEthnicBackgroundEnum.NATIVE_AMERICAN]: t('Native American'),
    [RacialEthnicBackgroundEnum.PACIFIC_ISLANDER]: t('Pacific Islander'),
    [RacialEthnicBackgroundEnum.MULTIRACIAL]: t('Multiracial'),
    [RacialEthnicBackgroundEnum.PREFER_NOT_SAY]: t('Prefer not to say'),
  };
  return map[value] ?? value;
}

export function getLocalizedRelationshipStatus(
  t: TFunction,
  value: string
): string {
  const map: Record<string, string> = {
    [RelationshipStatusEnum.SINGLE]: t('Single'),
    [RelationshipStatusEnum.MARRIED]: t('Married'),
    [RelationshipStatusEnum.DOMESTIC_PARTNERSHIP]: t('Domestic Partnership'),
    [RelationshipStatusEnum.DIVORCED]: t('Divorced'),
    [RelationshipStatusEnum.WIDOWED]: t('Widowed'),
    [RelationshipStatusEnum.PREFER_NOT_SAY]: t('Prefer not to say'),
  };
  return map[value] ?? value;
}

export function getLocalizedIncomeRange(t: TFunction, value: string): string {
  const map: Record<string, string> = {
    [IncomeRangeEnum.UNDER_50K]: t('Under $50K'),
    [IncomeRangeEnum.RANGE_50K_100K]: t('$50K - $100K'),
    [IncomeRangeEnum.RANGE_100K_150K]: t('$100K - $150K'),
    [IncomeRangeEnum.RANGE_150K_250K]: t('$150K - $250K'),
    [IncomeRangeEnum.OVER_250K]: t('Over $250K'),
    [IncomeRangeEnum.PREFER_NOT_SAY]: t('Prefer not to say'),
  };
  return map[value] ?? value;
}

export function getLocalizedInterestedInFund(
  t: TFunction,
  value: string
): string {
  const map: Record<string, string> = {
    [InterestedInFundEnum.YES]: t('Yes'),
    [InterestedInFundEnum.MAYBE]: t('Maybe'),
    [InterestedInFundEnum.NOT_NOW]: t('Not now'),
  };
  return map[value] ?? value;
}

export function getLocalizedRecognitionPreference(
  t: TFunction,
  value: string
): string {
  const map: Record<string, string> = {
    [RecognitionPreferencesEnum.DIGITAL_BADGE]: t('Digital Badge'),
    [RecognitionPreferencesEnum.NEWSLETTER_FEATURE]: t('Newsletter Feature'),
    [RecognitionPreferencesEnum.WEBSITE_RECOGNITION]: t('Website Recognition'),
    [RecognitionPreferencesEnum.ANNUAL_REPORT]: t('Annual Report'),
    [RecognitionPreferencesEnum.PREFER_ANONYMOUS]: t(
      'Prefer to remain anonymous'
    ),
  };
  return map[value] ?? value;
}

export function getLocalizedLegacyRingLevel(
  t: TFunction,
  value: string
): string {
  const map: Record<string, string> = {
    [LegacyRingLevelEnum.RING_ONE_BUILDER]: t('Ring One Builder'),
    [LegacyRingLevelEnum.RING_TWO_ADVOCATE]: t('Ring Two Advocate'),
    [LegacyRingLevelEnum.RING_THREE_LEADER]: t('Ring Three Leader'),
    [LegacyRingLevelEnum.RING_FOUR_VISIONARY]: t('Ring Four Visionary'),
    [LegacyRingLevelEnum.RING_FIVE_LEGACY]: t('Ring Five Legacy'),
  };

  return map[value] ?? value;
}
