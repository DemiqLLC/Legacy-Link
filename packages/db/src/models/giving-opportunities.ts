import { eq, getTableColumns } from 'drizzle-orm';
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
}
