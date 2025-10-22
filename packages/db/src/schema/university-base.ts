import { uuid } from 'drizzle-orm/pg-core';

import { baseFields } from './base';
import { university } from './university';

export const baseUniversityFields = {
  ...baseFields,
  universityId: uuid().references(() => university.id, {
    onDelete: 'cascade',
  }),
};
