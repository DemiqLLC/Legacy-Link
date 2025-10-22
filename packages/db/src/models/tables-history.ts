import type { ActivityActions } from '@meltstudio/types';
import type { SQL } from 'drizzle-orm';
import { and, eq, gte, ilike, lte, or } from 'drizzle-orm';
import type { PgSelect } from 'drizzle-orm/pg-core';

import type { DbTablesHistoryExtended } from '@/db/schema';
import {
  tablesHistory as tablesHistoryTable,
  university,
  users,
} from '@/db/schema';
import type { GetQueryRelations } from '@/db/utils';

import type { DbWhere, ManyRelations } from './base';
import { DbModel } from './base';
import type { DbModelKeys } from './db';

export type TablesHistoryDbWhere = DbWhere & {
  userId?: string;
  universityId?: string;
  action?: ActivityActions;
  tableName?: string;
};

export class DbTablesHistoryModel extends DbModel<
  typeof tablesHistoryTable,
  TablesHistoryDbWhere,
  'tablesHistory'
> {
  // eslint-disable-next-line class-methods-use-this
  protected override get adminFieldChoiceName(): string {
    return 'name';
  }

  // eslint-disable-next-line class-methods-use-this
  protected get manyRelationsMap(): Map<string, ManyRelations> {
    const dynamic = new Map<string, ManyRelations>();
    return dynamic;
  }

  // eslint-disable-next-line class-methods-use-this
  protected override get queryRelations(): GetQueryRelations<'tablesHistory'> {
    return {
      user: true,
      university: true,
    };
  }

  // eslint-disable-next-line class-methods-use-this
  protected override get isExportable(): boolean {
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  public override get saveEmbedding(): boolean {
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  protected get activityStream(): boolean {
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  protected override get sendWebhooks(): boolean {
    return false;
  }

  public async findWithUser(args?: {
    universityId: string;
  }): Promise<DbTablesHistoryExtended[]> {
    const where = args?.universityId
      ? eq(this.dbTable.universityId, args.universityId)
      : undefined;
    const data = await this.client.query.tablesHistory.findMany({
      with: {
        user: true,
        university: true,
      },
      where,
    });

    return data;
  }

  // eslint-disable-next-line class-methods-use-this
  public override get schemaTsName(): 'tablesHistory' {
    return 'tablesHistory';
  }

  // eslint-disable-next-line class-methods-use-this
  protected get dbTable(): typeof tablesHistoryTable {
    return tablesHistoryTable;
  }

  // eslint-disable-next-line class-methods-use-this
  protected get modelName(): DbModelKeys {
    return 'tablesHistory';
  }

  // eslint-disable-next-line class-methods-use-this
  protected override filterQuery<Query extends PgSelect>(
    query: Query,
    where: TablesHistoryDbWhere
  ): Query {
    const conditions: (SQL | undefined)[] = [];

    if (where.search != null) {
      const search = `%${where.search}%`;
      conditions.push(
        or(
          ilike(tablesHistoryTable.userId, search),
          ilike(tablesHistoryTable.tableName, search)
        )
      );
    }

    if (where.tableName) {
      const tableName = `%${where.tableName.trim()}%`;
      conditions.push(ilike(tablesHistoryTable.tableName, tableName));
    }

    if (where.action) {
      const action = `%${where.action.trim()}%`;
      conditions.push(ilike(tablesHistoryTable.action, action));
    }

    if (where.userId) {
      const userId = `%${where.userId.trim()}%`;
      conditions.push(ilike(tablesHistoryTable.userId, userId));
    }
    if (where.universityId) {
      const universityId = `%${where.universityId.trim()}%`;
      conditions.push(ilike(tablesHistoryTable.universityId, universityId));
    }

    return query.where(and(...conditions));
  }

  public async findById(
    historyId: string
  ): Promise<DbTablesHistoryExtended | null> {
    const [result] = await this.client
      .select()
      .from(this.dbTable)
      .leftJoin(users, eq(this.dbTable.userId, users.id))
      .leftJoin(university, eq(this.dbTable.universityId, university.id))
      .where(eq(this.dbTable.id, historyId))
      .execute();

    if (!result || !result.tables_history) {
      return null;
    }

    if (!result.users) {
      return null;
    }

    const transformedData: DbTablesHistoryExtended = {
      ...result.tables_history,
      user: result.users,
      university: result.university || null,
    };

    return transformedData;
  }

  public async findManyWithUserName(opts?: {
    args?: {
      where?: {
        from: string;
        to: string;
        universityId: string;
      };
    };
  }): Promise<unknown[]> {
    const { args } = opts ?? {};
    const { universityId, from, to } = args?.where || {};

    let whereClause = universityId
      ? eq(this.dbTable.universityId, universityId)
      : undefined;

    if (from) {
      const condition = gte(this.dbTable.createdAt, from);
      whereClause = whereClause ? and(whereClause, condition) : condition;
    }

    if (to) {
      const condition = lte(this.dbTable.createdAt, to);
      whereClause = whereClause ? and(whereClause, condition) : condition;
    }

    const query = this.client
      .select({
        id: this.dbTable.id,
        createdAt: this.dbTable.createdAt,
        user: users.name,
        action: this.dbTable.action,
        tableName: this.dbTable.tableName,
      })
      .from(this.dbTable)
      .leftJoin(users, eq(this.dbTable.userId, users.id))
      .where(whereClause);

    const results = await query.execute();

    return results;
  }
}
