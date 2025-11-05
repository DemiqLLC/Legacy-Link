import type { SQL } from 'drizzle-orm';
import { and, eq, getTableColumns, ilike, or, sql } from 'drizzle-orm';
import type { PgSelect } from 'drizzle-orm/pg-core';

import type { DbModelKeys } from '@/db/models/db';
import type { DbPledgeOpportunity } from '@/db/schema';
import {
  pledgeOpportunities as pledgeOpportunitiesTable,
  university,
} from '@/db/schema';

import type { DbWhere, ManyRelations } from './base';
import { DbModel } from './base';

export type PledgeOpportunitiesDbWhere = DbWhere & {
  universityId?: string;
  userId?: string;
  givingOpportunityId?: string;
  orderBy?: Partial<
    Record<keyof typeof pledgeOpportunitiesTable, 'asc' | 'desc'>
  >;
};

export class DbPledgeOpportunitiesModel extends DbModel<
  typeof pledgeOpportunitiesTable,
  PledgeOpportunitiesDbWhere,
  'pledgeOpportunities'
> {
  // eslint-disable-next-line class-methods-use-this
  public override get schemaTsName(): 'pledgeOpportunities' {
    return 'pledgeOpportunities';
  }

  // eslint-disable-next-line class-methods-use-this
  protected get manyRelationsMap(): Map<string, ManyRelations> {
    const dynamic = new Map<string, ManyRelations>();
    return dynamic;
  }

  // eslint-disable-next-line class-methods-use-this
  protected get dbTable(): typeof pledgeOpportunitiesTable {
    return pledgeOpportunitiesTable;
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
    where: PledgeOpportunitiesDbWhere
  ): Query {
    let filtered = query;

    if (where.universityId != null) {
      filtered = filtered.where(
        eq(this.dbTable.universityId, where.universityId)
      );
    }
    if (where.userId != null) {
      filtered = filtered.where(eq(this.dbTable.userId, where.userId));
    }
    if (where.givingOpportunityId != null) {
      filtered = filtered.where(
        eq(this.dbTable.givingOpportunityId, where.givingOpportunityId)
      );
    }

    if (where.orderBy) {
      const entries = Object.entries(where.orderBy) as [
        keyof typeof this.dbTable,
        'asc' | 'desc',
      ][];
      // eslint-disable-next-line no-restricted-syntax
      for (const [column, direction] of entries) {
        const columnRef = this.dbTable[column];
        if (columnRef) {
          filtered = filtered.orderBy(
            direction === 'desc'
              ? sql`${columnRef} DESC`
              : sql`${columnRef} ASC`
          );
        }
      }
    }

    return filtered;
  }

  public async findById(
    pledgeOpportunityId: string
  ): Promise<(DbPledgeOpportunity & { universityName: string }) | null> {
    const [data] = await this.client
      .select({
        ...getTableColumns(this.dbTable),
        universityName: university.name,
      })
      .from(this.dbTable)
      .where(eq(this.dbTable.id, pledgeOpportunityId))
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

  public async findByGivingOpportunityId(
    givingOpportunityId: string
  ): Promise<DbPledgeOpportunity[]> {
    const data = await this.client
      .select()
      .from(this.dbTable)
      .where(eq(this.dbTable.givingOpportunityId, givingOpportunityId))
      .execute();

    return data;
  }

  public async findAllPledgeOpportunities(opts?: {
    filters?: {
      search?: string;
    };
    pagination?: { pageIndex?: number; pageSize?: number };
  }): Promise<{ items: DbPledgeOpportunity[]; total: number }> {
    const conditions: (SQL | undefined)[] = [];

    if (opts?.filters?.search) {
      const search = `%${opts.filters.search}%`;
      conditions.push(
        or(
          ilike(this.dbTable.email, search),
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
        .execute(),
    ]);

    const total = Number(totalResult[0]?.count ?? 0);

    return { items, total };
  }
}
