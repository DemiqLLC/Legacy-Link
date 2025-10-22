import { eq, getTableColumns } from 'drizzle-orm';
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
}
