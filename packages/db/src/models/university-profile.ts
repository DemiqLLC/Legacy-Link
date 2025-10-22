import { eq } from 'drizzle-orm';
import type { PgColumn, PgSelect } from 'drizzle-orm/pg-core';

import type { DbUniversityProfile } from '@/db/schema';
import { universityProfile as universityProfileTable } from '@/db/schema';

import type { ManyRelations } from './base';
import { DbModel } from './base';
import type { DbModelKeys } from './db';

export type DbUniversitiesProfileWhere = {
  universityId?: string;
};

export class DbUniversityProfileModel extends DbModel<
  typeof universityProfileTable,
  DbUniversitiesProfileWhere,
  'universityProfile'
> {
  public override get dbTablePkColumn(): PgColumn {
    return this.dbTable.universityId;
  }

  // eslint-disable-next-line class-methods-use-this
  public override get schemaTsName(): 'universityProfile' {
    return 'universityProfile';
  }

  // eslint-disable-next-line class-methods-use-this
  protected get manyRelationsMap(): Map<string, ManyRelations> {
    const dynamic = new Map<string, ManyRelations>();
    return dynamic;
  }

  // eslint-disable-next-line class-methods-use-this
  protected get dbTable(): typeof universityProfileTable {
    return universityProfileTable;
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
  protected override get isExportable(): boolean {
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  protected get modelName(): DbModelKeys {
    return 'universityProfile';
  }

  // eslint-disable-next-line class-methods-use-this
  protected override get sendWebhooks(): boolean {
    return false;
  }

  protected override filterQuery<Query extends PgSelect>(
    query: Query,
    where: DbUniversitiesProfileWhere
  ): Query {
    let filtered = query;

    if (where.universityId != null) {
      filtered = filtered.where(
        eq(this.dbTable.universityId, where.universityId)
      );
    }

    return filtered;
  }

  // eslint-disable-next-line class-methods-use-this
  protected get activityStream(): boolean {
    return true;
  }

  public async findByUniversityId(
    universityId: string
  ): Promise<DbUniversityProfile | null> {
    const [data] = await this.client
      .select()
      .from(this.dbTable)
      .where(eq(this.dbTable.universityId, universityId))
      .execute();

    return data || null;
  }
}
