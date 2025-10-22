import { faker } from '@faker-js/faker';

import type { DbUniversity } from '@/db/schema/university';

export function fakeUniversity(
  overrides: Partial<DbUniversity> = {}
): DbUniversity {
  const universityAbbreviation = faker.string.alphanumeric(5).toUpperCase();
  return {
    id: faker.string.uuid(),
    name: faker.company.name(),
    createdAt: faker.date.recent().toISOString(),
    universityAbbreviation,
    referenceCode: `LL-${universityAbbreviation}-${faker.number.int({ min: 1, max: 999 }).toString().padStart(3, '0')}`,
    ...overrides,
  };
}
