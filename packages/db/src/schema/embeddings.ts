import {
  index,
  jsonb,
  pgTable,
  text,
  unique,
  uuid,
  vector,
} from 'drizzle-orm/pg-core';

import { baseUniversityFields } from './university-base';

export const embeddings = pgTable(
  'embeddings',
  {
    ...baseUniversityFields,
    tableName: text().notNull(),
    rowId: uuid().notNull(),
    data: jsonb().notNull(),
    embedding: vector({ dimensions: 1536 }).notNull(),
  },
  (table) => [
    index().using('hnsw', table.embedding.op('vector_cosine_ops')),
    unique().on(table.tableName, table.rowId),
  ]
);
