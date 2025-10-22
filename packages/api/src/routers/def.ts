import { mergeApis } from '@zodios/core';

import { adminApiDef } from './admin/def';
import { featureFlagsApi } from './feature-flags/def';
import { givingOpportunitiesApiDef } from './giving-opportunities/def';
import { historicTableApiDef } from './historic-table/def';
import { integrationsApiDef } from './integrations/def';
import { shopifyApiDef } from './integrations/shopify/def';
import { metricsApiDef } from './metrics/def';
import { pledgeOppotunitiesApiDef } from './pledge-opportunities/def';
import { reportsApiDef } from './reports/def';
import { sessionApiDef } from './session/def';
import { storageApiDef } from './storage/def';
import { taskRunnerApiDef } from './task-runner/def';
import { universityApiDef } from './university/def';
import { universityProfileApiDef } from './university-profile/def';
import { userProfileApiDef } from './user-profile/def';
import { userUniversitiesApiDef } from './user-universities/def';
import { usersApiDef } from './users/def';
import { webhooksApiDef } from './webhooks/def';

const zodiosApiDef = mergeApis({
  '/session': sessionApiDef,
  '/users': usersApiDef,
  '/storage': storageApiDef,
  '/feature-flags': featureFlagsApi,
  '/admin': adminApiDef,
  '/university-profile': universityProfileApiDef,
  '/metrics': metricsApiDef,
  '/integrations/shopify': shopifyApiDef,
  '/webhooks': webhooksApiDef,
  '/integrations': integrationsApiDef,
  '/task-runner': taskRunnerApiDef,
  '/historic-table': historicTableApiDef,
  '/user-universities': userUniversitiesApiDef,
  '/reports': reportsApiDef,
  '/giving-opportunities': givingOpportunitiesApiDef,
  '/university': universityApiDef,
  '/user-profile': userProfileApiDef,
  '/pledge-opportunities': pledgeOppotunitiesApiDef,
});

export const apiDef = mergeApis({
  '/api': zodiosApiDef,
});
