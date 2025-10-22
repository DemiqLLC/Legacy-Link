import { eq } from 'drizzle-orm';
import type { PgColumn, PgSelect } from 'drizzle-orm/pg-core';

import type { DbUserProfile } from '@/db/schema';
import { userProfile as userProfileTable } from '@/db/schema';

import type { ManyRelations } from './base';
import { DbModel } from './base';
import type { DbModelKeys } from './db';

export type DbUsersProfileWhere = {
  userId?: string;
};

export class DbUserProfileModel extends DbModel<
  typeof userProfileTable,
  DbUsersProfileWhere,
  'userProfile'
> {
  public override get dbTablePkColumn(): PgColumn {
    return this.dbTable.id;
  }

  // eslint-disable-next-line class-methods-use-this
  public override get schemaTsName(): 'userProfile' {
    return 'userProfile';
  }

  // eslint-disable-next-line class-methods-use-this
  protected get manyRelationsMap(): Map<string, ManyRelations> {
    const dynamic = new Map<string, ManyRelations>();
    return dynamic;
  }

  // eslint-disable-next-line class-methods-use-this
  protected get dbTable(): typeof userProfileTable {
    return userProfileTable;
  }

  // eslint-disable-next-line class-methods-use-this
  protected get adminFieldChoiceName(): string {
    return 'userId';
  }

  // eslint-disable-next-line class-methods-use-this
  public override get saveEmbedding(): boolean {
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  protected override get isExportable(): boolean {
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  protected get modelName(): DbModelKeys {
    return 'userProfile';
  }

  // eslint-disable-next-line class-methods-use-this
  protected override get sendWebhooks(): boolean {
    return false;
  }

  protected override filterQuery<Query extends PgSelect>(
    query: Query,
    where: DbUsersProfileWhere
  ): Query {
    let filtered = query;

    if (where.userId != null) {
      filtered = filtered.where(eq(this.dbTable.userId, where.userId));
    }

    return filtered;
  }

  // eslint-disable-next-line class-methods-use-this
  protected get activityStream(): boolean {
    return true;
  }

  public async findByUserId(userId: string): Promise<DbUserProfile | null> {
    const [data] = await this.client
      .select()
      .from(this.dbTable)
      .where(eq(this.dbTable.userId, userId))
      .execute();

    return data || null;
  }
}
