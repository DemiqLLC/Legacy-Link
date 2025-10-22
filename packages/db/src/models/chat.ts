/* eslint-disable class-methods-use-this */
import { and, eq } from 'drizzle-orm';
import type { PgSelect } from 'drizzle-orm/pg-core';

import type { DbChat } from '@/db/schema';
import { chat as chatsTable } from '@/db/schema';
import type { GetQueryRelations } from '@/db/utils';

import type { DbWhere, ManyRelations } from './base';
import { DbModel } from './base';
import type { DbModelKeys } from './db';

export type ChatWhere = DbWhere & {
  universityId?: string;
};

export class DbChatModel extends DbModel<typeof chatsTable, ChatWhere, 'chat'> {
  protected override get isExportable(): boolean {
    throw new Error('Method not implemented.');
  }

  protected override get manyRelationsMap(): Map<string, ManyRelations> {
    const dynamic = new Map<string, ManyRelations>();
    return dynamic;
  }

  protected get adminFieldChoiceName(): string {
    return 'name';
  }

  public override get schemaTsName(): 'chat' {
    return 'chat';
  }

  protected get dbTable(): typeof chatsTable {
    return chatsTable;
  }

  protected get modelName(): DbModelKeys {
    return 'chat';
  }

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

  protected override get queryRelations(): GetQueryRelations<'chat'> {
    return {
      university: true,
      user: true,
      messages: true,
    };
  }

  protected override filterQuery<Query extends PgSelect>(
    query: Query,
    where: ChatWhere
  ): Query {
    const conditions = [];
    if (where.universityId != null) {
      conditions.push(eq(this.dbTable.universityId, where.universityId));
    }

    return query.where(and(...conditions));
  }

  public async findChatsByUniversity(
    universityId: string
  ): Promise<DbChat[] | null> {
    const data = await this.client
      .select()
      .from(this.dbTable)
      .where(eq(this.dbTable.universityId, universityId))
      .execute();

    return data || null;
  }
}
