import { faker } from '@faker-js/faker';

import type { DbFeatureFlag } from '@/db/schema/feature-flag';

import { fakeGlobalFeatureFlag } from './global-feature-flag';
import { fakeUniversity } from './university';

export function fakeFeatureFlag(
  overrides?: Partial<DbFeatureFlag>
): DbFeatureFlag {
  const fake: DbFeatureFlag = {
    id: faker.string.uuid(),
    description: faker.lorem.words(),
    createdAt: faker.date.recent().toISOString(),
    flag: faker.word.words(),
    released: true,
    universityId: fakeUniversity().id,
    globalFeatureFlagId: fakeGlobalFeatureFlag().id,
    ...overrides,
  };

  return { ...fake, ...overrides };
}
