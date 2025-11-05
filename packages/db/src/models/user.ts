/* eslint-disable class-methods-use-this */
import type { MemberFiltersType } from '@meltstudio/types';
import type { SQL } from 'drizzle-orm';
import {
  and,
  eq,
  getTableColumns,
  gte,
  ilike,
  inArray,
  lte,
  or,
  sql,
} from 'drizzle-orm';
import type { PgSelect } from 'drizzle-orm/pg-core';

import type {
  DbUser,
  DbUserExtended,
  DbUserWithPasswordExtended,
  DbUserWithRole,
} from '@/db/schema';
import {
  university as universityTable,
  users,
  users as usersTable,
  userUniversities,
  userUniversities as userUniversitiesTable,
} from '@/db/schema';
import type { GetQueryRelations } from '@/db/utils';
import { generateDatesFrom28DaysAgo } from '@/db/utils/date-utils';

import type { DbWhere, ManyRelations } from './base';
import { DbModel } from './base';
import type { DbModelKeys } from './db';

export type UserDbWhere = Omit<DbWhere & MemberFiltersType, 'id'> & {
  id?: string | string[];
  isSuperAdmin?: boolean;
  createdAt?: { gte?: Date };
};

export type Metrics = {
  date: string;
  count: number;
};

export class DbUserModel extends DbModel<
  typeof usersTable,
  UserDbWhere,
  'users'
> {
  // eslint-disable-next-line class-methods-use-this
  public override get schemaTsName(): 'users' {
    return 'users';
  }

  // eslint-disable-next-line class-methods-use-this
  protected get dbTable(): typeof usersTable {
    return usersTable;
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
  protected get modelName(): DbModelKeys {
    return 'users';
  }

  public override get saveEmbedding(): boolean {
    return true;
  }

  // eslint-disable-next-line class-methods-use-this
  protected get activityStream(): boolean {
    return true;
  }

  // eslint-disable-next-line class-methods-use-this
  protected override get sendWebhooks(): boolean {
    return true;
  }

  // eslint-disable-next-line class-methods-use-this
  protected override get queryRelations(): GetQueryRelations<'users'> {
    return {
      featureFlags: true,
      universities: {
        with: {
          university: true,
        },
      },
      inviteToken: true,
      passwordRecoveryTokens: true,
    };
  }

  protected get manyRelationsMap(): Map<string, ManyRelations> {
    this.registerManyRelations('university', 'userUniversities', {
      mainKey: 'userId',
      relatedKey: 'universityId',
      relatedField: 'universities',
    });

    return this.dynamicManyRelationsMap;
  }

  // // eslint-disable-next-line class-methods-use-this
  // protected override registerDefaultJoinTables(): void {
  //   this.registerJoinTableInfo('users', 'university', 'user-universities', {
  //     mainKey: 'userId',
  //     relatedKey: 'universityId',
  //   });
  // }

  // eslint-disable-next-line class-methods-use-this
  protected override filterQuery<Query extends PgSelect>(
    query: Query,
    where: UserDbWhere
  ): Query {
    const conditions: (SQL | undefined)[] = [];
    if (where.search != null) {
      const search = `%${where.search}%`;
      conditions.push(
        or(ilike(usersTable.name, search), ilike(usersTable.email, search))
      );
    }

    const { id } = where;
    if (id != null) {
      if (Array.isArray(id) && id.length > 0) {
        conditions.push(inArray(usersTable.id, id));
      } else if (typeof id === 'string' && id.trim() !== '') {
        conditions.push(eq(usersTable.id, id.trim()));
      }
    }

    if (where.name) {
      const name = `%${where.name.trim()}%`;
      conditions.push(ilike(usersTable.name, name));
    }

    if (where.email) {
      const email = `%${where.email.trim()}%`;
      conditions.push(ilike(usersTable.email, email));
    }

    if (where.active) {
      const active = where.active === 'true';
      conditions.push(eq(usersTable.active, active));
    }

    if (where.isSuperAdmin) {
      conditions.push(eq(usersTable.isSuperAdmin, where.isSuperAdmin));
    }

    return query.where(and(...conditions));
  }

  public async findUniqueByID(id: string): Promise<DbUserExtended | null> {
    const user = await this.client.query.users.findFirst({
      columns: { password: false },
      where: eq(usersTable.id, id),
      with: {
        featureFlags: true,
        universities: {
          with: {
            university: true,
          },
        },
      },
    });
    if (user == null) {
      return null;
    }

    return user;
  }

  public async findUniqueByEmail(
    email: string
  ): Promise<DbUserExtended | null> {
    const user = await this.client.query.users.findFirst({
      columns: { password: false },
      where: eq(usersTable.email, email),
      with: {
        featureFlags: true,
        universities: {
          with: {
            university: true,
          },
        },
      },
    });
    if (user == null) {
      return null;
    }

    return user;
  }

  public async findManyByEmail(emails: string[]): Promise<DbUserExtended[]> {
    const userList = await this.client.query.users.findMany({
      columns: { password: false },
      where: inArray(usersTable.email, emails),
      with: {
        featureFlags: true,
        universities: {
          with: {
            university: true,
          },
        },
      },
    });

    return userList;
  }

  public async findUniqueByEmailWithPassword(
    email: string
  ): Promise<DbUserWithPasswordExtended | null> {
    const user = await this.client.query.users.findFirst({
      where: eq(usersTable.email, email),
      with: {
        featureFlags: true,
        universities: {
          with: {
            university: true,
          },
        },
      },
    });
    if (user == null) {
      return null;
    }

    return user;
  }

  public async getUsersOverTime(universityId: string): Promise<Metrics[]> {
    const result = await this.client
      .select({
        date: sql`DATE_TRUNC('day', ${usersTable.createdAt})`,
        count: sql`CAST(COUNT(*) AS INTEGER)`,
      })
      .from(usersTable)
      .where(
        sql`${usersTable.createdAt} >= NOW() - INTERVAL '30 days' AND
            EXISTS (
              SELECT 1
              FROM ${userUniversitiesTable}
              WHERE ${userUniversitiesTable.universityId} = ${universityId}
              AND ${userUniversitiesTable.userId} = ${usersTable.id}
            )`
      )
      .groupBy(sql`DATE_TRUNC('day', ${usersTable.createdAt})`)
      .orderBy(sql`DATE_TRUNC('day', ${usersTable.createdAt})`);

    const userCounts = result as Metrics[];

    const dates = generateDatesFrom28DaysAgo();

    const userCountMap = userCounts.reduce(
      (map, metric) => {
        const dateKey = metric.date.split(' ')[0];

        if (dateKey) {
          return { ...map, [dateKey]: metric.count };
        }

        return map;
      },
      {} as Record<string, number>
    );

    const completeData = dates.map((date) => ({
      date,
      count: userCountMap[date] ?? 0,
    }));

    return completeData;
  }

  public async getUniversityMembers(
    universityId: string
  ): Promise<DbUserWithRole[]> {
    const usersData = await this.client
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        active: usersTable.active,
        createdAt: usersTable.createdAt,
        is2faEnabled: usersTable.is2faEnabled,
        profileImage: usersTable.profileImage,
        isSuperAdmin: usersTable.isSuperAdmin,
        gtmId: usersTable.gtmId,
        universities: sql`
        json_agg(
          json_build_object(
            'userId', ${userUniversitiesTable.userId},
            'universityId', ${userUniversitiesTable.universityId},
            'role', ${userUniversitiesTable.role},
            'selected', ${universityTable.id} = ${universityId}
          )
        ) FILTER (WHERE ${userUniversitiesTable.universityId} IS NOT NULL)
      `.as('universities'),
      })
      .from(usersTable)
      .leftJoin(
        userUniversitiesTable,
        eq(usersTable.id, userUniversitiesTable.userId)
      )
      .leftJoin(
        universityTable,
        eq(userUniversitiesTable.universityId, universityTable.id)
      )
      .where(eq(userUniversitiesTable.universityId, universityId))
      .groupBy(
        usersTable.id,
        usersTable.name,
        usersTable.email,
        usersTable.active,
        usersTable.createdAt,
        usersTable.is2faEnabled,
        usersTable.profileImage,
        usersTable.isSuperAdmin,
        usersTable.gtmId
      );

    return usersData as unknown as DbUserWithRole[];
  }

  public async findManyWithUserUniversities(opts?: {
    args?: {
      where?: {
        from?: string;
        to?: string;
        universityId?: string;
      };
    };
  }): Promise<DbUserWithRole[]> {
    const { args } = opts ?? {};
    const { universityId, from, to } = args?.where || {};

    const whereConditions = [];

    if (universityId) {
      whereConditions.push(eq(userUniversities.universityId, universityId));
    }

    if (from) {
      whereConditions.push(gte(users.createdAt, from));
    }

    if (to) {
      whereConditions.push(lte(users.createdAt, to));
    }

    const results = await this.client
      .select({
        id: users.id,
        createdAt: users.createdAt,
        email: users.email,
        name: users.name,
        active: users.active,
      })
      .from(users)
      .innerJoin(userUniversities, eq(users.id, userUniversities.userId))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .execute();

    return results as unknown as DbUserWithRole[];
  }

  public async findById(userId: string): Promise<DbUser | null> {
    const [data] = await this.client
      .select({
        ...getTableColumns(this.dbTable),
      })
      .from(this.dbTable)
      .where(eq(this.dbTable.id, userId))
      .execute();

    if (!data) {
      return null;
    }

    return data as DbUser;
  }

  public async findAllUsers(opts?: {
    filters?: {
      search?: string;
      isSuperAdmin?: boolean;
    };
    pagination?: { pageIndex?: number; pageSize?: number };
  }): Promise<{ items: DbUser[]; total: number }> {
    const conditions: (SQL | undefined)[] = [];

    if (opts?.filters?.isSuperAdmin) {
      conditions.push(eq(this.dbTable.isSuperAdmin, opts.filters.isSuperAdmin));
    }

    if (opts?.filters?.search) {
      const search = `%${opts.filters.search}%`;
      conditions.push(
        or(ilike(this.dbTable.name, search), ilike(this.dbTable.email, search))
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
