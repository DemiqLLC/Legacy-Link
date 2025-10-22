import { AlgoliaIndex } from '@meltstudio/types';

import type { AlgoliaDataConfigCl } from './base';
import { givingOpportunitiesAlgolia } from './giving-opportunities';
// import { globalFeatureFlagsAlgolia } from './global-feature-flags';
import { pledgeOpportunitiesAlgolia } from './pledge-opportunities';
// import { algoliaReports } from './reports';
import { algoliaTablesHistory } from './tables-history';
import { universities } from './university';
import { user } from './user';
import { userUniversitiesModel } from './user-universities';

export const models: Record<AlgoliaIndex, AlgoliaDataConfigCl> = {
  [AlgoliaIndex.USERS]: user,
  // [AlgoliaIndex.GLOBAL_FEATURE_FLAGS]: globalFeatureFlagsAlgolia,
  [AlgoliaIndex.UNIVERSITIES]: universities,
  [AlgoliaIndex.TABLES_HISTORY]: algoliaTablesHistory,
  // [AlgoliaIndex.REPORTS]: algoliaReports,
  [AlgoliaIndex.GIVING_OPPORTUNITIES]: givingOpportunitiesAlgolia,
  [AlgoliaIndex.USER_UNIVERSITIES]: userUniversitiesModel,
  [AlgoliaIndex.PLEDGE_OPPORTUNITIES]: pledgeOpportunitiesAlgolia,
};
