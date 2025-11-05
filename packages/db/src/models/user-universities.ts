/* eslint-disable class-methods-use-this */
import type { LegacyRingLevelEnum, UserRoleEnum } from '@meltstudio/types';
import type { SQL } from 'drizzle-orm';
import { and, eq, ilike, inArray, or, sql } from 'drizzle-orm';
import type { PgColumn, PgSelect } from 'drizzle-orm/pg-core';

import type { DbUserUniversities } from '@/db/schema';
import {
  users as usersTable,
  userUniversities as userUniversitiesTable,
} from '@/db/schema';
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

  public async findAllUserUniversities(opts?: {
    filters?: {
      search?: string;
      role?: string;
    };
    pagination?: { pageIndex?: number; pageSize?: number };
  }): Promise<{ items: DbUserUniversities[]; total: number }> {
    const conditions: (SQL | undefined)[] = [];

    if (opts?.filters?.role) {
      conditions.push(eq(this.dbTable.role, opts.filters.role));
    }

    if (opts?.filters?.search) {
      const search = `%${opts.filters.search}%`;
      conditions.push(
        or(ilike(usersTable.name, search), ilike(usersTable.email, search))
      );
    }

    const pageSize = opts?.pagination?.pageSize ?? 10;
    const pageIndex = opts?.pagination?.pageIndex ?? 0;

    const whereCondition =
      conditions.length > 0 ? and(...conditions) : undefined;

    const [items, totalResult] = await Promise.all([
      this.client
        .select({
          userId: this.dbTable.userId,
          universityId: this.dbTable.universityId,
          role: this.dbTable.role,
          ringLevel: this.dbTable.ringLevel,
        })
        .from(this.dbTable)
        .innerJoin(usersTable, eq(this.dbTable.userId, usersTable.id))
        .where(whereCondition)
        .limit(pageSize)
        .offset(pageIndex * pageSize)
        .execute(),
      this.client
        .select({ count: sql<number>`count(*)` })
        .from(this.dbTable)
        .innerJoin(usersTable, eq(this.dbTable.userId, usersTable.id))
        .where(whereCondition)
        .execute(),
    ]);

    const total = Number(totalResult[0]?.count ?? 0);

    return { items: items as DbUserUniversities[], total };
  }
}
