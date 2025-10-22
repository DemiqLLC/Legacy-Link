/* eslint-disable class-methods-use-this */
import type { LegacyRingLevelEnum, UserRoleEnum } from '@meltstudio/types';
import { and, eq, inArray } from 'drizzle-orm';
import type { PgColumn, PgSelect } from 'drizzle-orm/pg-core';

import type { DbUserUniversities } from '@/db/schema';
import { userUniversities as userUniversitiesTable } from '@/db/schema';
import type { GetQueryRelations } from '@/db/utils';

import type { ManyRelations } from './base';
import { DbModel } from './base';
import type { DbModelKeys } from './db';

export type DbUserUniversitiesWhere = {
  userId?: string;
  role?: UserRoleEnum;
};

export class DbUserUniversitiesModel extends DbModel<
  typeof userUniversitiesTable,
  DbUserUniversitiesWhere,
  'userUniversities'
> {
  public override get dbTablePkColumn(): PgColumn {
    return this.dbTable.userId;
  }

  // eslint-disable-next-line class-methods-use-this
  public override get schemaTsName(): 'userUniversities' {
    return 'userUniversities';
  }

  // eslint-disable-next-line class-methods-use-this
  protected get dbTable(): typeof userUniversitiesTable {
    return userUniversitiesTable;
  }

  // eslint-disable-next-line class-methods-use-this
  protected get adminFieldChoiceName(): string {
    return 'userId';
  }

  // eslint-disable-next-line class-methods-use-this
  protected override get isExportable(): boolean {
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  protected get modelName(): DbModelKeys {
    return 'userUniversities';
  }

  // eslint-disable-next-line class-methods-use-this
  protected override get queryRelations(): GetQueryRelations<'userUniversities'> {
    return { user: true, university: true };
  }

  public override get saveEmbedding(): boolean {
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  protected get manyRelationsMap(): Map<string, ManyRelations> {
    const dynamic = new Map<string, ManyRelations>();
    return dynamic;
  }

  // eslint-disable-next-line class-methods-use-this
  protected get activityStream(): boolean {
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  protected override get sendWebhooks(): boolean {
    return true;
  }

  // // eslint-disable-next-line class-methods-use-this
  // protected override registerDefaultJoinTables(): void {}

  // eslint-disable-next-line class-methods-use-this
  protected override filterQuery<Query extends PgSelect>(
    query: Query,
    where: DbUserUniversitiesWhere
  ): Query {
    let filtered = query;
    if (where.userId != null) {
      filtered = filtered.where(eq(this.dbTable.userId, where.userId));
    }

    if (where.role != null) {
      filtered = filtered.where(eq(this.dbTable.role, where.role));
    }

    return filtered;
  }

  public async findByUserIdAndUniversityId(
    userId: string,
    universityId: string
  ): Promise<DbUserUniversities | null> {
    const [data] = await this.client
      .select()
      .from(this.dbTable)
      .where(
        and(
          eq(this.dbTable.userId, userId),
          eq(this.dbTable.universityId, universityId)
        )
      )
      .execute();

    return data || null;
  }

  public async findManyByUserIdAndUniversityId(
    userIdList: string[],
    universityId: string
  ): Promise<DbUserUniversities[]> {
    const data = await this.client
      .select()
      .from(this.dbTable)
      .where(
        and(
          eq(this.dbTable.universityId, universityId),
          inArray(this.dbTable.userId, userIdList)
        )
      )
      .execute();

    return data;
  }

  public async updateRoleMultipleUsersInUniversity(
    users: string[],
    universityId: string,
    role: string
  ): Promise<void> {
    await this.client
      .update(userUniversitiesTable)
      .set({ role })
      .where(
        and(
          inArray(userUniversitiesTable.userId, users),
          eq(userUniversitiesTable.universityId, universityId)
        )
      );
  }

  public async updateRingLevelForUserInUniversity(
    userId: string,
    universityId: string,
    ringLevel: LegacyRingLevelEnum
  ): Promise<void> {
    await this.client
      .update(userUniversitiesTable)
      .set({ ringLevel })
      .where(
        and(
          eq(userUniversitiesTable.userId, userId),
          eq(userUniversitiesTable.universityId, universityId)
        )
      );
  }
}
