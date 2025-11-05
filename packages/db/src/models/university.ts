import type { SQL } from 'drizzle-orm';
import { and, eq, ilike, inArray, or, sql } from 'drizzle-orm';
import type { PgSelect } from 'drizzle-orm/pg-core';

import type { DbUniversity } from '@/db/schema';
import {
  university as universitiesTable,
  universityProfile,
} from '@/db/schema';
import type { GetQueryRelations } from '@/db/utils';

import type { ManyRelations } from './base';
import { DbModel } from './base';
import type { DbModelKeys } from './db';

export type DbUniversityWhere = {
  name?: string;
  id?: string | string[];
};

export class DbUniversityModel extends DbModel<
  typeof universitiesTable,
  DbUniversityWhere,
  'university'
> {
  // eslint-disable-next-line class-methods-use-this
  public override get schemaTsName(): 'university' {
    return 'university';
  }

  // eslint-disable-next-line class-methods-use-this
  protected get dbTable(): typeof universitiesTable {
    return universitiesTable;
  }

  // eslint-disable-next-line class-methods-use-this
  protected get adminFieldChoiceName(): string {
    return 'name';
  }

  // eslint-disable-next-line class-methods-use-this
  protected override get isExportable(): boolean {
    return true;
  }

  // eslint-disable-next-line class-methods-use-this
  protected get activityStream(): boolean {
    return true;
  }

  // eslint-disable-next-line class-methods-use-this
  protected get modelName(): DbModelKeys {
    return 'university';
  }

  // eslint-disable-next-line class-methods-use-this
  public override get saveEmbedding(): boolean {
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  protected override get sendWebhooks(): boolean {
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  protected override get queryRelations(): GetQueryRelations<'university'> {
    return {
      users: {
        with: {
          user: true,
        },
      },
    };
  }

  protected get manyRelationsMap(): Map<string, ManyRelations> {
    this.registerManyRelations('users', 'userUniversities', {
      mainKey: 'universityId',
      relatedKey: 'userId',
      relatedField: 'users',
    });

    return this.dynamicManyRelationsMap;
  }

  // eslint-disable-next-line class-methods-use-this
  protected override filterQuery<Query extends PgSelect>(
    query: Query,
    where: DbUniversityWhere
  ): Query {
    let filtered = query;
    if (where.name != null) {
      filtered = filtered.where(ilike(this.dbTable.name, where.name));
    }
    if (where.id != null) {
      if (Array.isArray(where.id)) {
        filtered = filtered.where(inArray(this.dbTable.id, where.id));
      } else {
        filtered = filtered.where(eq(this.dbTable.id, where.id));
      }
    }

    return filtered;
  }

  public async findById(
    universityId: string
  ): Promise<(DbUniversity & { description: string }) | null> {
    const [data] = await this.client
      .select()
      .from(this.dbTable)
      .where(eq(this.dbTable.id, universityId))
      .leftJoin(universityProfile, eq(this.dbTable.id, universityId))
      .execute();

    if (!data?.university || !data?.university_profile) {
      return null;
    }

    const result = {
      name: data?.university.name,
      id: data?.university.id,
      createdAt: data?.university.createdAt,
      referenceCode: data?.university.referenceCode,
      universityAbbreviation: data?.university.universityAbbreviation,
      description: data?.university_profile.description,
      legacyLinkFoundationCode: data?.university.legacyLinkFoundationCode,
    };

    return result || null;
  }

  public async findAllUniversities(opts?: {
    filters?: {
      search?: string;
    };
    pagination?: { pageIndex?: number; pageSize?: number };
  }): Promise<{ items: DbUniversity[]; total: number }> {
    const conditions: (SQL | undefined)[] = [];

    if (opts?.filters?.search) {
      const search = `%${opts.filters.search}%`;
      conditions.push(
        or(
          ilike(this.dbTable.name, search),
          ilike(this.dbTable.referenceCode, search)
        )
      );
    }

    const pageSize = opts?.pagination?.pageSize ?? 10;
    const pageIndex = opts?.pagination?.pageIndex ?? 0;

    const whereCondition =
      conditions.length > 0 ? and(...conditions) : undefined;

    const [items, totalResult] = await Promise.all([
      this.client
        .select()
        .from(this.dbTable)
        .where(whereCondition)
        .limit(pageSize)
        .offset(pageIndex * pageSize)
        .execute(),
      this.client
        .select({ count: sql<number>`count(*)` })
        .from(this.dbTable)
        .where(whereCondition)
        .execute(),
    ]);

    const total = Number(totalResult[0]?.count ?? 0);

    return { items, total };
  }
}
