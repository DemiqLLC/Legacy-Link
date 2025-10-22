import { faker } from '@faker-js/faker';

import type { DbUniversityProfile } from '@/db/schema/university-profile';

import { fakeUniversity } from './university';

export function fakeUniversityProfile(
  overrides: Partial<DbUniversityProfile> = {}
): DbUniversityProfile {
  return {
    universityId: fakeUniversity().id,
    description: faker.lorem.paragraph(),
    logoFile: faker.system.filePath(),
    linkedinUrl: faker.internet.url(),
    instagramUrl: faker.internet.url(),
    facebookUrl: faker.internet.url(),
    companyUrl: faker.internet.url(),
    ...overrides,
  };
}
