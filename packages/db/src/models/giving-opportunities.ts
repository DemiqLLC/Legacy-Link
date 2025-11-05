import type { SQL } from 'drizzle-orm';
import { and, eq, getTableColumns, ilike, inArray, or, sql } from 'drizzle-orm';
import type { PgSelect } from 'drizzle-orm/pg-core';

import type { DbModelKeys } from '@/db/models/db';
import type { DbGivingOpportunities } from '@/db/schema';
import {
  givingOpportunities as givingOpportunitiesTable,
  university,
} from '@/db/schema';

import type { DbWhere, ManyRelations } from './base';
import { DbModel } from './base';

export type GivingOpportunitiesDbWhere = DbWhere & {
  universityId?: string;
  id?: string | string[];
};

export class DbGivingOpportunitiesModel extends DbModel<
  typeof givingOpportunitiesTable,
  GivingOpportunitiesDbWhere,
  'givingOpportunities'
> {
  // eslint-disable-next-line class-methods-use-this
  public override get schemaTsName(): 'givingOpportunities' {
    return 'givingOpportunities';
  }

  // eslint-disable-next-line class-methods-use-this
  protected get manyRelationsMap(): Map<string, ManyRelations> {
    const dynamic = new Map<string, ManyRelations>();
    return dynamic;
  }

  // eslint-disable-next-line class-methods-use-this
  protected get dbTable(): typeof givingOpportunitiesTable {
    return givingOpportunitiesTable;
  }

  // eslint-disable-next-line class-methods-use-this
  protected get adminFieldChoiceName(): string {
    return 'universityId';
  }

  // eslint-disable-next-line class-methods-use-this
  public override get saveEmbedding(): boolean {
    return true;
  }

  // eslint-disable-next-line class-methods-use-this
  protected get modelName(): DbModelKeys {
    return 'givingOpportunities';
  }

  // eslint-disable-next-line class-methods-use-this
  protected override get isExportable(): boolean {
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  protected get activityStream(): boolean {
    return true;
  }

  // eslint-disable-next-line class-methods-use-this
  protected override get sendWebhooks(): boolean {
    return true;
  }

  protected override filterQuery<Query extends PgSelect>(
    query: Query,
    where: GivingOpportunitiesDbWhere
  ): Query {
    let filtered = query;

    if (where.universityId != null) {
      filtered = filtered.where(
        eq(this.dbTable.universityId, where.universityId)
      );
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
    givingOpportunityId: string
  ): Promise<(DbGivingOpportunities & { universityName: string }) | null> {
    const [data] = await this.client
      .select({
        ...getTableColumns(this.dbTable),
        universityName: university.name,
      })
      .from(this.dbTable)
      .where(eq(this.dbTable.id, givingOpportunityId))
      .leftJoin(university, eq(this.dbTable.universityId, university.id))
      .execute();

    if (!data) {
      return null;
    }

    return {
      ...data,
      universityName: data.universityName || '',
    };
  }

  public async findByUniversityId(
    universityId: string
  ): Promise<DbGivingOpportunities[]> {
    const data = await this.client
      .select()
      .from(this.dbTable)
      .where(eq(this.dbTable.universityId, universityId))
      .execute();

    return data;
  }

  public async findAllGivingOpportunities(opts?: {
    filters?: {
      search?: string;
    };
    pagination?: { pageIndex?: number; pageSize?: number };
  }): Promise<{ items: DbGivingOpportunities[]; total: number }> {
    const conditions: (SQL | undefined)[] = [];

    if (opts?.filters?.search) {
      const search = `%${opts.filters.search}%`;
      conditions.push(
        or(
          ilike(this.dbTable.name, search),
          ilike(this.dbTable.referenceCode, search),
          ilike(university.name, search)
        )
      );
    }

    const pageSize = opts?.pagination?.pageSize ?? 10;
    const pageIndex = opts?.pagination?.pageIndex ?? 0;

    const whereCondition =
      conditions.length > 0 ? and(...conditions) : undefined;

    const [items, totalResult] = await Promise.all([
      this.client
        .select({
          id: this.dbTable.id,
          name: this.dbTable.name,
          isActive: this.dbTable.isActive,
          createdAt: this.dbTable.createdAt,
          description: this.dbTable.description,
          referenceCode: this.dbTable.referenceCode,
          universityId: this.dbTable.universityId,
          goalAmount: this.dbTable.goalAmount,
        })
        .from(this.dbTable)
        .innerJoin(university, eq(this.dbTable.universityId, university.id))
        .where(whereCondition)
        .limit(pageSize)
        .offset(pageIndex * pageSize)
        .execute(),
      this.client
        .select({ count: sql<number>`count(*)` })
        .from(this.dbTable)
        .innerJoin(university, eq(this.dbTable.universityId, university.id))
        .where(whereCondition)
        .execute(),
    ]);

    const total = Number(totalResult[0]?.count ?? 0);

    return { items, total };
  }
}
